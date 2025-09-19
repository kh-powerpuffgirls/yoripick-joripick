import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MarketMain.module.css';
import CommunityHeader from '../CommunityHeader';
import axios from 'axios';

interface MarketMain {
    productId: number;
    title: string;
    author: string;
    authorProfileUrl: string;
    image: string;
    views: number;
    likes: number;
    createdAt: string;
}

const MarketMain = () => {
    const navigate = useNavigate();
    const [popularPosts, setPopularPosts] = useState<MarketMain[]>([]);
    const [recentPosts, setRecentPosts] = useState<MarketMain[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const popularResponse = await axios.get('http://localhost:8081/community/market/popular');
                setPopularPosts(popularResponse.data);

                const recentResponse = await axios.get('http://localhost:8081/community/market/recent');
                setRecentPosts(recentResponse.data);
                
                setIsLoading(false);
            } catch (err) {
                console.error("Failed to fetch market posts:", err);
                setError('게시글을 불러오는데 실패했습니다.');
                setIsLoading(false);
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
    <div key={post.productId} className={styles.postCard} onClick={() => navigate(`/community/market/buyForm/${post.productId}`)}>
            <img src={post.image} alt={post.title} className={styles.postImage} />
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

    if (isLoading) {
        return <div className={styles.loading}>게시글을 불러오는 중입니다...</div>;
    }

    if (error) {
        return <div className={styles.error}>{error}</div>;
    }

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
                        {popularPosts.length > 0 ? popularPosts.map(renderPostCard) : <p className={styles.noPosts}>인기 거래 게시글이 없습니다.</p>}
                    </div>
                </div>

                {/* 최신 거래 */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <h2 className={styles.sectionTitle}>최신 거래</h2>
                        <span className={styles.viewMore}>더보기 &gt;</span>
                    </div>
                    <div className={styles.postGrid}>
                        {recentPosts.length > 0 ? recentPosts.map(renderPostCard) : <p className={styles.noPosts}>최신 거래 게시글이 없습니다.</p>}
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