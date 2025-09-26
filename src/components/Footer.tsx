import { Link } from "react-router-dom"

const Footer = () => {
    return (
        <div id="footer">            
            <ul className="footer-nav">
                <li className="footer-nav-item">
                    <Link to="/" className="footer-nav-link">Home</Link>
                </li>
                <li className="footer-nav-item">
                    <Link to="/api/recipe" className="footer-nav-link">레시피</Link>
                </li>
                <li className="footer-nav-item">
                    <Link to="/eat-bti" className="footer-nav-link">식BTI</Link>
                </li>
                <li className="footer-nav-item">
                    <Link to="/cservice" className="footer-nav-link">고객센터</Link>
                </li>
                <li className="footer-nav-item">
                    <Link to="/users" className="footer-nav-link">My Page</Link>
                </li>
            </ul>
            <div>Copyright 파워퍼프걸즈 All Rights Reserved</div>
        </div>
    )
}

export default Footer
