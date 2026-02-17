import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import '../styles/Dashboard.css';
import StatusTimeline from '../components/StatusTimeline';
import { Volume2 } from 'lucide-react';

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
            await axios.post(`http://localhost:5000/api/grievances/${selectedGrievance._id}/feedback`, { rating, feedback });
            alert('Feedback submitted!');
            setSelectedGrievance(null);
            // Refresh
            const res = await axios.get('http://localhost:5000/api/grievances/my');
            setGrievances(res.data);
        } catch (err) {
            alert('Failed to submit feedback');
        }
    };

    const speakText = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'ta-IN'; // Default to Tamil/Indian English context
            window.speechSynthesis.speak(utterance);
        } else {
            alert('Text-to-Speech not supported');
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
                                <th>{t('currentDept')}</th>
                                <th>{t('action')}</th>
                                <th>Details</th>
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
                                            <button onClick={() => setSelectedGrievance(g)} className="btn-secondary">{t('rate')}</button>
                                        ) : g.rating ? (
                                            <span>⭐ {g.rating}</span>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        <button className="btn-secondary" onClick={() => setSelectedGrievance(g)} style={{ fontSize: '0.8rem', padding: '5px 10px' }}>View</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>



            {selectedGrievance && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px', width: '90%' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <h3>Grievance Details #{selectedGrievance.grievanceId}</h3>
                            <button onClick={() => setSelectedGrievance(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>×</button>
                        </div>

                        <StatusTimeline status={selectedGrievance.status} />

                        <div style={{ marginTop: '20px', padding: '15px', background: '#f8f9fa', borderRadius: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <p><strong>Department:</strong> {selectedGrievance.category}</p>
                                    <p><strong>Sub-Type:</strong> {selectedGrievance.subType || 'N/A'}</p>
                                    <p><strong>Description:</strong> {selectedGrievance.text}</p>
                                </div>
                                <button onClick={() => speakText(selectedGrievance.text)} title="Read Aloud" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#007bff' }}>
                                    <Volume2 size={24} />
                                </button>
                            </div>

                            {selectedGrievance.responsibleOfficer && (
                                <p style={{ marginTop: '10px', color: '#28a745' }}>
                                    <strong>Assigned Officer:</strong> {selectedGrievance.responsibleOfficer}
                                </p>
                            )}
                        </div>

                        {selectedGrievance.status === 'Resolved' && !selectedGrievance.rating && (
                            <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                                <h4>{t('rateResolution')}</h4>
                                <form onSubmit={handleFeedbackSubmit}>
                                    <div className="form-group">
                                        <label>{t('rate')}</label>
                                        <select value={rating} onChange={(e) => setRating(e.target.value)} style={{ padding: '5px', borderRadius: '4px' }}>
                                            <option value="5">5 - {t('excellent')}</option>
                                            <option value="4">4 - {t('veryGood')}</option>
                                            <option value="3">3 - {t('good')}</option>
                                            <option value="2">2 - {t('fair')}</option>
                                            <option value="1">1 - {t('poor')}</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <input
                                            value={feedback}
                                            onChange={(e) => setFeedback(e.target.value)}
                                            placeholder={t('feedback')}
                                            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>{t('submit')}</button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}

        </div>
    );
};

export default Dashboard;
