import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CkClass.module.css';
import CommunityHeader from '../CommunityHeader';

interface CookingClass {
    id: number;
    name: string;
    description: string;
    author?: string;
    imageUrl: string;
}

const CkClassMain = () => {
    const navigate = useNavigate();
    const [myClasses, setMyClasses] = useState<CookingClass[]>([]);
    const [joinedClasses, setJoinedClasses] = useState<CookingClass[]>([]);

    useEffect(() => {
        // 임시 데이터. 백엔드 API와 연결되면 fetch 호출로 대체
        const dummyMyClasses = [
            { id: 1, name: '프랑스 마카롱 만들기', description: '달콤한 디저트의 세계로!', imageUrl: 'https://placehold.co/200x150/ffe6b7/000000?text=Image+1', author: '민지쌤' },
        ];
        const dummyJoinedClasses = [
            { id: 2, name: '김치찌개 마스터', description: '얼큰한 국물의 비밀', imageUrl: 'https://placehold.co/200x150/ffe6b7/000000?text=Image+2', author: '준식쌤' },
            { id: 3, name: '정통 오일 파스타', description: '본토의 맛을 그대로', imageUrl: 'https://placehold.co/200x150/ffe6b7/000000?text=Image+3', author: '진영쌤' },
        ];
        setMyClasses(dummyMyClasses);
        setJoinedClasses(dummyJoinedClasses);
    }, []);

    const handleSearchClick = () => {
        navigate('/community/ckclass/search');
    };

    const handleRegisterClick = () => {
        navigate('/community/ckclass/form');
    };

    const handleSettingsClick = (classId: number) => {
        // 모달창을 띄우는 로직을 여기에 구현
        console.log(`클래스 ID ${classId}에 대한 설정 모달을 띄웁니다.`);
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
                                <img src={cls.imageUrl} alt={cls.name} className={styles.searchResultImage} />
                                <div className={styles.searchResultContent}>
                                    <h3 className={styles.searchResultTitle}>{cls.name}</h3>
                                    <p className={styles.searchResultAuthor}>방장: {cls.author}</p>
                                    <p className={styles.searchResultDesc}>{cls.description}</p>
                                    <div className={styles.searchResultButtons}>
                                        <button 
                                            className={styles.settingsButton}
                                            onClick={() => handleSettingsClick(cls.id)}
                                        >
                                            설정
                                        </button>
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
                                    <div className={styles.searchResultButtons}>
                                        <button className={styles.searchJoinButton}>참여</button>
                                        <button className={styles.searchReportButton}>신고</button>
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
            
            {/* 쿠킹 클래스 모달창 여기에...
                <Modal />
            */}
        </>
    );
};

export default CkClassMain;