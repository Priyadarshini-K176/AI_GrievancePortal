import { Link, useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Navbar.css';

import logo from '../assets/logo.svg';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { language, toggleLanguage, t } = useLanguage();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <header className="gov-header">
            {/* Top Bar: Govt Branding */}
            <div className="top-bar">
                <div className="container top-bar-content">
                    <div className="gov-branding">
                        <img src={logo} alt="Portal Logo" className="emblem" />
                        <div className="branding-text">
                            <span className="portal-title">{t('portalTitle')}</span>
                            <span className="gov-title">{t('govTitle')}</span>
                        </div>
                    </div>
                    <div className="top-actions">
                        <button onClick={toggleLanguage} className="lang-toggle">
                            🌐 {language === 'en' ? 'தமிழ்' : 'English'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Navigation */}
            <nav className="main-nav">
                <div className="container nav-content">
                    <Link to="/" className="nav-logo-link">{t('home')}</Link>
                    <div className="nav-links">
                        {!user ? (
                            <>
                                <Link to="/login" className="nav-item">{t('login')}</Link>
                                <Link to="/register" className="nav-item btn-register">{t('register')}</Link>
                            </>
                        ) : (
                            <>
                                {user.role === 'citizen' && (
                                    <>
                                        <Link to="/dashboard" className="nav-item">{t('myGrievances')}</Link>
                                        <Link to="/submit-grievance" className="nav-item active-btn">{t('fileGrievance')}</Link>
                                    </>
                                )}
                                {user.role === 'authority' && <Link to="/authority/dashboard" className="nav-item">{t('authorityPanel')}</Link>}
                                {user.role === 'admin' && <Link to="/admin/dashboard" className="nav-item">{t('adminPanel')}</Link>}
                                <button onClick={handleLogout} className="nav-item logout-link">{t('logout')}</button>
                            </>
                        )}
                    </div>
                </div>
            </nav>
        </header>
    );
};

export default Navbar;
