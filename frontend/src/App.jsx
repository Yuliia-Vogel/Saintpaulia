import { Routes, Route } from 'react-router-dom'
import Header from "./components/Header"
import Navbar from './components/Navbar'
import ErrorBoundary from "./components/ErrorBoundary";
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import ConfirmEmail from './pages/ConfirmEmail'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import NotFound from './pages/NotFound'
import VarietyDetail from './pages/VarietyDetail'
import SearchPage from './pages/SearchPage'
import AddVariety from './pages/AddVariety'
import EditVariety from "./pages/EditVariety";
import PrivateRoute from './components/PrivateRoute'


function App() {
  console.log("📦 Rendering App component");
  return (
    <ErrorBoundary>
      <Header />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/confirm-email" element={<ConfirmEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/add" element={<AddVariety />} />
        <Route path="/variety/:name" element={<VarietyDetail />} />
        {/* <Route path="/add-variety" element={<PrivateRoute><AddVariety /></PrivateRoute>} /> */}
        <Route path="/variety/:name/edit" element={<EditVariety />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}

export default App;
