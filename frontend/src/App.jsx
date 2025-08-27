import { Routes, Route } from 'react-router-dom'
import Header from "./components/Header"
import Navbar from './components/Navbar'
import MainLayout from './layouts/MainLayout'
import NoSidebarLayout from './layouts/NoSidebarLayout'
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
import UploadPhoto from './pages/UploadPhoto';
import PrivateRoute from './components/PrivateRoute';
import CabinetPage from './pages/CabinetPage';
import MyVarietiesPage from "./pages/MyVarietiesPage";
import ExtendedSearchPage from './pages/ExtendedSearchPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import UserVarietiesPage from './pages/UserVarietiesPage';
import AdminUserPage from './pages/admin/AdminUserPage'; 
import Contacts from './pages/Contacts';
import DeletedVarietiesPage from "./pages/admin/DeletedVarietiesPage";
import AdminPanel from "./pages/admin/AdminPanel";


function App() {
  console.log("📦 Rendering App component");
  return (
    <ErrorBoundary>
      <Header />
      <Navbar />
      <Routes>
        <Route element={<NoSidebarLayout />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/confirm-email" element={<ConfirmEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/contact-info" element={<Contacts />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/add" element={<AddVariety />} />
          <Route path="/variety/:name" element={<VarietyDetail />} />
          <Route path="/variety/:name/edit" element={<EditVariety />} />
          <Route path="/variety/:id/upload-photo" element={<PrivateRoute><UploadPhoto /></PrivateRoute>} />
          <Route path="/cabinet" element={<PrivateRoute><CabinetPage /></PrivateRoute>} />
          <Route path="/my-varieties" element={<PrivateRoute><MyVarietiesPage /></PrivateRoute>} />
          <Route path="/extended-search" element={<ExtendedSearchPage />} />
          <Route path="*" element={<NotFound />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/users/:userId/varieties" element={<UserVarietiesPage />} />
          <Route path="/admin/users/:id" element={<AdminUserPage />} />
          <Route path="/admin/varieties/deleted" element={<DeletedVarietiesPage />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Route>

      </Routes>
    </ErrorBoundary>
  );
}

export default App;
