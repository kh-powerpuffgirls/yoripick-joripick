import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CkClass.module.css';
import CommunityHeader from '../Header/CommunityHeader';
import CommunityModal from '../CommunityModal';
import ReportModal from '../../../components/Report/ReportModal';
import { useSelector, useDispatch } from 'react-redux';
import type { RootState, AppDispatch } from '../../../store/store';
import axios from 'axios';
import { store } from '../../../store/store';
import CkSettingsModal from './CkSettingsModal';
import { leaveRooms, openChat, setRooms } from '../../../features/chatSlice';
import type { ChatRoom, ChatRoomCreate, Message } from '../../../type/chatmodal';
import { getRooms, saveMessage } from '../../../api/chatApi';
import useChat from '../../../hooks/useChat';
import { useQueryClient } from '@tanstack/react-query';

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

interface ModalState {
  message: string;
  onConfirm?: () => void;
  showCancel?: boolean;
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

const CkClassMain = () => {
  const queryClient = useQueryClient();
  const { sendChatMessage, rmvCKclass } = useChat();
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const user = useSelector((state: RootState) => state.auth.user);
  const rooms = useSelector((state: RootState) => state.chat.rooms);

  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  const myClasses = useMemo(
    () => rooms.filter(room => room.type === 'cclass' && room.username === user?.username),
    [rooms, user?.username]
  );
  const joinedClasses = useMemo(
    () => rooms.filter(room => room.type === 'cclass' && room.username !== user?.username),
    [rooms, user?.username]
  );

  const [reportOptions, setReportOptions] = useState<ReportOption[]>([]);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportTargetInfo, setReportTargetInfo] = useState<ReportTargetInfo | null>(null);
  const [myCurrentPage, setMyCurrentPage] = useState(1);
  const [joinedCurrentPage, setJoinedCurrentPage] = useState(1);

  const myClassesPerPage = 3;
  const joinedClassesPerPage = 3;

  const openModal = (modalData: ModalState) => setModal(modalData);
  const closeModal = () => setModal(null);
  const handleConfirm = () => {
    modal?.onConfirm?.();
    closeModal();
  };

  const handleReportClick = async (room: ChatRoom) => {
    const category = 'COOKING_CLASS';
    const targetInfo: ReportTargetInfo = {
      author: room.username as string,
      title: room.className,
      category,
      refNo: Number(room.roomNo),
    };

    setReportTargetInfo(targetInfo);

    try {
      const res = await api.get<ReportOption[]>('/community/report/types');
      const filteredOptions = res.data.filter((option) => option.category === category);
      setReportOptions(filteredOptions);
      setIsReportModalOpen(true);
    } catch (err) {
      console.error('신고 옵션 fetch 실패:', err);
      setReportOptions([]);
      openModal({ message: '신고 옵션 로드 실패', onConfirm: closeModal });
    }
  };

  const handleReportSubmit = async (reportType: string, content: string, refNo: number) => {
    if (!user?.userNo || !reportTargetInfo) {
      openModal({ message: '로그인 후 신고 가능합니다.', onConfirm: closeModal });
      return;
    }

    try {
      await api.post('/community/report', {
        reportType,
        content,
        refNo,
        refType: reportTargetInfo.category,
      });

      openModal({ message: '신고가 접수되었습니다.', onConfirm: closeModal });
      setIsReportModalOpen(false);
      setReportTargetInfo(null);
    } catch (err: any) {
      console.error(err);
      openModal({ message: err.response?.data || '신고 실패', onConfirm: closeModal });
      setIsReportModalOpen(false);
      setReportTargetInfo(null);
    }
  };

  const handleSearchClick = () => navigate('/community/ckclass/search');
  const handleRegisterClick = () => {
    if (!user?.userNo) {
      openModal({ message: '로그인 후 클래스 등록 가능합니다.', onConfirm: closeModal });
      return;
    }
    navigate('/community/ckclass/form');
  };

  const handleJoinClick = async (id: number) => {
    const room = {
      roomNo: id,
      type: 'cclass' as ChatRoomCreate,
      messages: [],
      className: myClasses.find((cls) => cls.roomNo == id)?.className || joinedClasses.find((cls) => cls.roomNo == id)?.className || '클래스',
    };
    dispatch(openChat(room));
  };

  // handleDeleteClick 바깥에 선언
  const handleLeaveClassClick = (id: number, className: string) => {
    openModal({
      message: `정말로 "${className}" 클래스에서 탈퇴하시겠습니까?`,
      onConfirm: async () => {
        try {
          await api.delete(`/community/ckclass/${id}/leave`);
          openModal({ message: '클래스에서 성공적으로 탈퇴했습니다.', onConfirm: closeModal });
          dispatch(leaveRooms(id));
          queryClient.invalidateQueries({ queryKey: ["rooms"] });

          // 퇴장 메시지 생성
          const systemMessage: Message = {
            userNo: 0,
            username: "SYSTEM",
            content: `${user?.username} 님이 퇴장하셨습니다`,
            createdAt: new Date().toISOString(),
            roomNo: id,
          };

          // DB 저장
          let messageBlob = new Blob([JSON.stringify(systemMessage)], { type: "application/json" });
          let formData = new FormData();
          formData.append("message", messageBlob);
          await saveMessage("cclass", id, formData);

          // 웹소켓 브로드캐스트
          sendChatMessage(id, systemMessage);
        } catch (err: any) {
          console.error('클래스 탈퇴 실패:', err);
          openModal({ message: err.response?.data || '클래스 탈퇴에 실패했습니다.', onConfirm: closeModal });
        }
      },
      showCancel: true,
    });
  };

  const handleDeleteClick = async (id: number) => {
    const classToDelete = myClasses.find((cls) => cls.roomNo == id);
    if (!classToDelete) {
      openModal({ message: '클래스를 찾을 수 없습니다.', onConfirm: closeModal });
      return;
    }

    const confirmDelete = () => {
      openModal({
        message: `정말로 "${classToDelete.className}" 클래스를 삭제하시겠습니까?`,
        onConfirm: async () => {
          try {
            await api.delete(`/community/ckclass/${id}`);
            openModal({ message: '클래스가 성공적으로 삭제되었습니다.', onConfirm: closeModal });
            rmvCKclass(id);
          } catch (err: any) {
            console.error(err);
            openModal({ message: err.response?.data || '클래스 삭제에 실패했습니다.', onConfirm: closeModal });
          }
        },
        showCancel: true,
      });
    };
    confirmDelete();
  };

  const handleNotificationToggle = async (id: number) => {
    try {
      await api.post(`/community/ckclass/${id}/toggleNotification`);
      const updatedRooms = await getRooms(user?.userNo);
      dispatch(setRooms(updatedRooms));
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    } catch (err: any) {
      console.error(err);
      openModal({ message: err.response?.data || '알림 설정 변경에 실패했습니다.', onConfirm: closeModal });
    }
  };

  const handleSettingsClick = (id: number) => {
    setSelectedClassId(id);
    setIsSettingsModalOpen(true);
  };

  const closeSettingsModal = () => {
    setIsSettingsModalOpen(false);
    setSelectedClassId(null);
  };

  const handleMyPageChange = (pageNumber: number) => {
    const totalPages = Math.ceil(myClasses.length / myClassesPerPage);
    if (pageNumber >= 1 && pageNumber <= totalPages) setMyCurrentPage(pageNumber);
  };

  const handleJoinedPageChange = (pageNumber: number) => {
    const totalPages = Math.ceil(joinedClasses.length / joinedClassesPerPage);
    if (pageNumber >= 1 && pageNumber <= totalPages) setJoinedCurrentPage(pageNumber);
  };

  const myClassesToDisplay = useMemo(
    () =>
      myClasses.slice(
        (myCurrentPage - 1) * myClassesPerPage,
        myCurrentPage * myClassesPerPage
      ),
    [myClasses, myCurrentPage, myClassesPerPage]
  );

  const renderClassCard = (room: ChatRoom) => (
    <div key={room.roomNo} className={styles.classCard}>
      <div
        className={styles.classImage}
        style={{ backgroundImage: room.imageUrl ? `url(${room.imageUrl})` : 'none' }}
      ></div>
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <div className={styles.classTitle}>
            {room.className}
            {/* 안 읽은 메시지 */}
            {(room.unreadCount ?? 0) > 0 && (
              <span className={styles.unreadCountBadge}>{room.unreadCount}</span>
            )}
          </div>
          <div className={styles.classButtons}>
            <button
              className={`${styles.notificationButton} ${room.notification === 'Y' ? styles.on : styles.off}`}
              onClick={() => handleNotificationToggle(Number(room.roomNo))}
            >
              {room.notification === 'Y' ? '🔔' : '🔕'}
            </button>
            {/* 💡 나의 클래스일 경우 '삭제' 버튼 표시 */}
            {room.username === user?.username && (
              <button className={styles.deleteButton} onClick={() => handleDeleteClick(Number(room.roomNo))}>
                삭제
              </button>
            )}
            {/* 💡 참여 클래스일 경우 '탈퇴' 버튼 표시 (삭제 버튼과 동일 위치) */}
            {room.username !== user?.username && (
              <button
                className={styles.leaveButton}
                onClick={() => handleLeaveClassClick(Number(room.roomNo), room.className)}
              >
                탈퇴
              </button>
            )}
          </div>
        </div>
        <div className={styles.classDescription}>{room.description}</div>
        <div className={styles.cardFooter}>
          <div className={styles.authorInfo}>
            <div className={styles.classAuthor}>{room.username}</div>
            <div className={styles.memberCount}>({room.memberCount}명 참여중...)</div>
          </div>

          {room.username === user?.username ? (
            <div className={styles.myButtons}>
              <button className={styles.joinButton} onClick={() => handleJoinClick(Number(room.roomNo))}>
                채팅
              </button>
              <button className={styles.settingsButton} onClick={() => handleSettingsClick(Number(room.roomNo))}>
                설정
              </button>
            </div>
          ) : (
            <div className={styles.joinedButtons}>
              <button className={styles.joinButton} onClick={() => handleJoinClick(Number(room.roomNo))}>
                채팅
              </button>
              {/* 💡 cardFooter에서 탈퇴 버튼 제거됨 - 위 classButtons로 이동 */}
              <button className={styles.reportButton} onClick={() => handleReportClick(room)}>
                신고
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const myTotalPages = Math.ceil(myClasses.length / myClassesPerPage);
  const joinedTotalPages = Math.ceil(joinedClasses.length / joinedClassesPerPage);

  return (
    <>
      <CommunityHeader />
      <div className={styles.container}>
        <h1 className={styles.mainTitle}>COOKING CLASS</h1>

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>나의 클래스 &gt;</h2>
          </div>
          {myClassesToDisplay.length > 0 ? (
            <div className={styles.classCardWrapper}>
              {myClassesToDisplay.map(renderClassCard)}
            </div>
          ) : (
            <div className={styles.noClasses}>아직 개설한 클래스가 없어요.</div>
          )}
        </div>

        {myTotalPages > 1 && (
          <div className={styles.pagination}>
            <button onClick={() => handleMyPageChange(myCurrentPage - 1)} disabled={myCurrentPage === 1}>
              &lt;
            </button>
            {Array.from({ length: myTotalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handleMyPageChange(i + 1)}
                className={i + 1 === myCurrentPage ? styles.active : ''}
              >
                {i + 1}
              </button>
            ))}
            <button onClick={() => handleMyPageChange(myCurrentPage + 1)} disabled={myCurrentPage === myTotalPages}>
              &gt;
            </button>
          </div>
        )}

        <hr className={styles.divider} />

        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>참여중인 클래스 &gt;</h2>
          </div>
          {joinedClasses.length > 0 ? (
            <div className={styles.classCardWrapper}>
              {joinedClasses.map(renderClassCard)}
            </div>
          ) : (
            <div className={styles.noClasses}>아직 참여중인 클래스가 없어요.</div>
          )}
        </div>

        {joinedTotalPages > 1 && (
          <div className={styles.pagination}>
            <button
              onClick={() => handleJoinedPageChange(joinedCurrentPage - 1)}
              disabled={joinedCurrentPage === 1}
            >
              &lt;
            </button>
            {Array.from({ length: joinedTotalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handleJoinedPageChange(i + 1)}
                className={i + 1 === joinedCurrentPage ? styles.active : ''}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handleJoinedPageChange(joinedCurrentPage + 1)}
              disabled={joinedCurrentPage === joinedTotalPages}
            >
              &gt;
            </button>
          </div>
        )}

        <div className={styles.actionButtons}>
          <button className={styles.searchButton} onClick={handleSearchClick}>
            클래스 검색
          </button>
          <button className={styles.registerButton} onClick={handleRegisterClick}>
            등록하기
          </button>
        </div>
      </div>

      {modal && (
        <CommunityModal
          message={modal.message}
          onConfirm={handleConfirm}
          showCancel={modal.showCancel}
          onClose={closeModal}
        />
      )}

      {reportTargetInfo && (
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false);
            setReportTargetInfo(null);
          }}
          onSubmit={handleReportSubmit}
          reportOptions={reportOptions}
          targetInfo={reportTargetInfo}
        />
      )}

      {isSettingsModalOpen && selectedClassId !== null && (
        <CkSettingsModal
          isOpen={isSettingsModalOpen}
          onClose={closeSettingsModal}
          classId={selectedClassId}
          onUpdate={() => {
            closeSettingsModal();
          }}
        />
      )}
    </>
  );
};

export default CkClassMain;
