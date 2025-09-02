import { Route, Routes } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Footer from './components/Footer'
import Mainpage from './pages/mainpage/Mainpage'
import Ingpedia from './pages/Ingpedia/Ingpedia'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element=<Mainpage/> />
        <Route path="/home" element=<Mainpage/> />
        <Route path="/ingpedia" element=<Ingpedia/> />
        <Route path="/home" element=<Mainpage/> />
      </Routes>
      <Footer/>
    </>
  )
}

export default App
