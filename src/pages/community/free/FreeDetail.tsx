import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './FreeDetail.module.css';
import CommunityHeader from '../CommunityHeader';

type FreePost = {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  content: string;
  imageUrl?: string;  
};

const FreeDetail = () => {
  const { postId } = useParams<{ postId: string }>();  
  const navigate = useNavigate();

  const [post, setPost] = useState<FreePost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) {
      setError('게시글 ID가 없습니다.');
      setIsLoading(false);
      return;
    }

    const fetchPost = async () => {
      try {
        const res = await fetch(`http://localhost:8080/community/posts/${postId}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data: FreePost = await res.json();
        setPost(data);
      } catch (err) {
        setError('게시글을 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  if (isLoading) return <div>로딩 중...</div>;
  if (error) return <div>{error}</div>;
  if (!post) return <div>게시글이 존재하지 않습니다.</div>;

        return (
          <>
          <CommunityHeader/>
        <div className={styles.container}>
            <div className={styles.mainCard}>
            <h1 className={styles.heading}>{post.title}</h1>
            <h3 className={styles.subtitle}>{post.subtitle}</h3>
            <p className={styles.author}>작성자: {post.author}</p>
            {post.imageUrl && (
                <img src={post.imageUrl} alt="게시글 이미지" className={styles.imagePreview} />
            )}
            <div className={styles.content}>{post.content}</div>

            <button onClick={() => navigate(-1)} className={styles.backButton}>
                뒤로가기
            </button>
            </div>
        </div>
        </>
        );
    }
export default FreeDetail;
