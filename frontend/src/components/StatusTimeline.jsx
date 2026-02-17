import React from 'react';
import '../styles/StatusTimeline.css';

const StatusTimeline = ({ status }) => {
    const steps = [
        { label: 'Registered', status: 'registered' },
        { label: 'Assigned', status: 'assigned' },
        { label: 'Action Taken', status: 'action taken' },
        { label: 'Resolved', status: 'resolved' }
    ];

    // Determine current step index
    // If status is "Closed", we treat it as Resolved for the timeline, or add a Closed step.
    // Let's normalize status to lowercase for comparison
    const currentStatus = status.toLowerCase();

    let activeIndex = 0;
    if (currentStatus === 'assigned') activeIndex = 1;
    else if (currentStatus === 'action taken') activeIndex = 2;
    else if (currentStatus === 'resolved' || currentStatus === 'closed') activeIndex = 3;

    return (
        <div className="timeline-container">
            <div className="timeline-progress-bar">
                <div
                    className="timeline-progress-fill"
                    style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                ></div>
            </div>
            <div className="timeline-steps">
                {steps.map((step, index) => (
                    <div key={index} className={`timeline-step ${index <= activeIndex ? 'active' : ''}`}>
                        <div className="step-circle">{index + 1}</div>
                        <div className="step-label">{step.label}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StatusTimeline;
