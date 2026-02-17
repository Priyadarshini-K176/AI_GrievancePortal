import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import '../styles/Auth.css';

const Register = () => {
    const [step, setStep] = useState(1); // 1: Details, 2: OTP
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [otp, setOtp] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        if (formData.phone.length < 10) {
            setError("Please enter a valid phone number");
            return;
        }

        setLoading(true);
        try {
            await axios.post('http://localhost:5000/api/auth/send-otp', { phone: formData.phone });
            setStep(2); // Move to OTP Step
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyAndRegister = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await register({
                name: formData.name,
                phone: formData.phone,
                password: formData.password,
                otp: otp
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Invalid OTP?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-form">
                <h2>Citizen Registration</h2>
                {error && <p className="error">{error}</p>}

                {step === 1 ? (
                    <form onSubmit={handleSendOtp}>
                        <div className="form-group">
                            <label>Full Name</label>
                            <input name="name" value={formData.name} onChange={handleChange} required placeholder="Enter your full name" />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} required placeholder="10-digit mobile number" />
                        </div>
                        <div className="form-group">
                            <label>Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Create a password" />
                        </div>
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required placeholder="Confirm your password" />
                        </div>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyAndRegister}>
                        <div className="otp-verification-section">
                            <p>Enter the 6-digit OTP sent to <strong>{formData.phone}</strong></p>
                            <div className="form-group">
                                <label>OTP</label>
                                <input
                                    name="otp"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                    placeholder="XXXXXX"
                                    maxLength="6"
                                    style={{ letterSpacing: '2px', fontSize: '1.2rem', textAlign: 'center' }}
                                />
                            </div>
                            <button type="submit" className="btn-primary" disabled={loading}>
                                {loading ? 'Verifying...' : 'Verify & Register'}
                            </button>

                            <div className="steps-action">
                                <button type="button" className="btn-link" onClick={() => setStep(1)}>
                                    Change Phone Number
                                </button>
                                <button type="button" className="btn-link" onClick={handleSendOtp} disabled={loading}>
                                    Resend OTP
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                <p className="login-link">
                    Already have an account? <span onClick={() => navigate('/login')}>Login here</span>
                </p>
            </div>
        </div>
    );
};

export default Register;
