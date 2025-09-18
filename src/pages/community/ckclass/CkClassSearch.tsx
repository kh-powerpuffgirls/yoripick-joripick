import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CkClass.module.css';
import CommunityHeader from '../CommunityHeader';

// 임시 데이터
const dummyClasses = [
    { id: 1, name: '제과 초급반: 프랑스 마카롱', author: '현주쌤', description: '달콤한 디저트의 세계로!', isCodeRequired: false, imageUrl: 'https://placehold.co/200x150/ffe6b7/000000?text=Macaron' },
    { id: 2, name: '한식 기초: 김치찌개 마스터하기', author: '준식쌤', description: '얼큰한 국물의 비밀', isCodeRequired: false, imageUrl: 'https://placehold.co/200x150/ffe6b7/000000?text=Kimchi' },
    { id: 3, name: '이탈리아 요리: 오일 파스타 정복', author: '진영쌤', description: '본토의 맛을 그대로', isCodeRequired: true, imageUrl: 'https://placehold.co/200x150/ffe6b7/000000?text=Pasta' },
    { id: 4, name: '베이킹 클래스: 케이크 데코레이션', author: '민지쌤', description: '나만의 특별한 케이크 만들기', isCodeRequired: false, imageUrl: 'https://placehold.co/200x150/ffe6b7/000000?text=Cake' },
];

const CkClassSearch = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [searchType, setSearchType] = useState('name'); // 'name' 또는 'author'
    const [excludeCode, setExcludeCode] = useState(false);
    const navigate = useNavigate();

    // 검색 로직 (임시)
    const filteredClasses = dummyClasses.filter(cls => {
        const matchesType = searchType === 'name' ? 
            cls.name.includes(searchTerm) : 
            cls.author.includes(searchTerm);
        
        const matchesCode = excludeCode ? !cls.isCodeRequired : true;
        
        return matchesType && matchesCode;
    });

    return (
        <>
        <CommunityHeader/>
        <div className={styles.container}>
            <div className={styles.searchSection}>
                <h1 className={styles.searchTitle}>클래스 검색</h1>
                <div className={styles.searchBar}>
                    <select 
                        className={styles.searchDropdown} 
                        value={searchType} 
                        onChange={(e) => setSearchType(e.target.value)}
                    >
                        <option value="name">클래스명</option>
                        <option value="author">방장명</option>
                    </select>
                    <input
                        type="text"
                        placeholder="검색어를 입력해주세요"
                        className={styles.searchInput}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className={styles.searchButton}>검색</button>
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

            <div className={styles.searchResultWrapper}>
                {filteredClasses.length > 0 ? (
                    filteredClasses.map(cls => (
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