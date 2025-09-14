import { Link } from "react-router-dom"

// 링크 연결 필요함

const Pagination = () => {
    return (
        <>
            <div className="pagination-area">
                <ul className="pagination page-modal">
                    <li> <a href="#" className="page-first">&lt;&lt;</a></li>
                    <li> <a href="#" className="page-left">&lt;</a></li> 
                    <li> <a href="#" className="active page-num">1</a></li>
                    <li> <a href="#" className="page-num">2</a></li>
                    <li> <a href="#" className="page-num">3</a></li>
                    <li> <a href="#" className="page-num">4</a></li>
                    <li> <a href="#" className="page-num">5</a></li>
                    <li> <a href="#" className="page-num">6</a></li>
                    <li> <a href="#" className="page-num">7</a></li>
                    <li> <a href="#" className="page-num">8</a></li>
                    <li> <a href="#" className="page-num">9</a></li>
                    <li> <a href="#" className="page-right">&gt;</a></li>
                    <li><a href="#" className="page-last">&gt;&gt;</a></li>
                </ul>
            </div>
        </>
    )
}

export default Pagination