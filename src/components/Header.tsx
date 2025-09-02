import { Link } from "react-router-dom"

const Header = () => {
    return (
        <div id="header">
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
                    <Link to="/" className="nav-link">커뮤니티</Link>
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
                    <Link to="/login" className="nav-link">로그인</Link>
                </li>
            </ul>
        </div>
    )
}

export default Header