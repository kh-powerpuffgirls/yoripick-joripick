import { useState, useEffect } from 'react';
import axios from 'axios';
import mypostStyles from './MyPost.module.css';
import { useNavigate } from 'react-router-dom';
import CommunityHeader from '../CommunityHeader';

interface MyPostDto {
    id: number;
    title: string;
    description: string;
    createdDate: string;
    views: number;
    category: string; // BOARD, RECIPE, CHALLENGE, MARKET
}

const MyPost = () => {
    const [posts, setPosts] = useState<MyPostDto[]>([]);
    const [selectedPost, setSelectedPost] = useState<MyPostDto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const API_URL = 'http://localhost:8081/community/mypost/user/2';

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await axios.get<MyPostDto[]>(API_URL);
            setPosts(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch posts:', err);
            setError('게시글을 불러오는 데 실패했습니다.');
            setLoading(false);
        }
    };

 const handlePostClick = (post: MyPostDto) => {
    switch(post.category) {
        case 'BOARD':
            navigate(`/community/free/${post.id}`);
            break;
        case 'RECIPE':
            navigate(`/community/recipe/${post.id}`);
            break;
        case 'CHALLENGE':
            navigate(`/community/challenge/${post.id}`);
            break;
        case 'MARKET':
            navigate(`/community/marketplace/${post.id}`);
            break;
        default:
            console.warn('Unknown category:', post.category);
    }
};

    const handleBackToList = () => {
        setSelectedPost(null);
    };

    if (loading) {
        return <div className={mypostStyles['loading-message']}>로딩 중...</div>;
    }

    if (error) {
        return <div className={mypostStyles['error-message']}>{error}</div>;
    }

    return (
        <>
            <CommunityHeader />
            <div className={mypostStyles.container}>
                {!selectedPost ? (
                    <div className={mypostStyles['post-list']}>
                        <div className={mypostStyles['title-box']}>
                            <h1>내 게시물 보기</h1>
                        </div>
                        <table className={mypostStyles['post-table']}>
                            <thead className={mypostStyles['table-header']}>
                                <tr>
                                    <th>번호</th>
                                    <th>제목</th>
                                    <th>날짜</th>
                                    <th>조회수</th>
                                    <th>종류</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map((post) => (
                                    <tr
                                        key={`${post.category}-${post.id}`}
                                        className={mypostStyles['post-row']}
                                        onClick={() => handlePostClick(post)}
                                    >
                                        <td>{post.id}</td>
                                        <td>{post.title || '-'}</td>
                                        <td>
                                            {new Date(post.createdDate).toLocaleDateString('ko-KR', {
                                                year: '2-digit',
                                                month: '2-digit',
                                                day: '2-digit',
                                            })}
                                        </td>
                                        <td>{post.views}</td>
                                        <td>{post.category}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className={mypostStyles['post-detail-card']}>
                        <button onClick={handleBackToList} className={mypostStyles['back-button']}>
                            &larr; 목록으로 돌아가기
                        </button>
                        <h1>{selectedPost.title || '제목 없음'}</h1>
                        <div className={mypostStyles['post-meta']}>
                            작성일: {new Date(selectedPost.createdDate).toLocaleDateString()} | 조회수: {selectedPost.views} | 종류: {selectedPost.category}
                        </div>
                        <p className={mypostStyles['post-description']}>{selectedPost.description || '내용 없음'}</p>
                    </div>
                )}
            </div>
        </>
    );
};

export default MyPost;
