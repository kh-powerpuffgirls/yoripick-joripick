import { Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import CommunityMain from './pages/community/CommunityMain' // 커뮤니티 메인 컴포넌트 불러오기
import MyPost from './pages/community/mypost/MyPost'; // MyPost 컴포넌트 불러오기

function App() {
  return (
    <>
      <Header />
      <Routes>
        {/* 커뮤니티 메인 페이지 */}
        <Route path="/" element={<CommunityMain />} />
        {/* 내 게시물 페이지 */}
        <Route path="/mypost" element={<MyPost />} />
      </Routes>
    </>
  );
}

export default App;
