import { Link, useLocation, useNavigate } from "react-router-dom";
import { lodingImg } from "../assets/images";
import { useDispatch, useSelector } from "react-redux";
import useLogout from "../hooks/logout";
import type { RootState } from "../store/store";
import { NewAnnouncement } from "./Admin/newAnnouncement";
import { NewChallenge } from "./Admin/newChallenge";
import { closeModal, openNewAnnouncementModal, openNewChallengeModal } from "../features/adminModalSlice";
import { useEffect, useState } from "react";
import { getTodayAnn } from "../api/authApi";

const Header = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const isAdmin = useSelector((state: RootState) => state.auth.user?.roles?.includes("ROLE_ADMIN"));
  const loc = useLocation();
  const adminPaths = ["/admin", "/admin/users", "/admin/recipes", "/admin/communities", "/admin/classes", 
    "/admin/cservices", "/admin/announcements", "/admin/challenges", "/admin/ingredients"];
  const isAdminPath = adminPaths.includes(loc.pathname);
  const logout = useLogout();
  const { isOpen, modalType } = useSelector((state: RootState) => state.adminModal);
  const dispatch = useDispatch();
  const [todayAnn, setTodayAnn] = useState("");
  const totalReports = useSelector((state: RootState) => state.adminState.totalReports);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const todayAnndata = await getTodayAnn();
        setTodayAnn(todayAnndata.content);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchAnnouncements();
  }, []);

  const handleSuccess = () => {
    dispatch(closeModal());
    window.location.reload(); 
  };

  console.log(window.location.pathname);

  return (
    <>
      {isOpen && modalType === 'newAnnouncement' &&
        <NewAnnouncement
          setOpenNewAnn={() => dispatch(closeModal())}
          onSuccess={handleSuccess}
        />}
      {isOpen && modalType === 'newChallenge' && (
        <NewChallenge
          setOpenNewCh={() => dispatch(closeModal())}
          onSuccess={handleSuccess}
        />
      )}
      <div id="header" className={isAdminPath ? "admHeader" : "commHeader"}>
        <Link to="/home">
          <img className="logo-image" src={lodingImg.logo} alt="요리Pick! 조리Pick!" />
        </Link>
        <ul className="navbar">
          {isAdminPath ? (
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
                <button onClick={() => dispatch(openNewAnnouncementModal())} className="nav-button">공지작성</button>
              </li>
              <li className="nav-line"></li>
              <li>
                <button onClick={() => dispatch(openNewChallengeModal(null))} className="nav-button">챌린지 등록</button>
              </li>
              <li className="nav-line"></li>
              <li>
                <button className="nav-button">재료등록</button>
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
                <Link to="/community/recipe" className="nav-link">커뮤니티</Link>
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
                    <Link to="/mypage" className="nav-link">마이페이지</Link>
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
                <div>로그아웃</div>
                <img className="profile-image" src={ user.profile ? `${user.profile}` : lodingImg.profile} alt="프로필" />
              </button>
            ) : (
              <button className="log-link" onClick={() => navigate('/login', { state: { from: loc } })}>
                  <div>로그인</div>
                  <img className="profile-image" src={lodingImg.profile} alt="프로필" />
              </button>
            )}
          </div>
        </div>
      </div>
      {isAdminPath ? (
        totalReports > 0 &&
        <div className="announcement-bar adm">
          <span>새롭게 처리해야 할 항목이 {totalReports}건 있습니다.</span>
        </div>
      ) :
        todayAnn &&
        <div className="announcement-bar ann">
          <span>{todayAnn}</span>
        </div>
      }
    </>
  );
};

export default Header;