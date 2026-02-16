import { Link } from 'react-router-dom';
import '../styles/LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-container">
            {/* Hero Section */}
            <header className="hero">
                <div className="hero-content">
                    <h1>Public Grievance Redressal Portal</h1>
                    <p>Bridging the gap between Citizens and Government with AI & Transparency</p>
                    <div className="cta-buttons">
                        <Link to="/submit-grievance" className="btn-primary hero-btn">File a Grievance</Link>
                        <Link to="/login" className="btn-secondary hero-btn-outline">Track Status</Link>
                    </div>
                </div>
            </header>

            {/* Stats Section */}
            <section className="stats-bar">
                <div className="container stats-grid">
                    <div className="stat-item">
                        <span className="stat-number">2.5L+</span>
                        <span className="stat-label">Grievances Resolved</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">98%</span>
                        <span className="stat-label">Resolution Rate</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">21 Days</span>
                        <span className="stat-label">Avg. Turnaround</span>
                    </div>
                </div>
            </section>

            {/* Features / Process */}
            <section className="features container">
                <h2 className="section-title">How It Works</h2>
                <div className="feature-grid">
                    <div className="feature-card">
                        <div className="icon-box">🎙️</div>
                        <h3>Voice Reporting</h3>
                        <p>Report issues easily by speaking in Tamil or English. Our AI transcribes it for you.</p>
                    </div>
                    <div className="feature-card">
                        <div className="icon-box">🤖</div>
                        <h3>AI Categorization</h3>
                        <p>Smart algorithms automatically route your grievance to the correct department immediately.</p>
                    </div>
                    <div className="feature-card">
                        <div className="icon-box">⚡</div>
                        <h3>Quick Resolution</h3>
                        <p>Strict SLA monitoring ensures your issue is addressed within 21 days or escalated.</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;
