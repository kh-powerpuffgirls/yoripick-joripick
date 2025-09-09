
import { Link } from "react-router-dom";
import { lodingImg } from "../assets/images";
import { useSelector } from "react-redux";
import useLogout from "../hooks/logout";
import type { RootState } from "../store/store";


const Header = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const logout = useLogout();

  return (
    <div id="header">
      <Link to="/home">
        <img className="logo-image" src={lodingImg.logo} alt="요리Pick! 조리Pick!" />
      </Link>
      <ul className="navbar">
        <li>
          <Link to="/recipe/list" className="nav-link">레시피</Link>
        </li>
        <li className="nav-line"></li>
        <li>
          <Link to="/ingpedia" className="nav-link">재료백과</Link>
        </li>
        <li className="nav-line"></li>
        <li>
          <Link to="/community" className="nav-link">커뮤니티</Link>
        </li>
        <li className="nav-line"></li>
        <li>
          <Link to="/eat-bti" className="nav-link">식BTI</Link>
        </li>
        <li className="nav-line"></li>
        <li>
          <Link to="/cservice" className="nav-link">고객센터</Link>
        </li>

        {isAuthenticated && (
          <>
            <li className="nav-line"></li>
            <li>
              <Link to="/mypage" className="nav-link">마이페이지</Link>
            </li>
          </>
        )}
      </ul>
      <div className="nav-right">
        <div className="search-icon">
          <img className="search-image" src={lodingImg.search} />
        </div>
        <div className="profile-icon">
          {isAuthenticated ? (
            <button className="log-link" onClick={logout}>
              로그아웃
              <img className="profile-image" src={lodingImg.profile} alt="프로필" />
            </button>
          ) : (
            <Link to="/login" className="log-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              로그인
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;