import React from 'react';

export default function EraToggle({ value, onChange }) {
    return (
        <div className="era-toggle">
            {['AC', 'DC'].map((era) => (
                <button
                    key={era}
                    type="button"
                    className={`era-btn${value === era ? ' active' : ''}`}
                    data-era={era}
                    onClick={() => onChange(era)}
                >
                    {era === 'AC' ? 'a.C.' : 'd.C.'}
                </button>
            ))}
        </div>
    );
}
