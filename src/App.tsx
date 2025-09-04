import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import { Route, Routes } from 'react-router-dom'
import { AlertModal } from './components/AlertModal'
import { ChatModal } from './components/Chatting/chatModal'
import Mainpage from './pages/mainpage/Mainpage'
import { CServiceMain } from './pages/CService/main'
import Ingpedia from './pages/Ingpedia/Ingpedia'

function App() {
  return (
    <>
      <Header />
      <AlertModal />
      <ChatModal />
      <Routes>
        <Route path="/" element={<Mainpage/>} />
        <Route path="/home" element={<Mainpage/>} />
        <Route path="/ingpedia" element={<Ingpedia/>} />
        <Route path="/cservice" element={<CServiceMain/>} />
      </Routes>
      <Footer/>
    </>
  )
}

export default App
