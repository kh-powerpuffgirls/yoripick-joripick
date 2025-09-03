import { useState } from 'react';
import { Link } from 'react-router-dom';
import freestyles from './FreeMain.module.css';
import CommunityHeader from '../CommunityHeader';
import { useNavigate } from 'react-router-dom';

interface PostInfo {
  id: number;
  title: string;
  subtitle: string;
  author: string;
  createdDate: string;
  views: number;
  likes: number;
  comments: number;
  imageUrl?: string;
}

const FreeMain = () => {
  const navigate = useNavigate();
  const [posts] = useState<PostInfo[]>([
    {
      id: 1,
      title: '요리 똥손도 금손 만들어주는 내돈내산 템!!',
      subtitle: '#요리 #조리',
      author: '망곰eee',
      createdDate: '2023-10-26T10:00:00Z',
      views: 305,
      likes: 0,
      comments: 2,
      imageUrl: 'https://placehold.co/80x80/ffe6b7/000000?text=Image+1',
    },
    {
      id: 2,
      title: '여행 가서 먹어본 역대급 맛집!',
      subtitle: '인생맛집찾는사람',
      author: '좋아hyun',
      createdDate: '2023-10-25T14:30:00Z',
      views: 35,
      likes: 8,
      comments: 7,
      imageUrl: 'https://placehold.co/80x80/d3e2e6/000000?text=Image+2',
    },
    {
      id: 3,
      title: '요리 비포 앤 애프터 보실 분? 사진 있는데',
      subtitle: '실력자',
      author: '웅비912',
      createdDate: '2023-10-24T18:00:00Z',
      views: 55,
      likes: 17,
      comments: 25,
      imageUrl: 'https://placehold.co/80x80/c5d8e2/000000?text=Image+3',
    },
    {
      id: 4,
      title: '내가 바로 요리왕 비룡 그 자체! 제가 만든 음식 사진 보고 가실 분?',
      subtitle: 'ㅋㅋㅋㅋㅋㅋㅋㅋ@@@##$ 소환!!',
      author: '현주짱',
      createdDate: '2023-10-23T09:15:00Z',
      views: 1,
      likes: 27,
      comments: 32,
      imageUrl: 'https://placehold.co/80x80/b7cbe6/000000?text=Image+4',
    },
  ]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  const truncateTitle = (title: string, maxLength: number) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  return (
    <>
      <CommunityHeader />
      <div className={freestyles['community-main-container']}>
        <main className={freestyles['main-content']}>
          <section className={freestyles['post-list-section']}>
            {posts.map((post) => (
              <Link
                to={`/community/free/${post.id}`}
                key={post.id}
                className={freestyles['post-card-link']}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className={freestyles['post-card']}>
                  <div className={freestyles['post-left']}>
                    <div className={freestyles['post-header']}>
                      <span className={freestyles['post-subtitle']}>[{post.subtitle || ''}]</span>
                    </div>
                    <h2 className={freestyles['post-title']}>{truncateTitle(post.title, 20)}</h2>
                    <div className={freestyles['post-meta']}>
                      <span className={freestyles['post-author']}>{post.author}</span>
                      <span className={freestyles['post-date']}>{formatDate(post.createdDate)}</span>
                      <span className={freestyles['post-views']}>조회수 {post.views}</span>
                      <span className={freestyles['post-likes']}>좋아요 {post.likes}</span>
                    </div>
                  </div>
                  <div className={freestyles['post-image-container']}>
                    <img
                      src={post.imageUrl}
                      alt="게시글 이미지"
                      className={freestyles['post-image']}
                    />
                    <div className={freestyles['post-comments-overlay']}>💬 {post.comments}</div>
                  </div>
                </div>
              </Link>
            ))}
          </section>

          <div className={freestyles['button-container']}>
            <button
              className={freestyles['register-button']}
              onClick={() => navigate('/community/free/create')}
            >
              등록하기
            </button>
          </div>
        </main>
      </div>
    </>
  );
};

export default FreeMain;
