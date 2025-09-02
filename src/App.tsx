<<<<<<< HEAD
import { Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import CommunityMain from './pages/community/CommunityMain' // 커뮤니티 메인 컴포넌트 불러오기
import MyPost from './pages/community/mypost/MyPost'; // MyPost 컴포넌트 불러오기
=======
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import { Route, Routes } from 'react-router-dom'
import { AlertModal } from './components/AlertModal'
import { ChatModal } from './components/Chatting/chatModal'
import Mainpage from './pages/mainpage/Mainpage'
import { CServiceMain } from './pages/CService/main'
>>>>>>> master

function App() {
  return (
    <>
      <Header />
      <AlertModal />
      <ChatModal />
      <Routes>
<<<<<<< HEAD
        {/* 커뮤니티 메인 페이지 */}
        <Route path="/" element={<CommunityMain />} />
        {/* 내 게시물 페이지 */}
        <Route path="/mypost" element={<MyPost />} />
=======
        <Route path="/home" element={<Mainpage/>} />
        <Route path="/cservice" element={<CServiceMain/>} />
>>>>>>> master
      </Routes>
      <Footer/>
    </>
  );
}

export default App;
