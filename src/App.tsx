import { Route, Routes } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import { CServiceMain } from './pages/CService/main'
import { AlertModal } from './components/AlertModal'

function App() {
  return (
    <>
      <Header />
      <AlertModal />
      <Routes>
        <Route path="/" element={<div></div>} />
      </Routes>
      <Routes>
        <Route path="/cservice" element={<CServiceMain/>} />
      </Routes>
    </>
  )
}

export default App
