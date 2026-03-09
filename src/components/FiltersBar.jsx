import React from 'react';
import TagChip from './TagChip.jsx';

export default function FiltersBar({ tags, activeTagIds, onFilter }) {
    const toggle = (id) => {
        if (activeTagIds.includes(id)) {
            onFilter(activeTagIds.filter((t) => t !== id));
        } else {
            onFilter([...activeTagIds, id]);
        }
    };

    return (
        <div className="filters-bar glass-card" id="filters-bar">
            <div className="filters-label">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                <span>Filtrar:</span>
            </div>
            <div className="tag-chips">
                <span
                    className={`tag-chip filter${activeTagIds.length === 0 ? ' active' : ''}`}
                    style={activeTagIds.length === 0 ? { background: 'var(--accent-1)' } : {}}
                    onClick={() => onFilter([])}
                >
                    Todos
                </span>
                {tags.map((tag) => (
                    <TagChip
                        key={tag.id}
                        tag={tag}
                        selected={activeTagIds.includes(tag.id)}
                        onClick={() => toggle(tag.id)}
                    />
                ))}
            </div>
        </div>
    );
}
