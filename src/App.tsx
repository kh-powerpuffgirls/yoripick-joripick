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
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { api } from './api/authApi'
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

function App() {

  const dispatch = useDispatch();
  useEffect(() => {
    api.post("auth/tokens/refresh")
      .then(res => {
        dispatch(saveUserData(res.data));
        dispatch(loginSuccess());
      })
      .catch(err => {
        dispatch(logout());
      });
  }, []);

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
        <Route path="/mypage/mealplan" element={<MealplanMain />} />
        <Route path="/oauth2/success" element={<OAuth2Success />} />
        <Route path="/oauth2/username" element={<OAuthUsernamePage />} />
        <Route path="/recipe/:rcpNo" element={<CommunityRecipeDetail />} />
        <Route path="/community/recipe" element={<CommunityRecipeList />} />
        <Route path="/community/recipe/:rcpNo" element={<CommunityRecipeDetail />} />
        <Route path="/community/recipe/write" element={<RecipeWrite />} />
        <Route path="/community/recipe/edit/:rcpNo" element={<RecipeEditPage />} />
        <Route path="/myPage" element={<MyPage />} />
        <Route path="/eatBTI" element={<EatBTIPage />} />
        <Route path="/eatBTI/question" element={<QuestionPage />} />
        <Route path="/eatBTI/result" element={<ResultPage />} />

        <Route path="/ingpedia" element={<Ingpedia/>} >
          <Route path='' element={<IngpediaList/>}/>
          <Route path='write' element={<IngpediaWrite/>}/>
          <Route path='detail/:ingNo' element={<IngpediaDetail/>}/>
          <Route path='edit/:ingNo' element={<IngpediaEdit/>}/>
        </Route>
        <Route path="/mypage/inglist" element={<MyIng/>} >
          <Route path='' element={<MyIngList/>}/>
          <Route path='detail/:ingNo' element={<MyIngDetail/>}/>
          <Route path='write' element={<MyIngWrite/>}/>
        </Route>
        <Route path="/ing-popup" element={<IngPopup/>} />

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