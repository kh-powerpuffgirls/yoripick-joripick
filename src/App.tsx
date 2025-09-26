import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import { Route, Routes } from 'react-router-dom'
import { AlertModal } from './components/Security/AlertModal'
import { ChatModal } from './components/Chatting/chatModal'
import Mainpage from './pages/mainpage/Mainpage'
import { CServiceMain } from './pages/CService/main'
import CommunityRecipeList from './pages/community/Recipe/CommunityRecipeList'
import Login from './pages/login/Login'
import AlreadyLoginRoute from './components/Security/AlreadyLoginRoute'
import OAuth2Success from './pages/login/OAuth2Success'
import OAuthUsernamePage from './pages/enroll/OAuthUsernamePage'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { api, getNotiSettings } from './api/authApi'
import { MealplanMain } from './pages/Mealplan/main'
import { loginSuccess, logout, saveUserData } from './features/authSlice'
import RecipeWrite from './pages/community/Recipe/RecipeWrite'
import MyPage from './pages/MyPage/MyPage'
import CommunityRecipeDetail from './pages/community/Recipe/RecipeDetail'
import RecipeEditPage from './pages/community/Recipe/RecipeEdit'
import EatBTIPage from './pages/EatBTI/main'
import QuestionPage from './pages/EatBTI/question'
import ResultPage from './pages/EatBTI/result'
import Ingpedia from './pages/Ingpedia/Ingpedia'
import IngpediaList from './pages/Ingpedia/IngpediaList'
import IngpediaWrite from './pages/Ingpedia/IngpediaWrite'
import IngpediaDetail from './pages/Ingpedia/IngpediaDetail'
import IngpediaEdit from './pages/Ingpedia/IngpediaEdit'
import MyIng from './pages/MyIng/MyIng'
import MyIngList from './pages/MyIng/MyIngList'
import MyIngDetail from './pages/MyIng/MyIngDetail'
import MyIngWrite from './pages/MyIng/MyIngWrite'
import { IngPopup } from './components/IngModal/IngModal'
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
import MarketMyList from './pages/community/market/MarketMyList'
import MarketMyDetailPage from './pages/community/market/MarketMyDetailPage'
import { setSettingsError, setSettingsLoading, setUserSettings } from './features/notiSlice'
import type { RootState } from './store/store'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { getRooms } from './api/chatApi'
import { closeChat, openChat, resetRooms, setRooms } from './features/chatSlice'
import { ChatAlertModal } from './components/Chatting/chatAlertModal'
import { Notification } from './components/Chatting/Notification'
import AdminRoute from './components/AdminRoute'
import { AdminDashboard } from './pages/Admin/main'
import { UserManagement } from './pages/Admin/userManagement'
import { RcpManagement } from './pages/Admin/rcpManagement'
import { CommManagement } from './pages/Admin/commManagement'
import { ClassManagement } from './pages/Admin/classManagement'
import { CSmanagement } from './pages/Admin/csManagement'
import { AnnManagement } from './pages/Admin/annManagement'
import { ClngManagement } from './pages/Admin/clngManagement'
import { IngManagement } from './pages/Admin/ingManagement'

function App() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  const userNo = user?.userNo;
  const rooms = useSelector((state: RootState) => state.chat.rooms);
  const totalUnread = rooms?.reduce((sum, room) => sum + (room.unreadCount || 0), 0);

  // 로그인 정보 유지
  useEffect(() => {
    api.post("auth/tokens/refresh")
      .then(res => {
        dispatch(saveUserData(res.data));
        dispatch(loginSuccess());
      })
      .catch(() => {
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
    queryKey: ["rooms"],
    queryFn: () => getRooms(userNo),
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (isAuthenticated) {
      refetch();
    } else {
      dispatch(closeChat());
      dispatch(resetRooms());
      queryClient.invalidateQueries({ queryKey: ["rooms"] });
    }
  }, [isAuthenticated, refetch, dispatch]);

  useEffect(() => {
    if (roomData) {
      dispatch(setRooms(roomData));
    }
  }, [roomData, dispatch]);

  return (
    <>
      <Header />
      <AlertModal />
      <ChatAlertModal />
      <ChatModal />
      <Notification />
      {rooms && rooms.length > 0 && (
        <p className={`chatBtn ${totalUnread > 0 ? "blink" : ""}`} 
        onClick={() => dispatch(openChat(rooms[0]))}>💬</p>
      )}
      <Routes>
        <Route path="/login" element={
          <AlreadyLoginRoute>
            <Login />
          </AlreadyLoginRoute>
        } />
        <Route path="/admin" element={
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        } />

        {/* ==================== 메인페이지 ==================== */}
        <Route path="/home" element={<Mainpage />} />

        {/* ==================== 시큐리티 <oauth2,SECURITY> ==================== */}
        <Route path="/oauth2/success" element={<OAuth2Success />} />
        <Route path="/oauth2/username" element={<OAuthUsernamePage />} />

        {/* ==================== 유저 <users> ==================== */}
        <Route path="/users/:userNo" element={<MyPage />} />
        <Route path="/myPage" element={<MyPage />} />
  
        {/* ==================== 관리자 <Admin> ==================== */}
        <Route path="/admin/users" element={<UserManagement />} />
        <Route path="/admin/recipes" element={<RcpManagement />} />
        <Route path="/admin/communities" element={<CommManagement />} />
        <Route path="/admin/classes" element={<ClassManagement />} />
        <Route path="/admin/cservices" element={<CSmanagement />} />
        <Route path="/admin/announcements" element={<AnnManagement />} />
        <Route path="/admin/challenges" element={<ClngManagement />} />
        <Route path="/admin/ingredients" element={<IngManagement />} />
  
        {/* ==================== 고객문의 <cservice> ==================== */}
        <Route path="/cservice" element={<CServiceMain />} />

        {/* ==================== 마이페이지<mypage> ==================== */}
        <Route path="/mypage/inglist" element={<MyIng />} >
          <Route path='' element={<MyIngList />} />
          <Route path='detail/:ingNo' element={<MyIngDetail />} />
          <Route path='write' element={<MyIngWrite />} />
        </Route>
        {/* 식단관리 */}
        <Route path="/mypage/mealplan" element={<MealplanMain />} />

        {/* ==================== 재료 관리<ingpedia> ==================== */}
        <Route path="/ingpedia" element={<Ingpedia />} >
          <Route path='' element={<IngpediaList />} />
          <Route path='write' element={<IngpediaWrite />} />
          <Route path='detail/:ingNo' element={<IngpediaDetail />} />
          <Route path='edit/:ingNo' element={<IngpediaEdit />} />
        </Route>
        <Route path="/ing-popup" element={<IngPopup />} />

        {/* ==================== 레시피<Rcipe> ==================== */}
        <Route path="/api/recipe/:rcpNo" element={<CommunityRecipeDetail />} />
        <Route path="/api/recipe" element={<CommunityRecipeList />} />
        <Route path="/community/recipe" element={<CommunityRecipeList />} />
        <Route path="/community/recipe/:rcpNo" element={<CommunityRecipeDetail />} />
        <Route path="/community/recipe/write" element={<RecipeWrite />} />
        <Route path="/community/recipe/edit/:rcpNo" element={<RecipeEditPage />} />

        {/* ==================== 식비티아이<eatBTI> ==================== */}
        <Route path="/eatBTI" element={<EatBTIPage />} />
        <Route path="/eatBTI/question" element={<QuestionPage />} />
        <Route path="/eatBTI/result" element={<ResultPage />} />
        <Route path="/eatBTI" element={<EatBTIPage />} />
        <Route path="/eatBTI/question" element={<QuestionPage />} />
        <Route path="/eatBTI/result" element={<ResultPage />} />

        {/* ==================== 커뮤니티 <Community> ==================== */}
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
        <Route path="/community/market/buyForm/:id" element={<MarketBuyForm />} />
        <Route path="/community/market/my-list" element={<MarketMyList />} />
        <Route path="/community/market/my-buy-form/:formId" element={<MarketMyDetailPage />} />

      </Routes>

      <Footer />
    </>
  )
}

export default App