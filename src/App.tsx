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
      </Routes>
      <Footer />
    </>
  )
}

export default App