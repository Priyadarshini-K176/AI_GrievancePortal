import '../styles/Footer.css';

const Footer = () => {
    return (
        <footer className="gov-footer">
            <div className="container footer-content">
                <div className="footer-section">
                    <h4>Grievance Redressal System</h4>
                    <p>AI-Powered Student Project</p>
                    <p>Connecting Citizens & Authorities</p>
                </div>
                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="#">Privacy Policy</a></li>
                        <li><a href="#">Terms of Use</a></li>
                        <li><a href="#">Disclaimer</a></li>
                        <li><a href="#">Contact Us</a></li>
                    </ul>
                </div>
                <div className="footer-section">
                    <h4>Helpline</h4>
                    <p className="helpline">📞 1100</p>
                    <p>24x7 Citizen Call Center</p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Grievance Redressal Portal. All Rights Reserved.</p>
                <p>Project Prototype</p>
            </div>
        </footer>
    );
};

export default Footer;
