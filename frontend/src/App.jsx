import { Routes, Route } from 'react-router-dom'
import Header from "./components/Header"
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'
import VarietyDetail from './pages/VarietyDetail'

function App() {
  return (
    <>
      <Header />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/variety/:name" element={<VarietyDetail />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

export default App
