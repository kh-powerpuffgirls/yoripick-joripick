import { useEffect, useState, useRef, type KeyboardEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import { store } from '../../../store/store';
import styles from './FreeDetail.module.css';
import CommunityHeader from '../CommunityHeader';
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
 const [isLikeLoading, setIsLikeLoading] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [editingReplyNo, setEditingReplyNo] = useState<number | null>(null);
 const [editingContent, setEditingContent] = useState('');
 const [replyingToReplyNo, setReplyingToReplyNo] = useState<number | null>(null);
 const [replyingContent, setReplyingContent] = useState('');

 const [isReportModalOpen, setIsReportModalOpen] = useState(false);
 const [reportTargetInfo, setReportTargetInfo] = useState<ReportTargetInfo | null>(null);
 const [reportOptions, setReportOptions] = useState<ReportOption[]>([]);
 const [newComment, setNewComment] = useState('');

 const commentsEndRef = useRef<HTMLDivElement>(null);

 useEffect(() => {
  const postNo = Number(boardNo);
  if (isNaN(postNo)) {
   setError('   ID.');
   setIsLoading(false);
   return;
  }

  const fetchPostData = async () => {
   try {
    setIsLoading(true);

    //     ,    
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

   } catch (err) {
    console.error('    :', err);
    setError('    .');
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

  // UI 즉시 반영
  setIsLiked(!prevIsLiked);
  setLikesCount(prevLikesCount + (prevIsLiked ? -1 : 1));

  try {
    // boardNo를 숫자로 변환
    const postNo = Number(boardNo);

    // POST 요청: body 없음, status는 쿼리 파라미터
    await api.post(`/community/free/${postNo}/likes`, null, {
      params: { status: prevIsLiked ? 'COMMON' : 'LIKE' }
    });

  } catch (err: any) {
    console.error('좋아요 처리 오류:', err);

    // 오류 발생 시 UI 롤백
    setIsLiked(prevIsLiked);
    setLikesCount(prevLikesCount);

    openModal({ message: '좋아요 처리에 실패했습니다.', showCancel: false });
  }
};

 const fetchReportOptions = async (category: string) => {
  try {
   const res = await api.get<ReportOption[]>(`/community/report/types`);
   const filteredOptions = res.data.filter(option => option.category === category);
   setReportOptions(filteredOptions);
  } catch (err) {
   console.error('   :', err);
   openModal({ message: '   ', showCancel: false });
   setReportOptions([]);
  }
 };

 const handleReportClick = async (targetInfo: ReportTargetInfo) => {
  if (!user) {
   openModal({ message: '    .', showCancel: false });
   return;
  }
  if (user.userNo === (targetInfo.category === 'BOARD' ? post?.userNo : replies.find(r => r.replyNo === targetInfo.refNo)?.userNo)) {
   openModal({ message: '      .', showCancel: false });
   return;
  }

  setReportTargetInfo(targetInfo);
  await fetchReportOptions(targetInfo.category);
  setIsReportModalOpen(true);
 };

 const handleReportSubmit = async (reportType: string, content: string, refNo: number, refType: string) => {
  try {
   await api.post(`/community/report`, { reportType, content, refNo, refType });
   openModal({ message: ' .', showCancel: false });
   setIsReportModalOpen(false);
   setReportTargetInfo(null);
  } catch (err: any) {
   console.error(' :', err.response?.data?.message || err.message);
   openModal({ message: err.response?.data?.message || '    .', showCancel: false });
   setIsReportModalOpen(false);
   setReportTargetInfo(null);
  }
 };

 const handleEditClick = () => {
  if (!user) {
   openModal({ message: '   ', showCancel: false });
   return;
  }
  if (post && user.userNo === post.userNo) {
   navigate(`/community/free/form/${boardNo}`);
  } else {
   openModal({ message: '   ', showCancel: false });
  }
 };

 const handleDeletePost = () => {
  if (!user || !post) return;
  if (user.userNo !== post.userNo) {
   openModal({ message: '   .', showCancel: false });
   return;
  }

  openModal({
   message: ' ?',
   showCancel: true,
   onConfirm: async () => {
    try {
     await api.delete(`/community/free/${boardNo}`);
     openModal({ message: '  ', showCancel: false, onConfirm: () => navigate('/community/free') });
    } catch (err) {
     console.error(err);
     openModal({ message: '  ', showCancel: false });
    }
   },
  });
 };

 const handleAddComment = async () => {
  if (!user) {
   openModal({ message: '    ', showCancel: false });
   return;
  }
  if (!newComment.trim()) {
   openModal({ message: '  ', showCancel: false });
   return;
  }

  try {
   await api.post(`/community/free/replies`, { refNo: Number(boardNo), category: 'BOARD', content: newComment.trim() });
   setNewComment('');
   const repliesRes = await api.get<Reply[]>(`/community/free/${boardNo}/replies`);
   setReplies(repliesRes.data);
  } catch (err) {
   console.error('  :', err);
   openModal({ message: '  ', showCancel: false });
  }
 };

 const handleNewCommentKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
  if (e.key === 'Enter' && !e.shiftKey) {
   e.preventDefault();
   handleAddComment();
  }
 };

 const handleEditReply = (replyNo: number) => {
  const replyToEdit = replies.find(r => r.replyNo === replyNo);
  if (replyToEdit && user?.userNo === replyToEdit.userNo) {
   setEditingReplyNo(replyNo);
   setEditingContent(replyToEdit.content);
  } else {
   openModal({ message: '   .', showCancel: false });
  }
 };

 const handleSaveEditedReply = async (replyNo: number, content: string) => {
  if (!content.trim()) {
   openModal({ message: '  ', showCancel: false });
   return;
  }

  openModal({
   message: ' ?',
   showCancel: true,
   onConfirm: async () => {
    try {
     await api.put(`/community/free/replies/${replyNo}`, { content: content.trim() });
     const repliesRes = await api.get<Reply[]>(`/community/free/${boardNo}/replies`);
     setReplies(repliesRes.data);
     setEditingReplyNo(null);
     setEditingContent('');
    } catch (err) {
     console.error(err);
     openModal({ message: '  ', showCancel: false });
    }
   },
  });
 };

 const handleDeleteReply = async (replyNo: number) => {
  const replyToDelete = replies.find(r => r.replyNo === replyNo);
  if (!replyToDelete || user?.userNo !== replyToDelete.userNo) {
   openModal({ message: '   .', showCancel: false });
   return;
  }

  openModal({
   message: ' ?',
   showCancel: true,
   onConfirm: async () => {
    try {
     await api.delete(`/community/free/replies/${replyNo}`);
     const repliesRes = await api.get<Reply[]>(`/community/free/${boardNo}/replies`);
     setReplies(repliesRes.data);
     openModal({ message: '  ', showCancel: false });
    } catch (err) {
     console.error(err);
     openModal({ message: '  ', showCancel: false });
    }
   },
  });
 };

 const renderReplies = () => {
  const parentReplies = replies.filter(r => r.category === 'BOARD' && r.refNo === Number(boardNo));
  
  return parentReplies.map(parent => {
   const childReplies = replies.filter(r => r.category === 'REPLY' && r.refNo === parent.replyNo);
   const parentProfileImageUrl = parent.profileImageServerName
    ? `${API_BASE}/images/${parent.profileImageServerName}`
    : 'https://placehold.co/400x400/CCCCCC/ffffff?text=No+Image';

   return (
    <div key={parent.replyNo} className={styles.commentWrapper}>
     <div className={styles.comment}>
      <div className={styles.commentHeader}>
       <Link to={`/mypage/${parent.userNo}`}>
        <img src={parentProfileImageUrl} alt="" className={styles.commentProfileImage} />
       </Link>
       <div className={styles.commentInfo}>
        <Link to={`/mypage/${parent.userNo}`} className={styles.commentAuthor}>
         {parent.username}{parent.sik_bti && ` (${parent.sik_bti})`}
        </Link>
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
         <button className={styles.commentActionButton} onClick={() => handleSaveEditedReply(parent.replyNo, editingContent)}></button>
         <button className={styles.commentActionButton} onClick={() => setEditingReplyNo(null)}></button>
        </div>
       </div>
      ) : (
       <p className={styles.commentContent}>{parent.content}</p>
      )}

      <div className={styles.commentActions}>
       {user && parent.userNo === user.userNo && editingReplyNo !== parent.replyNo && (
        <>
         <button className={styles.commentActionButton} onClick={() => handleEditReply(parent.replyNo)}></button>
         <button className={styles.commentActionButton} onClick={() => handleDeleteReply(parent.replyNo)}></button>
        </>
       )}
       {user && replyingToReplyNo !== parent.replyNo && (
        <button className={styles.commentActionButton} onClick={() => setReplyingToReplyNo(parent.replyNo)}></button>
       )}
       <button className={styles.commentActionButton} onClick={() => handleReportClick({ author: parent.username, title: parent.content.substring(0, 20) + '...', category: 'REPLY', refNo: parent.replyNo })}></button>
      </div>

      {replyingToReplyNo === parent.replyNo && (
       <form
        className={styles.replyForm}
        onSubmit={async e => {
         e.preventDefault();
         if (!replyingContent.trim()) {
          openModal({ message: '  ', showCancel: false });
          return;
         }
         try {
          await api.post(`/community/free/replies`, { refNo: parent.replyNo, category: 'REPLY', content: replyingContent.trim() });
          const repliesRes = await api.get<Reply[]>(`/community/free/${boardNo}/replies`);
          setReplies(repliesRes.data);
          setReplyingContent('');
          setReplyingToReplyNo(null);
         } catch (err) {
          console.error(err);
          openModal({ message: '  ', showCancel: false });
         }
        }}
       >
        <textarea className={styles.replyInput} value={replyingContent} onChange={e => setReplyingContent(e.target.value)} placeholder=" ..." />
        <button type="submit" className={styles.replySubmitButton}></button>
       </form>
      )}

      {childReplies.length > 0 && (
       <div className={styles.childComments}>
        {childReplies.map(child => {
         const childProfileImageUrl = child.profileImageServerName
          ? `${API_BASE}/images/${child.profileImageServerName}`
          : 'https://placehold.co/400x400/CCCCCC/ffffff?text=No+Image';
         return (
          <div key={child.replyNo} className={styles.commentChild}>
           <div className={styles.commentHeader}>
            <Link to={`/mypage/${child.userNo}`}>
             <img src={childProfileImageUrl} alt="" className={styles.commentProfileImage} />
            </Link>
            <div className={styles.commentInfo}>
             <Link to={`/mypage/${child.userNo}`} className={styles.commentAuthor}>
              {child.username}{child.sik_bti && ` (${child.sik_bti})`}
             </Link>
             <span className={styles.commentDate}>{new Date(child.createdAt).toLocaleString()}</span>
            </div>
           </div>

           {editingReplyNo === child.replyNo ? (
            <div className={styles.editForm}>
             <textarea className={styles.commentEditInput} value={editingContent} onChange={e => setEditingContent(e.target.value)} />
             <div className={styles.editActions}>
              <button className={styles.commentActionButton} onClick={() => handleSaveEditedReply(child.replyNo, editingContent)}></button>
              <button className={styles.commentActionButton} onClick={() => setEditingReplyNo(null)}></button>
             </div>
            </div>
           ) : (
            <p className={styles.commentContent}>{child.content}</p>
           )}

           {user && child.userNo === user.userNo && editingReplyNo !== child.replyNo && (
            <div className={styles.commentActions}>
             <button className={styles.commentActionButton} onClick={() => handleEditReply(child.replyNo)}></button>
             <button className={styles.commentActionButton} onClick={() => handleDeleteReply(child.replyNo)}></button>
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

 if (isLoading) return <div className={styles.loading}> ...</div>;
 if (error) return <div className={styles.error}>{error}</div>;
 if (!post) return <div className={styles.noPost}>  .</div>;

 const validImageUrl = post.serverName ? `${API_BASE}/images/${post.serverName}` : post.imageUrl || null;

 return (
  <>
   {modal && <CommunityModal message={modal.message} onConfirm={handleModalConfirm} onClose={closeModal} showCancel={modal.showCancel} />}
   {isReportModalOpen && reportTargetInfo && <ReportModal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} onSubmit={handleReportSubmit} reportOptions={reportOptions} targetInfo={reportTargetInfo} />}

   <CommunityHeader />

   <div className={styles.container}>
    <div className={styles.mainCard}>
    <div className={styles.postHeader}>
     {post.subheading && <p className={styles.subtitle}>[{post.subheading}]</p>}
     <h1 className={styles.title}>{post.title}</h1>
     <div className={styles.meta}>
      <span>{post.username}
      {post.sik_bti && ` (${post.sik_bti})`}</span>
      <span>{new Date(post.createdDate).toLocaleString()}</span>
      <span> {post.views}</span>
      <span> {likesCount}</span>
     </div>
    </div>   
     {validImageUrl && <img src={validImageUrl} alt=" " className={styles.postImage} />}
     <p className={styles.content}>{post.content}</p>
    </div>
    
    <div className={styles.postActions}>
 <div>
    <button
      className={styles.likeButton}
      onClick={handleLikeToggle}
      >
      <span className={styles.heartIcon}>{isLiked ? '❤️' : '🤍'}</span>
  </button>
 </div>

 <div className={styles.editDeleteButtons}>
  {user?.userNo === post.userNo ? (
   <>
    <button className={styles.editButton} onClick={handleEditClick}></button>
    <button className={styles.deleteButton} onClick={handleDeletePost}></button>
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
    
   </button>
  )}
 </div>
</div>
    
    <div className={styles.commentsSection}>
     <div className={styles.addComment}>
      {/*   . */}
      <textarea 
       className={styles.commentInput} 
       placeholder=" ." 
       value={newComment} 
       onChange={e => setNewComment(e.target.value)} 
       onKeyDown={handleNewCommentKeyDown} 
      />
      <button 
       className={styles.submitBtn} 
       onClick={handleAddComment}>
       
      </button>
     </div>
     <div className={styles.commentsList}>
      {renderReplies()}
      <div ref={commentsEndRef} />
     </div>
    </div>
   </div>
  </>
 );
};

export default FreeDetail;