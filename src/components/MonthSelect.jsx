import React from 'react';

const MONTHS = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
];

export default function MonthSelect({ value, onChange, id }) {
    return (
        <select id={id} className="select-input" value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="">—</option>
            {MONTHS.map((m, i) => (
                <option key={i + 1} value={i + 1}>{m}</option>
            ))}
        </select>
    );
}
