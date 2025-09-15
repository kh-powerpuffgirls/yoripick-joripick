import { useState } from 'react';
import './CommunityHeader.css';

const CommunityHeader = () => {
    const [isSearchVisible, setIsSearchVisible] = useState(false);

    const toggleSearch = () => {
        setIsSearchVisible(!isSearchVisible);
    };

    return (
        <header className="header">
            <nav className="nav">
                <ul className="nav-list">
                    <li className="nav-item">자유 게시판</li>
                    <li className="nav-item">레시피 공유</li>
                    <li className="nav-item">푸드 챌린지</li>
                    <li className="nav-item">쿠킹 클래스</li>
                    <li className="nav-item">직거래 장터</li>
                </ul>
            </nav>
            <div className="search-toggle-icon" onClick={toggleSearch}>
                <span role="img" aria-label="cooking-icon">🍳</span>
            </div>
            {isSearchVisible && (
                <div className="search-container">
                    <input type="text" className="search-input" placeholder="검색어를 입력해주세요." />
                </div>
            )}
        </header>
    );
};

export default CommunityHeader;