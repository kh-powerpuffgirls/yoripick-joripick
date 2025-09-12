import { useEffect, useState, useRef, type KeyboardEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
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
  sik_bti?: string;
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

  const user = useSelector((state: RootState) => state.auth.user);
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

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

  // Axios instance with JWT token
  const getApi = () =>
    axios.create({
      baseURL: API_BASE,
      headers: user && accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      withCredentials: true,
    });

  // 게시글, 댓글, 좋아요 데이터 가져오기
  useEffect(() => {
    if (!boardNo || isNaN(Number(boardNo))) {
      setError('유효하지 않은 게시글 ID입니다.');
      setIsLoading(false);
      return;
    }

    const fetchPostData = async () => {
      try {
        setIsLoading(true);
        const postRes = await axios.get<FreePost>(`${API_BASE}/community/free/${boardNo}`, { withCredentials: true });
        setPost(postRes.data);

        let repliesRes: Reply[] = [];
        let likesCountRes = 0;
        let isLikedRes = false;

        if (user) {
          const [likesCountResp, likeStatusResp, repliesResp] = await Promise.all([
            axios.get<number>(`${API_BASE}/community/free/${boardNo}/likes/count`, { withCredentials: true }),
            axios.get<{ isLiked: boolean }>(`${API_BASE}/community/free/${boardNo}/likes/status`, { params: { userNo: user.userNo }, withCredentials: true }),
            axios.get<Reply[]>(`${API_BASE}/community/free/${boardNo}/replies`, { withCredentials: true }),
          ]);

          likesCountRes = likesCountResp.data;
          isLikedRes = likeStatusResp.data.isLiked;
          repliesRes = repliesResp.data;
        } else {
          const repliesResp = await axios.get<Reply[]>(`${API_BASE}/community/free/${boardNo}/replies`);
          repliesRes = repliesResp.data;
        }

        setLikesCount(likesCountRes);
        setIsLiked(isLikedRes);
        setReplies(repliesRes);
        setError(null);
      } catch (err) {
        console.error('게시글 데이터를 불러오는 데 실패했습니다:', err);
        setError('게시글 데이터를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostData();
  }, [boardNo, user]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [replies]);

  // 좋아요 토글
  const handleLikeToggle = async () => {
    if (!user) { alert('좋아요는 로그인 후 이용 가능합니다.'); return; }
    if (isLikeLoading) return;
    setIsLikeLoading(true);
    try {
      await getApi().post(`/community/free/${boardNo}/likes`, { userNo: user.userNo });
      setIsLiked(prev => !prev);
      setLikesCount(prev => (isLiked ? prev - 1 : prev + 1));
    } catch (err) {
      console.error('좋아요 토글 실패:', err);
      alert('좋아요 처리 중 오류 발생');
    } finally {
      setIsLikeLoading(false);
    }
  };

  // 댓글 작성
  const handleAddComment = async () => {
    if (!user) { alert('로그인 후 댓글 작성 가능'); return; }
    if (!newComment.trim()) { alert('댓글 입력 필요'); return; }
    try {
      await getApi().post(`/community/free/replies`, { refNo: Number(boardNo), category: 'BOARD', userNo: user.userNo, content: newComment.trim() });
      setNewComment('');
      const repliesRes = await getApi().get<Reply[]>(`/community/free/${boardNo}/replies`);
      setReplies(repliesRes.data);
    } catch (err) {
      console.error('댓글 작성 실패:', err);
      alert('댓글 작성 실패');
    }
  };

  const handleNewCommentKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); }
  };

  // 게시글 수정/삭제
  const handleEditClick = () => {
    if (!user) { alert('로그인 후 수정 가능'); return; }
    if (post && user.userNo === post.userNo) navigate(`/community/free/form/${boardNo}`);
    else alert('본인 게시글만 수정 가능');
  };
  const handleDeletePost = async () => {
    if (!user || !post) return;
    if (user.userNo !== post.userNo) { alert('본인 게시글만 삭제 가능'); return; }
    if (!window.confirm('게시글 삭제하시겠습니까?')) return;
    try { await getApi().delete(`/community/free/${boardNo}`, { params: { userNo: user.userNo } }); alert('게시글 삭제 완료'); navigate('/community/free'); }
    catch (err) { console.error(err); alert('게시글 삭제 실패'); }
  };

  // 댓글 렌더링
  const renderReplies = () => {
    const parentReplies = replies.filter(r => r.category === 'BOARD');
    return parentReplies.map(parent => {
      const childReplies = replies.filter(r => r.category === 'REPLY' && r.refNo === parent.replyNo);
      const parentProfileImageUrl = parent.profileImageServerName
        ? `${API_BASE}/images/${parent.profileImageServerName}`
        : 'https://placehold.co/400x400/CCCCCC/ffffff?text=No+Image';

      return (
        <div key={parent.replyNo} className={styles.commentWrapper}>
          <div className={styles.comment}>
            <div className={styles.commentHeader}>
              <img src={parentProfileImageUrl} alt="프로필" className={styles.commentProfileImage} />
              <div className={styles.commentInfo}>
                <span className={styles.commentAuthor}>{parent.username}{parent.sik_bti && ` (${parent.sik_bti})`}</span>
                <span className={styles.commentDate}>{new Date(parent.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {editingReplyNo === parent.replyNo ? (
              <div className={styles.editForm}>
                <textarea
                  className={styles.commentEditInput}
                  value={editingContent}
                  onChange={e => setEditingContent(e.target.value)}
                />
                <div className={styles.editActions}>
                  <button
                    className={styles.commentActionButton}
                    onClick={async () => {
                      if (!editingContent.trim()) return alert('내용 입력 필요');
                      try {
                        await getApi().put(`/community/free/replies/${editingReplyNo}`, { content: editingContent, userNo: user?.userNo });
                        const repliesRes = await getApi().get<Reply[]>(`/community/free/${boardNo}/replies`);
                        setReplies(repliesRes.data);
                        setEditingReplyNo(null);
                        setEditingContent('');
                      } catch (err) {
                        console.error(err);
                        alert('댓글 수정 실패');
                      }
                    }}
                  >
                    저장
                  </button>
                  <button className={styles.commentActionButton} onClick={() => setEditingReplyNo(null)}>취소</button>
                </div>
              </div>
            ) : (
              <p className={styles.commentContent}>{parent.content}</p>
            )}

            <div className={styles.commentActions}>
              {user && parent.userNo === user.userNo && editingReplyNo !== parent.replyNo && (
                <>
                  <button
                    className={styles.commentActionButton}
                    onClick={() => { setEditingReplyNo(parent.replyNo); setEditingContent(parent.content); }}
                  >
                    수정
                  </button>
                  <button
                    className={styles.commentActionButton}
                    onClick={async () => {
                      if (!window.confirm('댓글 삭제하시겠습니까?')) return;
                      try {
                        await getApi().delete(`/community/free/replies/${parent.replyNo}`, { params: { userNo: user.userNo } });
                        const repliesRes = await getApi().get<Reply[]>(`/community/free/${boardNo}/replies`);
                        setReplies(repliesRes.data);
                      } catch (err) {
                        console.error(err);
                        alert('댓글 삭제 실패');
                      }
                    }}
                  >
                    삭제
                  </button>
                </>
              )}
              {user && replyingToReplyNo !== parent.replyNo && (
                <button className={styles.commentActionButton} onClick={() => setReplyingToReplyNo(parent.replyNo)}>답글</button>
              )}
            </div>

            {/* 답글 작성 */}
            {replyingToReplyNo === parent.replyNo && (
              <form
                className={styles.replyForm}
                onSubmit={async e => {
                  e.preventDefault();
                  if (!replyingContent.trim()) return alert('답글 입력 필요');
                  try {
                    await getApi().post(`/community/free/replies`, {
                      refNo: parent.replyNo,
                      category: 'REPLY',
                      userNo: user?.userNo,
                      content: replyingContent.trim()
                    });
                    const repliesRes = await getApi().get<Reply[]>(`/community/free/${boardNo}/replies`);
                    setReplies(repliesRes.data);
                    setReplyingContent('');
                    setReplyingToReplyNo(null);
                  } catch (err) {
                    console.error(err);
                    alert('답글 작성 실패');
                  }
                }}
              >
                <textarea
                  className={styles.replyInput}
                  value={replyingContent}
                  onChange={e => setReplyingContent(e.target.value)}
                  placeholder="답글 입력..."
                />
                <button type="submit" className={styles.replySubmitButton}>등록</button>
              </form>
            )}

            {/* 대댓글 표시 */}
            {childReplies.length > 0 && (
              <div className={styles.childComments}>
                {childReplies.map(child => {
                  const childProfileImageUrl = child.profileImageServerName
                    ? `${API_BASE}/images/${child.profileImageServerName}`
                    : 'https://placehold.co/400x400/CCCCCC/ffffff?text=No+Image';
                  return (
                    <div key={child.replyNo} className={styles.commentChild}>
                      <div className={styles.commentHeader}>
                        <img src={childProfileImageUrl} alt="프로필" className={styles.commentProfileImage} />
                        <div className={styles.commentInfo}>
                          <span className={styles.commentAuthor}>{child.username}{child.sik_bti && ` (${child.sik_bti})`}</span>
                          <span className={styles.commentDate}>{new Date(child.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      {editingReplyNo === child.replyNo ? (
                        <div className={styles.editForm}>
                          <textarea
                            className={styles.commentEditInput}
                            value={editingContent}
                            onChange={e => setEditingContent(e.target.value)}
                          />
                          <div className={styles.editActions}>
                            <button
                              className={styles.commentActionButton}
                              onClick={async () => {
                                if (!editingContent.trim()) return alert('내용 입력 필요');
                                try {
                                  await getApi().put(`/community/free/replies/${editingReplyNo}`, { content: editingContent, userNo: user?.userNo });
                                  const repliesRes = await getApi().get<Reply[]>(`/community/free/${boardNo}/replies`);
                                  setReplies(repliesRes.data);
                                  setEditingReplyNo(null);
                                  setEditingContent('');
                                } catch (err) {
                                  console.error(err);
                                  alert('대댓글 수정 실패');
                                }
                              }}
                            >
                              저장
                            </button>
                            <button className={styles.commentActionButton} onClick={() => setEditingReplyNo(null)}>취소</button>
                          </div>
                        </div>
                      ) : (
                        <p className={styles.commentContent}>{child.content}</p>
                      )}
                      {user && child.userNo === user.userNo && editingReplyNo !== child.replyNo && (
                        <div className={styles.commentActions}>
                          <button
                            className={styles.commentActionButton}
                            onClick={() => { setEditingReplyNo(child.replyNo); setEditingContent(child.content); }}
                          >
                            수정
                          </button>
                          <button
                            className={styles.commentActionButton}
                            onClick={async () => {
                              if (!window.confirm('댓글 삭제하시겠습니까?')) return;
                              try {
                                await getApi().delete(`/community/free/replies/${child.replyNo}`, { params: { userNo: user.userNo } });
                                const repliesRes = await getApi().get<Reply[]>(`/community/free/${boardNo}/replies`);
                                setReplies(repliesRes.data);
                              } catch (err) {
                                console.error(err);
                                alert('대댓글 삭제 실패');
                              }
                            }}
                          >
                            삭제
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    });
  };

  if (isLoading) return <div className={styles.loading}>로딩 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!post) return <div className={styles.noPost}>게시글이 존재하지 않습니다.</div>;

  const validImageUrl = post.serverName ? `${API_BASE}/images/${post.serverName}` : post.imageUrl || null;

  return (
    <div className={styles.container}>
      <div className={styles.mainCard}>
        <h1 className={styles.heading}>{post.title}</h1>
        <div className={styles.meta}>
          <span>{post.username}{post.sik_bti ? ` (${post.sik_bti})` : ''}</span>
          <span>작성일: {new Date(post.createdDate).toLocaleString()}</span>
          <span>조회수: {post.views}</span>
        </div>
        <div className={styles.postImageWrapper}>
          <img src={validImageUrl || 'https://placehold.co/400x400/CCCCCC/ffffff?text=No+Image'} alt="게시글 이미지" className={styles.postImage} />
        </div>
        <div className={styles.content}>{post.content}</div>

        <div className={styles.postActions}>
          <button onClick={handleLikeToggle} className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}>❤️ 좋아요 {likesCount}</button>
          {user && post.userNo === user.userNo && (
            <>
              <button onClick={handleEditClick} className={styles.editButton}>수정</button>
              <button onClick={handleDeletePost} className={styles.deleteButton}>삭제</button>
            </>
          )}
        </div>

        <hr className={styles.divider} />

        {user ? (
          <div className={styles.newCommentWrapper}>
            <textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="댓글 작성..." rows={3} className={styles.newCommentInput} onKeyDown={handleNewCommentKeyDown} />
            <button onClick={handleAddComment} className={styles.commentSubmitButton}>댓글 작성</button>
          </div>
        ) : <div className={styles.loginNotice}>로그인 후 댓글 작성 가능</div>}

        <div className={styles.commentsSection}>
          {replies.length > 0 ? renderReplies() : <div className={styles.noComments}>댓글이 없습니다.</div>}
          <div ref={commentsEndRef} />
        </div>

        <div className={styles.backButtonContainer}>
          <button onClick={() => navigate(-1)} className={styles.backButton}>뒤로가기</button>
        </div>
      </div>
    </div>
  );
};

export default FreeDetail;
