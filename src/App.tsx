import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import { Route, Routes } from 'react-router-dom'
import { AlertModal } from './components/AlertModal'
import { ChatModal } from './components/Chatting/chatModal'
import Mainpage from './pages/mainpage/Mainpage'
import { CServiceMain } from './pages/CService/main'
import CommunityMain from './pages/community/CommunityMain'
import MyPost from './pages/community/mypost/MyPost';
import FreeMain from './pages/community/free/FreeMain'
import FreeDetail from './pages/community/free/FreeDetail'
import FreeForm from './pages/community/free/FreeForm'
import ChallengeMain from './pages/community/challenge/ChallengeMain'
import ChallengeForm from './pages/community/challenge/ChallengeForm'
import CkClassMain from './pages/community/ckclass/CkClassMain'
import CkClassSearch from './pages/community/ckclass/CkClassSearch'
import CkClassForm from './pages/community/ckclass/CkClassForm'
import MarketMain from './pages/community/market/MarketMain'
import MarketForm from './pages/community/market/MarketForm'
import MarketBuyForm from './pages/community/market/MarketBuyForm'
import Login from './pages/login/Login'
import AlreadyLoginRoute from './components/AlreadyLoginRoute'
import OAuth2Success from './pages/login/OAuth2Success'
import OAuthUsernamePage from './pages/enroll/OAuthUsernamePage'
import ChallengeDetail from './pages/community/challenge/ChallengeDetail'
import ChallengeSuggestionForm from './pages/community/challenge/ChallengeSuggestionForm'

function App() {
  return (
    <>
      <Header />
      <AlertModal />
      <ChatModal />
      <Routes>
        <Route path="/login" element={
          <AlreadyLoginRoute>
            <Login />
          </AlreadyLoginRoute>
        } />
        <Route path="/home" element={<Mainpage />} />
        <Route path="/cservice" element={<CServiceMain />} />
        <Route path="/oauth2/success" element={<OAuth2Success />} />
        <Route path="/oauth2/username" element={<OAuthUsernamePage />} />
        <Route path="/community" element={<CommunityMain />} />
        <Route path="/community/mypost" element={<MyPost />} />
        <Route path="/community/free/form" element={<FreeForm />} />
        <Route path="/community/free/form/:boardNo" element={<FreeForm />} />
        <Route path="/community/free/:boardNo" element={<FreeDetail />} />
        <Route path="/community/free" element={<FreeMain />} />
        {/* 새 챌린지 요청 라우트를 상세 페이지 라우트보다 위에 위치시켜야 합니다. */}
        <Route path="/community/challenge/suggestion" element={<ChallengeSuggestionForm />} />
        <Route path="/community/challenge/:challengeNo" element={<ChallengeDetail />} />
        <Route path="/community/challenge" element={<ChallengeMain />} />
        <Route path="/community/challenge/form/:challengeNo" element={<ChallengeForm />} />
        <Route path="/community/challenge/form" element={<ChallengeForm />} />
        <Route path="/community/ckclass" element={<CkClassMain />} />
        <Route path="/community/ckclass/search" element={<CkClassSearch />} />
        <Route path="/community/ckclass/form" element={<CkClassForm />} />
        <Route path="/community/market" element={<MarketMain />} />
        <Route path="/community/market/form" element={<MarketForm />} />
        <Route path="/community/market/buyform" element={<MarketBuyForm />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
