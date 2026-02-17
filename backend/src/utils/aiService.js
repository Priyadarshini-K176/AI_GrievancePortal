const { spawn } = require('child_process');
const path = require('path');

const classifyGrievance = (text) => {
    return new Promise((resolve, reject) => {
        if (!text) return resolve({ category: 'Unclassified', subType: 'Other' });

        const scriptPath = path.join(__dirname, '../../ml/predict.py');
        const pythonProcess = spawn('python', [scriptPath, text]);

        let dataString = '';

        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python Stderr: ${data}`);
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python process exited with code ${code}`);
                return resolve({ category: 'Unclassified', subType: 'Other' }); // Fallback
            }

            try {
                const result = JSON.parse(dataString);
                if (result.error) {
                    console.error('ML Error:', result.error);
                    return resolve({ category: 'Unclassified', subType: 'Other' });
                }
                resolve({
                    category: result.department,
                    subType: result.subtype
                });
            } catch (err) {
                console.error('Error parsing ML output:', err);
                resolve({ category: 'Unclassified', subType: 'Other' });
            }
        });
    });
};

const predictUrgency = (text) => {
    const lowerText = text.toLowerCase();
    const urgentKeywords = ['urgent', 'emergency', 'dangerous', 'danger', 'accident', 'fire', 'immediately', 'critical', 'severe', 'death', 'blood', 'injury'];

    if (urgentKeywords.some(keyword => lowerText.includes(keyword))) {
        return 'High';
    }
    return 'Normal';
};

module.exports = {
    classifyGrievance,
    predictUrgency
};
