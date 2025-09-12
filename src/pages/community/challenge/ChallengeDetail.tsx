import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ChallengeDetail.module.css';
import CommunityHeader from '../CommunityHeader';
import axios from 'axios';

const API_BASE = 'http://localhost:8081';

interface ChallengeDetailItem {
    challengeNo: number;
    userNo: number;
    username: string;
    title: string;
    views: number;
    likes: number;
    postImageUrl?: string;
    videoUrl?: string;
    createdAt: string;
}

interface ReplyItem {
    replyNo: number;
    refNo: number;
    userNo: number;
    username: string;
    sik_bti?: string;
    content: string;
    createdAt: string;
    profileImageServerName?: string;
    category: string;
}

const ChallengeDetail = () => {
    const { challengeNo } = useParams<{ challengeNo: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<ChallengeDetailItem | null>(null);
    const [comments, setComments] = useState<ReplyItem[]>([]);
    const [commentInput, setCommentInput] = useState<string>('');
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [likesCount, setLikesCount] = useState<number>(0);
    const [replyingToReplyNo, setReplyingToReplyNo] = useState<number | null>(null);
    const [replyingContent, setReplyingContent] = useState<string>('');
    const currentUserId = 2; // 로그인 상태 관리에서 가져와야 함

    useEffect(() => {
        if (!challengeNo || isNaN(Number(challengeNo))) {
            console.error("URL 파라미터 challengeNo가 유효하지 않습니다.");
            alert("잘못된 접근입니다.");
            navigate('/community/challenge');
            return;
        }
        fetchPostAndComments();
    }, [challengeNo, navigate, currentUserId]);

    const fetchPostAndComments = async () => {
        try {
            const [postResponse, repliesResponse, likeStatusResponse] = await Promise.all([
                axios.get<ChallengeDetailItem>(`${API_BASE}/community/challenge/${challengeNo}`),
                axios.get<ReplyItem[]>(`${API_BASE}/community/challenge/replies/${challengeNo}`),
                axios.get<boolean>(`${API_BASE}/community/challenge/like/status/${challengeNo}?userId=${currentUserId}`)
            ]);

            const postData = postResponse.data;
            setPost(postData);
            setLikesCount(postData.likes);
            setIsLiked(likeStatusResponse.data);
            setComments(repliesResponse.data);
        } catch (error) {
            console.error("데이터 로드 실패:", error);
            alert("게시글 정보를 불러오는 데 실패했습니다. 서버 상태를 확인해주세요.");
            navigate('/community/challenge');
        }
    };

    const fetchComments = async () => {
        if (!challengeNo) return;
        try {
            const repliesResponse = await axios.get<ReplyItem[]>(`${API_BASE}/community/challenge/replies/${challengeNo}`);
            setComments(repliesResponse.data);
        } catch (error) {
            console.error("댓글 새로고침 실패:", error);
        }
    };

    const handleLikeToggle = async () => {
        if (!post) return;
        try {
            await axios.post(`${API_BASE}/community/challenge/like/${post.challengeNo}?userId=${currentUserId}`);
            const newIsLiked = !isLiked;
            setIsLiked(newIsLiked);
            setLikesCount(newIsLiked ? likesCount + 1 : likesCount - 1);
        } catch (error) {
            console.error("좋아요 토글 실패:", error);
            alert("좋아요 처리에 실패했습니다.");
        }
    };

    const handleGoToChallenge = () => {
        if (post?.videoUrl) {
            let url = post.videoUrl;
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            window.open(url, '_blank');
        } else {
            alert('등록된 챌린지 URL이 없습니다.');
        }
    };

    const handleCommentSubmit = async () => {
        if (commentInput.trim() === '' || !post) return;
        try {
            const newComment = {
                content: commentInput,
                userNo: currentUserId,
                refNo: post.challengeNo,
                category: "CHALLENGE" 
            };
            await axios.post(`${API_BASE}/community/challenge/replies`, newComment);
            setCommentInput('');
            await fetchComments();
        } catch (error) {
            console.error("댓글 등록 실패:", error);
            alert("댓글 등록에 실패했습니다.");
        }
    };

    const handleReplySubmit = async () => {
        if (replyingContent.trim() === '' || replyingToReplyNo === null) return;
        try {
            const newReply = {
                content: replyingContent.trim(),
                userNo: currentUserId,
                refNo: replyingToReplyNo, 
                category: "REPLY",
            };
            await axios.post(`${API_BASE}/community/challenge/replies`, newReply);
            setReplyingContent('');
            setReplyingToReplyNo(null);
            await fetchComments();
        } catch (error) {
            console.error("답글 등록 실패:", error);
            alert("답글 등록에 실패했습니다.");
        }
    };

    const handleDelete = async () => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            try {
                await axios.delete(`${API_BASE}/community/challenge/${post?.challengeNo}`);
                console.log('게시글 삭제 성공');
                alert('게시글이 삭제되었습니다.');
                navigate('/community/challenge');
            } catch (error) {
                console.error("게시글 삭제 실패:", error);
                alert("게시글 삭제에 실패했습니다.");
            }
        }
    };

    const handleEdit = () => {
        navigate(`/community/challenge/form/${post?.challengeNo}?mode=edit`);
    };

    const handleDeleteComment = async (replyNo: number, commentUserNo: number) => {
        if (commentUserNo !== currentUserId) {
            alert("자신이 작성한 댓글만 삭제할 수 있습니다.");
            return;
        }
        if (window.confirm('정말 댓글을 삭제하시겠습니까?')) {
            try {
                await axios.delete(`${API_BASE}/community/challenge/replies/${replyNo}`); 
                alert("댓글이 삭제되었습니다.");
                await fetchComments();
            } catch (error) {
                console.error("댓글 삭제 실패:", error);
                alert("댓글 삭제에 실패했습니다.");
            }
        }
    };

    if (!post) {
        return <div>Loading...</div>;
    }

    const formatTimeAgo = (dateString: string) => {
        const now = new Date();
        const then = new Date(dateString);
        const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);
        if (seconds < 60) return `${seconds}초 전`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}분 전`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}시간 전`;
        const days = Math.floor(hours / 24);
        return `${days}일 전`;
    };

    const buildCommentTree = (comments: ReplyItem[]) => {
        const commentMap = new Map<number, ReplyItem & { children?: (ReplyItem & { children?: any[] })[] }>();
        const rootComments: (ReplyItem & { children?: any[] })[] = [];
    
        comments.forEach(comment => {
            commentMap.set(comment.replyNo, { ...comment, children: [] });
        });
    
        comments.forEach(comment => {
            const currentComment = commentMap.get(comment.replyNo);
            if (!currentComment) return;
    
            if (comment.category === 'REPLY') {
                const parentComment = commentMap.get(comment.refNo);
                if (parentComment) {
                    if (!parentComment.children) {
                        parentComment.children = [];
                    }
                    parentComment.children.push(currentComment);
                } else {
                    rootComments.push(currentComment);
                }
            } else {
                rootComments.push(currentComment);
            }
        });
    
        return rootComments;
    };

    const renderComments = (comments: (ReplyItem & { children?: any[] })[]) => {
        return comments.map((comment) => (
            <div key={comment.replyNo}>
                <div className={`${styles.commentItem} ${comment.category === 'REPLY' ? styles.isReply : ''}`}>
                    <div className={styles.avatar}>
                        {comment.profileImageServerName ? (
                            <img
                                src={`http://localhost:8081/images/${comment.profileImageServerName}`}
                                alt="프로필 이미지"
                                className={styles.profileImage}
                            />
                        ) : (
                            <div className={styles.defaultAvatar}></div>
                        )}
                    </div>
                    <div className={styles.commentBody}>
                        <span className={styles.commentAuthor}>{comment.username}</span>
                        <span className={styles.commentTime}>{formatTimeAgo(comment.createdAt)}</span>
                        <p className={styles.commentContent}>{comment.content}</p>
                        <div className={styles.commentActions}>
                            <span 
                                className={styles.replyBtn} 
                                onClick={() => setReplyingToReplyNo(replyingToReplyNo === comment.replyNo ? null : comment.replyNo)}
                            >
                                {replyingToReplyNo === comment.replyNo ? '취소' : '답글쓰기'}
                            </span>
                            {comment.userNo === currentUserId && (
                                <button 
                                    className={styles.actionBtn} 
                                    onClick={() => handleDeleteComment(comment.replyNo, comment.userNo)}>
                                    삭제
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                
                {replyingToReplyNo === comment.replyNo && (
                    <div className={styles.replyInputBox}>
                        <input
                            type="text"
                            className={styles.commentInput}
                            placeholder={`${comment.username}님에게 답글 달기...`}
                            value={replyingContent}
                            onChange={(e) => setReplyingContent(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') handleReplySubmit();
                            }}
                        />
                        <button className={styles.submitBtn} onClick={handleReplySubmit}>
                            등록
                        </button>
                    </div>
                )}
                
                {comment.children && (
                    <div className={styles.replies}>
                        {renderComments(comment.children)}
                    </div>
                )}
            </div>
        ));
    };

    const commentTree = buildCommentTree(comments);

    return (
        <>
            <CommunityHeader />
            <div className={styles.container}>
                <div className={styles.postHeader}>
                    <h1 className={styles.title}>{post.title}</h1>
                    <div className={styles.postMeta}>
                        <span>{post.username}</span>
                        <span>{post.createdAt.substring(0, 10)}</span>
                        <span>조회수 {post.views}</span>
                    </div>
                </div>

                <div className={styles.postContent}>
                    <div className={styles.mediaContainer}>
                        {post.postImageUrl ? (
                            <img
                                src={`http://localhost:8081/images/${post.postImageUrl}`}
                                alt="챌린지 이미지"
                                className={styles.challengeImage}
                            />
                        ) : (
                            <div className={styles.mediaPlaceholder}>이미지 없음</div>
                        )}
                    </div>

                    {post.videoUrl && (
                        <div className={styles.challengeLink}>
                            <button className={styles.challengeButton} onClick={handleGoToChallenge}>
                                챌린지 보러가기
                            </button>
                        </div>
                    )}

                    <div className={styles.actions}>
                        <div className={styles.likeButton} onClick={handleLikeToggle}>
                            👍 {isLiked ? '좋아요 취소' : '좋아요'} ({likesCount})
                        </div>
                        <div className={styles.reportButton}>🚨 신고</div>
                        {post.userNo === currentUserId && (
                            <div className={styles.editDeleteButtons}>
                                <button className={styles.actionBtn} onClick={handleEdit}>수정</button>
                                <button className={styles.actionBtn} onClick={handleDelete}>삭제</button>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.commentSection}>
                    <div className={styles.commentList}>
                        {renderComments(commentTree)}
                    </div>

                    <div className={styles.commentInputBox}>
                        <input
                            type="text"
                            className={styles.commentInput}
                            placeholder="댓글을 입력해주세요."
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') handleCommentSubmit();
                            }}
                        />
                        <button className={styles.submitBtn} onClick={handleCommentSubmit}>
                            등록하기
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChallengeDetail;