import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import styles from './CkClass.module.css';
import CommunityHeader from '../Header/CommunityHeader';
import CommunityModal from '../CommunityModal';
import ReportModal from '../../../components/Report/ReportModal';
import { useDispatch, useSelector } from 'react-redux';
import { store } from '../../../store/store';
import type { RootState } from '../../../store/store';
import { openChat, setRooms } from '../../../features/chatSlice';
import type { ChatRoom, Message } from '../../../type/chatmodal';
import { getRooms, lastRead, saveMessage } from '../../../api/chatApi';
import useChat from '../../../hooks/useChat';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PasscodeModal from './passcodeModal';

const API_BASE = 'http://3.38.213.177:8081';
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

interface CkclassDto {
  roomNo: number;
  className: string;
  classInfo: string;
  username?: string;
  serverName?: string;
  memberCount?: number;
  unreadCount?: number | null;
  passcode?: string | null;
}

interface CookingClassDisplay {
  id: number;
  name: string;
  description: string;
  author: string;
  memberCount?: number;
  unreadCount?: number;
  type: 'search';
  imageUrl?: string;
  passcode?: string | null;
}

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

type SearchType = 'all' | 'className' | 'userName';

const CkClassSearch = () => {
  const queryClient = useQueryClient();
  const { sendChatMessage } = useChat();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchType, setSearchType] = useState<SearchType>('all');
  const [excludeCode, setExcludeCode] = useState(false);

  const [allClasses, setAllClasses] = useState<CookingClassDisplay[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const classesPerPage = 10;

  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportOptions, setReportOptions] = useState<ReportOption[]>([]);
  const [reportTargetInfo, setReportTargetInfo] = useState<ReportTargetInfo | null>(null);

  // 참여코드 모달 상태
  const [isPasscodeModalOpen, setIsPasscodeModalOpen] = useState(false);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [selectedClass, setSelectedClass] = useState<CookingClassDisplay | null>(null);

  const openModal = (modalData: ModalState) => setModal(modalData);
  const closeModal = () => setModal(null);
  const handleConfirm = () => {
    modal?.onConfirm?.();
    closeModal();
  };

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await api.get<CkclassDto[]>(`/community/ckclass/search`, {
        params: { keyword: searchTerm, searchType, excludeCode },
      });
      const data = Array.isArray(response.data) ? response.data : [];
      const mappedData: CookingClassDisplay[] = data.map((cls) => ({
        id: cls.roomNo,
        name: cls.className ?? '',
        description: cls.classInfo ?? '',
        author: cls.username || '알 수 없음',
        memberCount: cls.memberCount ?? 0,
        unreadCount: cls.unreadCount ?? 0,
        type: 'search',
        imageUrl: cls.serverName ? `http://3.38.213.177:8081/images/${cls.serverName}` : undefined,
        passcode: cls.passcode,
      }));
      setAllClasses(mappedData);
      setCurrentPage(1);
    } catch (error: any) {
      openModal({
        message: error.response?.data || '클래스 검색 중 오류가 발생했습니다.',
        onConfirm: closeModal,
        showCancel: false,
      });
      setAllClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const handleSearch = () => {
    fetchClasses();
  };

  // 클래스 참여 로직
  const mutation = useMutation({
    mutationFn: (payload: { roomNo: number, userNo: number }) =>
      api.post(`/community/ckclass/enroll`, payload),
    onSuccess: async (res, variables) => {
      await getRooms(user?.userNo)
        .then((rooms: ChatRoom[]) => {
          const newRoom = rooms.find(r => r.roomNo === variables.roomNo);
          if (!newRoom) return;

          const systemMessage: Message = {
            userNo: 0,
            username: "SYSTEM",
            content: `${user?.username} 님이 입장하셨습니다`,
            createdAt: new Date().toISOString(),
            roomNo: newRoom.roomNo,
          };

          let messageBlob = new Blob([JSON.stringify(systemMessage)], { type: "application/json" });
          let formData = new FormData();
          formData.append("message", messageBlob);
          saveMessage("cclass", newRoom.roomNo, formData)
            .then((res) => {
              lastRead(user?.userNo as number, "cclass", res.roomNo, res.messageNo as number);
              dispatch(setRooms(rooms));
              queryClient.invalidateQueries({ queryKey: ["rooms"] });
            });

          sendChatMessage(newRoom.roomNo, systemMessage);
          dispatch(openChat(newRoom));
        });
    },
    onError: () => {
      openModal({
        message: '이미 참여중인 클래스 입니다.',
        onConfirm: closeModal,
        showCancel: false,
      });
    },
  });

  const handleJoin = (cls: CookingClassDisplay) => {
    if (!user?.userNo) {
      openModal({
        message: '로그인 후 참여 가능합니다.',
        onConfirm: closeModal,
        showCancel: false,
      });
      return;
    }

    if (cls.passcode) {
      setSelectedClass(cls);
      setPasscodeInput('');
      setIsPasscodeModalOpen(true);
      return;
    }

    mutation.mutate({ roomNo: cls.id, userNo: user.userNo });
  };

  const handlePasscodeConfirm = () => {
    if (!selectedClass) return;

    if (passcodeInput !== selectedClass.passcode) {
      openModal({
        message: '참여 코드가 일치하지 않습니다.',
        onConfirm: closeModal,
        showCancel: false,
      });
      return;
    }

    mutation.mutate({ roomNo: selectedClass.id, userNo: user?.userNo! });
    setIsPasscodeModalOpen(false);
    setSelectedClass(null);
  };  

  const fetchReportOptions = async () => {
    try {
      const res = await api.get<ReportOption[]>(`/community/report/types?category=COOKING_CLASS`);
      setReportOptions(res.data);
    } catch {
      setReportOptions([]);
    }
  };

  const handleReportClick = async (cls: CookingClassDisplay) => {
    if (!user?.userNo) {
      openModal({
        message: '로그인 후 신고 가능합니다.',
        onConfirm: closeModal,
        showCancel: false,
      });
      return;
    }

    setReportTargetInfo({
      author: cls.author,
      title: cls.name,
      category: 'COOKING_CLASS',
      refNo: cls.id,
    });
    await fetchReportOptions();
    setIsReportModalOpen(true);
  };

  const handleReportSubmit = async (reportType: string, content: string, refNo: number) => {
    if (!user?.userNo || !reportTargetInfo) {
      openModal({
        message: '로그인 후 신고 가능합니다.',
        onConfirm: closeModal,
        showCancel: false,
      });
      return;
    }
    try {
      await api.post(`/community/report`, {
        reportType,
        content,
        refNo,
        refType: reportTargetInfo.category,
      });
      openModal({
        message: '신고가 접수되었습니다.',
        onConfirm: closeModal,
        showCancel: false,
      });
      setIsReportModalOpen(false);
      setReportTargetInfo(null);
    } catch (err: any) {
      openModal({
        message: err.response?.data || '신고 실패',
        onConfirm: closeModal,
        showCancel: false,
      });
      setIsReportModalOpen(false);
      setReportTargetInfo(null);
    }
  };

  const indexOfLastClass = currentPage * classesPerPage;
  const indexOfFirstClass = indexOfLastClass - classesPerPage;
  const currentClasses = useMemo(
    () => allClasses.slice(indexOfFirstClass, indexOfLastClass),
    [allClasses, indexOfFirstClass, indexOfLastClass],
  );
  const totalPages = Math.max(1, Math.ceil(allClasses.length / classesPerPage));
  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const renderClassCard = (cls: CookingClassDisplay) => (
    <div key={cls.id} className={styles.classCard}>
      <div
        className={styles.classImage}
        style={{ backgroundImage: cls.imageUrl ? `url(${cls.imageUrl})` : 'none' }}
      />
      <div className={styles.cardContent}>
        <div className={styles.cardHeader}>
          <div className={styles.classTitle}>
            {cls.name}
            {(cls.unreadCount ?? 0) > 0 && (
              <span className={styles.unreadCountBadge}>{cls.unreadCount}</span>
            )}
          </div>
        </div>
        <div className={styles.classDescription}>{cls.description}</div>
        <div className={styles.cardFooter}>
          <div className={styles.authorInfo}>
            <div className={styles.classAuthor}>{cls.author}</div>
            <div className={styles.memberCount}>({cls.memberCount ?? 0}명 참여중...)</div>
          </div>
          <div className={styles.joinedButtons}>
            <button className={styles.joinButton} onClick={() => handleJoin(cls)}>
              참여
            </button>
            <button className={styles.reportButton} onClick={() => handleReportClick(cls)}>
              신고
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <CommunityHeader />
      <div className={styles.container}>
        <div className={styles.searchSection}>
          <h1 className={styles.searchTitle}>클래스 검색</h1>
          <div className={styles.searchBar}>
            <select
              className={styles.searchDropdown}
              value={searchType}
              onChange={(e) => setSearchType(e.target.value as SearchType)}
            >
              <option value="all">전체</option>
              <option value="className">클래스명</option>
              <option value="userName">방장명</option>
            </select>
            <input
              type="text"
              placeholder="검색어를 입력해주세요"
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            />
            <button className={styles.rsearchButton} onClick={handleSearch}>
              검색
            </button>
          </div>
          <div className={styles.searchOptions}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={excludeCode}
                onChange={(e) => setExcludeCode(e.target.checked)}
              />
              참여코드 클래스 제외
            </label>
          </div>
        </div>

        <div className={styles.classCardWrapper}>
          {loading ? (
            <p>로딩 중...</p>
          ) : currentClasses.length > 0 ? (
            currentClasses.map(renderClassCard)
          ) : (
            <p className={styles.noClasses}>검색 결과가 없습니다.</p>
          )}
        </div>

        {totalPages >= 1 && (
          <div className={styles.pagination}>
            <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={i + 1 === currentPage ? styles.active : ''}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        )}
      </div>

      {/* 일반 모달 */}
      {modal && (
        <CommunityModal
          message={modal.message}
          onConfirm={handleConfirm}
          showCancel={modal.showCancel}
          onClose={closeModal}
        />
      )}

      {/* 참여코드 모달 */}
      {isPasscodeModalOpen && selectedClass && (
        <PasscodeModal
          className={selectedClass.name}
          correctPasscode={selectedClass.passcode}
          onConfirm={(input) => {
            if (input !== selectedClass.passcode) {
              openModal({
                message: '참여 코드가 일치하지 않습니다.',
                onConfirm: closeModal,
                showCancel: false,
              });
              return;
            }
            mutation.mutate({ roomNo: selectedClass.id, userNo: user?.userNo! });
            setIsPasscodeModalOpen(false);
            setSelectedClass(null);
          }}
          onClose={() => {
            setIsPasscodeModalOpen(false);
            setSelectedClass(null);
          }}
        />
      )}
      {/* 신고 모달 */}
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
    </>
  );
};

export default CkClassSearch;
