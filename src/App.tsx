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

function App() {
  return (
    <>
      <Header />
      <AlertModal />
      <ChatModal />
      <Routes>
        <Route path="/home" element={<Mainpage/>} />
        <Route path="/cservice" element={<CServiceMain/>} />

        {/* community/recipe */}
        <Route path="/community/recipe" element={<CommunityRecipeList />} />
        <Route path="/community/recipe/write" element={<CommunityRecipeWrite />} />
        <Route path="/community/recipe/test" element={<CommunityRecipeDetail_Detail />} />

      </Routes>
      <Footer/>
    </>
  )
}

export default App
