import { Link } from "react-router-dom"
<<<<<<< HEAD
import logo from '../assets/logo.png'

const Header = () => {
    return (
        <>
            <div id="header">
                <img src={logo} alt='picture1' height='100px' width='200px' /> 
                <h1 style={{ textAlign: "center" }}>요리 PICK! 조리 PICK!</h1>
                
                <ul className="navbar">
                    <li>
                        <Link to="/" className="nav-link">Home</Link>
                    </li>
                    <li>
                        <Link to="/" className="nav-link">레시피</Link>
                    </li>
                    <li>
                        <Link to="/" className="nav-link">재료백과</Link>
                    </li>
                    <li>
                        <Link to="/community/recipe" className="nav-link">커뮤니티</Link>
                    </li>
                    <li>
                        <Link to="/" className="nav-link">식BTI</Link>
                    </li>
                    <li>
                        <Link to="/" className="nav-link">고객센터</Link>
                    </li>
                    <li>
                        <Link to="/" className="nav-link">마이페이지</Link>
                    </li>
                    <li>
                        <Link to="/" className="nav-link">로그인</Link>
                    </li>
                </ul>
            </div>
        </>
=======
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
                    <img className="search-image" src={lodingImg.search}/>
                </div>
                <div className="profile-icon">
                    <Link to="/login" className="log-link">로그인</Link>
                    <img className="profile-image" src={lodingImg.profile}/>
                </div>
            </div>
        </div>
>>>>>>> master
    )
}

export default Header