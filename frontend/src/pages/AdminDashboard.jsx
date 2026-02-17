import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import { departmentData } from '../utils/dropdownData';
import { AnalyticsChart } from '../components/AnalyticsChart';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('authorities');
    const [authorities, setAuthorities] = useState([]);
    const [grievances, setGrievances] = useState([]);
    const [analyticsData, setAnalyticsData] = useState(null);
    const [analyticsError, setAnalyticsError] = useState(null); // New state for error
    const [expandedRow, setExpandedRow] = useState(null); // For view details
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        department: '',
        jurisdiction: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const { user } = useContext(AuthContext); // Get user/token from context if available, or just use localStorage
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            fetchData();
        }
    }, [token]);

    useEffect(() => {
        if (activeTab === 'analytics' && !analyticsData && token) {
            fetchAnalytics();
        }
    }, [activeTab, token]);

    const fetchAnalytics = async () => {
        try {
            setAnalyticsError(null); // Reset error
            console.log("Fetching analytics...");
            const res = await axios.get('http://localhost:5002/api/admin/analytics', {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Analytics Data Received:", res.data);
            setAnalyticsData(res.data);
        } catch (err) {
            console.error("Analytics Fetch Error", err);
            setAnalyticsError(err.response?.data?.message || err.message || 'Failed to load analytics');
        }
    };

    const fetchData = async () => {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        try {
            const authRes = await axios.get('http://localhost:5002/api/admin/authorities', config);
            setAuthorities(authRes.data);
            const grievRes = await axios.get('http://localhost:5002/api/grievances', config); // Admin sees all
            setGrievances(grievRes.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            };
            await axios.post('http://localhost:5002/api/admin/create-authority', {
                ...formData,
                role: 'authority'
            }, config);
            alert('Authority Created Successfully');
            setFormData({ name: '', phone: '', password: '', department: '', jurisdiction: '' });
            fetchData(); // Refresh list
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to create authority');
        }
    };

    return (
        <div className="dashboard-container">
            <h2>Admin Panel</h2>
            <div className="admin-tabs">
                <button className={activeTab === 'authorities' ? 'active' : ''} onClick={() => setActiveTab('authorities')}>Manage Authorities</button>
                <button className={activeTab === 'grievances' ? 'active' : ''} onClick={() => setActiveTab('grievances')}>View All Grievances</button>
                <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>📊 Analytics</button>
            </div>

            {activeTab === 'authorities' && (
                <div className="admin-section">
                    <div className="form-container">
                        <h3>Create New Authority</h3>
                        <form onSubmit={handleSubmit} className="compact-form">
                            <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" required />
                            <input name="phone" value={formData.phone} onChange={handleChange} placeholder="Phone" required />
                            <input name="password" type="password" value={formData.password} onChange={handleChange} placeholder="Password" required />
                            <select name="department" value={formData.department} onChange={handleChange} required>
                                <option value="">Select Dept</option>
                                {departmentData.map((dept, index) => (
                                    <option key={index} value={dept.name}>{dept.name}</option>
                                ))}
                            </select>
                            <select name="jurisdiction" value={formData.jurisdiction} onChange={handleChange} required>
                                <option value="">Select Zone</option>
                                <option value="North Zone">North Zone</option>
                                <option value="South Zone">South Zone</option>
                                <option value="East Zone">East Zone</option>
                                <option value="West Zone">West Zone</option>
                                <option value="Central Zone">Central Zone</option>
                            </select>
                            <button type="submit">Create</button>
                        </form>
                    </div>
                    <h3>Existing Authorities</h3>
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Department</th>
                                <th>Jurisdiction</th>
                            </tr>
                        </thead>
                        <tbody>
                            {authorities.map(auth => (
                                <tr key={auth._id}>
                                    <td>{auth.name}</td>
                                    <td>{auth.phone}</td>
                                    <td>{auth.department}</td>
                                    <td>{auth.jurisdiction}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {activeTab === 'grievances' && (
                <div className="admin-section">
                    <h3>All Grievances (Global View)</h3>
                    <table className="modern-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Citizen</th>
                                <th>Dept</th>
                                <th>Evidence</th>
                                <th>Zone</th>
                                <th>Status</th>
                                <th>Status</th>
                                <th>Assigned To</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grievances.map(g => {
                                const isOverdue = new Date(g.slaDeadline) < new Date() && g.status !== 'Resolved' && g.status !== 'Closed';
                                return (
                                    <>
                                        <tr key={g._id}>
                                            <td>{g.grievanceId}</td>
                                            <td>{g.citizenId?.name}</td>
                                            <td>{g.currentDepartment}</td>
                                            <td>
                                                {g.photoUrl ? (
                                                    <a href={`http://localhost:5002${g.photoUrl}`} target="_blank" rel="noopener noreferrer">View</a>
                                                ) : '-'}
                                            </td>
                                            <td>{g.jurisdiction}</td>
                                            <td>
                                                <span className={`status ${g.status.toLowerCase().replace(' ', '-')}`}>{g.status}</span>
                                                {isOverdue && <span className="status overdue" style={{ marginLeft: '8px', fontSize: '0.6rem' }}>OVERDUE</span>}
                                            </td>
                                            <td>{authorities.find(a => a._id === g.currentAuthority)?.name || 'Unassigned'}</td>
                                            <td>
                                                <button
                                                    onClick={() => setExpandedRow(expandedRow === g._id ? null : g._id)}
                                                    className="btn-view"
                                                >
                                                    {expandedRow === g._id ? 'Hide' : 'View'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedRow === g._id && (
                                            <tr className="expanded-row">
                                                <td colSpan="8">
                                                    <div className="details-expanded">
                                                        <h4>Grievance Details</h4>
                                                        <div className="details-grid">
                                                            <div className="detail-item">
                                                                <strong>Sub-Type:</strong> {g.subType || '-'}
                                                            </div>
                                                            <div className="detail-item">
                                                                <strong>Urgency:</strong> {g.urgency}
                                                            </div>
                                                            <div className="detail-item">
                                                                <strong>Area:</strong> {g.area}
                                                            </div>
                                                            <div className="detail-item">
                                                                <strong>Address:</strong> {g.address}
                                                            </div>
                                                            <div className="detail-item">
                                                                <strong>Petitioner Type:</strong> {g.petitionerType}
                                                            </div>
                                                            <div className="detail-item">
                                                                <strong>Gender:</strong> {g.gender || '-'}
                                                            </div>
                                                            <div className="detail-item">
                                                                <strong>Disability:</strong> {g.differentlyAbled}
                                                            </div>
                                                            <div className="detail-item">
                                                                <strong>Local Body:</strong> {g.localBodyType || '-'}
                                                            </div>
                                                            <div className="detail-item">
                                                                <strong>Taluk:</strong> {g.taluk || '-'}
                                                            </div>
                                                            <div className="detail-item">
                                                                <strong>Full Description:</strong>
                                                                <p style={{ marginTop: '5px' }}>{g.text}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}


            {
                activeTab === 'analytics' && (
                    <div className="admin-section">
                        <h3>Portal Analytics & Insights</h3>
                        {analyticsData ? (
                            <>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
                                    <div className="stats-pill" style={{ textAlign: 'center', background: '#e0f2fe', color: '#0369a1' }}>
                                        <h3>{analyticsData.total}</h3> <small>Total Grievances</small>
                                    </div>
                                    <div className="stats-pill" style={{ textAlign: 'center', background: '#fef3c7', color: '#b45309' }}>
                                        <h3>{analyticsData.pending}</h3> <small>Pending</small>
                                    </div>
                                    <div className="stats-pill" style={{ textAlign: 'center', background: '#dcfce7', color: '#15803d' }}>
                                        <h3>{analyticsData.resolved}</h3> <small>Resolved</small>
                                    </div>
                                    <div className="stats-pill" style={{ textAlign: 'center', background: '#fee2e2', color: '#b91c1c' }}>
                                        <h3>{analyticsData.escalated}</h3> <small>Escalated</small>
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '30px' }}>
                                    <AnalyticsChart title="Complaints by Category (Department)" data={analyticsData.byCategory} />
                                    <AnalyticsChart title="Urgency Distribution" data={analyticsData.byUrgency} type="pie" />
                                    <AnalyticsChart title="Status Distribution" data={analyticsData.byStatus} type="pie" />
                                    <AnalyticsChart title="Zone-wise Complaints" data={analyticsData.byZone} />
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <p>{analyticsError ? <span style={{ color: 'red' }}>Error: {analyticsError}</span> : 'Loading analytics...'}</p>
                                <button onClick={fetchAnalytics} style={{ marginTop: '10px', padding: '5px 10px' }}>Retry / Refresh</button>
                            </div>
                        )}
                    </div>
                )}
        </div>
    );
};

export default AdminDashboard;
