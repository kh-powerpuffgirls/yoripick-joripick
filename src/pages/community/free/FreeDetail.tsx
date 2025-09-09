import { useEffect, useState, useRef, type KeyboardEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './FreeDetail.module.css';

const API_BASE = 'http://localhost:8080';

interface FreePost {
  boardNo: number;
  userNo: number;
  title: string;
  username: string;
  content: string;
  createdDate: string;
  views: number;
  likes: number;
  replyCount: number;
  serverName?: string | null;
  imageUrl?: string | null;
}

interface Reply {
  replyNo: number;
  refNo: number;
  content: string;
  createdAt: string;
  category?: string;
  userNo: number;
  username: string;
  sik_bti?: string;
  profileImageServerName?: string;
}

const FreeDetail = () => {
  const { boardNo } = useParams<{ boardNo: string }>();
  const navigate = useNavigate();

  const [post, setPost] = useState<FreePost | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLiked, setIsLiked] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingReplyNo, setEditingReplyNo] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');

  const [replyingToReplyNo, setReplyingToReplyNo] = useState<number | null>(null);
  const [replyingContent, setReplyingContent] = useState('');

  const commentsEndRef = useRef<HTMLDivElement>(null);

  const tempUserNo = 2;

  useEffect(() => {
    if (!boardNo || isNaN(Number(boardNo))) {
      setError('유효하지 않은 게시글 ID입니다.');
      setIsLoading(false);
      return;
    }

    const fetchPostData = async () => {
      try {
        setIsLoading(true);
        const [postRes, likesRes, repliesRes, likeStatusRes] = await Promise.all([
          axios.get(`${API_BASE}/community/free/${boardNo}`),
          axios.get(`${API_BASE}/community/free/${boardNo}/likes/count`),
          axios.get(`${API_BASE}/community/free/${boardNo}/replies`),
          axios.get(`${API_BASE}/community/free/${boardNo}/likes/status`, {
            params: { userNo: tempUserNo },
          }),
        ]);

        setPost(postRes.data);
        setLikesCount(likesRes.data);
        setReplies(repliesRes.data);
        setIsLiked(likeStatusRes.data.isLiked);
        setError(null);
      } catch (err) {
        console.error('게시글 데이터를 불러오는 데 실패했습니다:', err);
        setError('게시글 데이터를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostData();
  }, [boardNo]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [replies]);

  const handleLikeToggle = async () => {
    if (isLikeLoading) return;
    setIsLikeLoading(true);
    try {
      await axios.post(`${API_BASE}/community/free/${boardNo}/likes`, null, {
        params: { userNo: tempUserNo },
      });
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch (err) {
      console.error('좋아요 토글에 실패했습니다:', err);
      alert('좋아요 처리 중 오류가 발생했습니다.');
    } finally {
      setIsLikeLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return alert('댓글을 입력해주세요.');
    try {
      const newReply = {
        refNo: Number(boardNo),
        category: 'BOARD',
        userNo: tempUserNo,
        content: newComment.trim(),
      };
      await axios.post(`${API_BASE}/community/free/replies`, newReply);
      setNewComment('');
      const repliesRes = await axios.get(`${API_BASE}/community/free/${boardNo}/replies`);
      setReplies(repliesRes.data);
    } catch (err) {
      console.error('댓글 작성 실패:', err);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleAddReplyToReply = async () => {
    if (!replyingContent.trim()) return alert('대댓글을 입력해주세요.');
    if (replyingToReplyNo === null) return;

    try {
      const newReply = {
        refNo: replyingToReplyNo,
        category: 'REPLY',
        userNo: tempUserNo,
        content: replyingContent.trim(),
      };
      await axios.post(`${API_BASE}/community/free/replies`, newReply);
      setReplyingToReplyNo(null);
      setReplyingContent('');
      const repliesRes = await axios.get(`${API_BASE}/community/free/${boardNo}/replies`);
      setReplies(repliesRes.data);
    } catch (err) {
      console.error('대댓글 작성 실패:', err);
      alert('대댓글 작성에 실패했습니다.');
    }
  };

  const handleStartEditing = (replyNo: number, content: string) => {
    setEditingReplyNo(replyNo);
    setEditingContent(content);
  };

  const handleCancelEditing = () => {
    setEditingReplyNo(null);
    setEditingContent('');
  };

  const handleSaveEditing = async (replyNo: number) => {
    if (!editingContent.trim()) return alert('댓글 내용을 입력해주세요.');
    try {
      await axios.put(`${API_BASE}/community/free/replies/${replyNo}`, {
        content: editingContent.trim(),
      });
      setEditingReplyNo(null);
      setEditingContent('');
      const repliesRes = await axios.get(`${API_BASE}/community/free/${boardNo}/replies`);
      setReplies(repliesRes.data);
    } catch (err) {
      console.error('댓글 수정에 실패했습니다:', err);
      alert('댓글 수정에 실패했습니다.');
    }
  };

  const handleNewCommentKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const handleReplyToReplyKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddReplyToReply();
    }
  };

  const handleEditClick = () => {
    if (!post) return;
    navigate(`/community/free/form/${boardNo}`);
  };

  if (isLoading) return <div className={styles.loading}>로딩 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!post) return <div className={styles.noPost}>게시글이 존재하지 않습니다.</div>;

  const imageUrl = post.serverName
    ? `${API_BASE}/images/${post.serverName}`
    : post.imageUrl || null;

  const renderReplies = () => {
    const parentReplies = replies.filter((r) => r.category === 'BOARD');

    return parentReplies.map((parent) => {
      const childReplies = replies.filter(
        (r) => r.category === 'REPLY' && r.refNo === parent.replyNo
      );

      return (
        <div key={parent.replyNo} className={styles.commentWrapper}>
          <div className={styles.comment}>
            <div className={styles.commentMeta}>
              {parent.profileImageServerName && (
                <img
                  src={`${API_BASE}/images/${parent.profileImageServerName}`}
                  alt="프로필"
                  className={styles.profileImage}
                />
              )}
              <span className={styles.commentAuthor}>
                {parent.username} <span className={styles.sikBti}>({parent.sik_bti || null})</span>
              </span>
              <span className={styles.commentDate}>
                {new Date(parent.createdAt).toLocaleString()}
              </span>
            </div>

            {editingReplyNo === parent.replyNo ? (
              <>
                <textarea
                  value={editingContent}
                  onChange={(e) => setEditingContent(e.target.value)}
                  className={styles.commentEditInput}
                  rows={3}
                />
                <div className={styles.editActions}>
                  <button onClick={() => handleSaveEditing(parent.replyNo)} className={styles.commentButton}>
                    저장
                  </button>
                  <button onClick={handleCancelEditing} className={styles.commentButton}>
                    취소
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className={styles.commentContent}>{parent.content}</p>
                {parent.userNo === tempUserNo && (
                  <button
                    onClick={() => handleStartEditing(parent.replyNo, parent.content)}
                    className={styles.editButtonSmall}
                  >
                    수정
                  </button>
                )}
              </>
            )}

            {replyingToReplyNo === parent.replyNo ? (
              <div className={styles.replyForm}>
                <textarea
                  value={replyingContent}
                  onChange={(e) => setReplyingContent(e.target.value)}
                  placeholder="대댓글을 작성해주세요..."
                  className={styles.commentInput}
                  rows={2}
                  onKeyDown={handleReplyToReplyKeyDown}
                />
                <div className={styles.commentActions}>
                  <button onClick={handleAddReplyToReply} className={styles.commentButton}>
                    대댓글 작성
                  </button>
                  <button onClick={() => setReplyingToReplyNo(null)} className={styles.commentButton}>
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() =>
                  setReplyingToReplyNo(replyingToReplyNo === parent.replyNo ? null : parent.replyNo)
                }
                className={styles.replyToggleButton}
              >
                {replyingToReplyNo === parent.replyNo ? '대댓글 취소' : '답글 달기'}
              </button>
            )}
          </div>

          {childReplies.length > 0 && (
            <div className={styles.childComments}>
              {childReplies.map((child) => (
                <div key={child.replyNo} className={styles.commentChild}>
                  <div className={styles.commentMeta}>
                    {child.profileImageServerName && (
                      <img
                        src={`${API_BASE}/images/${child.profileImageServerName}`}
                        alt="프로필 이미지"
                        className={styles.profileImage}
                      />
                    )}
                    <span className={styles.commentAuthor}>
                      {child.username}
                      <span className={styles.sikBti}> ({child.sik_bti || null})</span>
                    </span>
                    <span className={styles.commentDate}>
                      {new Date(child.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {editingReplyNo === child.replyNo ? (
                    <>
                      <textarea
                        value={editingContent}
                        onChange={(e) => setEditingContent(e.target.value)}
                        className={styles.commentEditInput}
                        rows={3}
                      />
                      <div className={styles.editActions}>
                        <button onClick={() => handleSaveEditing(child.replyNo)} className={styles.commentButton}>
                          저장
                        </button>
                        <button onClick={handleCancelEditing} className={styles.commentButton}>
                          취소
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className={styles.commentContent}>{child.content}</p>
                      {child.userNo === tempUserNo && (
                        <button
                          onClick={() => handleStartEditing(child.replyNo, child.content)}
                          className={styles.editButtonSmall}
                        >
                          수정
                        </button>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainCard}>
        {imageUrl && (
          <div className={styles.postImageWrapper}>
            <img src={imageUrl} alt="게시글 이미지" className={styles.postImage} />
          </div>
        )}

        <h1 className={styles.heading}>{post.title}</h1>
        <div className={styles.meta}>
          <span>{post.username}</span>
          <span>작성일: {new Date(post.createdDate).toLocaleString()}</span>
          <span>조회수: {post.views}</span>
        </div>
        <div className={styles.content}>{post.content}</div>

        {post.userNo === tempUserNo && (
          <button onClick={handleEditClick} className={styles.editButton}>
            수정하기
          </button>
        )}

        <div className={styles.actions}>
          <button
            onClick={handleLikeToggle}
            disabled={isLikeLoading}
            className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
          >
            <span role="img" aria-label="heart">❤️</span> 좋아요 {likesCount}
          </button>
        </div>

        <hr className={styles.divider} />

        <div className={styles.commentsSection}>
          <h4 className={styles.commentHeading}>댓글 ({post.replyCount})</h4>
          <div className={styles.commentsList}>
            {replies.length > 0 ? renderReplies() : <p className={styles.noComments}>아직 댓글이 없습니다.</p>}
            <div ref={commentsEndRef} />
          </div>

          <div className={styles.commentForm}>
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="댓글을 작성해주세요..."
              className={styles.commentInput}
              onKeyDown={handleNewCommentKeyDown}
              rows={3}
            />
            <div className={styles.commentActions}>
              <button onClick={handleAddComment} className={styles.commentButton}>
                댓글 작성
              </button>
            </div>
          </div>
        </div>

        <div className={styles.backButtonContainer}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>
            뒤로가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default FreeDetail;