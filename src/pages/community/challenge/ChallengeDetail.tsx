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
  imageUrl?: string;
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
  const { challengeId } = useParams<{ challengeId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<ChallengeDetailItem | null>(null);
  const [comments, setComments] = useState<ReplyItem[]>([]);
  const [commentInput, setCommentInput] = useState<string>('');
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(0);
  const currentUserId = 2; // 임시로 고정된 현재 로그인 사용자 ID

  useEffect(() => {
    if (challengeId) {
      const fetchPostAndComments = async () => {
        try {
          // 게시글 상세 정보 가져오기
          const postResponse = await axios.get<ChallengeDetailItem>(`http://localhost:8080/community/challenge/${challengeId}`);
          setPost(postResponse.data);
          setLikesCount(postResponse.data.likes);

          // 좋아요 상태 확인
          const likeStatusResponse = await axios.get<boolean>(`http://localhost:8080/community/challenge/like/status/${challengeId}?userId=${currentUserId}`);
          setIsLiked(likeStatusResponse.data);

          // 댓글 목록 가져오기
          const repliesResponse = await axios.get<ReplyItem[]>(`http://localhost:8080/community/challenge/replies/${challengeId}`);
          setComments(repliesResponse.data);

        } catch (error) {
          console.error("데이터 로드 실패:", error);
          alert("게시글 정보를 불러오는 데 실패했습니다.");
          navigate('/community/challenge'); // 실패 시 목록으로 이동
        }
      };

      fetchPostAndComments();
    }
  }, [challengeId, navigate]);

  const handleLikeToggle = async () => {
    if (!post) return;
    try {
      await axios.post(`http://localhost:8080/community/challenge/like/${post.challengeNo}`);
      // 좋아요 상태와 개수 즉시 업데이트
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    } catch (error) {
      console.error("좋아요 토글 실패:", error);
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
      await axios.post(`http://localhost:8080/community/challenge/replies/${post.challengeNo}`, newComment);
      
      // 댓글 목록 새로고침 (간단한 방법)
      const updatedReplies = await axios.get<ReplyItem[]>(`http://localhost:8080/community/challenge/replies/${post.challengeNo}`);
      setComments(updatedReplies.data);
      setCommentInput('');
    } catch (error) {
      console.error("댓글 등록 실패:", error);
      alert("댓글 등록에 실패했습니다.");
    }
  };
  
  const handleDelete = () => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      // 삭제 로직은 ChallengeForm에서 처리하는 것이 일반적이므로, 여기서는 Form으로 이동하도록 합니다.
      navigate(`/community/challenge/form/${post?.challengeNo}?mode=delete`);
    }
  };

  const handleEdit = () => {
    navigate(`/community/challenge/form/${post?.challengeNo}?mode=edit`);
  };

  if (!post) {
    return <div>Loading...</div>;
  }

  // 댓글 시간 포맷팅 (예시)
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
            {post.imageUrl && (
              <div className={styles.mediaPlaceholder}>
                <img src={`http://localhost:8080/images/${post.imageUrl}`} alt="챌린지 이미지" className={styles.challengeImage} />
              </div>
            )}
            {!post.imageUrl && (
              <div className={styles.mediaPlaceholder}>이미지 없음</div>
            )}
          </div>

          {post.videoUrl && (
            <div className={styles.challengeLink}>
              <a href={post.videoUrl} target="_blank" rel="noopener noreferrer">
                <button className={styles.challengeButton}>챌린지 보러가기</button>
              </a>
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
            {comments.map((comment, index) => (
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