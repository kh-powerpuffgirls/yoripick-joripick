import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import { Route, Routes } from 'react-router-dom'
import { AlertModal } from './components/Security/AlertModal'
import { ChatModal } from './components/Chatting/chatModal'
import Mainpage from './pages/mainpage/Mainpage'
import { CServiceMain } from './pages/CService/main'
import Login from './pages/login/Login'
import AlreadyLoginRoute from './components/Security/AlreadyLoginRoute'
import OAuth2Success from './pages/login/OAuth2Success'
import OAuthUsernamePage from './pages/enroll/OAuthUsernamePage'
import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import { api } from './api/authApi'
import { loginSuccess, logout } from './features/authSlice'
import MyPage from './pages/MyPage/MyPage'

function App() {

  const dispatch = useDispatch();

  useEffect(() => {
    api.post("http://localhost:8081/auth/refresh")
      .then(res => {
        dispatch(loginSuccess(res.data));
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
        <Route path="/oauth2/success" element={<OAuth2Success />} />
        <Route path="/oauth2/username" element={<OAuthUsernamePage />} />
        <Route path="/myPage" element={<MyPage />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App