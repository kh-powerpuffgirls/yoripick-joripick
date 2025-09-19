import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CkClass.module.css';
import CommunityHeader from '../CommunityHeader';
import CommunityModal from '../CommunityModal';
import ReportModal from '../ReportModal';
import { useSelector } from 'react-redux';
import type { RootState } from '../../../store/store';
import axios from 'axios';
import { store } from '../../../store/store';

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

interface CkclassDto {
    roomNo: number;
    userNo: number;
    className: string;
    classInfo: string;
    originName?: string;
    serverName?: string; 
    passcode?: string;
    deleteStatus?: string;
    memberCount?: number;
    unreadCount?: number;
    username?: string; 
}

interface CookingClassDisplay {
    id: number;
    name: string;
    description: string;
    author: string;
    imageUrl?: string; 
    memberCount?: number;
    unreadCount?: number;
}

// 신고 대상 데이터 타입
interface ReportTarget {
    type: 'CLASS' | 'REPLY';
    id: number;
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

const CkClassMain = () => {
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth.user);

    const [myClasses, setMyClasses] = useState<CookingClassDisplay[]>([]);
    const [joinedClasses, setJoinedClasses] = useState<CookingClassDisplay[]>([]);
    
    // 모달 상태
    const [modal, setModal] = useState<ModalState | null>(null);
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportTarget, setReportTarget] = useState<ReportTarget | null>(null);

    const openModal = (modalData: ModalState) => setModal(modalData);
    const closeModal = () => setModal(null);
    const handleConfirm = () => { modal?.onConfirm?.(); closeModal(); };
    const handleCancel = () => { modal?.onCancel?.(); closeModal(); };

    useEffect(() => {
        const fetchClasses = async () => {
            const userNo = user?.userNo;
            if (!userNo) {
                setMyClasses([]);
                setJoinedClasses([]);
                return;
            }

            try {
                const myRes = await api.get<CkclassDto[]>(`/community/ckclass/my`);
                const myMappedData: CookingClassDisplay[] = myRes.data
                .filter(cls => cls.roomNo != null)
                .map(cls => ({
                    id: cls.roomNo!,
                    name: cls.className ?? '',
                    description: cls.classInfo ?? '',
                    author: cls.username ?? '알 수 없음',
                    imageUrl: cls.serverName ? `${API_BASE}/images/${cls.serverName}` : undefined,
                    memberCount: cls.memberCount ?? 0,
                    unreadCount: cls.unreadCount ?? 0,
                }));
                setMyClasses(myMappedData);

                // 참여중인 클래스 API 호출
                const joinedRes = await api.get<CkclassDto[]>(`/community/ckclass/joined`);
                const joinedMappedData: CookingClassDisplay[] = joinedRes.data.map(cls => ({
                    id: cls.roomNo,
                    name: cls.className,
                    description: cls.classInfo,
                    author: cls.username ?? '알 수 없음',
                    imageUrl: cls.serverName 
                        ? `${API_BASE}/images/${cls.serverName}` 
                        : 'https://placehold.co/200x150/ffe6b7/000000?text=No+Image',
                    memberCount: cls.memberCount,
                    unreadCount: cls.unreadCount
                }));

                setJoinedClasses(joinedMappedData);

            } catch (error) {
                console.error("클래스 목록을 불러오는 데 실패했습니다:", error);
                openModal({ message: '클래스 목록을 불러오는 데 실패했습니다.' });
            }
        };

        fetchClasses();
    }, [user]);
    
    // 신고 제출
    const handleReportSubmit = async (type: string, content: string) => {
        if (!user?.userNo || !reportTarget) {
            openModal({ message: '로그인 후 신고 가능합니다.' });
            return;
        }

        try {
            await api.post(`/community/report`, {
                type,
                content,
                roomNo: reportTarget.id,
                refType: 'CLASS'
            });
            setIsReportModalOpen(false);
            setReportTarget(null);
            openModal({ message: '신고가 접수되었습니다.' });
        } catch (err: any) {
            console.error(err);
            openModal({ message: err.response?.data || '신고 실패' });
        }
    };
    
    const handleSearchClick = () => {
        navigate('/community/ckclass/search');
    };

    const handleRegisterClick = () => {
        if (!user?.userNo) {
            openModal({ message: '로그인 후 클래스 등록 가능합니다.' });
            return;
        }
        navigate('/community/ckclass/form');
    };

    return (
        <>
            <CommunityHeader/>
            <div className={styles.container}>
                <h1 className={styles.mainTitle}>COOKING CLASS</h1>
                
                {/* 나의 클래스 섹션 */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>나의 클래스</h2>
                        <span className={styles.viewMore}>&gt;</span>
                    </div>
                    <div className={styles.searchResultWrapper}>
                        {myClasses.map(cls => (
                            <div key={cls.id} className={styles.searchResultCard}>
                            <img src={cls.imageUrl ?? 'https://placehold.co/40x40/CCCCCC/ffffff?text=No+Image'} alt={cls.name} className={styles.searchResultImage} />
                                <div className={styles.searchResultContent}>
                                    <h3 className={styles.searchResultTitle}>{cls.name}</h3>
                                    <p className={styles.searchResultAuthor}>방장: {cls.author}</p>
                                    <p className={styles.searchResultDesc}>{cls.description}</p>
                                    <p>참여 인원: {cls.memberCount ?? 0}</p>
                                    <p className={styles.unreadCount}>
                                        읽지 않은 메시지: {cls.unreadCount ?? 0}
                                    </p>
                                    <div className={styles.searchResultButtons}>
                                        <button className={styles.settingsButton}>설정</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <hr className={styles.divider} />

                {/* 참여중인 클래스 섹션 */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2>참여중인 클래스</h2>
                        <span className={styles.viewMore}>&gt;</span>
                    </div>
                    <div className={styles.searchResultWrapper}>
                        {joinedClasses.map(cls => (
                            <div key={cls.id} className={styles.searchResultCard}>
                                <img src={cls.imageUrl} alt={cls.name} className={styles.searchResultImage} />
                                <div className={styles.searchResultContent}>
                                    <h3 className={styles.searchResultTitle}>{cls.name}</h3>
                                    <p className={styles.searchResultAuthor}>방장: {cls.author}</p>
                                    <p className={styles.searchResultDesc}>{cls.description}</p>
                                    <p>참여 인원: {cls.memberCount ?? 0}</p>
                                    {cls.unreadCount !== undefined && cls.unreadCount > 0 && (
                                        <p className={styles.unreadCount}>읽지 않은 메시지: {cls.unreadCount}</p>
                                    )}
                                    <div className={styles.searchResultButtons}>
                                        <button className={styles.searchJoinButton}>참여</button>
                                        {/* 신고 버튼 클릭 시 모달 열기 */}
                                        <button 
                                            className={styles.searchReportButton}
                                            onClick={() => {
                                                if (!user?.userNo) {
                                                    openModal({ message: '로그인 후 신고 가능합니다.' });
                                                    return;
                                                }
                                                setReportTarget({ type: 'CLASS', id: cls.id });
                                                setIsReportModalOpen(true);
                                            }}
                                        >
                                            신고
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={styles.actionButtons}>
                    <button className={styles.searchButton} onClick={handleSearchClick}>
                        클래스 검색
                    </button>
                    <button className={styles.registerButton} onClick={handleRegisterClick}>
                        등록하기
                    </button>
                </div>
            </div>
            
            {/* 일반 알림/확인 모달 */}
            {modal && <CommunityModal message={modal.message} onConfirm={modal.onConfirm ? handleConfirm : undefined} onCancel={modal.onCancel ? handleCancel : undefined} />}

            {/* 신고 모달 */}
            <ReportModal
                isOpen={isReportModalOpen}
                onClose={() => { setIsReportModalOpen(false); setReportTarget(null); }}
                onSubmit={handleReportSubmit}
                reportTypes={reportTypes}
            />
        </>
    );
};

export default CkClassMain;