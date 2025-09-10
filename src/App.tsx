import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import { Route, Routes } from 'react-router-dom'
import { AlertModal } from './components/AlertModal'
import { ChatModal } from './components/Chatting/chatModal'
import Mainpage from './pages/mainpage/Mainpage'
import { CServiceMain } from './pages/CService/main'
import CommunityRecipeList from './pages/community/Recipe/CommunityRecipeList'
import CommunityRecipeWrite from './pages/community/Recipe/CommunityRecipeWrite'
import CommunityRecipeDetail_Detail from './pages/community/Recipe/CommunityRecipeDetail_Detail'
import Login from './pages/login/Login'
import AlreadyLoginRoute from './components/AlreadyLoginRoute'
import OAuth2Success from './pages/login/OAuth2Success'
import OAuthUsernamePage from './pages/enroll/OAuthUsernamePage'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { api } from './api/authApi'
import { loginSuccess, logout } from './features/authSlice'
import CommunityRecipeDetail from './pages/community/Recipe/CommunityRecipeDetail'


function App() {

  const dispath = useDispatch();

  useEffect(() => {
    api.post("/auth/refresh")
      .then(res => {
        dispath(loginSuccess(res.data));
      })
      .catch(err => {
        dispath(logout());
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
        <Route path="/oauth2/success" element={<OAuth2Success />} />
        <Route path="/oauth2/username" element={<OAuthUsernamePage />} />
         {/* community/recipe */}
        <Route path="/community/recipe" element={<CommunityRecipeList />} />
        <Route path="/community/recipe/write" element={<CommunityRecipeWrite />} />
        <Route path="/community/recipe/test" element={<CommunityRecipeDetail_Detail />} />
        <Route path="/community/recipe/detail" element={<CommunityRecipeDetail />} />


      </Routes>
      <Footer />
    </>
  )
}

export default App