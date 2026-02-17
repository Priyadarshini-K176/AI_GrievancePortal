import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mic, MicOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import '../styles/GrievanceForm.css';
import { departmentData } from '../utils/dropdownData';

const GrievanceForm = () => {
    // Standard States
    const [text, setText] = useState('');
    const [category, setCategory] = useState('');
    const [subType, setSubType] = useState('');
    const [jurisdiction, setJurisdiction] = useState('');
    const [area, setArea] = useState('');

    // Voice & Status States
    const [isRecording, setIsRecording] = useState(false);
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [isPredicting, setIsPredicting] = useState(false);

    // Personal & Location States
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

    const { language, t } = useLanguage();
    const navigate = useNavigate();

    // Voice Recording Refs
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    // --- Whisper/AssemblyAI Voice Logic ---
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                if (audioBlob.size === 0) return;

                const formData = new FormData();
                formData.append('audio', audioBlob, 'audio.webm');

                try {
                    setIsTranscribing(true);
                    const response = await axios.post(
                        'http://localhost:5000/api/voice/voice-to-text',
                        formData,
                        { headers: { 'Content-Type': 'multipart/form-data' } }
                    );

                    // 1. Update text with transcription
                    const newText = response.data.tamil || response.data.text || "";
                    setText(prev => (prev ? `${prev} ${newText}` : newText));

                    // 2. Auto-fill category if backend detected it
                    if (response.data.category) {
                        setCategory(response.data.category);
                    }

                    // 3. [NEW] Auto-fill Jurisdiction & Area from Spacy
                    if (response.data.jurisdiction && response.data.jurisdiction !== "General") {
                        // Simple fuzzy match or direct set if it matches dropdown values
                        const validZones = ["North Zone", "South Zone", "East Zone", "West Zone", "Central Zone"];
                        const detected = response.data.jurisdiction;

                        // Try to find a match in the dropdown
                        const match = validZones.find(z => z.toLowerCase().includes(detected.toLowerCase()));
                        if (match) setJurisdiction(match);
                    }

                    if (response.data.area) {
                        setArea(prev => prev || response.data.area);
                    }
                } catch (err) {
                    console.error('Transcription error:', err);
                    alert('Voice processing failed. Please try typing.');
                } finally {
                    setIsTranscribing(false);
                    // Crucial: Stop the mic hardware
                    stream.getTracks().forEach(track => track.stop());
                }
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Auto-stop after 6 seconds to prevent massive files
            setTimeout(() => {
                if (mediaRecorder.state !== 'inactive') stopRecording();
            }, 6000);

        } catch (err) {
            alert('Please allow microphone access to use voice input.');
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    // --- Existing Handlers ---
    const handleAutoPredict = async () => {
        if (!text) return;
        setIsPredicting(true);
        try {
            const res = await axios.post('http://localhost:5000/api/grievances/predict-category', { text });
            if (res.data.department) setCategory(res.data.department);
            if (res.data.subtype) setSubType(res.data.subtype);
        } catch (err) {
            alert('Auto-detection failed.');
        } finally {
            setIsPredicting(false);
        }
    };

    const [file, setFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleAnalyzeImage = async () => {
        if (!file) return alert("Please select an image first!");

        setAnalyzing(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post('http://localhost:5000/api/ai/analyze-image', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log("AI Response:", res.data);

            if (res.data.error) {
                alert(`AI Error: ${res.data.error}`);
                return;
            }

            const { category, description, detected_objects } = res.data;

            if (!description) {
                alert("AI did not return a description. Raw response: " + JSON.stringify(res.data));
                return;
            }

            // Auto-fill form
            setCategory(prev => category || prev);
            setText(prev => (prev ? `${prev}\n\n[AI Analysis]: ${description}` : `[AI Analysis]: ${description}`));

            alert(`✨ AI Detected: ${category}\nObjects: ${detected_objects?.join(', ')}`);
        } catch (err) {
            console.error(err);
            alert("AI Analysis failed (Check console for details)");
        } finally {
            setAnalyzing(false);
        }
    };
    const handleOCR = async () => {
        if (!file) return alert("Please select an image of the letter first!");

        setAnalyzing(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await axios.post('http://localhost:5000/api/ai/ocr', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const { text, description } = res.data;

            if (!text) {
                alert("OCR did not find any text.");
                return;
            }

            // Auto-fill form
            setText(prev => (prev ? `${prev}\n\n[OCR Extracted]: ${text}` : `[OCR Extracted]: ${text}`));
            alert(`📝 Text Extracted!\n\n${description}`);
        } catch (err) {
            console.error(err);
            alert("OCR Failed (Check console)");
        } finally {
            setAnalyzing(false);
        }
    };

    const handleSameAddressChange = (e) => {
        setSameAddress(e.target.checked);
        if (e.target.checked) setCommAddress(address);
        else setCommAddress('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        // Append text & dropdowns
        formData.append('text', text);
        formData.append('category', category);
        formData.append('subType', subType);
        formData.append('jurisdiction', jurisdiction);
        formData.append('area', area);
        // Append Personal Details
        formData.append('gender', gender);
        formData.append('differentlyAbled', differentlyAbled);
        formData.append('petitionerType', petitionerType);
        formData.append('address', address);
        formData.append('communicationAddress', commAddress);
        // Append Location Details
        formData.append('localBodyType', localBodyType);
        formData.append('subDepartment', subDepartment);
        formData.append('taluk', taluk);
        formData.append('revenueDivision', revenueDivision);
        formData.append('firka', firka);
        formData.append('villagePanchayat', villagePanchayat);

        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput?.files[0]) formData.append('file', fileInput.files[0]);

        try {
            await axios.post('http://localhost:5000/api/grievances', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate('/dashboard');
        } catch (err) {
            alert('Submission failed. Check your connection.');
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
                    {/* Add Taluk/Revenue Div/Village inputs here if needed */}
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
                                placeholder={isTranscribing ? "Processing your voice..." : "Type or use the mic..."}
                                disabled={isTranscribing}
                            ></textarea>
                            <div className="voice-controls">
                                <button
                                    type="button"
                                    className={`mic-btn ${isRecording ? 'listening' : ''}`}
                                    onClick={isRecording ? stopRecording : startRecording}
                                    disabled={isTranscribing}
                                    title="Voice Input"
                                >
                                    {isRecording ? <MicOff /> : <Mic />}
                                </button>
                                {text && (
                                    <button type="button" className="clear-btn" onClick={() => setText('')}>✕</button>
                                )}
                            </div>
                        </div>
                        <small className={`voice-status ${isRecording ? 'active' : ''}`}>
                            {isRecording ? (language === 'ta' ? 'கேட்கிறது...' : 'Recording...') :
                                isTranscribing ? 'Converting voice to text...' : t('mic')}
                        </small>
                    </div>

                    <div style={{ margin: '15px 0' }}>
                        <button
                            type="button"
                            onClick={handleAutoPredict}
                            disabled={isPredicting || !text || isTranscribing}
                            className="predict-btn"
                        >
                            {isPredicting ? t('analyzing') : t('autoDetect')}
                        </button>
                    </div>

                    {/* Image Upload with AI Analysis */}
                    <div className="form-group">
                        <label>{t('uploadPhoto')}</label>
                        <div className="file-input-wrapper">
                            <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={handleFileChange}
                                className="file-input"
                            />
                            <button
                                type="button"
                                className="btn-ai-analyze"
                                onClick={handleAnalyzeImage}
                                disabled={analyzing || !file}
                                title={!file ? "Upload an image first" : "Find Objects (Cars, Garbage)"}
                            >
                                {analyzing ? '🔍 Analyzing...' : '✨ AI Analyze'}
                            </button>
                            <button
                                type="button"
                                className="btn-ai-analyze btn-ocr"
                                onClick={handleOCR}
                                disabled={analyzing || !file}
                                title={!file ? "Upload an image first" : "Read Text from Letter"}
                                style={{ background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5D5D 100%)' }}
                            >
                                📝 Scan Letter
                            </button>
                        </div>
                    </div>



                    <div className="form-group">
                        <label>{t('dept')}</label>
                        <select
                            value={category}
                            onChange={(e) => {
                                setCategory(e.target.value);
                                setSubType('');
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
                </div>

                <button type="submit" className="btn-primary" disabled={isTranscribing || isRecording}>
                    {t('submit')}
                </button>
            </form >
        </div >
    );
};

export default GrievanceForm;