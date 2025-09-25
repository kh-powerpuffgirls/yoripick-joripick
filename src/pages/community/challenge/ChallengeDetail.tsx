import { useEffect, useState, useRef, type KeyboardEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import axios from 'axios';
import CommunityHeader from '../Header/CommunityHeader';
import styles from './ChallengeDetail.module.css';
import { store } from '../../../store/store';
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

export interface Reply {
  replyNo: number;
  userNo: number;
  username: string;
  content: string;
  createdAt: string;
  category: 'CHALLENGE' | 'REPLY';
  refNo?: number;
  profileImageServerName?: string;
  sik_bti?: string;
}

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
  sik_bti?: string;
}

interface ReportTargetInfo {
  author: string;
  title: string;
  category: string;
  refNo: number;
}

interface ReportOption {
  reportType: string;
  category: string;
  detail: string;
}

interface ModalState {
  message: string;
  onConfirm?: () => void;
  showCancel?: boolean;
}

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
  const [editingReplyNo, setEditingReplyNo] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [modal, setModal] = useState<ModalState | null>(null);
  const [reportTargetInfo, setReportTargetInfo] = useState<ReportTargetInfo | null>(null);
  const [reportOptions, setReportOptions] = useState<ReportOption[]>([]);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [nextChallengeNo, setNextChallengeNo] = useState<number | null>(null);
  const [prevChallengeNo, setPrevChallengeNo] = useState<number | null>(null);


  const commentsEndRef = useRef<HTMLDivElement>(null);

  const openModal = (modalData: ModalState) => setModal(modalData);
  const closeModal = () => setModal(null);
  const handleConfirm = () => { modal?.onConfirm?.(); closeModal(); };
  
// ChallengeDetail.tsx
useEffect(() => {
  if (!challengeNo || !user) return;

  const fetchData = async () => {
    try {
      setIsLoading(true);

      const [postRes, repliesRes, likeCountRes] = await Promise.all([
        api.get<ChallengePost>(`/community/challenge/${challengeNo}`),
        api.get<Reply[]>(`/community/challenge/replies/${challengeNo}`),
        api.get<number>(`/community/challenge/like/count/${challengeNo}`)
      ]);

      let isLikedStatus = false;
      if (user?.userNo) {
        isLikedStatus = await api.get<boolean>(`/community/challenge/like/status/${challengeNo}`).then(res => res.data);
      }

      setPost(postRes.data);
      setReplies(repliesRes.data);
      setLikesCount(likeCountRes.data);
      setIsLiked(isLikedStatus);

      try {
        const navRes = await api.get(`/community/challenge/navigation/${challengeNo}`);
        setPrevChallengeNo(navRes.data.prev);
        setNextChallengeNo(navRes.data.next);
      } catch (navErr) {
        console.warn('이전/다음 게시글 정보 로드 실패:', navErr);
        setPrevChallengeNo(null);
        setNextChallengeNo(null);
      }

      setError(null);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.status === 401 ? '로그인이 필요합니다.' : '게시글 정보를 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  fetchData();
}, [challengeNo, user]);

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [replies]);

  const fetchReplies = async () => {
    const repliesRes = await api.get<Reply[]>(`/community/challenge/replies/${challengeNo}`);
    setReplies(repliesRes.data);
  };

  const handleLikeToggle = async () => {
    if (!user?.userNo) {
      openModal({ message: '로그인 후 좋아요 가능합니다.' });
      return;
    }
    const prevIsLiked = isLiked;
    const prevLikesCount = likesCount;
    setIsLiked(!prevIsLiked);
    setLikesCount(prevLikesCount + (prevIsLiked ? -1 : 1));
    try {
      await api.post(`/community/challenge/like/${challengeNo}`, null, {
        params: { status: prevIsLiked ? 'COMMON' : 'LIKE' }
      });
    } catch (err: any) {
      console.error(err);
      setIsLiked(prevIsLiked);
      setLikesCount(prevLikesCount);
      openModal({ message: '좋아요 처리 실패' });
    }
  };

  const handleAddComment = async () => {
    if (!user?.userNo || !newComment.trim()) {
      openModal({ message: !user?.userNo ? '로그인 후 댓글 작성 가능' : '댓글 입력 필요' });
      return;
    }
    try {
      await api.post(`/community/challenge/replies`, { content: newComment.trim(), refNo: Number(challengeNo), category: 'CHALLENGE' });
      setNewComment('');
      await fetchReplies();
    } catch {
      openModal({ message: '댓글 작성 실패' });
    }
  };

  const handleReplySubmit = async () => {
    if (!user?.userNo || replyingToReplyNo === null || !replyingContent.trim()) {
      openModal({ message: '답글을 작성하려면 로그인하고 내용을 입력해야 합니다.' });
      return;
    }
    try {
      await api.post(`/community/challenge/replies`, { content: replyingContent.trim(), refNo: replyingToReplyNo, category: 'REPLY' });
      setReplyingContent('');
      setReplyingToReplyNo(null);
      await fetchReplies();
    } catch {
      openModal({ message: '답글 작성 실패' });
    }
  };

  const handleUpdateReply = async (replyNo: number, content: string) => {
    if (!user?.userNo || !content.trim()) { openModal({ message: '댓글 수정 불가' }); return; }
    try {
      await api.put(`/community/challenge/replies/${replyNo}`, { content });
      setEditingReplyNo(null);
      setEditingContent('');
      await fetchReplies();
    } catch {
      openModal({ message: '댓글 수정 실패' });
    }
  };

  const handleDeleteComment = (replyNo: number, commentUserNo: number) => {
    if (!user?.userNo || commentUserNo !== user.userNo) { openModal({ message: '본인 댓글만 삭제 가능합니다.' }); return; }
    openModal({
      message: '댓글을 삭제하시겠습니까?',
      showCancel: true,
      onConfirm: async () => {
        try {
          await api.delete(`/community/challenge/replies/${replyNo}`);
          await fetchReplies();
        } catch {
          openModal({ message: '댓글 삭제 실패' });
        }
      }
    });
  };

  const handleReportClick = async (target: Reply | ChallengePost) => {
    if (!user?.userNo) {
      openModal({ message: '로그인 후 신고 가능합니다.' });
      return;
    }
    
    const targetUserNo = 'replyNo' in target ? target.userNo : target.userNo;
    if (user.userNo === targetUserNo) {
      openModal({ message: '본인 게시물 또는 댓글은 신고할 수 없습니다.' });
      return;
    }
    
    let targetInfo: ReportTargetInfo;
    const category = 'replyNo' in target ? target.category : 'CHALLENGE';

    if ('replyNo' in target) {
      targetInfo = {
        author: target.username,
        title: target.content.length > 30 ? target.content.substring(0, 30) + '...' : target.content,
        category,
        refNo: target.replyNo
      };
    } else {
      targetInfo = {
        author: target.username,
        title: target.title,
        category,
        refNo: target.challengeNo
      };
    }
    setReportTargetInfo(targetInfo);

    try {
      const res = await api.get<ReportOption[]>(`/community/report/types`);
      const filteredOptions = res.data.filter(option => option.category === category);
      setReportOptions(filteredOptions);
      setIsReportModalOpen(true);
    } catch (err) {
      console.error('신고 옵션 로드 실패:', err);
      openModal({ message: '신고 옵션 로드 실패' });
    }
  };

  const handleReportSubmit = async (reportType: string, content: string, refNo: number, refType: string) => {
    try {
      await api.post(`/community/report`, { 
        reportType, 
        content, 
        refNo, 
        refType 
      });
      setIsReportModalOpen(false);
      setReportTargetInfo(null);
      openModal({ message: '신고가 접수되었습니다.' });
    } catch (err: any) {
      console.error(err);
      openModal({ message: err.response?.data?.message || '신고 실패' });
      setIsReportModalOpen(false);
    }
  };

  const renderReplies = () => {
const parentReplies = replies
        .filter(r => r.category === 'CHALLENGE')
        .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    return parentReplies.map(parent => {
        const childReplies = replies
            .filter(r => r.category === 'REPLY' && r.refNo === parent.replyNo)
            .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        const parentImage = parent.profileImageServerName
            ? `${API_BASE}/${parent.profileImageServerName}`
            : 'https://placehold.co/40x40/CCCCCC/ffffff?text=No+Image';

        const finalParentImageUrl = parent.profileImageServerName?.includes('/images/')
            ? `${API_BASE}${parent.profileImageServerName}`
            : `${API_BASE}/images/${parent.profileImageServerName}`;
        // ----------------------------------------

        return (
            <div key={parent.replyNo} className={styles.commentWrapper}>
                <div className={styles.commentItem}>
                    <div className={styles.avatar}>
                        <img src={finalParentImageUrl} alt="프로필" className={styles.profileImage} onClick={() => navigate(`/mypage/${parent.userNo}`)} />
                    </div>
            <div className={styles.commentBody}>
              <div className={styles.commentHeader}>
                <span className={styles.commentAuthor} onClick={() => navigate(`/mypage/${parent.userNo}`)}>
                  {parent.username} {parent.sik_bti && `(${parent.sik_bti})`}
                </span>
                <span className={styles.commentTime}>{new Date(parent.createdAt).toLocaleString()}</span>
              </div>
              {editingReplyNo === parent.replyNo ? (
                <div className={styles.editingBox}>
                  <input
                    type="text"
                    value={editingContent}
                    onChange={e => setEditingContent(e.target.value)}
                    className={styles.editingInput}
                    onKeyPress={(e: KeyboardEvent) => { if (e.key === 'Enter') handleUpdateReply(parent.replyNo, editingContent); }}
                  />
                  <button onClick={() => handleUpdateReply(parent.replyNo, editingContent)} className={styles.editingButton}>수정</button>
                  <button onClick={() => setEditingReplyNo(null)} className={styles.editingButton}>취소</button>
                </div>
              ) : (
                <p className={styles.commentContent}>{parent.content}</p>
              )}
              <div className={styles.commentActions}>
                {user?.userNo === parent.userNo && (
                  <>
                    <span onClick={() => { setEditingReplyNo(parent.replyNo); setEditingContent(parent.content); }}>수정</span>
                    <span onClick={() => handleDeleteComment(parent.replyNo, parent.userNo)}>삭제</span>
                  </>
                )}
                <span onClick={() => setReplyingToReplyNo(replyingToReplyNo === parent.replyNo ? null : parent.replyNo)}>
                  {replyingToReplyNo === parent.replyNo ? '취소' : '답글'}
                </span>
                {user?.userNo !== parent.userNo && <span onClick={() => handleReportClick(parent)}>신고</span>}
              </div>
            </div>
          </div>

          {replyingToReplyNo === parent.replyNo && (
            <div className={styles.replyForm}>
              <textarea
                value={replyingContent}
                onChange={(e) => setReplyingContent(e.target.value)}
                placeholder="답글을 입력하세요..."
                className={styles.replyInput}
              />
              <button onClick={handleReplySubmit} className={styles.replySubmitButton}>
                답글 등록
              </button>
            </div>
          )}

          {childReplies.map(child => {
            const childImage = child.profileImageServerName
        ? `${API_BASE}/${child.profileImageServerName}`
        : 'https://placehold.co/40x40/CCCCCC/ffffff?text=No+Image';
    
    const finalChildImageUrl = child.profileImageServerName?.includes('/images/')
        ? `${API_BASE}${child.profileImageServerName}`
        : `${API_BASE}/images/${child.profileImageServerName}`;
    return (
            <div key={child.replyNo} className={`${styles.commentItem} ${styles.isReply}`}>
                <div className={styles.avatar}>
                    <img src={finalChildImageUrl} alt="프로필" className={styles.profileImage} onClick={() => navigate(`/mypage/${child.userNo}`)} />
                </div>
                <div className={styles.commentBody}>
                  <div className={styles.commentHeader}>
                    <span className={styles.parentUsername}>@{parent.username}</span>
                      <span className={styles.commentAuthor} onClick={() => navigate(`/mypage/${child.userNo}`)}>
                        {child.username} {child.sik_bti && `(${child.sik_bti})`}
                      </span>
                    <span className={styles.commentTime}>{new Date(child.createdAt).toLocaleString()}</span>
                  </div>
                  {editingReplyNo === child.replyNo ? (
                    <div className={styles.editingBox}>
                      <input
                        type="text"
                        value={editingContent}
                        onChange={e => setEditingContent(e.target.value)}
                        className={styles.editingInput}
                        onKeyPress={(e: KeyboardEvent) => { if (e.key === 'Enter') handleUpdateReply(child.replyNo, editingContent); }}
                      />
                      <button onClick={() => handleUpdateReply(child.replyNo, editingContent)} className={styles.editingButton}>수정</button>
                      <button onClick={() => setEditingReplyNo(null)} className={styles.editingButton}>취소</button>
                    </div>
                  ) : (
                    <p className={styles.commentContent}>{child.content}</p>
                  )}
                  <div className={styles.commentActions}>
                    {user?.userNo === child.userNo && (
                      <>
                        <span onClick={() => { setEditingReplyNo(child.replyNo); setEditingContent(child.content); }}>수정</span>
                        <span onClick={() => handleDeleteComment(child.replyNo, child.userNo)}>삭제</span>
                      </>
                    )}
                    {user?.userNo !== child.userNo && <span onClick={() => handleReportClick(child)}>신고</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    });
  };

  const handleNextPost = () => {
    if (nextChallengeNo) {
      navigate(`/community/challenge/${nextChallengeNo}`);
    }
  };

  const handlePrevPost = () => {
    if (prevChallengeNo) {
      navigate(`/community/challenge/${prevChallengeNo}`);
    }
  };

  if (isLoading) return <div className={styles.loading}>로딩 중...</div>;
  if (error) return <div className={styles.error}>{error}</div>;
  if (!post) return <div className={styles.error}>게시글이 존재하지 않습니다.</div>;

  const imageUrl = post?.serverName ? `${API_BASE}/images/${post.serverName}` : 'https://placehold.co/400x400/CCCCCC/ffffff?text=No+Image';

  return (
    <>
      <CommunityHeader />
      <div className={styles.container}>
        <div className={styles.postHeader}>
          <h1 className={styles.title}>{post.title}</h1>
          <div className={styles.postMeta}>
            <span onClick={() => navigate(`/mypage/${post.userNo}`)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>
              {post.username} {post.sik_bti && `(${post.sik_bti})`}
            </span>
            <span>{new Date(post.createdAt).toLocaleString()}</span> | <span>조회수 {post.views}</span>
          </div>
        </div>

        <div className={styles.postContent}>
          <div className={styles.mediaContainer}>
            <button className={styles.navButton} onClick={handlePrevPost} disabled={!prevChallengeNo}>{'<'}</button>
            <div className={styles.postImage}>
              <img src={imageUrl} alt="챌린지 이미지" className={styles.challengeImage} />
            </div>
            <button className={styles.navButton} onClick={handleNextPost} disabled={!nextChallengeNo}>{'>'}</button>
          </div>
          {post.videoUrl && (
            <div className={styles.challengeLink}>
              <button className={styles.challengeButton} onClick={() => window.open(post.videoUrl?.startsWith('http') ? post.videoUrl : `http://${post.videoUrl}`, '_blank')}>챌린지 보러가기</button>
            </div>
          )}
        </div>

        <div className={styles.actions}>
          <div>
            <button className={styles.likeButton} onClick={handleLikeToggle}>
              {isLiked ? '❤️' : '🤍'}
            </button>
          </div>
          <div className={styles.editDeleteButtons}>
            {user?.userNo === post.userNo ? (
              <>
                <button className={styles.actionBtn} onClick={() => navigate(`/community/challenge/form/${challengeNo}?mode=edit`)}>수정</button>
                <button className={styles.actionBtn} onClick={() => openModal({ 
                  message: '삭제하시겠습니까?', 
                  showCancel: true,
                  onConfirm: async () => { 
                    await api.delete(`/community/challenge/${challengeNo}`); 
                    navigate('/community/challenge'); 
                  } 
                })}>삭제</button>
              </>
            ) : (
              <button className={styles.reportBtn} onClick={() => handleReportClick(post)}>신고</button>
            )}
          </div>
        </div>

        <hr className={styles.divider} />

        <div className={styles.commentSection}>
          {user?.userNo ? (
            <div className={styles.commentInputBox}>
              <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="댓글 입력..." onKeyPress={e => { if (e.key==='Enter') handleAddComment(); }} className={styles.commentInput} />
              <button onClick={handleAddComment} className={styles.submitBtn}>댓글 등록</button>
            </div>
          ) : <div className={styles.loginRequired}>로그인 후 댓글 작성 가능</div>}

          <div className={styles.commentList}>{replies.length === 0 ? <div className={styles.noComments}>아직 댓글이 없습니다.</div> : renderReplies()}</div>
          <div ref={commentsEndRef} />
        </div>
        
        <div className={styles.backButtonContainer}>
            <button className={styles.backButton} onClick={() => navigate(-1)}>뒤로가기</button>
        </div>
      </div>

      {modal && <CommunityModal message={modal.message} onConfirm={modal.onConfirm ? handleConfirm : undefined} onClose={closeModal} showCancel={modal.showCancel} />}
      {isReportModalOpen && reportTargetInfo && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => { setReportTargetInfo(null); setIsReportModalOpen(false); }}
          onSubmit={handleReportSubmit}
          reportOptions={reportOptions}
          targetInfo={reportTargetInfo}
        />
      )}
    </>
  );
};

export default ChallengeDetail;
