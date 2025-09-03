import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MarketMain.module.css';
import CommunityHeader from '../CommunityHeader';
import axios from 'axios';

interface MarketMain {
    id: number;
    title: string;
    author: string;
    authorProfileUrl: string;
    imageUrl: string;
    views: number;
    likes: number;
}

const MarketMain = () => {
    const navigate = useNavigate();
    const [popularPosts, setPopularPosts] = useState<MarketMain[]>([]);
    const [recentPosts, setRecentPosts] = useState<MarketMain[]>([]);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                // 인기 거래 목록 가져오기
                const popularResponse = await axios.get('http://localhost:8080/community/market/posts/popular');
                setPopularPosts(popularResponse.data);

                // 최신 거래 목록 가져오기
                const recentResponse = await axios.get('http://localhost:8080/community/market/posts/recent');
                setRecentPosts(recentResponse.data);
            } catch (error) {
                console.error("Failed to fetch market posts:", error);
            }
        };

        fetchPosts();
    }, []);

    const handleRegisterClick = () => {
        navigate('/community/market/form');
    };

    const handleMyListClick = () => {
        navigate('/community/market/my-list');
    };

    const renderPostCard = (post: MarketMain) => (
        <div key={post.id} className={styles.postCard} onClick={() => navigate(`/community/market/buyForm/${post.id}`)}>
            <img src={post.imageUrl} alt={post.title} className={styles.postImage} />
            <div className={styles.postInfo}>
                <h3 className={styles.postTitle}>{post.title}</h3>
                <div className={styles.postAuthor}>
                    <img src={post.authorProfileUrl} alt="profile" className={styles.profileIcon} />
                    <span>{post.author}</span>
                </div>
                <div className={styles.postStats}>
                    <span>👁️ {post.views}</span>
                    <span>👍 {post.likes}</span>
                </div>
            </div>
        </div>
    );

    return (
        <>
            <CommunityHeader/>
            <div className={styles.container}>
                <h1 className={styles.mainTitle}>거래장터</h1>

                {/* 인기 거래 */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>인기 거래</h2>
                        <span className={styles.viewMore}>더보기 &gt;</span>
                    </div>
                    <div className={styles.postGrid}>
                        {popularPosts.length > 0 ? popularPosts.map(renderPostCard) : <p>인기 거래 게시글이 없습니다.</p>}
                    </div>
                </div>

                {/* 최신 거래 */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>최신 거래</h2>
                        <span className={styles.viewMore}>더보기 &gt;</span>
                    </div>
                    <div className={styles.postGrid}>
                        {recentPosts.length > 0 ? recentPosts.map(renderPostCard) : <p>최신 거래 게시글이 없습니다.</p>}
                    </div>
                </div>

                <div className={styles.actionButtons}>
                    <button className={styles.registerButton} onClick={handleRegisterClick}>등록하기</button>
                    <button className={styles.myListButton} onClick={handleMyListClick}>내 판매 목록</button>
                </div>
            </div>
        </>
    );
};

export default MarketMain;