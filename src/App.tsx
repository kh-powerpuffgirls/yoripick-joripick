import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import { Route, Routes } from 'react-router-dom'
import { AlertModal } from './components/AlertModal'
import { ChatModal } from './components/Chatting/chatModal'
import Mainpage from './pages/mainpage/Mainpage'
import { CServiceMain } from './pages/CService/main'
import Ingpedia from './pages/Ingpedia/Ingpedia'
import IngpediaList from './pages/Ingpedia/IngpediaList'
import IngpediaDetail from './pages/Ingpedia/IngpediaDetail'
import IngpediaWrite from './pages/Ingpedia/IngpediaWrite'
import MyIng from './pages/MyIng/MyIng'
import MyIngList from './pages/MyIng/MyIngList'
import MyIngDetail from './pages/MyIng/MyIngDetail'
import MyIngWrite from './pages/MyIng/MyIngWrite'

function App() {
  return (
    <>
      <Header />
      <AlertModal />
      <ChatModal />
      <Routes>
        <Route path="/" element={<Mainpage/>} />
        <Route path="/home" element={<Mainpage/>} />
        <Route path="/ingpedia" element={<Ingpedia/>} >
          <Route path='' element={<IngpediaList/>}/>
          <Route path='detail' element={<IngpediaDetail/>}/>
          <Route path='write' element={<IngpediaWrite/>}/>
        </Route>
        <Route path="/cservice" element={<CServiceMain/>} />
        

        {/* 병합 후 마이페이지 하위 루트로 수정해야 함 */}
        <Route path="/mypage/inglist" element={<MyIng/>} >
          <Route path='' element={<MyIngList/>}/>
          <Route path='detail' element={<MyIngDetail/>}/>
          <Route path='write' element={<MyIngWrite/>}/>
        </Route>
      </Routes>
      <Footer/>
    </>
  )
}

export default App
