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

function App() {
  const dispatch = useDispatch();
  const rooms = useSelector((state: RootState) => state.chat.rooms);

  const handleOpenChat = () => {
    if (rooms.length > 0) {
      dispatch(openChat(rooms[0]));
    } else {
      console.warn("열 수 있는 채팅방이 없습니다.");
    }
  };

  return (
    <>
      <Header />
      <AlertModal />
      <ChatModal />
      <p className='chatBtn' onClick={handleOpenChat}>💬</p>
      <Routes>
        <Route path="/home" element={<Mainpage />} />
        <Route path="/cservice" element={<CServiceMain />} />
      </Routes>
      <Footer />
    </>
  )
}

export default App
