import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './ChallengeDetail.module.css';
import CommunityHeader from '../CommunityHeader';
import axios from 'axios';

// 백엔드 DTO에 맞게 타입 정의
interface ChallengeDetailItem {
    challengeNo: number;
    username: string;
    title: string;
    views: number;
    likes: number;
    postImageUrl?: string; // 사용자가 업로드한 이미지 URL
    imageUrl?: string; // (기존) 관리자가 설정한 챌린지 정보 이미지 URL
    videoUrl?: string;
    createdAt: string;
    userNo: number;
}

interface ReplyItem {
    replyNo: number;
    parentReplyNo?: number;
    refNo: number;
    userNo: number;
    username: string;
    sik_bti?: string;
    content: string;
    createdAt: string;
    profileImageServerName?: string;
}

const ChallengeDetail = () => {
    // challengeId 대신 challengeNo를 사용하도록 변경
    const { challengeNo } = useParams<{ challengeNo: string }>();
    const navigate = useNavigate();
    const [post, setPost] = useState<ChallengeDetailItem | null>(null);
    const [comments, setComments] = useState<ReplyItem[]>([]);
    const [commentInput, setCommentInput] = useState<string>('');
    const [isLiked, setIsLiked] = useState<boolean>(false);
    const [likesCount, setLikesCount] = useState<number>(0);
    const currentUserId = 2; // 실제 사용자 ID를 로그인 상태 관리에서 가져와야 합니다.

    useEffect(() => {
        // challengeId 대신 challengeNo가 유효한지 먼저 확인
        if (!challengeNo) {
            console.error("URL 파라미터 challengeNo가 유효하지 않습니다.");
            alert("잘못된 접근입니다.");
            navigate('/community/challenge');
            return;
        }

        const fetchPostAndComments = async () => {
            try {
                const [postResponse, repliesResponse, likeStatusResponse] = await Promise.all([
                    axios.get<ChallengeDetailItem>(`http://localhost:8080/community/challenge/${challengeNo}`),
                    axios.get<ReplyItem[]>(`http://localhost:8080/community/challenge/replies/${challengeNo}`),
                    axios.get<boolean>(`http://localhost:8080/community/challenge/like/status/${challengeNo}?userId=${currentUserId}`)
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

        fetchPostAndComments();
    }, [challengeNo, navigate, currentUserId]);

    const handleLikeToggle = async () => {
        if (!post) return;
        try {
            await axios.post(`http://localhost:8080/community/challenge/like/${post.challengeNo}?userId=${currentUserId}`);
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
            };
            const response = await axios.post<ReplyItem>(`http://localhost:8080/community/challenge/replies/${post.challengeNo}`, newComment);

            setComments([...comments, response.data]);
            setCommentInput('');
        } catch (error) {
            console.error("댓글 등록 실패:", error);
            alert("댓글 등록에 실패했습니다.");
        }
    };

    const handleDelete = async () => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            try {
                await axios.delete(`http://localhost:8080/community/challenge/${post?.challengeNo}`);
                console.log('게시글이 성공적으로 삭제되었습니다.');
                alert('게시글이 삭제되었습니다.');
                navigate('/community/challenge'); // 삭제 성공 후 목록 페이지로 이동
            } catch (error) {
                console.error("게시글 삭제 실패:", error);
                alert("게시글 삭제에 실패했습니다.");
            }
        }
    };

    const handleEdit = () => {
        navigate(`/community/challenge/form/${post?.challengeNo}?mode=edit`);
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
                        {post.postImageUrl && (
                            <div className={styles.mediaPlaceholder}>
                                <img
                                    src={`http://localhost:8080/images/${post.postImageUrl}`}
                                    alt="챌린지 이미지"
                                    className={styles.challengeImage}
                                />
                            </div>
                        )}
                        {!post.postImageUrl && (
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
                    <div className={styles.commentInputBox}>
                        <input
                            type="text"
                            className={styles.commentInput}
                            placeholder="댓글을 입력해주세요."
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                        />
                        <button className={styles.submitBtn} onClick={handleCommentSubmit}>등록하기</button>
                    </div>

                    <div className={styles.commentList}>
                        {comments.map((comment) => (
                            <div key={comment.replyNo} className={styles.commentItem}>
                                <div className={styles.avatar}>
                                    {comment.profileImageServerName ? (
                                        <img src={`http://localhost:8080/images/${comment.profileImageServerName}`} alt="프로필 이미지" className={styles.profileImage} />
                                    ) : (
                                        <div className={styles.defaultAvatar}></div>
                                    )}
                                </div>
                                <div className={styles.commentBody}>
                                    <span className={styles.commentAuthor}>{comment.username}</span>
                                    <span className={styles.commentTime}>{formatTimeAgo(comment.createdAt)}</span>
                                    <p>{comment.content}</p>
                                    <div className={styles.commentActions}>
                                        <span className={styles.replyBtn}>답글쓰기</span>
                                        <span className={styles.reportBtn}>신고</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ChallengeDetail;