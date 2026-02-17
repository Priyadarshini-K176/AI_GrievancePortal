import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Dashboard.css';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [selectedGrievance, setSelectedGrievance] = useState(null);
    const [rating, setRating] = useState(5);
    const [feedback, setFeedback] = useState('');
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

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
                <h2>{t('welcome')}, {user?.name}</h2>
                <Link to="/submit-grievance" className="btn-primary">{t('fileGrievance')}</Link>
            </header>

            <div className="grievance-list">
                <h3>{t('myGrievances')}</h3>
                {grievances.length === 0 ? (
                    <p>{t('noGrievances')}</p>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>{t('id')}</th>
                                <th>{t('category')}</th>
                                <th>{t('evidence')}</th>
                                <th>{t('status')}</th>
                                <th>{t('currentDept')}</th>
                                <th>{t('action')}</th>
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
                                    <td>
                                        <span className={`status ${g.status.toLowerCase().replace(' ', '-')}`}>
                                            {t(g.status.toLowerCase().replace(' ', '_'))}
                                        </span>
                                    </td>
                                    <td>{g.currentDepartment || 'Unassigned'}</td>
                                    <td>
                                        {g.status === 'Resolved' && !g.rating ? (
                                            <button onClick={() => setSelectedGrievance(g._id)} className="btn-secondary">{t('rate')}</button>
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
                        <h3>{t('rateResolution')}</h3>
                        <form onSubmit={handleFeedbackSubmit}>
                            <div className="form-group">
                                <label>{t('rate')}</label>
                                <select value={rating} onChange={(e) => setRating(e.target.value)}>
                                    <option value="5">5 - {t('excellent')}</option>
                                    <option value="4">4 - {t('veryGood')}</option>
                                    <option value="3">3 - {t('good')}</option>
                                    <option value="2">2 - {t('fair')}</option>
                                    <option value="1">1 - {t('poor')}</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>{t('feedback')}</label>
                                <textarea value={feedback} onChange={(e) => setFeedback(e.target.value)} required />
                            </div>
                            <button type="submit" className="btn-primary">{t('submit')}</button>
                            <button type="button" onClick={() => setSelectedGrievance(null)} style={{ marginLeft: '10px' }}>{t('cancel')}</button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;
