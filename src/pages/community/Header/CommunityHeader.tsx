import { Link, useLocation } from 'react-router-dom';
import chstyles from './CommunityHeader.module.css';

const CommunityHeader = () => {
  const location = useLocation();

  return (
    <header className={chstyles.header}>
      <nav className={chstyles.nav}>
        <ul className={chstyles['nav-list']}>
          <li
            className={`${chstyles['nav-item']} ${
              location.pathname.startsWith('/community/free') ? chstyles.active : ''
            }`}
          >
            <Link to="/community/free">자유 게시판</Link>
          </li>
          <li
            className={`${chstyles['nav-item']} ${
              location.pathname.startsWith('/community/recipe') ? chstyles.active : ''
            }`}
          >
            <Link to="/community/recipe">레시피 공유</Link>
          </li>
          <li
            className={`${chstyles['nav-item']} ${
              location.pathname.startsWith('/community/challenge') ? chstyles.active : ''
            }`}
          >
            <Link to="/community/challenge">푸드 챌린지</Link>
          </li>
          <li
            className={`${chstyles['nav-item']} ${
              location.pathname.startsWith('/community/ckclass') ? chstyles.active : ''
            }`}
          >
            <Link to="/community/ckclass">쿠킹 클래스</Link>
          </li>
          <li
            className={`${chstyles['nav-item']} ${
              location.pathname.startsWith('/community/market') ? chstyles.active : ''
            }`}
          >
            <Link to="/community/market">직거래 장터</Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default CommunityHeader;
