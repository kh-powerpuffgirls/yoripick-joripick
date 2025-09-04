import { Link } from "react-router-dom"
import { lodingImg } from "../assets/images"

const Header = () => {
    return (
        <div id="header">
            <Link to="/home">
                <img className="logo-image" src={lodingImg.logo} alt="요리Pick! 조리Pick!" />
            </Link>
            <ul className="navbar">
                <li>
                    <Link to="/recipe/list" className="nav-link">레시피</Link>
                </li><li className="nav-line"></li>
                <li>
                    <Link to="/ingpedia" className="nav-link">재료백과</Link>
                </li><li className="nav-line"></li>
                <li>
                    <Link to="/community" className="nav-link">커뮤니티</Link>
                </li><li className="nav-line"></li>
                <li>
                    <Link to="/eat-bti" className="nav-link">식BTI</Link>
                </li><li className="nav-line"></li>
                <li>
                    <Link to="/cservice" className="nav-link">고객센터</Link>
                </li>
                <li>
                    <Link to="/mypage" className="nav-link">마이페이지</Link>
                </li>
            </ul>
            <div className="nav-right">
                <div className="search-icon">
                    <img className="search-image" src={lodingImg.search} />
                </div>
                <div className="profile-icon">
                    <Link to="/login" className="log-link" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        로그인
                        <img className="profile-image" src={lodingImg.profile} alt="프로필" />
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Header