import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import AuthContext from '../context/AuthContext';
import '../styles/Dashboard.css';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('authorities');
    const [authorities, setAuthorities] = useState([]);
    const [grievances, setGrievances] = useState([]);
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

    const fetchData = async () => {
        const config = {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
        try {
            const authRes = await axios.get('http://localhost:5000/api/admin/authorities', config);
            setAuthorities(authRes.data);
            const grievRes = await axios.get('http://localhost:5000/api/grievances', config); // Admin sees all
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
            await axios.post('http://localhost:5000/api/admin/create-authority', {
                ...formData,
                role: 'authority'
            }, config);
            alert('Authority Created Successfully');
            setFormData({ name: '', phone: '', password: '', department: '', jurisdiction: '' });
            fetchData(); // Refresh list
        } catch (err) {
            alert('Failed to create authority');
        }
    };

    return (
        <div className="dashboard-container">
            <h2>Admin Panel</h2>
            <div className="admin-tabs">
                <button className={activeTab === 'authorities' ? 'active' : ''} onClick={() => setActiveTab('authorities')}>Manage Authorities</button>
                <button className={activeTab === 'grievances' ? 'active' : ''} onClick={() => setActiveTab('grievances')}>View All Grievances</button>
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
                                <option value="Water">Water</option>
                                <option value="Roads">Roads</option>
                                <option value="Electricity">Electricity</option>
                                <option value="Sanitation">Sanitation</option>
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
                    <table className="data-table">
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
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Citizen</th>
                                <th>Dept</th>
                                <th>Evidence</th>
                                <th>Zone</th>
                                <th>Status</th>
                                <th>Assigned To</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grievances.map(g => {
                                const isOverdue = new Date(g.slaDeadline) < new Date() && g.status !== 'Resolved' && g.status !== 'Closed';
                                return (
                                    <tr key={g._id}>
                                        <td>{g.grievanceId}</td>
                                        <td>{g.citizenId?.name}</td>
                                        <td>{g.currentDepartment}</td>
                                        <td>
                                            {g.photoUrl ? (
                                                <a href={`http://localhost:5000${g.photoUrl}`} target="_blank" rel="noopener noreferrer">View</a>
                                            ) : '-'}
                                        </td>
                                        <td>{g.jurisdiction}</td>
                                        <td>
                                            <span className={`status ${g.status.toLowerCase().replace(' ', '-')}`}>{g.status}</span>
                                            {isOverdue && <span className="status overdue" style={{ marginLeft: '8px', fontSize: '0.6rem' }}>OVERDUE</span>}
                                        </td>
                                        <td>{authorities.find(a => a._id === g.currentAuthority)?.name || 'Unassigned'}</td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
