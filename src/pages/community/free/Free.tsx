import { useState, useEffect } from 'react';
import axios from 'axios';
import './Free.css';
import CommunityHeader from '../CommunityHeader';
import { Link } from 'react-router-dom';

// 게시글 정보 인터페이스
interface PostInfo {
    id: number;
    title: string;
    subtitle: string;
    author: string;
    createdDate: string;
    views: number;
    likes: number;
    comments: number;
    imageUrl?: string; // 이미지 URL을 옵션으로 추가
}

const Free = () => {
    const [posts, setPosts] = useState<PostInfo[]>([]);

    useEffect(() => {
        // 더미 데이터
        const dummyPosts: PostInfo[] = [
            {
                id: 1,
                title: '요리 똥손도 금손 만들어주는 내돈내산 찐템! 솔직히 이건 반칙 수준의 인생 주방템이라서 안 사면 후회함!!!!!!!',
                subtitle: '#요리 #조리 #요리조리',
                author: '망곰eee',
                createdDate: '25.08.25',
                views: 0,
                likes: 0,
                comments: 0,
                imageUrl: 'https://placehold.co/80x80/E2E8F0/A0AEC0?text=이미지'
            },
            {
                id: 2,
                title: '여행 가서 먹어본 역대급 맛집! 알고 보니 현지인이 하는 곳이라던데요? 위치 알려드릴까요 일단 한국은 아니긴해요',
                subtitle: '인생맛집찾은사람',
                author: '좋아hyun',
                createdDate: '25.08.25',
                views: 17,
                likes: 8,
                comments: 7,
                imageUrl: 'https://placehold.co/80x80/E2E8F0/A0AEC0?text=이미지'
            },
            {
                id: 3,
                title: '요리 비포 앤 애프터! 평범했던 재료가 환골탈태하는 마법!',
                subtitle: '@실력자',
                author: '응비912',
                createdDate: '25.08.25',
                views: 32,
                likes: 17,
                comments: 25,
                imageUrl: 'https://placehold.co/80x80/E2E8F0/A0AEC0?text=이미지'
            },
            {
                id: 4,
                title: '장보기 고수들 모여라! 신선하고 저렴한 내 단골 시장, 알려드릴까요?',
                subtitle: '',
                author: '현주짱',
                createdDate: '25.08.25',
                views: 59,
                likes: 27,
                comments: 32,
                imageUrl: 'https://placehold.co/80x80/E2E8F0/A0AEC0?text=이미지'
            },
        ];
        setPosts(dummyPosts);
    }, []);
    
    // 페이지네이션을 위한 더미 데이터
    const totalPages = 10;
    const currentPage = 1;

    const renderPagination = () => {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
            pages.push(
                <div key={i} className={`pagination-item ${currentPage === i ? 'active' : ''}`}>
                    {i}
                </div>
            );
        }
        return pages;
    };


    return (
        <div className="community-main-container">
            <CommunityHeader />
            <main className="main-content">
                <div className="button-container">
                    <button className="register-button">등록하기</button>
                </div>
                <section className="post-list-section">
                    {posts.map((post) => (
                        <div key={post.id} className="post-card">
                            <div className="post-info-container">
                                <div className="post-header">
                                    {/* 소제목이 없으면 []만 표시 */}
                                    <span className="post-subtitle">[{post.subtitle}]</span>
                                </div>
                                <h2 className="post-title">{post.title}</h2>
                                <div className="post-meta">
                                    <span className="post-author">{post.author}</span>
                                    <span className="post-date">{post.createdDate}</span>
                                    <span className="post-views">조회수 {post.views}</span>
                                    <span className="post-likes">좋아요 {post.likes}</span>
                                </div>
                            </div>
                            {post.imageUrl && (
                                <div className="post-image-container">
                                    <img src={post.imageUrl} alt="게시글 이미지" className="post-image" />
                                </div>
                            )}
                            <div className="post-comments-container">
                                {post.comments}
                            </div>
                        </div>
                    ))}
                </section>
                <div className="pagination-container">
                    <div className="pagination-arrow">&lt;</div>
                    {renderPagination()}
                    <div className="pagination-arrow">&gt;</div>
                </div>
            </main>
        </div>
    );
};

export default Free;
