import { Route, Routes } from 'react-router-dom'
import './App.css'
import Header from './components/Header'
import Login from './pages/login/Login'

function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/login" element={<Login/>} />
      </Routes>
    </>
  )
}

export default App
