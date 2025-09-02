import { useState, useEffect } from 'react';
import axios from 'axios';
import './CommunityMain.css';
import CommunityHeader from './CommunityHeader';
import { Link } from 'react-router-dom';

interface BoardInfo {
    title: string;
    description: string;
}

const CommunityMain = () => {
    const [boards, setBoards] = useState<BoardInfo[]>([]);

    useEffect(() => {
        axios.get('http://localhost:8080/community')
            .then(response => {
                if (Array.isArray(response.data)) {
                    setBoards(response.data);
                } else {
                    console.error("응답 데이터:", response.data);
                    setBoards([]);
                }
            })
            .catch(error => {
                console.error("오류 발생:", error);
                setBoards([]);
            });
    }, []);

    return (
        <div className="community-main-container">
            <CommunityHeader />
            
            <main className="main-content">
                <div className="community-title-container">
                    <h1 className="community-title">요픽조픽 커뮤니티</h1>
                </div>
                    <div className="my-posts-link-container">
                    {/* <a> 태그 대신 라우터의 <Link> 컴포넌트를 사용하여 페이지 이동 */}
                    <Link to="/mypost" className="my-posts-link">내 게시글 보기 &gt;</Link>
                </div>

                <section className="board-list-container">
                    {boards.map((board, index) => (
                        <a key={index} href="#" className="board-card">
                            <h2 className="board-title">{board.title}</h2>
                            <p className="board-description">{board.description}</p>
                        </a>
                    ))}
                </section>
            </main>
        </div>
    );
};

export default CommunityMain;