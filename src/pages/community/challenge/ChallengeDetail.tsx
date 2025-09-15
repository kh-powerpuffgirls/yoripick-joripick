import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import axios from 'axios';
import CommunityHeader from '../CommunityHeader';
import styles from './ChallengeDetail.module.css';
import { store } from '../../../store/store';

// API 기본 URL 정의
const API_BASE = 'http://localhost:8081';

// Redux 스토어에서 accessToken을 가져오기
const getAccessToken = () => store.getState().auth.accessToken;

// API 호출
const api = axios.create({
    baseURL: API_BASE,
    withCredentials: true,
});

// 토큰 토큰 토큰
api.interceptors.request.use(
    (config) => {
        const token = getAccessToken();
        if (token) config.headers.Authorization = `Bearer ${token}`;
        return config;
    },
    (error) => Promise.reject(error),
);

// 챌린지 게시글 데이터 타입 정의
interface ChallengePost {
    challengeNo: number;
    userNo: number;
    username: string;
    title: string;
    views: number;
    likes: number;
    serverName?: string;
    videoUrl?: string;
    createdAt: string;
    imageUrl?: string; 
}

// 댓글 및 답글 데이터 타입 정의
interface Reply {
    replyNo: number;
    refNo: number;
    userNo: number;
    username: string;
    content: string;
    createdAt: string;
    profileImageServerName?: string;
    category: 'CHALLENGE' | 'REPLY';
}

// 모달 상태 타입 정의
interface ModalState {
    message: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

// 챌린지 상세 페이지 컴포넌트
const ChallengeDetail = () => {
    const { challengeNo } = useParams<{ challengeNo: string }>();
    const navigate = useNavigate();

    const user = useSelector((state: RootState) => state.auth.user);

    const [post, setPost] = useState<ChallengePost | null>(null);
    const [replies, setReplies] = useState<Reply[]>([]);
    const [likesCount, setLikesCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [replyingToReplyNo, setReplyingToReplyNo] = useState<number | null>(null);
    const [replyingContent, setReplyingContent] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [modal, setModal] = useState<ModalState | null>(null);

    const commentsEndRef = useRef<HTMLDivElement>(null);

    // 데이터 가져오기 (게시글, 댓글, 좋아요 상태, 좋아요 수)
    useEffect(() => {
        if (!challengeNo || isNaN(Number(challengeNo))) {
            setError('유효하지 않은 챌린지 번호입니다.');
            setIsLoading(false);
            return;
        }

        const fetchData = async () => {
            try {
                setIsLoading(true);

                const postRes = await api.get<ChallengePost>(`/community/challenge/${challengeNo}`);
                setPost(postRes.data);

                const repliesRes = await api.get<Reply[]>(`/community/challenge/replies/${challengeNo}`);
                setReplies(repliesRes.data);

                if (user?.userNo) {
                    const likeStatusRes = await api.get<boolean>(`/community/challenge/like/status/${challengeNo}`);
                    setIsLiked(likeStatusRes.data);
                }

                const likeCountRes = await api.get<number>(`/community/challenge/like/count/${challengeNo}`);
                setLikesCount(likeCountRes.data);

                setError(null);
            } catch (err: any) {
                console.error(err);
                if (err.response && err.response.status === 401) {
                    setError('로그인이 필요합니다.');
                } else {
                    setError('게시글 정보를 불러오는 데 실패했습니다.');
                }
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [challengeNo, user]);

    // 댓글 목록이 업데이트되면 맨 아래로 스크롤
    useEffect(() => {
        commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [replies]);

    const openModal = (modalData: ModalState) => {
        setModal(modalData);
    };

    const closeModal = () => {
        setModal(null);
    };

    const handleConfirm = () => {
        if (modal?.onConfirm) {
            modal.onConfirm();
        }
        closeModal();
    };

    const handleCancel = () => {
        if (modal?.onCancel) {
            modal.onCancel();
        }
        closeModal();
    };

    // 좋아요 버튼 클릭 핸들러
    const handleLikeToggle = async () => {
        if (!user?.userNo) {
            openModal({ message: '로그인 후 좋아요 가능합니다.' });
            return;
        }
        try {
            await api.post(`/community/challenge/like/${challengeNo}`);
            setIsLiked(prev => !prev);
            setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
        } catch (err: any) {
            console.error(err);
            if (err.response && err.response.status === 401) {
                openModal({ message: '좋아요는 로그인 후 가능합니다.' });
            } else {
                openModal({ message: '좋아요 처리 실패' });
            }
        }
    };

    // 댓글 작성 핸들러
    const handleAddComment = async () => {
        if (!user?.userNo) {
            openModal({ message: '로그인 후 댓글 작성 가능' });
            return;
        }
        if (!newComment.trim()) {
            openModal({ message: '댓글 입력 필요' });
            return;
        }
        const payload = {
            content: newComment.trim(),
            refNo: Number(challengeNo),
            category: 'CHALLENGE'
        };
        try {
            await api.post(`/community/challenge/replies`, payload);
            setNewComment('');
            const repliesRes = await api.get<Reply[]>(`/community/challenge/replies/${challengeNo}`);
            setReplies(repliesRes.data);
        } catch (err: any) {
            console.error("Failed to add comment:", err);
            if (err.response && err.response.status === 401) {
                openModal({ message: '댓글 작성은 로그인 후 가능합니다.' });
            } else {
                openModal({ message: '댓글 작성 실패' });
            }
        }
    };

    // 답글 작성
    const handleReplySubmit = async () => {
        if (!user?.userNo || replyingToReplyNo === null || !replyingContent.trim()) {
            openModal({ message: '답글을 작성하려면 로그인하고 내용을 입력해야 합니다.' });
            return;
        }
        const payload = {
            content: replyingContent.trim(),
            refNo: replyingToReplyNo,
            category: 'REPLY',
        };
        try {
            await api.post(`/community/challenge/replies`, payload);
            setReplyingContent('');
            setReplyingToReplyNo(null);
            const repliesRes = await api.get<Reply[]>(`/community/challenge/replies/${challengeNo}`);
            setReplies(repliesRes.data);
        } catch (err: any) {
            console.error("Failed to add reply:", err);
            if (err.response && err.response.status === 401) {
                openModal({ message: '답글 작성은 로그인 후 가능합니다.' });
            } else {
                openModal({ message: '답글 작성 실패' });
            }
        }
    };

    // 게시글 삭제
    const handleDeletePost = () => {
        if (!user?.userNo || post?.userNo !== user.userNo) {
            openModal({ message: '본인 글만 삭제 가능합니다.' });
            return;
        }
        openModal({
            message: '게시글을 삭제하시겠습니까?',
            onConfirm: async () => {
                try {
                    await api.delete(`/community/challenge/${challengeNo}`);
                    openModal({ message: '게시글 삭제 완료' });
                    navigate('/community/challenge');
                } catch (err: any) {
                    console.error(err);
                    if (err.response && err.response.status === 401) {
                        openModal({ message: '삭제 권한이 없습니다.' });
                    } else {
                        openModal({ message: '게시글 삭제 실패' });
                    }
                }
            },
            onCancel: () => { }
        });
    };

    // 댓글 삭제
    const handleDeleteComment = (replyNo: number, commentUserNo: number) => {
        if (!user?.userNo || commentUserNo !== user.userNo) {
            openModal({ message: '본인 댓글만 삭제 가능합니다.' });
            return;
        }
        openModal({
            message: '댓글을 삭제하시겠습니까?',
            onConfirm: async () => {
                try {
                    await api.delete(`/community/challenge/replies/${replyNo}`, { data: { userNo: user.userNo } });
                    const repliesRes = await api.get<Reply[]>(`/community/challenge/replies/${challengeNo}`);
                    setReplies(repliesRes.data);
                } catch (err: any) {
                    console.error(err);
                    if (err.response && err.response.status === 401) {
                        openModal({ message: '삭제 권한이 없습니다.' });
                    } else {
                        openModal({ message: '댓글 삭제 실패' });
                    }
                }
            },
            onCancel: () => { }
        });
    };
    
    // 게시글 수정 버튼 클릭
    const handleEditClick = () => {
        if (!user?.userNo || post?.userNo !== user.userNo) {
            openModal({ message: '본인 글만 수정 가능합니다.' });
            return;
        }
        navigate(`/community/challenge/form/${challengeNo}?mode=edit`);
    };

 if (isLoading) return <div className={styles.loading}>로딩 중...</div>;
    if (error) return <div className={styles.error}>{error}</div>;
    if (!post) return <div className={styles.error}>게시글이 존재하지 않습니다.</div>;

    const imageUrl = post?.serverName ? `${API_BASE}/images/${post.serverName}` : 'https://placehold.co/400x400/CCCCCC/ffffff?text=No+Image';

    return (
        <>
            <CommunityHeader />
            <div className={styles.container}>
                <h1>{post.title}</h1>
                <div className={styles.postMeta}>
                    <span>{post.username}</span> | <span>{new Date(post.createdAt).toLocaleString()}</span> | <span>조회수 {post.views}</span>
                </div>
                <img src={imageUrl} alt="챌린지 이미지" className={styles.postImage} />
                
                    {post.videoUrl && (
                    <button onClick={() => {
                        const url = post.videoUrl?.startsWith('http') ? post.videoUrl : `http://${post.videoUrl}`;
                        window.open(url, '_blank');
                    }}>
                        챌린지 보러가기
                    </button>
                )}

                <div className={styles.postActions}>
                    <button onClick={handleLikeToggle}>{isLiked ? '좋아요 취소' : '좋아요'} ({likesCount})</button>
                    {user?.userNo === post.userNo && (
                        <>
                            <button onClick={handleEditClick}>수정</button>
                            <button onClick={handleDeletePost}>삭제</button>
                        </>
                    )}
                </div>

                <hr />

                {user?.userNo ? (
                    <div className={styles.commentInputBox}>
                        <input
                            value={newComment}
                            onChange={e => setNewComment(e.target.value)}
                            placeholder="댓글 입력..."
                            onKeyPress={e => { if (e.key === 'Enter') handleAddComment(); }}
                        />
                        <button onClick={handleAddComment}>댓글 등록</button>
                    </div>
                ) : <div className={styles.loginRequired}>로그인 후 댓글 작성 가능</div>}

                <div className={styles.commentsList}>
                    {replies.length === 0 ? (
                        <div className={styles.noComments}>아직 댓글이 없습니다.</div>
                    ) : (
                        renderReplies()
                    )}
                </div>
                <div ref={commentsEndRef} />

                <button onClick={() => navigate(-1)}>뒤로가기</button>
            </div>

            {modal && (
                <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                        <p>{modal.message}</p>
                        <div className={styles.modalActions}>
                            {modal.onConfirm && (
                                <button onClick={handleConfirm}>확인</button>
                            )}
                            {modal.onCancel && (
                                <button onClick={handleCancel}>취소</button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );

    function renderReplies() {
        const replyMap = new Map<number, Reply[]>();
        replies.forEach(reply => {
            const parentId = reply.category === 'CHALLENGE' ? 0 : reply.refNo;
            if (!replyMap.has(parentId)) {
                replyMap.set(parentId, []);
            }
            replyMap.get(parentId)?.push(reply);
        });

        const parentReplies = replyMap.get(0) || [];
        parentReplies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        return parentReplies.map(parent => {
            const childReplies = replyMap.get(parent.replyNo) || [];
            childReplies.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

            const parentImage = parent.profileImageServerName ? `${API_BASE}/images/${parent.profileImageServerName}` : 'https://placehold.co/40x40/CCCCCC/ffffff?text=No+Image';

            return (
                <div key={parent.replyNo} className={styles.commentWrapper}>
                    <div className={styles.comment}>
                        <img src={parentImage} alt="프로필" className={styles.commentProfileImage} />
                        <div>
                            <strong className={styles.username}>{parent.username}</strong>
                            <span className={styles.timestamp}>{new Date(parent.createdAt).toLocaleString()}</span>
                            <p className={styles.content}>{parent.content}</p>
                            <div className={styles.commentActions}>
                                {user?.userNo === parent.userNo && (
                                    <button onClick={() => handleDeleteComment(parent.replyNo, parent.userNo)}>삭제</button>
                                )}
                                <button onClick={() => setReplyingToReplyNo(replyingToReplyNo === parent.replyNo ? null : parent.replyNo)}>
                                    {replyingToReplyNo === parent.replyNo ? '취소' : '답글'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {replyingToReplyNo === parent.replyNo && (
                        <div className={styles.replyInputBox}>
                            <input
                                value={replyingContent}
                                onChange={e => setReplyingContent(e.target.value)}
                                placeholder="답글 입력..."
                                onKeyPress={e => { if (e.key === 'Enter') handleReplySubmit(); }}
                            />
                            <button onClick={handleReplySubmit}>등록</button>
                        </div>
                    )}

                    {childReplies.length > 0 && (
                        <div className={styles.childComments}>
                            {childReplies.map(child => {
                                const childImage = child.profileImageServerName ? `${API_BASE}/images/${child.profileImageServerName}` : 'https://placehold.co/30x30/CCCCCC/ffffff?text=No+Image';
                                return (
                                    <div key={child.replyNo} className={styles.commentChild}>
                                        <img src={childImage} alt="프로필" />
                                        <div>
                                            <strong className={styles.username}>{child.username}</strong>
                                            <span className={styles.timestamp}>{new Date(child.createdAt).toLocaleString()}</span>
                                            <p className={styles.content}>{child.content}</p>
                                            {user?.userNo === child.userNo && (
                                                <button onClick={() => handleDeleteComment(child.replyNo, child.userNo)}>삭제</button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            );
        });
    }
};

export default ChallengeDetail;