import { useEffect, useState, useRef, type KeyboardEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import { store } from '../../../store/store';
import styles from './FreeDetail.module.css';
import CommunityHeader from '../Header/CommunityHeader';
import CommunityModal from '../CommunityModal';
import ReportModal from '../../../components/Report/ReportModal';

const API_BASE = 'http://localhost:8081';

const getAccessToken = () => store.getState().auth.accessToken;

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

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
  subheading?: string;
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

interface ModalState {
  message: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

interface ReportOption {
  reportType: string;
  category: string;
  detail: string;
}

interface ReportTargetInfo {
  author: string;
  title: string;
  category: string;
  refNo: number;
}

const useModal = () => {
  const [modal, setModal] = useState<ModalState | null>(null);

  const openModal = (modalData: ModalState) => setModal(modalData);
  const closeModal = () => setModal(null);
  const handleModalConfirm = () => {
    modal?.onConfirm?.();
    closeModal();
  };

  return { modal, openModal, closeModal, handleModalConfirm };
};

const FreeDetail = () => {
  const { boardNo } = useParams<{ boardNo: string }>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user); 
  const { modal, openModal, closeModal, handleModalConfirm } = useModal();

  const [post, setPost] = useState<FreePost | null>(null);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    
  const [editingReplyNo, setEditingReplyNo] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [replyingToReplyNo, setReplyingToReplyNo] = useState<number | null>(null);
  const [replyingContent, setReplyingContent] = useState('');
  const [newComment, setNewComment] = useState('');

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTargetInfo, setReportTargetInfo] = useState<ReportTargetInfo | null>(null);
  const [reportOptions, setReportOptions] = useState<ReportOption[]>([]);
  

  const commentsEndRef = useRef<HTMLDivElement>(null);

  const fetchReplies = async () => {
    try {
      const repliesRes = await api.get<Reply[]>(`/community/free/${boardNo}/replies`);
      setReplies(repliesRes.data);
    } catch (err) {
      console.error('댓글 목록 재로드 실패', err);
    }
  };

  useEffect(() => {
    const postNo = Number(boardNo);
    if (isNaN(postNo)) {
      setError('유효하지 않은 게시글 ID입니다.');
      setIsLoading(false);
      return;
    }

    const fetchPostData = async () => {
      try {
        setIsLoading(true);

        const [postRes, repliesRes, likesCountRes, isLikedRes] = await Promise.all([
          api.get<FreePost>(`/community/free/${postNo}`),
          api.get<Reply[]>(`/community/free/${postNo}/replies`),
          api.get<number>(`/community/free/${postNo}/likes/count`),
          user ? api.get<boolean>(`/community/free/${postNo}/likes/status`) : Promise.resolve({ data: false }),
        ]);

        setPost(postRes.data);
        setReplies(repliesRes.data);
        setLikesCount(likesCountRes.data);
        setIsLiked(isLikedRes.data);
        setError(null);
      } catch (err: any) {
        console.error('게시글 정보 로드 오류:', err);
        setError('게시글 정보를 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPostData();
  }, [boardNo, user]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [replies]);

  const handleLikeToggle = async () => {
    if (!user?.userNo) {
      openModal({ message: '로그인 후 좋아요 가능합니다.', showCancel: false });
      return;
    }

    const prevIsLiked = isLiked;
    const prevLikesCount = likesCount;

    setIsLiked(!prevIsLiked);
    setLikesCount(prevLikesCount + (prevIsLiked ? -1 : 1));

    try {
      const postNo = Number(boardNo);
      await api.post(`/community/free/${postNo}/likes`, null, {
        params: { status: prevIsLiked ? 'COMMON' : 'LIKE' },
      });
    } catch (err: any) {
      console.error('좋아요 처리 오류:', err);
      setIsLiked(prevIsLiked);
      setLikesCount(prevLikesCount);
      openModal({ message: '좋아요 처리에 실패했습니다.', showCancel: false });
    }
  };

  const handleAddComment = async () => {
    const trimmedComment = newComment.trim();

    if (!user?.userNo) {
      openModal({ message: '로그인 후 댓글 작성 가능', showCancel: false });
      return;
    }
    if (!trimmedComment) {
      openModal({ message: '댓글 입력 필요', showCancel: false });
      return;
    }
    
    try {
      await api.post(`/community/free/replies`, { content: newComment, refNo: Number(boardNo), category: 'BOARD' });
      setNewComment('');
      await fetchReplies();
    } catch {
      openModal({ message: '댓글 작성 실패', showCancel: false });
    }
  };

  const handleReplySubmit = async () => {
    const trimmedReply = replyingContent.trim();
    
    if (!user?.userNo) { 
      openModal({ message: '로그인 후 답글 작성 가능합니다.', showCancel: false });
      return;
    }
    if (replyingToReplyNo === null || !trimmedReply) { 
      openModal({ message: '답글을 작성하려면 내용을 입력해야 합니다.', showCancel: false });
      return;
    }
    
    try {
      await api.post(`/community/free/replies`, { content: replyingContent, refNo: replyingToReplyNo, category: 'REPLY' });
      setReplyingContent('');
      setReplyingToReplyNo(null);
      await fetchReplies();
    } catch {
      openModal({ message: '답글 작성 실패', showCancel: false });
    }
  };
    
  const handleSaveEditedReply = async (replyNo: number, content: string) => {
    const trimmedContent = content.trim(); // ⚠️ trim()만 남김

    if (!user?.userNo) { 
      openModal({ message: '댓글 수정 불가: 로그인해야 합니다.', showCancel: false }); 
      return; 
    }
    if (!trimmedContent) {
      openModal({ message: '댓글 수정 불가: 내용을 입력해야 합니다.', showCancel: false }); 
      return;
    }
    
    try {
      await api.put(`/community/free/replies/${replyNo}`, { content: content });
      setEditingReplyNo(null);
      setEditingContent('');
      await fetchReplies();
    } catch {
      openModal({ message: '댓글 수정 실패', showCancel: false });
    }
  };
    
  const handleEditReply = (replyNo: number) => {
    if (!user?.userNo) {
      openModal({ message: '로그인 후 수정 가능합니다.', showCancel: false });
      return;
    }
    
    const replyToEdit = replies.find(r => r.replyNo === replyNo);
    if (replyToEdit && user.userNo === replyToEdit.userNo) {
      setEditingReplyNo(replyNo);
      setEditingContent(replyToEdit.content);
      setReplyingToReplyNo(null);
    } else {
      openModal({ message: '댓글 수정 권한이 없습니다.', showCancel: false });
    }
  };

  const handleReplyButtonClick = (replyNo: number) => {
    if (!user?.userNo) {
      openModal({ message: '로그인 후 답글 작성 가능합니다.', showCancel: false });
      return;
    }

    setEditingReplyNo(null);

    setReplyingToReplyNo(prevNo => (prevNo === replyNo ? null : replyNo));
    setReplyingContent('');
  };

  const handleDeleteReply = (replyNo: number, commentUserNo: number) => {
    if (!user?.userNo) { 
      openModal({ message: '로그인 후 삭제 가능합니다.', showCancel: false });
      return;
    }
    if (commentUserNo !== user.userNo) { 
      openModal({ message: '본인 댓글만 삭제 가능합니다.', showCancel: false }); 
      return; 
    }
    openModal({
      message: '댓글을 삭제하시겠습니까?',
      showCancel: true,
      onConfirm: async () => {
        try {
          await api.delete(`/community/free/replies/${replyNo}`);
          await fetchReplies();
        } catch {
          openModal({ message: '댓글 삭제 실패', showCancel: false });
        }
      }
    });
  };
    
  const handleNewCommentKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAddComment();
    }
  };

  const fetchReportOptions = async (category: string) => {
    try {
      const res = await api.get<ReportOption[]>(`/community/report/types`);
      const filteredOptions = res.data.filter(option => option.category === category);
      setReportOptions(filteredOptions);
    } catch (err) {
      console.error('신고 유형 로드 오류:', err);
      openModal({ message: '신고 유형을 불러오는 데 실패했습니다.', showCancel: false });
      setReportOptions([]);
    }
  };

  const handleReportClick = async (targetInfo: ReportTargetInfo) => {
    if (!user) {
      openModal({ message: '신고 기능은 로그인 후 이용 가능합니다.', showCancel: false });
      return;
    }
    const targetUserNo = targetInfo.category === 'BOARD' 
      ? post?.userNo 
      : replies.find(r => r.replyNo === targetInfo.refNo)?.userNo;

    if (user.userNo === targetUserNo) {
      openModal({ message: '자신의 게시글/댓글은 신고할 수 없습니다.', showCancel: false });
      return;
    }

    setReportTargetInfo(targetInfo);
    await fetchReportOptions(targetInfo.category);
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = async (reportType: string, content: string, refNo: number, refType: string) => {
    try {
      await api.post(`/community/report`, { reportType, content, refNo, refType });
      openModal({ message: '신고가 성공적으로 접수되었습니다.', showCancel: false });
      setIsReportModalOpen(false);
      setReportTargetInfo(null);
    } catch (err: any) {
      console.error('신고 제출 오류:', err.response?.data?.message || err.message);
      openModal({ message: err.response?.data?.message || '신고 처리에 실패했습니다.', showCancel: false });
      setIsReportModalOpen(false);
      setReportTargetInfo(null);
    }
  };

  const handleEditClick = () => {
    if (!user) {
      openModal({ message: '로그인 후 수정 가능합니다.', showCancel: false });
      return;
    }
    if (post && user.userNo === post.userNo) {
      navigate(`/community/free/form/${boardNo}`);
    } else {
      openModal({ message: '수정 권한이 없습니다.', showCancel: false });
    }
  };

  const handleDeletePost = () => {
    if (!user || !post) return;
    if (user.userNo !== post.userNo) {
      openModal({ message: '삭제 권한이 없습니다.', showCancel: false });
      return;
    }

    openModal({
      message: '정말로 이 게시글을 삭제하시겠습니까?',
      showCancel: true,
      onConfirm: async () => {
        try {
          await api.delete(`/community/free/${boardNo}`);
          openModal({ message: '게시글이 삭제되었습니다.', showCancel: false, onConfirm: () => navigate('/community/free') });
        } catch (err) {
          console.error(err);
          openModal({ message: '게시글 삭제에 실패했습니다.', showCancel: false });
        }
      },
    });
  };

  const renderReplies = () => {
    const parentReplies = replies
      .filter(r => r.category === 'BOARD' && r.refNo === Number(boardNo))
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    const getProfileImageUrl = (serverName: string | undefined) => 
      serverName 
      ? `${API_BASE}/images/${serverName}` 
      : 'https://placehold.co/40x40/CCCCCC/ffffff?text=No+Image';

    return parentReplies.map(parent => {
      const childReplies = replies
        .filter(r => r.category === 'REPLY' && r.refNo === parent.replyNo)
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

      const parentProfileImageUrl = getProfileImageUrl(parent.profileImageServerName);

      return (
        <div key={parent.replyNo} className={styles.commentWrapper}>
          <div className={styles.commentItem}>
            <Link to={`/mypage/${parent.userNo}`} className={styles.avatar}>
              <img src={parentProfileImageUrl} alt="프로필" className={styles.profileImage} />
            </Link>
            <div className={styles.commentBody}>
              <div className={styles.commentHeader}>
                <Link to={`/mypage/${parent.userNo}`} className={styles.commentAuthor}>
                  {parent.username} {parent.sik_bti && `(${parent.sik_bti})`}
                </Link>
                <span className={styles.commentTime}>{new Date(parent.createdAt).toLocaleString()}</span>
              </div>
              
              {editingReplyNo === parent.replyNo ? (
                <div className={styles.editingBox}>
                  <textarea
                    value={editingContent}
                    onChange={e => setEditingContent(e.target.value)}
                    className={styles.editingInput}
                  />
                  <button onClick={() => handleSaveEditedReply(parent.replyNo, editingContent)} className={styles.editingButton}>저장</button>
                  <button onClick={() => setEditingReplyNo(null)} className={styles.editingButton}>취소</button>
                </div>
              ) : (
                <p className={styles.commentContent}>{parent.content}</p>
              )}
             
              <div className={styles.commentActions}>
                {user?.userNo === parent.userNo && (
                  <>
                    <span onClick={() => handleEditReply(parent.replyNo)}>수정</span>
                    <span onClick={() => handleDeleteReply(parent.replyNo, parent.userNo)}>삭제</span> 
                  </>
                )}
                {user?.userNo ? (
                                <span onClick={() => handleReplyButtonClick(parent.replyNo)}>
                                {replyingToReplyNo === parent.replyNo ? '취소' : '답글'}
                            </span>
                ) : null}
                {user?.userNo !== parent.userNo && (
                  <span onClick={() => 
                    handleReportClick({
                      author: parent.username,
                      title: parent.content.substring(0, 30) + '...',
                      category: 'REPLY',
                      refNo: parent.replyNo,
                    })
                  }>
                    신고
                  </span>
                )}
              </div>
            </div>
          </div>

          {user?.userNo && replyingToReplyNo === parent.replyNo && (
            <div className={styles.replyForm}>
              <textarea
                value={replyingContent}
                onChange={(e) => setReplyingContent(e.target.value)}
                placeholder="답글을 입력하세요..."
                className={styles.replyInput}
                onKeyDown={(e: KeyboardEvent) => { 
                  if (e.key === 'Enter' && !e.shiftKey) { 
                    e.preventDefault();
                    handleReplySubmit(); 
                  }
                }}
              />
              <button onClick={handleReplySubmit} className={styles.replySubmitButton}>
                답글 등록
              </button>
            </div>
          )}

          {childReplies.map(child => {
            const childProfileImageUrl = getProfileImageUrl(child.profileImageServerName);
            return (
                <div key={child.replyNo} className={`${styles.commentItem} ${styles.isReply}`}>
                  <Link to={`/mypage/${child.userNo}`} className={styles.avatar}>
                    <img src={childProfileImageUrl} alt="프로필" className={styles.profileImage} />
                  </Link>
                  <div className={styles.commentBody}>
                    <div className={styles.commentHeader}>
                      <span className={styles.parentUsername}>@{parent.username}</span> 
                      <Link to={`/mypage/${child.userNo}`} className={styles.commentAuthor}>
                        {child.username} {child.sik_bti && `(${child.sik_bti})`}
                      </Link>
                      <span className={styles.commentTime}>{new Date(child.createdAt).toLocaleString()}</span>
                    </div>
                    
                    {editingReplyNo === child.replyNo ? (
                        <div className={styles.editingBox}>
                          <textarea
                            value={editingContent}
                            onChange={e => setEditingContent(e.target.value)}
                            className={styles.editingInput}
                          />
                          <button onClick={() => handleSaveEditedReply(child.replyNo, editingContent)} className={styles.editingButton}>저장</button>
                          <button onClick={() => setEditingReplyNo(null)} className={styles.editingButton}>취소</button>
                        </div>
                    ) : (
                        <p className={styles.commentContent}>{child.content}</p>
                    )}

                    <div className={styles.commentActions}>
                      {user?.userNo === child.userNo && (
                        <>
                          <span onClick={() => handleEditReply(child.replyNo)}>수정</span>
                          <span onClick={() => handleDeleteReply(child.replyNo, child.userNo)}>삭제</span>
                        </>
                      )}
                      {user?.userNo !== child.userNo && (
                        <span onClick={() => 
                          handleReportClick({
                            author: child.username,
                            title: child.content.substring(0, 30) + '...',
                            category: 'REPLY',
                            refNo: child.replyNo,
                          })
                        }>
                          신고
                        </span>
                      )}
                    </div>
                  </div>
                </div>
            );
          })}
        </div>
      );
    });
  };

  if (isLoading) return <div className={styles.loading}>게시글을 불러오는 중입니다...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!post) return <div className={styles.noPost}>해당 게시글이 존재하지 않거나 삭제되었습니다.</div>;

  const validImageUrl = post.serverName ? `${API_BASE}/images/${post.serverName}` : post.imageUrl || null;

  return (
    <>
      {modal && <CommunityModal message={modal.message} onConfirm={handleModalConfirm} onClose={closeModal} showCancel={modal.showCancel} />}
      {isReportModalOpen && reportTargetInfo && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          onSubmit={handleReportSubmit}
          reportOptions={reportOptions}
          targetInfo={reportTargetInfo}
        />
      )}

      <CommunityHeader />
      <div className={styles.container}>
        <div className={styles.mainCard}>
          <div className={styles.postHeader}>
            {post.subheading && <p className={styles.subtitle}>[{post.subheading}]</p>}
            <h1 className={styles.title}>{post.title}</h1>
            <div className={styles.meta}>
              <span>
                작성자: {post.username}
                {post.sik_bti && ` (${post.sik_bti})`}
              </span>
              <span>작성일: {new Date(post.createdDate).toLocaleString()}</span>
              <span>조회수: {post.views}</span>
              <span>좋아요: {likesCount}</span>
            </div>
          </div>
          {validImageUrl && <img src={validImageUrl} alt="게시글 첨부 이미지" className={styles.postImage} />}
          <p className={styles.content}>{post.content}</p>
        </div>

        <div className={styles.postActions}>
          <div>
            <button className={styles.likeButton} onClick={handleLikeToggle}>
              <span className={styles.heartIcon}>{isLiked ? '❤️' : '🤍'}</span>
            </button>
          </div>

          <div className={styles.editDeleteButtons}>
            {user?.userNo === post.userNo ? (
              <>
                <button className={styles.editButton} onClick={handleEditClick}>
                  수정
                </button>
                <button className={styles.deleteButton} onClick={handleDeletePost}>
                  삭제
                </button>
              </>
            ) : (
              <button
                className={styles.reportButton}
                onClick={() =>
                  handleReportClick({
                    author: post.username,
                    title: post.title,
                    category: 'BOARD',
                    refNo: post.boardNo,
                  })
                }
              >
                신고
              </button>
            )}
          </div>
        </div>
        <div className={styles.commentSection}> 
          {user?.userNo ? (
            <div className={styles.commentInputBox}>
              <textarea 
                 value={newComment} 
                 onChange={e => setNewComment(e.target.value)} 
                 placeholder="댓글 입력..." 
                 onKeyDown={handleNewCommentKeyDown} 
                 className={styles.commentInput} 
              />
              <button onClick={handleAddComment} className={styles.submitBtn}>댓글 등록</button>
            </div>
          ) : <div className={styles.loginRequired}>로그인 후 댓글 작성 가능</div>}

          <div className={styles.commentList}>{replies.length === 0 ? <div className={styles.noComments}>아직 댓글이 없습니다.</div> : renderReplies()}</div>
          <div ref={commentsEndRef} />
        </div>
      </div>
    </>
  );
};

export default FreeDetail;