import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mic, MicOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import '../styles/GrievanceForm.css';

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
                <div className="form-group">
                    <label>{t('description')}</label>
                    <div className="voice-input-wrapper">
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            rows="5"
                            required
                            placeholder={t('description')}
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

                <div style={{ marginTop: '10px' }}>
                    <button
                        type="button"
                        onClick={handleAutoPredict}
                        disabled={isPredicting || !text}
                        style={{ padding: '8px 12px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px' }}
                    >
                        {isPredicting ? 'Analyzing...' : 'Auto-detect Category'}
                    </button>
                </div>

                <div className="form-group">
                    <label>{t('category')}</label>
                    <input
                        type="text"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Department (e.g. Water Supply)"
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div className="form-group">
                    <label>Sub-Type</label>
                    <input
                        type="text"
                        value={subType}
                        onChange={(e) => setSubType(e.target.value)}
                        placeholder="Specific Issue (e.g. Pipe Leakage)"
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div className="form-group">
                    <label>{t('jurisdiction')} (Area)</label>
                    <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} required>
                        <option value="">Select Area</option>
                        <option value="North Zone">North Zone</option>
                        <option value="South Zone">South Zone</option>
                        <option value="East Zone">East Zone</option>
                        <option value="West Zone">West Zone</option>
                        <option value="Central Zone">Central Zone</option>
                    </select>
                </div>

                <div className="form-group">
                    <label>Street/Area (Specific Location)</label>
                    <input
                        type="text"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="e.g. Gandhi Street, 2nd Cross"
                        required
                        style={{ width: '100%', padding: '8px', marginTop: '5px' }}
                    />
                </div>

                <div className="form-group">
                    <label>Upload Photo (Optional)</label>
                    <input type="file" accept="image/*" />
                </div>

                <button type="submit" className="btn-primary">{t('submit')}</button>
            </form >
        </div >
    );
};

export default GrievanceForm;
