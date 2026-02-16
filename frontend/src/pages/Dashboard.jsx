import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [selectedGrievance, setSelectedGrievance] = useState(null);
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState('');
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGrievances = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/grievances/my');
                setGrievances(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchGrievances();
    }, [user]);

    const handleFeedbackSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`http://localhost:5000/api/grievances/${selectedGrievance}/feedback`, { rating, feedback });
            alert('Feedback submitted!');
            setSelectedGrievance(null);
            // Refresh
            const res = await axios.get('http://localhost:5000/api/grievances/my');
            setGrievances(res.data);
        } catch (err) {
            alert('Failed to submit feedback');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2>Welcome, {user?.name}</h2>
                <Link to="/submit-grievance" className="btn-primary">File New Grievance</Link>
            </header>

            <div className="grievance-list">
                <h3>My Grievances</h3>
                {grievances.length === 0 ? (
                    <p>No grievances filed yet.</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Category</th>
                                <th>Evidence</th>
                                <th>Status</th>
                                <th>Current Dept</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grievances.map(g => (
                                <tr key={g._id}>
                                    <td>{g.grievanceId}</td>
                                    <td>{g.category}</td>
                                    <td>
                                        {g.photoUrl ? (
                                            <a href={`http://localhost:5000${g.photoUrl}`} target="_blank" rel="noopener noreferrer">
                                                <img src={`http://localhost:5000${g.photoUrl}`} alt="Evidence" style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                                            </a>
                                        ) : 'None'}
                                    </td>
                                    <td><span className={`status ${g.status.toLowerCase().replace(' ', '-')}`}>{g.status}</span></td>
                                    <td>{g.currentDepartment || 'Unassigned'}</td>
                                    <td>
                                        {g.status === 'Resolved' && !g.rating ? (
                                            <button onClick={() => setSelectedGrievance(g._id)} className="btn-secondary">Rate Service</button>
                                        ) : g.rating ? (
                                            <span>⭐ {g.rating}</span>
                                        ) : '-'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {selectedGrievance && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Rate Resolution</h3>
                        <form onSubmit={handleFeedbackSubmit}>
                            <div className="form-group">
                                <label>Rating (1-5)</label>
                                <select value={rating} onChange={(e) => setRating(e.target.value)}>
                                    <option value="5">5 - Excellent</option>
                                    <option value="4">4 - Very Good</option>
                                    <option value="3">3 - Good</option>
                                    <option value="2">2 - Fair</option>
                                    <option value="1">1 - Poor</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Feedback</label>
                                <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn-primary">Submit</button>
                            <button type="button" onClick={() => setSelectedGrievance(null)} style={{ marginLeft: '10px' }}>Cancel</button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;
