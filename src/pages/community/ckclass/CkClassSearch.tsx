import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './CkClass.module.css';
import CommunityHeader from '../CommunityHeader';

interface ClassDto {
    roomNo: number;
    className: string;
    classInfo: string;
    username: string;
    originName?: string;
    serverName?: string;
    memberCount: number;
    unreadCount?: number | null;
    passcode?: string | null;
}

// searchType에 'all' 추가
type SearchType = 'all' | 'className' | 'userName';

const API_BASE = 'http://localhost:8081'; // 필요 시 환경에 맞게 수정

const CkClassSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState<SearchType>('all');
    const [excludeCode, setExcludeCode] = useState(false);
    const [classes, setClasses] = useState<ClassDto[]>([]);
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    // API 호출 함수
    const fetchClasses = async () => {
        try {
            setLoading(true);
            const response = await axios.get<ClassDto[]>(`${API_BASE}/community/ckclass/search`, {
                params: {
                    keyword: searchTerm,
                    searchType,
                    excludeCode,
                },
            });

            const data = Array.isArray(response.data) ? response.data : [];
            setClasses(data);
        } catch (error) {
            console.error('클래스 검색 중 오류 발생:', error);
            setClasses([]);
        } finally {
            setLoading(false);
        }
    };

    // 초기 로딩: 전체 목록 조회
    useEffect(() => {
        fetchClasses();
    }, []);

    // 검색 버튼 클릭 시
    const handleSearch = () => {
        fetchClasses();
    };

    // 참여 버튼 클릭 시
    const handleJoin = (roomNo: number, passcode?: string | null) => {
        if (passcode) {
            const inputCode = prompt('참여 코드를 입력해주세요:');
            if (inputCode !== passcode) {
                alert('참여 코드가 일치하지 않습니다.');
                return;
            }
        }
        navigate(`/class/${roomNo}`);
    };

    // 신고 버튼 클릭 시
    const handleReport = (roomNo: number) => {
        navigate(`/report/class/${roomNo}`);
    };

    return (
        <>
            <CommunityHeader />
            <div className={styles.container}>
                <div className={styles.searchSection}>
                    <h1 className={styles.searchTitle}>클래스 검색</h1>

                    {/* 검색 입력 영역 */}
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
                        <button className={styles.searchButton} onClick={handleSearch}>
                            검색
                        </button>
                    </div>

                    {/* 참여코드 제외 옵션 */}
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

                {/* 검색 결과 영역 */}
                <div className={styles.searchResultWrapper}>
                    {loading ? (
                        <p>로딩 중...</p>
                    ) : classes.length > 0 ? (
                        classes.map((cls) => (
                            <div key={cls.roomNo} className={styles.searchResultCard}>
                                <img
                                    src={
                                        cls.serverName
                                            ? `${API_BASE}/images/${cls.serverName}`
                                            : 'https://placehold.co/200x150/ffe6b7/000000?text=No+Image'
                                    }
                                    alt={cls.className}
                                    className={styles.searchResultImage}
                                />
                                <div className={styles.searchResultContent}>
                                    <h3 className={styles.searchResultTitle}>{cls.className}</h3>
                                    <p className={styles.searchResultAuthor}>방장: {cls.username}</p>
                                    <p className={styles.searchResultDesc}>{cls.classInfo}</p>
                                    <p>회원 수: {cls.memberCount}</p>
                                    <p>읽지 않은 메시지: {cls.unreadCount ?? 0}</p>
                                    <div className={styles.searchResultButtons}>
                                        <button
                                            className={styles.searchJoinButton}
                                            onClick={() => handleJoin(cls.roomNo, cls.passcode)}
                                        >
                                            참여
                                        </button>
                                        <button
                                            className={styles.searchReportButton}
                                            onClick={() => handleReport(cls.roomNo)}
                                        >
                                            신고
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className={styles.noResults}>검색 결과가 없습니다.</p>
                    )}
                </div>
            </div>
        </>
    );
};

export default CkClassSearch;
