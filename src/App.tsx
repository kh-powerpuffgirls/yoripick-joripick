import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import { Route, Routes } from 'react-router-dom'
import { AlertModal } from './components/AlertModal'
import { ChatModal } from './components/Chatting/chatModal'
import Mainpage from './pages/mainpage/Mainpage'
import { CServiceMain } from './pages/CService/main'
import { useDispatch, useSelector } from 'react-redux'
import { openChat } from './features/chatSlice'
import type { RootState } from './store/store'
import Login from './pages/login/Login'
import AlreadyLoginRoute from './components/AlreadyLoginRoute'

function App() {
  const dispatch = useDispatch();
  const rooms = useSelector((state: RootState) => state.chat.rooms);

  return (
    <>
      <Header />
      <AlertModal />
      <ChatModal />
      {rooms.length > 0 && (
        <p className='chatBtn' onClick={() => dispatch(openChat(rooms[0]))}>💬</p>
      )}
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
      </Routes>
      <Footer />
    </>
  )
}

export default App