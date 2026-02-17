import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import '../styles/Dashboard.css'; // Reuse or create specific

const AuthorityDashboard = () => {
    const { user } = useContext(AuthContext);
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGrievance, setSelectedGrievance] = useState(null);
    const [atr, setAtr] = useState('');

    useEffect(() => {
        const fetchGrievances = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/grievances');
                setGrievances(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchGrievances();
    }, []);

    const handleUpdateStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/grievances/${id}`, { status, remarks: atr });
            setGrievances(prev => prev.map(g => g._id === id ? { ...g, status } : g));
            setSelectedGrievance(null);
            setAtr('');
        } catch (err) {
            alert('Update failed');
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="dashboard-container">
            <h2>Authority Dashboard</h2>
            <div className="authority-info">
                <span><strong>Department:</strong> {user.department}</span>
                <span><strong>Jurisdiction:</strong> {user.jurisdiction}</span>
            </div>

            <div className="grievance-list">
                <table>
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Text</th>
                            <th>Evidence</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {grievances.map(g => {
                            const isOverdue = new Date(g.slaDeadline) < new Date() && g.status !== 'Resolved' && g.status !== 'Closed';
                            return (
                                <tr key={g._id} className={isOverdue ? 'row-overdue' : ''}>
                                    <td>{g.grievanceId}</td>
                                    <td>{g.text.substring(0, 50)}...</td>
                                    <td>
                                        {g.photoUrl ? (
                                            <a href={`http://localhost:5000${g.photoUrl}`} target="_blank" rel="noopener noreferrer">View Photo</a>
                                        ) : '-'}
                                    </td>
                                    <td>
                                        <span className={`status ${g.status.toLowerCase().replace(' ', '-')}`}>
                                            {g.status}
                                        </span>
                                        {isOverdue && <span className="status overdue" style={{ marginLeft: '8px' }}>OVERDUE</span>}
                                    </td>
                                    <td>
                                        {selectedGrievance === g._id ? (
                                            <div className="action-box">
                                                <div className="grievance-details-expanded">
                                                    <h4>Full Details</h4>
                                                    <div className="details-grid">
                                                        <p><strong>Category:</strong> {g.category} - {g.subType}</p>
                                                        <p><strong>Urgency:</strong> {g.urgency}</p>
                                                        <p><strong>Petitioner:</strong> {g.citizenId?.name} ({g.petitionerType})</p>
                                                        <p><strong>Mobile:</strong> {g.citizenId?.phone}</p>
                                                        <p><strong>Address:</strong> {g.address}, {g.area}</p>
                                                        <p><strong>Location:</strong> {g.villagePanchayat || g.localBodyType}, {g.taluk}</p>
                                                        <p><strong>Description:</strong> {g.text}</p>
                                                    </div>
                                                </div>
                                                <select onChange={(e) => handleUpdateStatus(g._id, e.target.value)}>
                                                    <option value="">Update Status...</option>
                                                    <option value="Action Taken">Action Taken</option>
                                                    <option value="Resolved">Resolved</option>
                                                </select>
                                                <input
                                                    placeholder="Remarks/ATR"
                                                    value={atr}
                                                    onChange={(e) => setAtr(e.target.value)}
                                                />
                                                <button onClick={() => setSelectedGrievance(null)}>Cancel</button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setSelectedGrievance(g._id)} className="btn-secondary">Take Action</button>
                                        )}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AuthorityDashboard;
