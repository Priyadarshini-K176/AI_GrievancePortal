import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mic, MicOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import '../styles/GrievanceForm.css';
import { departmentData } from '../utils/dropdownData';

const GrievanceForm = () => {
    const [text, setText] = useState('');
    const [category, setCategory] = useState(''); // Changed default to empty
    const [subType, setSubType] = useState(''); // Added subType
    const [jurisdiction, setJurisdiction] = useState('');
    const [area, setArea] = useState(''); // Added area
    const [isListening, setIsListening] = useState(false);
    const [isPredicting, setIsPredicting] = useState(false); // Added predicting state
    const { language, t } = useLanguage();
    const navigate = useNavigate();

    // New State Variables
    const [gender, setGender] = useState('');
    const [differentlyAbled, setDifferentlyAbled] = useState('No');
    const [petitionerType, setPetitionerType] = useState('Public');
    const [address, setAddress] = useState('');
    const [commAddress, setCommAddress] = useState('');
    const [sameAddress, setSameAddress] = useState(false);

    const [localBodyType, setLocalBodyType] = useState('');
    const [subDepartment, setSubDepartment] = useState('');
    const [taluk, setTaluk] = useState('');
    const [revenueDivision, setRevenueDivision] = useState('');
    const [firka, setFirka] = useState('');
    const [villagePanchayat, setVillagePanchayat] = useState('');
    const [responsibleOfficer, setResponsibleOfficer] = useState('');

    const handleSameAddressChange = (e) => {
        setSameAddress(e.target.checked);
        if (e.target.checked) setCommAddress(address);
        else setCommAddress('');
    };

    const startListening = () => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            const recognition = new SpeechRecognition();
            recognition.lang = language === 'ta' ? 'ta-IN' : 'en-US'; // Dynamic Language
            recognition.interimResults = false;
            recognition.maxAlternatives = 1;

            recognition.onstart = () => setIsListening(true);
            recognition.onend = () => setIsListening(false);
            recognition.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setText(prev => prev + ' ' + transcript);
            };

            recognition.start();
        } else {
            alert('Browser does not support voice input.');
        }
    };

    const handleAutoPredict = async () => {
        if (!text) return;
        setIsPredicting(true);
        try {
            const res = await axios.post('http://localhost:5000/api/grievances/predict-category', { text });
            if (res.data.department) setCategory(res.data.department);
            if (res.data.subtype) setSubType(res.data.subtype);
        } catch (err) {
            console.error(err);
            alert('Prediction failed. Please enter category manually.');
        } finally {
            setIsPredicting(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append('text', text);
        formData.append('category', category);
        formData.append('subType', subType);
        formData.append('jurisdiction', jurisdiction);

        formData.append('area', area); // Added area

        // Append New Fields
        formData.append('gender', gender);
        formData.append('differentlyAbled', differentlyAbled);
        formData.append('petitionerType', petitionerType);
        formData.append('address', address);
        formData.append('communicationAddress', commAddress);
        formData.append('localBodyType', localBodyType);
        formData.append('subDepartment', subDepartment);
        formData.append('taluk', taluk);
        formData.append('revenueDivision', revenueDivision);
        formData.append('firka', firka);
        formData.append('villagePanchayat', villagePanchayat);
        formData.append('responsibleOfficer', responsibleOfficer);

        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput.files[0]) {
            formData.append('file', fileInput.files[0]);
        }

        try {
            await axios.post('http://localhost:5000/api/grievances', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/dashboard');
        } catch (err) {
            alert('Failed to submit grievance');
        }
    };

    return (
        <div className="form-container">
            <h2>{t('fileGrievance')}</h2>
            <form onSubmit={handleSubmit}>

                {/* SECTION 1: Petitioner Details */}
                <h3 className="section-header">{t('personalDetails')}</h3>
                <div className="section-card">
                    <div className="form-group">
                        <label>{t('gender')}</label>
                        <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                            <option value="">-Select-</option>
                            <option value="Male">{t('male')}</option>
                            <option value="Female">{t('female')}</option>
                            <option value="Transgender">{t('transgender')}</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>{t('differentlyAbled')}</label>
                        <div className="radio-group">
                            <label><input type="radio" value="Yes" checked={differentlyAbled === 'Yes'} onChange={() => setDifferentlyAbled('Yes')} /> {t('yes')}</label>
                            <label><input type="radio" value="No" checked={differentlyAbled === 'No'} onChange={() => setDifferentlyAbled('No')} /> {t('no')}</label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>{t('petitionerType')}</label>
                        <select value={petitionerType} onChange={(e) => setPetitionerType(e.target.value)}>
                            <option value="Public">{t('public')}</option>
                            <option value="Individual">{t('individual')}</option>
                            <option value="Association">{t('association')}</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>{t('address')}</label>
                        <textarea value={address} onChange={(e) => setAddress(e.target.value)} rows="3" required></textarea>
                    </div>

                    <div className="form-group">
                        <label>{t('commAddress')}</label>
                        <div style={{ marginBottom: '10px' }}>
                            <input type="checkbox" checked={sameAddress} onChange={handleSameAddressChange} /> {t('sameAsAbove')}
                        </div>
                        <textarea value={commAddress} onChange={(e) => setCommAddress(e.target.value)} rows="3" disabled={sameAddress} required></textarea>
                    </div>
                </div>

                {/* SECTION 2: Location Details */}
                <h3 className="section-header">{t('locationDetails')}</h3>
                <div className="section-card">
                    <div className="form-row">
                        <div className="form-group half">
                            <label>{t('localBodyType')}</label>
                            <select value={localBodyType} onChange={(e) => setLocalBodyType(e.target.value)}>
                                <option value="">-None-</option>
                                <option value="Corporation">Corporation</option>
                                <option value="Municipality">Municipality</option>
                                <option value="Town Panchayat">Town Panchayat</option>
                                <option value="Village Panchayat">Village Panchayat</option>
                            </select>
                        </div>
                        <div className="form-group half">
                            <label>{t('area')}</label>
                            <input type="text" value={area} onChange={(e) => setArea(e.target.value)} placeholder="e.g. Gandhi Street" required />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group half">
                            <label>{t('taluk')}</label>
                            <input type="text" value={taluk} onChange={(e) => setTaluk(e.target.value)} placeholder="-None-" />
                        </div>
                        <div className="form-group half">
                            <label>{t('revDiv')}</label>
                            <input type="text" value={revenueDivision} onChange={(e) => setRevenueDivision(e.target.value)} placeholder="-None-" />
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group half">
                            <label>{t('firka')}</label>
                            <input type="text" value={firka} onChange={(e) => setFirka(e.target.value)} placeholder="-None-" />
                        </div>
                        <div className="form-group half">
                            <label>{t('village')}</label>
                            <input type="text" value={villagePanchayat} onChange={(e) => setVillagePanchayat(e.target.value)} placeholder="-None-" />
                        </div>
                    </div>
                </div>

                {/* SECTION 3: Grievance Details */}
                <h3 className="section-header">{t('grievanceDetails')}</h3>
                <div className="section-card">
                    <div className="form-group">
                        <label>{t('description')}</label>
                        <div className="voice-input-wrapper">
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                rows="5"
                                required
                                placeholder="Start speaking or typing..."
                            ></textarea>
                            <div className="voice-controls">
                                <button type="button" className={`mic-btn ${isListening ? 'listening' : ''}`} onClick={startListening} title="Start Voice Input">
                                    {isListening ? <MicOff /> : <Mic />}
                                </button>
                                {text && (
                                    <button type="button" className="clear-btn" onClick={() => setText('')} title="Clear Text">
                                        ✕
                                    </button>
                                )}
                            </div>
                        </div>
                        <small className={`voice-status ${isListening ? 'active' : ''}`}>
                            {isListening ? (language === 'ta' ? 'கேட்கிறது...' : 'Listening...') : t('mic')}
                        </small>
                    </div>

                    <div style={{ marginTop: '10px', marginBottom: '20px' }}>
                        <button
                            type="button"
                            onClick={handleAutoPredict}
                            disabled={isPredicting || !text}
                            style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                        >
                            {isPredicting ? t('analyzing') : t('autoDetect')}
                        </button>
                    </div>

                    <div className="form-group">
                        <label>{t('dept')}</label>
                        <select
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                setSubType(''); // Reset subType when category changes
                            }}
                            required
                        >
                            <option value="">{t('selectCategory') || "-Select Category-"}</option>
                            {departmentData.map((dept, index) => (
                                <option key={index} value={dept.name}>{dept.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label>{t('subDept')}</label>
                        <input type="text" value={subDepartment} onChange={(e) => setSubDepartment(e.target.value)} placeholder="-None-" />
                    </div>

                    <div className="form-group">
                        <label>{t('subType')}</label>
                        <select
                            value={subType}
                            onChange={(e) => setSubType(e.target.value)}
                            disabled={!category}
                            required
                        >
                            <option value="">{t('selectSubType') || "-Select Sub-Type-"}</option>
                            {category && departmentData.find(d => d.name === category)?.subTypes.map((sub, index) => (
                                <option key={index} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>



                    {/* Removed Responsible Officer - Auto-assigned by system */}

                    <div className="form-group">
                        <label>{t('jurisdiction')}</label>
                        <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} required>
                            <option value="">{t('selectArea')}</option>
                            <option value="North Zone">North Zone</option>
                            <option value="South Zone">South Zone</option>
                            <option value="East Zone">East Zone</option>
                            <option value="West Zone">West Zone</option>
                            <option value="Central Zone">Central Zone</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label>{t('uploadPhoto')}</label>
                        <input type="file" accept="image/*" />
                    </div>
                </div>

                <button type="submit" className="btn-primary">{t('submit')}</button>
            </form>
        </div >
    );
};

export default GrievanceForm;
