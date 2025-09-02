import { Route, Routes } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import { CServiceMain } from './pages/CService/main'
import { AlertModal } from './components/AlertModal'
import Footer from './components/Footer'
import { ChatModal } from './components/Chatting/chatModal'

function App() {
  return (
    <>
      <Header />
      <AlertModal />
      <Routes>
        <Route path="/" element={<div></div>} />
        <Route path="/cservice" element={<CServiceMain/>} />
      </Routes>
      <Footer />
      <ChatModal />
    </>
  )
}

export default App
