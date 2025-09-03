// ChallengeDetail.tsx
import { useState } from 'react';
import styles from './ChallengeDetail.module.css';
import CommunityHeader from '../CommunityHeader';

// 타입 정의
interface Comment {
  author: string;
  content: string;
  time: string;
  isReply: boolean;
  replyTo?: string;
}

const ChallengeDetail = () => {
  const [commentInput, setCommentInput] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const totalPages = 10;
  
  // 예시 데이터에 videoUrl 추가
  const post = {
    title: '마라탕에 팅후루 넣어먹기 챌린지 !!!',
    author: 'goofy',
    regDate: '2025.08.27',
    views: 59,
    likes: 624,
    videoUrl: 'https://youtu.be/7HjLushlx6s' // 예시 URL
  };

  const comments: Comment[] = [
    { author: 'goofy', content: '저 첫번째 셀린지 ^-^', time: '3분', isReply: false },
    { author: '맛곰eee', content: 'ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ', time: '11분', isReply: false },
    { author: '성민S2', content: '조식 트리케라톱스', time: '22분', isReply: false },
    { author: '송아hyun', content: '말로리 소나이퍼', time: '30분', isReply: false },
    { author: '윱비912', content: '푸드 갠디', time: '55분', isReply: false },
    { author: 'goofy', content: '너 많이 먹어', time: '5분', isReply: true, replyTo: '윱비912' },
    { author: '윱비912', content: '안고갈게요', time: '2분', isReply: true, replyTo: 'goofy' },
  ];

  const handleCommentSubmit = () => {
    if (commentInput.trim() === '') return;
    console.log('댓글 제출:', commentInput);
    setCommentInput('');
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  return (
    <>
    <CommunityHeader/>
    <div className={styles.container}>
      <div className={styles.postHeader}>
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.postMeta}>
          <span>{post.author}</span>
          <span>{post.regDate}</span>
          <span>조회수 {post.views}</span>
        </div>
      </div>
      
      <div className={styles.postContent}>
        <div className={styles.mediaContainer}>
          <button className={styles.navButton}>&lt;</button>
          <div className={styles.mediaPlaceholder}>동영상/이미지</div>
          <button className={styles.navButton}>&gt;</button>
        </div>

        {/* '챌린지 보러가기' 버튼 추가 */}
        {post.videoUrl && (
          <div className={styles.challengeLink}>
            <a href={post.videoUrl} target="_blank" rel="noopener noreferrer">
              <button className={styles.challengeButton}>챌린지 보러가기</button>
            </a>
          </div>
        )}

        <div className={styles.actions}>
          <div className={styles.likeButton}>👍 {post.likes}</div>
          <div className={styles.reportButton}>🚨 신고</div>
          <div className={styles.editDeleteButtons}>
            <button className={styles.actionBtn}>수정</button>
            <button className={styles.actionBtn}>삭제</button>
          </div>
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
            <div key={index} className={`${styles.commentItem} ${comment.isReply ? styles.isReply : ''}`}>
              <div className={styles.avatar}></div>
              <div className={styles.commentBody}>
                <span className={styles.commentAuthor}>{comment.author}</span>
                <span className={styles.commentTime}>{comment.time}</span>
                <p>{comment.content}</p>
                <div className={styles.commentActions}>
                  <span className={styles.replyBtn}>답글쓰기</span>
                  <span className={styles.reportBtn}>신고</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className={styles.pagination}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={styles.pageBtn}
          >&lt;</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => handlePageChange(page)}
              className={`${styles.pageBtn} ${currentPage === page ? styles.active : ''}`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={styles.pageBtn}
          >&gt;</button>
        </div>
      </div>
    </div>
    </>
  );
};

export default ChallengeDetail;