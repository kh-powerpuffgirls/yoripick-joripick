import { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './CommunityMain.module.css';
import CommunityHeader from './Header/CommunityHeader';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';

interface BoardInfo {
    title: string;
    description: string;
}

const CommunityMain = () => {
    const [boards, setBoards] = useState<BoardInfo[]>([]);
    const user = useSelector((state: RootState) => state.auth.user); // 로그인 유저 확인

    useEffect(() => {
        axios.get('https://api.ypjp.store:8443/community')
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

    const getBoardPath = (title: string) => {
        switch (title) {
            case '자유 게시판': return '/community/free';
            case '레시피 공유': return '/community/recipe';
            case '푸드 챌린지': return '/community/challenge';
            case '쿠킹 클래스': return '/community/ckclass';
            case '직거래 장터': return '/community/market';
            default: return '/community';
        }
    };

    return (
        <>
            <CommunityHeader />
            <div className={styles.communityMainContainer}>
                <main className={styles.mainContent}>
                    <div className={styles.communityTitleContainer}>
                        <h1 className={styles.communityTitle}>요픽조픽 커뮤니티</h1>
                    </div>

                    {/* 로그인한 유저만 내 게시글 보기 버튼 */}
                    {user && (
                        <div className={styles.myPostsLinkContainer}>
                            <Link to="/community/mypost" className={styles.myPostsLink}>
                                내 게시글 보기 &gt;
                            </Link>
                        </div>
                    )}

                    <section className={styles.boardListContainer}>
                        {boards.map((board, index) => (
                            <Link
                                key={index}
                                to={getBoardPath(board.title)}
                                className={styles.boardCard}
                            >
                                <h2 className={styles.boardTitle}>{board.title}</h2>
                                <p className={styles.boardDescription}>{board.description}</p>
                            </Link>
                        ))}
                    </section>
                </main>
            </div>
        </>
    );
};

export default CommunityMain;
