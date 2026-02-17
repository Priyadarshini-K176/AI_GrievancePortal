import { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import '../styles/Dashboard.css';
import StatusTimeline from '../components/StatusTimeline';

const AuthorityDashboard = () => {
    const { user } = useContext(AuthContext);
    const [grievances, setGrievances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedGrievance, setSelectedGrievance] = useState(null);
    const [atr, setAtr] = useState('');
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' | 'resolved'

    useEffect(() => {
        fetchGrievances();
    }, []);

    const fetchGrievances = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/grievances');
            // Backend currently returns all, but authority only sees theirs? 
            // The backend endpoint likely needs to filter for the logged-in authority.
            // Let's assume the backend handles it or we filter here for now if the endpoint returns all.
            // Ideally backend /api/grievances/assigned-to-me is better, but reusing /api/grievances 
            // implies the backend filters based on req.user.role.
            setGrievances(res.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        if (!selectedGrievance || !atr) return alert('Please enter remarks');
        try {
            await axios.put(`http://localhost:5000/api/grievances/${selectedGrievance._id}`, {
                status: 'Action Taken',
                remarks: atr
            });
            alert('Status Updated!');
            await fetchGrievances(); // Refresh
            setSelectedGrievance(null);
            setAtr('');
        } catch (err) {
            alert('Update failed');
        }
    };

    const handleResolve = async () => {
        if (!selectedGrievance) return;
        try {
            await axios.put(`http://localhost:5000/api/grievances/${selectedGrievance._id}`, {
                status: 'Resolved',
                remarks: atr || 'Resolved by Authority'
            });
            alert('Resolved Successfully!');
            await fetchGrievances();
            setSelectedGrievance(null);
            setAtr('');
        } catch (err) {
            alert('Update failed');
        }
    };

    // Filter Logic
    const pendingGrievances = grievances.filter(g =>
        g.status === 'Registered' || g.status === 'Assigned' || g.status === 'In Progress'
    );
    const resolvedGrievances = grievances.filter(g =>
        g.status === 'Action Taken' || g.status === 'Resolved' || g.status === 'Closed'
    );

    const displayedGrievances = activeTab === 'pending' ? pendingGrievances : resolvedGrievances;

    if (loading) return <div className="loading-spinner">Loading...</div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div>
                    <h2>Authority Console</h2>
                    <p className="subtitle">{user?.department} | {user?.jurisdiction}</p>
                </div>
                <div className="stats-pill">
                    <span>Pending: <strong>{pendingGrievances.length}</strong></span>
                </div>
            </header>

            <div className="admin-tabs">
                <button
                    className={activeTab === 'pending' ? 'active' : ''}
                    onClick={() => setActiveTab('pending')}
                >
                    🚨 Pending Action
                </button>
                <button
                    className={activeTab === 'resolved' ? 'active' : ''}
                    onClick={() => setActiveTab('resolved')}
                >
                    ✅ Resolved / History
                </button>
            </div>

            <div className="grievance-list">
                {displayedGrievances.length === 0 ? (
                    <p className="no-data">No grievances found in this category.</p>
                ) : (
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Category</th>
                                <th>Priority</th>
                                <th>Status</th>
                                <th>Submitted</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayedGrievances.map(g => (
                                <tr key={g._id}>
                                    <td>#{g.grievanceId}</td>
                                    <td>
                                        <div style={{ fontWeight: 'bold' }}>{g.subType || g.category}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#666' }}>{g.area}</div>
                                    </td>
                                    <td>
                                        <span className={`badge priority-${g.urgency?.toLowerCase()}`}>
                                            {g.urgency}
                                        </span>
                                    </td>
                                    <td>
                                        <span className={`status ${g.status.toLowerCase().replace(' ', '-')}`}>
                                            {g.status}
                                        </span>
                                    </td>
                                    <td>{new Date(g.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <button
                                            className="btn-secondary btn-sm"
                                            onClick={() => setSelectedGrievance(g)}
                                        >
                                            Manage
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* ACTION MODAL */}
            {selectedGrievance && (
                <div className="modal-overlay">
                    <div className="modal-content large-modal">
                        <header className="modal-header">
                            <h3>Manage Grievance #{selectedGrievance.grievanceId}</h3>
                            <button className="close-btn" onClick={() => setSelectedGrievance(null)}>×</button>
                        </header>

                        <div className="modal-body with-sidebar">
                            <div className="modal-main">
                                <StatusTimeline status={selectedGrievance.status} />

                                <div className="detail-group">
                                    <label>Description</label>
                                    <p>{selectedGrievance.text}</p>
                                </div>

                                <div className="detail-row">
                                    <div className="detail-group">
                                        <label>Location</label>
                                        <p>{selectedGrievance.address}, {selectedGrievance.area}</p>
                                    </div>
                                    <div className="detail-group">
                                        <label>Complainant</label>
                                        <p>{selectedGrievance.citizenId?.name} ({selectedGrievance.citizenId?.phone})</p>
                                    </div>
                                </div>

                                {selectedGrievance.photoUrl && (
                                    <div className="evidence-section">
                                        <label>Evidence</label>
                                        <img src={`http://localhost:5000${selectedGrievance.photoUrl}`} alt="Evidence" />
                                    </div>
                                )}
                            </div>

                            <div className="modal-sidebar">
                                <h4>Take Action</h4>
                                <textarea
                                    placeholder="Enter Action Taken Report (ATR) or Remarks..."
                                    rows="5"
                                    value={atr}
                                    onChange={(e) => setAtr(e.target.value)}
                                ></textarea>

                                <div className="action-buttons">
                                    <button
                                        className="btn-status action-taken"
                                        onClick={handleUpdateStatus}
                                        disabled={selectedGrievance.status === 'Resolved'}
                                    >
                                        Mark 'Action Taken'
                                    </button>
                                    <button
                                        className="btn-status resolved"
                                        onClick={handleResolve}
                                        disabled={selectedGrievance.status === 'Resolved'}
                                    >
                                        Mark 'Resolved'
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AuthorityDashboard;
