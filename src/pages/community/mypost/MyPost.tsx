import { useState, useEffect } from 'react';
import axios from 'axios';
import './MyPost.css';
import { useNavigate } from 'react-router-dom';
import CommunityHeader from '../CommunityHeader'; 

interface MyPostDto {
    id: number;
    title: string;
    description: string;
    createdDate: string;
    views: number;
}

const MyPost = () => {
    const [posts, setPosts] = useState<MyPostDto[]>([]);
    const [selectedPost, setSelectedPost] = useState<MyPostDto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate(); // useNavigate 훅 사용

    const API_URL = 'http://localhost:8080/community/mypost';

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

    const handlePostClick = async (id: number) => {
        try {
            const response = await axios.get<MyPostDto>(`${API_URL}/${id}`);
            setSelectedPost(response.data);
        } catch (err) {
            console.error('Failed to fetch post:', err);
            setError('게시글 상세 정보를 불러오는 데 실패했습니다.');
        }
    };

    const handleBackToList = () => {
        setSelectedPost(null);
        navigate(-1);
    };

    if (loading) {
        return <div className="loading-message">로딩 중...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <div className="container">
            <CommunityHeader />
            {!selectedPost ? (
                <div className="post-list">
                    <div className="title-box">
                        <h1>내 게시물 보기</h1>
                    </div>
                    <table className="post-table">
                        <thead className="table-header">
                            <tr>
                                <th>번호</th>
                                <th>제목</th>
                                <th>날짜</th>
                                <th>조회수</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map((post) => (
                                <tr key={post.id} className="post-row" onClick={() => handlePostClick(post.id)}>
                                    <td>{post.id}</td>
                                    <td>{post.title}</td>
                                    <td>{new Date(post.createdDate).toLocaleDateString('ko-KR', { year: '2-digit', month: '2-digit', day: '2-digit' })}</td>
                                    <td>{post.views}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                // 게시글 상세 보기
                <div className="post-detail-card">
                    <button onClick={handleBackToList} className="back-button">
                        &larr; 목록으로 돌아가기
                    </button>
                    <h1>{selectedPost.title}</h1>
                    <div className="post-meta">
                        작성일: {new Date(selectedPost.createdDate).toLocaleDateString()} | 조회수: {selectedPost.views}
                    </div>
                    <p className="post-description">{selectedPost.description}</p>
                </div>
            )}
        </div>
    );
};

export default MyPost;

{/* 백엔드에서 /community/mypost/{id} API 완성하기 */}
