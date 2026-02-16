import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import GrievanceForm from './pages/GrievanceForm';
import AuthorityDashboard from './pages/AuthorityDashboard';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <Router>
          <div className="app-container">
            <Navbar />
            <div className="content">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/submit-grievance" element={<GrievanceForm />} />
                <Route path="/authority/dashboard" element={<AuthorityDashboard />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
              </Routes>
            </div>
          </div>
          <Footer />
        </Router>
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
