import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import '../styles/Auth.css';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords don't match");
            return;
        }
        try {
            await register({
                name: formData.name,
                phone: formData.phone,
                password: formData.password
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed. Phone might be taken.');
        }
    };

    return (
        <div className="auth-container">
            <form onSubmit={handleSubmit} className="auth-form">
                <h2>Citizen Registration</h2>
                {error && <p className="error">{error}</p>}
                <div className="form-group">
                    <label>Full Name</label>
                    <input name="name" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Phone Number</label>
                    <input name="phone" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Password</label>
                    <input type="password" name="password" onChange={handleChange} required />
                </div>
                <div className="form-group">
                    <label>Confirm Password</label>
                    <input type="password" name="confirmPassword" onChange={handleChange} required />
                </div>
                <button type="submit" className="btn-primary">Register</button>
            </form>
        </div>
    );
};

export default Register;
