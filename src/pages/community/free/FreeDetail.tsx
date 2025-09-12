import { useEffect, useState, useRef, type KeyboardEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './FreeDetail.module.css';

const API_BASE = 'http://localhost:8081';

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

  // 로그인 사용자 정보
  const [user, setUser] = useState<{ userNo: number; username: string } | null>(null);

  // 사용자 정보 가져오기
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get<{ userNo: number; username: string }>(
          `${API_BASE}/auth/me`, // 예: 백엔드에서 로그인 사용자 정보 반환하는 엔드포인트
          {
            withCredentials: true, // 쿠키 포함
          }
        );
        setUser(res.data);
      } catch (err) {
        console.warn('사용자 정보 가져오기 실패:', err);
        setUser(null);
      }
    };

    fetchUser();
  }, []);

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
          axios.get<FreePost>(`${API_BASE}/community/free/${boardNo}`, { withCredentials: true }),
          axios.get<number>(`${API_BASE}/community/free/${boardNo}/likes/count`, { withCredentials: true }),
          axios.get<Reply[]>(`${API_BASE}/community/free/${boardNo}/replies`, { withCredentials: true }),
          axios.get<{ isLiked: boolean }>(`${API_BASE}/community/free/${boardNo}/likes/status`, { withCredentials: true }),
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

  // 좋아요 토글
  const handleLikeToggle = async () => {
    if (!user) {
      alert('좋아요는 로그인 후 이용 가능합니다.');
      return;
    }
    if (isLikeLoading) return;
    setIsLikeLoading(true);
    try {
      await axios.post(`${API_BASE}/community/free/${boardNo}/likes`, null, {
        withCredentials: true,
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

  // 댓글 작성
  const handleAddComment = async () => {
    if (!user) {
      alert('로그인 후 댓글을 작성할 수 있습니다.');
      return;
    }
    if (!newComment.trim()) {
      alert('댓글을 입력해주세요.');
      return;
    }
    try {
      const newReply = {
        refNo: Number(boardNo),
        category: 'BOARD',
        userNo: user.userNo,
        content: newComment.trim(),
      };
      await axios.post(`${API_BASE}/community/free/replies`, newReply, {
        withCredentials: true,
      });
      setNewComment('');
      const repliesRes = await axios.get<Reply[]>(`${API_BASE}/community/free/${boardNo}/replies`, { withCredentials: true });
      setReplies(repliesRes.data);
    } catch (err) {
      console.error('댓글 작성 실패:', err);
      alert('댓글 작성에 실패했습니다.');
    }
  };

  const handleAddReplyToReply = async () => {
    if (!user) {
      alert('로그인 후 대댓글을 작성할 수 있습니다.');
      return;
    }
    if (replyingToReplyNo === null) return;
    if (!replyingContent.trim()) {
      alert('대댓글을 입력해주세요.');
      return;
    }
    try {
      const newReply = {
        refNo: replyingToReplyNo,
        category: 'REPLY',
        userNo: user.userNo,
        content: replyingContent.trim(),
      };
      await axios.post(`${API_BASE}/community/free/replies`, newReply, {
        withCredentials: true,
      });
      setReplyingToReplyNo(null);
      setReplyingContent('');
      const repliesRes = await axios.get<Reply[]>(`${API_BASE}/community/free/${boardNo}/replies`, { withCredentials: true });
      setReplies(repliesRes.data);
    } catch (err) {
      console.error('대댓글 작성 실패:', err);
      alert('대댓글 작성에 실패했습니다.');
    }
  };

  const handleStartEditing = (replyNo: number, content: string) => {
    if (!user) {
      alert('댓글 수정은 로그인 후 이용 가능합니다.');
      return;
    }
    setEditingReplyNo(replyNo);
    setEditingContent(content);
  };

  const handleCancelEditing = () => {
    setEditingReplyNo(null);
    setEditingContent('');
  };

  const handleSaveEditing = async (replyNo: number) => {
    if (!user) {
      alert('댓글 수정은 로그인 후 이용 가능합니다.');
      return;
    }
    if (!editingContent.trim()) {
      alert('댓글 내용을 입력해주세요.');
      return;
    }
    try {
      await axios.put(`${API_BASE}/community/free/replies/${replyNo}`, {
        content: editingContent.trim(),
      }, {
        withCredentials: true,
      });
      setEditingReplyNo(null);
      setEditingContent('');
      const repliesRes = await axios.get<Reply[]>(`${API_BASE}/community/free/${boardNo}/replies`, { withCredentials: true });
      setReplies(repliesRes.data);
    } catch (err) {
      console.error('댓글 수정에 실패했습니다:', err);
      alert('댓글 수정에 실패했습니다.');
    }
  };

  const handleDeleteReply = async (replyNo: number) => {
    if (!user) {
      alert('댓글 삭제는 로그인 후 이용 가능합니다.');
      return;
    }
    if (!window.confirm('댓글을 정말 삭제하시겠습니까?')) return;
    try {
      await axios.delete(`${API_BASE}/community/free/replies/${replyNo}`, {
        withCredentials: true,
      });
      const repliesRes = await axios.get<Reply[]>(`${API_BASE}/community/free/${boardNo}/replies`, { withCredentials: true });
      setReplies(repliesRes.data);
      alert('댓글이 삭제되었습니다.');
    } catch (err) {
      console.error('댓글 삭제에 실패했습니다:', err);
      alert('댓글 삭제에 실패했습니다.');
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
    if (!user) {
      alert('로그인 후 수정할 수 있습니다.');
      return;
    }
    if (post && user.userNo === post.userNo) {
      navigate(`/community/free/form/${boardNo}`);
    } else {
      alert('본인 게시글만 수정할 수 있습니다.');
    }
  };

  const handleDeletePost = async () => {
    if (!user) {
      alert('로그인 후 삭제할 수 있습니다.');
      return;
    }
    if (!post) return;
    if (!window.confirm('게시글을 정말 삭제하시겠습니까?')) return;

    if (user.userNo !== post.userNo) {
      alert('본인 게시글만 삭제할 수 있습니다.');
      return;
    }

    try {
      await axios.delete(`${API_BASE}/community/free/${boardNo}`, {
        withCredentials: true,
      });
      alert('게시글이 삭제되었습니다.');
      navigate('/community/free');
    } catch (err) {
      console.error('게시글 삭제에 실패했습니다:', err);
      alert('게시글 삭제에 실패했습니다.');
    }
  };

  if (isLoading) return <div className={styles.loading}>로딩 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!post) return <div className={styles.noPost}>게시글이 존재하지 않습니다.</div>;

  const validImageUrl = post.serverName
    ? `${API_BASE}/images/${post.serverName}`
    : post.imageUrl || null;

  const renderReplies = () => {
    const parentReplies = replies.filter((r) => r.category === 'BOARD');

    return parentReplies.map((parent) => {
      const childReplies = replies.filter(
        (r) => r.category === 'REPLY' && r.refNo === parent.replyNo
      );

      const parentProfileImageUrl = parent.profileImageServerName
        ? `${API_BASE}/images/${parent.profileImageServerName}`
        : 'https://placehold.co/400x400/CCCCCC/ffffff?text=No+Image';

      return (
        <div key={parent.replyNo} className={styles.commentWrapper}>
          <div className={styles.comment}>
            <div className={styles.commentHeader}>
              <img
                src={parentProfileImageUrl}
                alt="프로필"
                className={styles.commentProfileImage}
              />
              <div className={styles.commentInfo}>
                <span className={styles.commentAuthor}>
                  {parent.username}
                  {parent.sik_bti && <span className={styles.sikBti}> ({parent.sik_bti})</span>}
                </span>
                <span className={styles.commentDate}>
                  {new Date(parent.createdAt).toLocaleString()}
                </span>
              </div>
            </div>

            <div className={styles.commentContentWrapper}>
              {editingReplyNo === parent.replyNo ? (
                <div className={styles.editForm}>
                  <textarea
                    value={editingContent}
                    onChange={(e) => setEditingContent(e.target.value)}
                    className={styles.commentEditInput}
                    rows={3}
                  />
                  <div className={styles.editActions}>
                    <button onClick={() => handleSaveEditing(parent.replyNo)} className={styles.commentActionButton}>
                      저장
                    </button>
                    <button onClick={handleCancelEditing} className={styles.commentActionButton}>
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <p className={styles.commentContent}>{parent.content}</p>
              )}

              <div className={styles.commentActions}>
                {user && parent.userNo === user.userNo && (
                  <>
                    <button
                      onClick={() => handleStartEditing(parent.replyNo, parent.content)}
                      className={styles.commentActionButton}
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDeleteReply(parent.replyNo)}
                      className={styles.commentActionButton}
                    >
                      삭제
                    </button>
                  </>
                )}
                <button
                  onClick={() =>
                    replyingToReplyNo === parent.replyNo ? setReplyingToReplyNo(null) : setReplyingToReplyNo(parent.replyNo)
                  }
                  className={styles.commentActionButton}
                >
                  {replyingToReplyNo === parent.replyNo ? '취소' : '답글 달기'}
                </button>
              </div>
            </div>

            {replyingToReplyNo === parent.replyNo && (
              <div className={styles.replyForm}>
                <textarea
                  value={replyingContent}
                  onChange={(e) => setReplyingContent(e.target.value)}
                  placeholder="대댓글을 작성해주세요..."
                  className={styles.replyInput}
                  rows={2}
                  onKeyDown={handleReplyToReplyKeyDown}
                />
                <button onClick={handleAddReplyToReply} className={styles.replySubmitButton}>
                  입력
                </button>
              </div>
            )}
          </div>

          {childReplies.length > 0 && (
            <div className={styles.childComments}>
              {childReplies.map((child) => {
                const childProfileImageUrl = child.profileImageServerName
                  ? `${API_BASE}/images/${child.profileImageServerName}`
                  : 'https://placehold.co/400x400/CCCCCC/ffffff?text=No+Image';

                return (
                  <div key={child.replyNo} className={styles.commentChild}>
                    <div className={styles.commentHeader}>
                      <img
                        src={childProfileImageUrl}
                        alt="프로필 이미지"
                        className={styles.commentProfileImage}
                      />
                      <div className={styles.commentInfo}>
                        <span className={styles.commentAuthor}>
                          {child.username}
                          {child.sik_bti && <span className={styles.sikBti}> ({child.sik_bti})</span>}
                        </span>
                        <span className={styles.commentDate}>
                          {new Date(child.createdAt).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <div className={styles.commentContentWrapper}>
                      {editingReplyNo === child.replyNo ? (
                        <div className={styles.editForm}>
                          <textarea
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            className={styles.commentEditInput}
                            rows={3}
                          />
                          <div className={styles.editActions}>
                            <button onClick={() => handleSaveEditing(child.replyNo)} className={styles.commentActionButton}>
                              저장
                            </button>
                            <button onClick={handleCancelEditing} className={styles.commentActionButton}>
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className={styles.commentContent}>{child.content}</p>
                      )}
                      {user && child.userNo === user.userNo && (
                        <div className={styles.commentActions}>
                          <button
                            onClick={() => handleStartEditing(child.replyNo, child.content)}
                            className={styles.commentActionButton}
                          >
                            수정
                          </button>
                          <button
                            onClick={() => handleDeleteReply(child.replyNo)}
                            className={styles.commentActionButton}
                          >
                            삭제
                          </button>
                        </div>
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
  };

  return (
    <div className={styles.container}>
      <div className={styles.mainCard}>
        <h1 className={styles.heading}>{post.title}</h1>
        <div className={styles.meta}>
          <span>{post.username}</span>
          <span>작성일: {new Date(post.createdDate).toLocaleString()}</span>
          <span>조회수: {post.views}</span>
        </div>
        <div className={styles.postImageWrapper}>
          <img
            src={
              validImageUrl || 'https://placehold.co/400x400/CCCCCC/ffffff?text=No+Image'
            }
            alt="게시글 이미지"
            className={styles.postImage}
          />
        </div>
        <div className={styles.content}>{post.content}</div>

        <div className={styles.postActions}>
          <div className={styles.leftActions}>
            <button
              onClick={handleLikeToggle}
              disabled={isLikeLoading}
              className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
            >
              <span role="img" aria-label="heart">❤️</span> 좋아요 {likesCount}
            </button>
          </div>

          {user && post.userNo === user.userNo && (
            <div className={styles.rightActions}>
              <button onClick={handleEditClick} className={styles.editButton}>
                수정하기
              </button>
              <button onClick={handleDeletePost} className={styles.deleteButton}>
                삭제하기
              </button>
            </div>
          )}
        </div>

        <hr className={styles.divider} />

        <div className={styles.commentsSection}>
          <h4 className={styles.commentHeading}>댓글 ({post.replyCount || 0})</h4>
          <div className={styles.commentsList}>
            {replies.length > 0 ? renderReplies() : <p className={styles.noComments}>아직 댓글이 없습니다.</p>}
            <div ref={commentsEndRef} />
          </div>

          {user ? (
            <div className={styles.commentForm}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 작성해주세요..."
                className={styles.commentInput}
                onKeyDown={handleNewCommentKeyDown}
                rows={3}
              />
              <button onClick={handleAddComment} className={styles.commentButton}>
                댓글 작성
              </button>
            </div>
          ) : (
            <p className={styles.loginPrompt}>댓글 작성을 위해 로그인 해주세요.</p>
          )}
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
