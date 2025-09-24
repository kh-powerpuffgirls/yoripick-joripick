import { useState } from 'react';
import { Link } from 'react-router-dom';
import chstyles from './CommunityHeader.module.css';

const CommunityHeader = () => {
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const toggleSearch = () => {
        setIsSearchVisible(!isSearchVisible);
    };

    return (
        <header className={chstyles.header}>
            <nav className={chstyles.nav}>
                <ul className={chstyles['nav-list']}>
                    <li className={chstyles['nav-item']}>
                        <Link to="/community/free">자유 게시판</Link>
                    </li>
                    <li className={chstyles['nav-item']}>
                        <Link to="/community/recipe">레시피 공유</Link>
                    </li>
                    <li className={chstyles['nav-item']}>
                        <Link to="/community/challenge">푸드 챌린지</Link>
                    </li>
                    <li className={chstyles['nav-item']}>
                        <Link to="/community/ckclass">쿠킹 클래스</Link>
                    </li>
                    <li className={chstyles['nav-item']}>
                        <Link to="/community/market">직거래 장터</Link>
                    </li>
                </ul>
            </nav>
            <div className={chstyles['search-toggle-icon']} onClick={toggleSearch}>
                <span role="img" aria-label="cooking-icon">🍳</span>
            </div>
            {isSearchVisible && (
                <div className={chstyles['search-container']}>
                    <input
                        type="text"
                        className={chstyles['search-input']}
                        placeholder="검색어를 입력해주세요."
                    />
                </div>
            )}
        </header>
    );
};

export default CommunityHeader;
