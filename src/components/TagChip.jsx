import React from 'react';

export default function TagChip({ tag, selected, onClick, style: extraStyle = {} }) {
    const baseStyle = selected
        ? { background: tag.color, borderColor: tag.color, color: 'white', ...extraStyle }
        : { ...extraStyle };

    return (
        <span
            className={`tag-chip${selected ? ' selected' : ''}${onClick ? ' filter' : ''}`}
            style={baseStyle}
            onClick={onClick}
        >
            {tag.name}
        </span>
    );
}
