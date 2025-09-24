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
import { loginSuccess, logout, saveUserData } from './features/authSlice'
import MyPage from './pages/MyPage/MyPage'
import MyIng from './pages/MyIng/MyIng'
import MyIngList from './pages/MyIng/MyIngList'
import MyIngDetail from './pages/MyIng/MyIngDetail'
import MyIngWrite from './pages/MyIng/MyIngWrite'
import { IngPopup } from './components/IngModal/IngModal'
import Ingpedia from './pages/Ingpedia/Ingpedia'
import IngpediaList from './pages/Ingpedia/IngpediaList'
import IngpediaDetail from './pages/Ingpedia/IngpediaDetail'
import IngpediaWrite from './pages/Ingpedia/IngpediaWrite'
import AdminRoute from './components/AdminRoute'
import IngpediaEdit from './pages/Ingpedia/IngpediaEdit'

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
        <Route path="/oauth2/success" element={<OAuth2Success />} />
        <Route path="/oauth2/username" element={<OAuthUsernamePage />} />
        <Route path="/myPage" element={<MyPage />} />

        <Route path="/ingpedia" element={<Ingpedia/>} >
          <Route path='' element={<IngpediaList/>}/>
          <Route path='write' element={<IngpediaWrite/>}/>
          <Route path='detail/:ingNo' element={<IngpediaDetail/>}/>
          <Route path='edit/:ingNo' element={
            <AdminRoute>
              <IngpediaEdit/>
            </AdminRoute>
          }/>
        </Route>
        <Route path="/mypage/inglist" element={<MyIng/>} >
          <Route path='' element={<MyIngList/>}/>
          <Route path='detail/:ingNo' element={<MyIngDetail/>}/>
          <Route path='write' element={<MyIngWrite/>}/>
        </Route>
        <Route path="/ing-popup" element={<IngPopup/>} />

      </Routes>
      <Footer />
    </>
  )
}

export default App