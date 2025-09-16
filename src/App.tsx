import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import { Route, Routes } from 'react-router-dom'
import { ChatModal } from './components/Chatting/chatModal'
import Mainpage from './pages/mainpage/Mainpage'
import { CServiceMain } from './pages/CService/main'
import { useDispatch, useSelector } from 'react-redux'
import { openChat, setRooms } from './features/chatSlice'
import { type RootState } from './store/store'
import CommunityRecipeList from './pages/community/Recipe/CommunityRecipeList'
import CommunityRecipeDetail_Detail from './pages/community/Recipe/CommunityRecipeDetail_Detail'
import Login from './pages/login/Login'
import AlreadyLoginRoute from './components/Security/AlreadyLoginRoute'
import { useQuery } from '@tanstack/react-query'
import { getRooms } from './api/chatApi'
import { useEffect } from 'react'
import { Notification } from './components/Chatting/Notification'
import OAuth2Success from './pages/login/OAuth2Success'
import OAuthUsernamePage from './pages/enroll/OAuthUsernamePage'
import { api, getNotiSettings } from './api/authApi'
import { loginSuccess, logout } from './features/authSlice'
import MyPage from './pages/MyPage/MyPage'
import { setSettingsError, setSettingsLoading, setUserSettings } from './features/notiSlice'
import { ChatAlertModal } from './components/Chatting/chatAlertModal'
import { MealplanMain } from './pages/Mealplan/main'
import { AdminDashboard } from './pages/Admin/main'
import AdminRoute from './components/AdminRoute'
import CommunityRecipeDetail from './pages/community/Recipe/CommunityRecipeDetail'
import RecipeWrite from './pages/community/Recipe/RecipeWrite'
import CommunityMain from './pages/community/CommunityMain'
import MyPost from './pages/community/mypost/MyPost'
import FreeForm from './pages/community/free/FreeForm'
import FreeDetail from './pages/community/free/FreeDetail'
import FreeMain from './pages/community/free/FreeMain'
import ChallengeSuggestionForm from './pages/community/challenge/ChallengeSuggestionForm'
import ChallengeDetail from './pages/community/challenge/ChallengeDetail'
import ChallengeMain from './pages/community/challenge/ChallengeMain'
import ChallengeForm from './pages/community/challenge/ChallengeForm'
import CkClassMain from './pages/community/ckclass/CkClassMain'
import CkClassSearch from './pages/community/ckclass/CkClassSearch'
import CkClassForm from './pages/community/ckclass/CkClassForm'
import MarketMain from './pages/community/market/MarketMain'
import MarketForm from './pages/community/market/MarketForm'
import MarketBuyForm from './pages/community/market/MarketBuyForm'

function App() {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const userNo = user?.userNo;
  const rooms = useSelector((state: RootState) => state.chat.rooms);

  // 로그인 정보 유지
  useEffect(() => {
    api.post("http://localhost:8081/auth/refresh")
      .then(res => {
        dispatch(loginSuccess(res.data));
      })
      .catch(err => {
        dispatch(logout());
      });
  }, []);

  // 사용자 알림설정 정보
  useEffect(() => {
    const fetchSettings = async () => {
      dispatch(setSettingsLoading(true));
      dispatch(setSettingsError(null));
      try {
        const settings = await getNotiSettings(userNo);
        dispatch(setUserSettings(settings));
      } catch (error) {
        dispatch(setSettingsError("알림 설정을 불러오는 데 실패했습니다."));
      } finally {
        dispatch(setSettingsLoading(false));
      }
    };
    if (userNo) {
      fetchSettings();
    }
  }, [dispatch, userNo]);

  // 채팅방 목록 로딩
  const { data: roomData, refetch } = useQuery({
    queryKey: ["rooms", userNo],
    queryFn: () => getRooms(userNo),
    enabled: isAuthenticated,
  });
  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    }
  }, [isAuthenticated, roomData, refetch]);
  useEffect(() => {
    if (roomData) {
      dispatch(setRooms(roomData));
    }
  }, [roomData, refetch]);

  return (
    <>
      <Header />
      <ChatAlertModal />
      <ChatModal />
      {rooms && rooms.length > 0 && (
        <p className='chatBtn' onClick={() => dispatch(openChat(rooms[0]))}>💬</p>
      )}
      <Notification />
      {/* 만약에 로그인한 사용자가 관리자권한이 있다면? 관리자 문의 채팅방 열릴 때마다
          거기 roomId 값 가져와서 sockjs로 구독해야함
          
          시간되면 로그인한 사용자 쿠킹클래스 채팅방도 stompClient redux로 관리하기 */}
      <Routes>
        <Route path="/login" element={
          <AlreadyLoginRoute>
            <Login />
          </AlreadyLoginRoute>
        } />
        <Route path="/home" element={<Mainpage />} />
        <Route path="/cservice" element={<CServiceMain />} />
        <Route path="/mypage/mealplan" element={<MealplanMain />} />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />
        <Route path="/oauth2/success" element={<OAuth2Success />} />
        <Route path="/oauth2/username" element={<OAuthUsernamePage />} />
        <Route path="/myPage" element={<MyPage />} />
        {/* community/recipe */}
        <Route path="/community/recipe" element={<CommunityRecipeList />} />
        {/* <Route path="/community/recipe/write" element={<CommunityRecipeWrite />} /> */}
        <Route path="/community/recipe/test" element={<CommunityRecipeDetail_Detail />} />
        <Route path="/community/recipe/detail" element={<CommunityRecipeDetail />} />
        <Route path="/community/recipe/write" element={<RecipeWrite />} />
        <Route path="/community" element={<CommunityMain />} />
        <Route path="/community/mypost" element={<MyPost />} />
        <Route path="/community/free/form" element={<FreeForm />} />
        <Route path="/community/free/form/:boardNo" element={<FreeForm />} />
        <Route path="/community/free/:boardNo" element={<FreeDetail />} />
        <Route path="/community/free" element={<FreeMain />} />
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
  )
}

export default App