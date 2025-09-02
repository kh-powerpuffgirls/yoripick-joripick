import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import { Route, Routes } from 'react-router-dom'
import { AlertModal } from './components/AlertModal'
import { ChatModal } from './components/Chatting/chatModal'
import Mainpage from './pages/mainpage/Mainpage'
import { CServiceMain } from './pages/CService/main'
import { useDispatch } from 'react-redux'
import { openChat } from './features/chatSlice'

function App() {
  const dispatch = useDispatch();
  return (
    <>
      <Header />
      <AlertModal />
      <p className='chatBtn' onClick={() => dispatch(openChat('0'))}>💬</p>
      <ChatModal />
      <Routes>
        <Route path="/home" element={<Mainpage/>} />
        <Route path="/cservice" element={<CServiceMain/>} />
      </Routes>
      <Footer/>
    </>
  )
}

export default App
