import { Link, useLocation } from "react-router-dom";
import { lodingImg } from "../assets/images";
import { useSelector } from "react-redux";
import useLogout from "../hooks/logout";
import type { RootState } from "../store/store";
// import { NewAnnouncement } from "./Admin/newAnnouncement";
import { useState } from "react";
// import { NewChallenge } from "./Admin/newChallenge";

const Header = () => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = useSelector((state: RootState) => state.auth.user?.roles?.includes("ROLE_ADMIN"));
  const loc = useLocation();
  const logout = useLogout();
  const [openNewAnn, setOpenNewAnn] = useState(false);
  const [openNewCh, setOpenNewCh] = useState(false);

  console.log(window.location.pathname);

  return (
    <>
      {/* {openNewAnn && <NewAnnouncement setOpenNewAnn={setOpenNewAnn}/>}
      {openNewCh && <NewChallenge setOpenNewCh={setOpenNewCh}/>} */}
      <div id="header">
        <Link to="/home">
          <img className="logo-image" src={lodingImg.logo} alt="요리Pick! 조리Pick!" />
        </Link>
        <ul className="navbar">
          {loc.pathname === "/admin" ? (
            <>
              <li>
                <Link to="/home" className="nav-link">HOME</Link>
              </li>
              <li className="nav-line"></li>
              <li>
                <Link to="/admin" className="nav-link">대시보드</Link>
              </li>
              <li className="nav-line"></li>
              <li>
                <button onClick={() => setOpenNewAnn(true)} className="nav-button">공지작성</button>
              </li>
              <li className="nav-line"></li>
              <li>
                <button onClick={() => setOpenNewCh(true)} className="nav-button">챌린지 등록</button>
              </li>
            </>
          ) : (
            <>
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
                <Link to="/eatbti" className="nav-link">식BTI</Link>
              </li>
              <li className="nav-line"></li>
              <li>
                <Link to="/cservice" className="nav-link">고객센터</Link>
              </li>
              {user && (
                <>
                  <li className="nav-line"></li>
                  <li>
                    <Link to="/users" className="nav-link">마이페이지</Link>
                  </li>
                </>
              )}
              {isAdmin && (
                <>
                  <li className="nav-line"></li>
                  <li>
                    <Link to="/admin" className="nav-link">관리자페이지</Link>
                  </li>
                </>
              )}
            </>
          )}
        </ul>
        <div className="nav-right">
          <div className="search-icon">
            <img className="search-image" src={lodingImg.search} />
          </div>
          <div className="profile-icon">
            {user ? (
              <button className="log-link" onClick={logout}>
                로그아웃
                <img className="profile-image" src={lodingImg.profile} alt="프로필" />
              </button>
            ) : (
              <Link to="/login" state={{ from: loc }}  className="log-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                로그인
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;