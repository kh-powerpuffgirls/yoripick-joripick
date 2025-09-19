import { useEffect, useState, useRef, type KeyboardEvent } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import axios from 'axios';
import CommunityHeader from '../CommunityHeader';
import styles from './ChallengeDetail.module.css';
import { store } from '../../../store/store';
import CommunityModal from '../CommunityModal';
import ReportModal from '../ReportModal';

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
  (error) => Promise.reject(error),
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
}

interface ModalState {
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const reportTypes = [
  { value: 'SPAM', label: '스팸/광고' },
  { value: 'ABUSE', label: '욕설/비방' },
  { value: 'OTHER', label: '기타' },
];

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
  const [reportTarget, setReportTarget] = useState<Reply | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const commentsEndRef = useRef<HTMLDivElement>(null);

  const openModal = (modalData: ModalState) => setModal(modalData);
  const closeModal = () => setModal(null);
  const handleConfirm = () => { modal?.onConfirm?.(); closeModal(); };
  const handleCancel = () => { modal?.onCancel?.(); closeModal(); };

  // 게시글 + 댓글 + 좋아요 불러오기
  useEffect(() => {
    if (!challengeNo || isNaN(Number(challengeNo))) {
      setError('유효하지 않은 챌린지 번호입니다.');
      setIsLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setIsLoading(true);

        const [postRes, repliesRes] = await Promise.all([
          api.get<ChallengePost>(`/community/challenge/${challengeNo}`),
          api.get<Reply[]>(`/community/challenge/replies/${challengeNo}`)
        ]);

        setPost(postRes.data);
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
    if (!user?.userNo) { openModal({ message: '로그인 후 좋아요 가능합니다.' }); return; }
    try {
      await api.post(`/community/challenge/like/${challengeNo}`);
      setIsLiked(prev => !prev);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (err: any) {
      console.error(err);
      openModal({ message: err.response?.status === 401 ? '좋아요는 로그인 후 가능합니다.' : '좋아요 처리 실패' });
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
      onConfirm: async () => {
        try {
          await api.delete(`/community/challenge/replies/${replyNo}`, { data: { userNo: user.userNo } });
          await fetchReplies();
        } catch {
          openModal({ message: '댓글 삭제 실패' });
        }
      }
    });
  };

  const handleReportSubmit = async (type: string, content: string, reply?: Reply) => {
    if (!reply) return; // reply가 없으면 그냥 종료

    try {
      await api.post(`/community/report`, { type, content, replyNo: reply.replyNo });
      setIsReportModalOpen(false);
      setReportTarget(null);
      openModal({ message: '신고가 접수되었습니다.' });
    } catch {
      openModal({ message: '신고 실패' });
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
      ? `${API_BASE}/images/${parent.profileImageServerName}`
      : 'https://placehold.co/40x40/CCCCCC/ffffff?text=No+Image';

    return (
      <div key={parent.replyNo} className={styles.commentWrapper}> {/* ← 추가된 div */}
        <div className={styles.commentItem}>
          <div className={styles.avatar}>
            <img src={parentImage} alt="프로필" className={styles.profileImage} onClick={() => navigate(`/mypage/${parent.userNo}`)} />
          </div>
          <div className={styles.commentBody}>
            <div className={styles.commentHeader}>
              <span className={styles.commentAuthor} onClick={() => navigate(`/mypage/${parent.userNo}`)}>{parent.username}</span>
              <span className={styles.commentTime}>{new Date(parent.createdAt).toLocaleString()}</span>
            </div>
            <p className={styles.commentContent}>{parent.content}</p>
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
              {user?.userNo !== parent.userNo && <span onClick={() => { setReportTarget(parent); setIsReportModalOpen(true); }}>신고</span>}
            </div>
          </div>
        </div>

        {/* 자식 댓글 */}
        {childReplies.map(child => {
          const childImage = child.profileImageServerName
            ? `${API_BASE}/images/${child.profileImageServerName}`
            : 'https://placehold.co/40x40/CCCCCC/ffffff?text=No+Image';
          return (
            <div key={child.replyNo} className={`${styles.commentItem} ${styles.isReply}`}>
              <div className={styles.avatar}>
                <img src={childImage} alt="프로필" className={styles.profileImage} onClick={() => navigate(`/mypage/${child.userNo}`)} />
              </div>
              <div className={styles.commentBody}>
                <div className={styles.commentHeader}>
                  <span className={styles.parentUsername}>@{parent.username}</span>
                  <span className={styles.commentAuthor} onClick={() => navigate(`/mypage/${child.userNo}`)}>{child.username}</span>
                  <span className={styles.commentTime}>{new Date(child.createdAt).toLocaleString()}</span>
                </div>
                <p className={styles.commentContent}>{child.content}</p>
                <div className={styles.commentActions}>
                  {user?.userNo === child.userNo && (
                    <>
                      <span onClick={() => { setEditingReplyNo(child.replyNo); setEditingContent(child.content); }}>수정</span>
                      <span onClick={() => handleDeleteComment(child.replyNo, child.userNo)}>삭제</span>
                    </>
                  )}
                  {user?.userNo !== child.userNo && <span onClick={() => { setReportTarget(child); setIsReportModalOpen(true); }}>신고</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  });
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
          <span onClick={() => navigate(`/mypage/${post.userNo}`)} style={{ cursor: 'pointer', fontWeight: 'bold' }}>{post.username}</span>
          {' | '}
          <span>{new Date(post.createdAt).toLocaleString()}</span> | <span>조회수 {post.views}</span>
        </div>
        <img src={imageUrl} alt="챌린지 이미지" className={styles.postImage} />
        {post.videoUrl && <button onClick={() => window.open(post.videoUrl?.startsWith('http') ? post.videoUrl : `http://${post.videoUrl}`, '_blank')}>챌린지 보러가기</button>}
        <div className={styles.postActions}>
          <button onClick={handleLikeToggle}>{isLiked ? '좋아요 취소' : '좋아요'} ({likesCount})</button>
          {user?.userNo === post.userNo && (
            <>
              <button onClick={() => navigate(`/community/challenge/form/${challengeNo}?mode=edit`)}>수정</button>
              <button onClick={() => openModal({ message: '삭제하시겠습니까?', onConfirm: async () => { await api.delete(`/community/challenge/${challengeNo}`); navigate('/community/challenge'); } })}>삭제</button>
            </>
          )}
        </div>

        <hr />

        {user?.userNo ? (
          <div className={styles.commentInputBox}>
            <input value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="댓글 입력..." onKeyPress={e => { if (e.key==='Enter') handleAddComment(); }} />
            <button onClick={handleAddComment}>댓글 등록</button>
          </div>
        ) : <div className={styles.loginRequired}>로그인 후 댓글 작성 가능</div>}

        <div className={styles.commentsList}>{replies.length === 0 ? <div className={styles.noComments}>아직 댓글이 없습니다.</div> : renderReplies()}</div>
        <div ref={commentsEndRef} />

        <button onClick={() => navigate(-1)}>뒤로가기</button>
      </div>

      {modal && <CommunityModal message={modal.message} onConfirm={modal.onConfirm ? handleConfirm : undefined} onCancel={modal.onCancel ? handleCancel : undefined} />}
      <ReportModal
        isOpen={isReportModalOpen}
        onClose={() => { setReportTarget(null); setIsReportModalOpen(false); }}
        onSubmit={handleReportSubmit}
        reportTypes={reportTypes}
        reply={reportTarget || undefined}
      />
    </>
  );
};

export default ChallengeDetail;
