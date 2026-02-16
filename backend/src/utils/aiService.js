// Simple keyword-based classification to simulate AI/ML model
const classifyGrievance = (text) => {
    const lowerText = text.toLowerCase();

    // Departments
    if (lowerText.includes('water') || lowerText.includes('leak') || lowerText.includes('pipe') || lowerText.includes('drain')) return 'Water';
    if (lowerText.includes('road') || lowerText.includes('pothole') || lowerText.includes('street') || lowerText.includes('traffic')) return 'Roads';
    if (lowerText.includes('electric') || lowerText.includes('power') || lowerText.includes('light') || lowerText.includes('pole')) return 'Electricity';
    if (lowerText.includes('garbage') || lowerText.includes('trash') || lowerText.includes('clean') || lowerText.includes('dustbin')) return 'Sanitation';

    return 'General';
};

const predictUrgency = (text) => {
    const lowerText = text.toLowerCase();
    const urgentKeywords = ['urgent', 'emergency', 'dangerous', 'danger', 'accident', 'fire', 'immediately', 'critical', 'severe'];

    if (urgentKeywords.some(keyword => lowerText.includes(keyword))) {
        return 'High';
    }
    return 'Normal';
};

module.exports = {
    classifyGrievance,
    predictUrgency
};
