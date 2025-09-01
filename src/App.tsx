import { Route, Routes } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import CommunityMain from './pages/community/CommunityMain' // 커뮤니티 메인 컴포넌트 불러오기

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<CommunityMain />} />
      </Routes>
    </>
  );
}

export default App;