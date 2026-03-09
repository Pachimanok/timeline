import React, { useRef, useEffect, useCallback } from 'react';

// ─── Date helpers ────────────────────────────────────────────────────────────

const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function formatHistoricDate(year, month, day, era) {
    if (!year && year !== 0) return '';
    const parts = [];
    if (day) parts.push(day);
    if (month) parts.push(MONTHS[month - 1]);
    parts.push(Math.abs(year));
    parts.push(era === 'AC' ? 'a.C.' : 'd.C.');
    return parts.join(' ');
}

function toNumericDate(year, month, day, era) {
    const y = era === 'AC' ? -year : year;
    const m = (month || 1) / 12;
    const d = (day || 1) / 365;
    return y + m + d;
}

function eventStartValue(event) {
    return toNumericDate(event.start_year, event.start_month, event.start_day, event.start_era || 'DC');
}

function eventEndValue(event) {
    if (event.end_year != null) {
        return toNumericDate(event.end_year, event.end_month, event.end_day, event.end_era || 'DC');
    }
    return eventStartValue(event);
}

function getTagColor(event) {
    if (event.tags && event.tags.length > 0) return event.tags[0].color;
    return '#6366f1';
}

function getPosition(numericVal, minVal, totalRange, width) {
    const axisLeft = 40;
    const axisRight = 40;
    const usable = width - axisLeft - axisRight;
    const pct = (numericVal - minVal) / totalRange;
    return axisLeft + pct * usable;
}

// ─── Renderer (imperative, same logic as original timeline.js) ───────────────

function renderTimeline(container, wrapper, events, zoom, onEventClick, emptyEl) {
    container.innerHTML = '';

    if (events.length === 0) {
        if (emptyEl) emptyEl.classList.remove('hidden');
        return;
    }
    if (emptyEl) emptyEl.classList.add('hidden');

    let minVal = Infinity, maxVal = -Infinity;
    for (const e of events) {
        const start = eventStartValue(e);
        const end = eventEndValue(e);
        if (start < minVal) minVal = start;
        if (end > maxVal) maxVal = end;
        if (start > maxVal) maxVal = start;
    }

    const now = new Date();
    const todayVal = toNumericDate(now.getFullYear(), now.getMonth() + 1, now.getDate(), 'DC');
    if (todayVal > maxVal) maxVal = todayVal;
    if (todayVal < minVal) minVal = todayVal;

    const range = maxVal - minVal || 1;
    const padding = range * 0.08;
    minVal -= padding;
    maxVal += padding;
    const totalRange = maxVal - minVal;

    const baseWidth = Math.max(wrapper.clientWidth, 800);
    const timelineWidth = baseWidth * zoom;
    container.style.width = `${timelineWidth}px`;
    container.style.minWidth = `${timelineWidth}px`;

    // Axis
    const axis = document.createElement('div');
    axis.className = 'timeline-axis';
    container.appendChild(axis);

    // Markers
    const span = maxVal - minVal;
    let interval;
    if (span <= 2) interval = 1;
    else if (span <= 20) interval = 5;
    else if (span <= 100) interval = 10;
    else if (span <= 500) interval = 50;
    else if (span <= 2000) interval = 100;
    else interval = 500;

    const axisLeft = 40, axisRight = 40;
    const usableWidth = timelineWidth - axisLeft - axisRight;
    let startYear = Math.floor(minVal / interval) * interval;

    for (let y = startYear; y <= maxVal; y += interval) {
        if (y < minVal) continue;
        const pct = (y - minVal) / totalRange;
        const x = axisLeft + pct * usableWidth;

        const marker = document.createElement('div');
        marker.className = 'timeline-marker';
        marker.style.left = `${x}px`;

        const line = document.createElement('div');
        line.className = 'timeline-marker-line';

        const label = document.createElement('div');
        label.className = 'timeline-marker-label';
        if (y < 0) label.textContent = `${Math.abs(Math.round(y))} a.C.`;
        else if (y === 0) label.textContent = '0';
        else label.textContent = `${Math.round(y)} d.C.`;

        marker.appendChild(line);
        marker.appendChild(label);
        container.appendChild(marker);
    }

    // Events
    const sorted = [...events].sort((a, b) => eventStartValue(a) - eventStartValue(b));
    sorted.forEach((event, index) => {
        const isTop = index % 2 === 0;
        const hasEnd = event.end_year != null && eventEndValue(event) !== eventStartValue(event);
        if (hasEnd) {
            drawRangeEvent(container, event, minVal, totalRange, timelineWidth, isTop, index, onEventClick);
        } else {
            drawPointEvent(container, event, minVal, totalRange, timelineWidth, isTop, index, onEventClick);
        }
    });

    // Today marker
    const x = getPosition(todayVal, minVal, totalRange, timelineWidth);
    const todayMarker = document.createElement('div');
    todayMarker.className = 'timeline-today-marker';
    todayMarker.style.left = `${x}px`;
    todayMarker.title = 'Hoy';

    const dot = document.createElement('div'); dot.className = 'today-dot';
    const pulse = document.createElement('div'); pulse.className = 'today-pulse';
    const todayLabel = document.createElement('div'); todayLabel.className = 'today-label'; todayLabel.textContent = 'Hoy';

    todayMarker.appendChild(pulse);
    todayMarker.appendChild(dot);
    todayMarker.appendChild(todayLabel);
    container.appendChild(todayMarker);
}

function drawPointEvent(container, event, minVal, totalRange, width, isTop, index, onEventClick) {
    const val = eventStartValue(event);
    const x = getPosition(val, minVal, totalRange, width);
    const color = getTagColor(event);

    const el = document.createElement('div');
    el.className = 'timeline-event-point';
    el.style.left = `${x}px`;
    el.style.animationDelay = `${index * 60}ms`;

    const node = document.createElement('div');
    node.className = 'event-node';
    node.style.background = color;
    node.style.boxShadow = `0 0 12px ${color}80`;
    el.appendChild(node);

    const label = document.createElement('div');
    label.className = `event-label ${isTop ? 'event-label-top' : 'event-label-bottom'}`;
    label.innerHTML = `${event.title}<span class="event-label-date">${formatHistoricDate(event.start_year, event.start_month, event.start_day, event.start_era || 'DC')}</span>`;
    el.appendChild(label);

    el.addEventListener('click', (e) => { e.stopPropagation(); onEventClick?.(event, el); });
    container.appendChild(el);
}

function drawRangeEvent(container, event, minVal, totalRange, width, isTop, index, onEventClick) {
    const startVal = eventStartValue(event);
    const endVal = eventEndValue(event);
    const x1 = getPosition(startVal, minVal, totalRange, width);
    const x2 = getPosition(endVal, minVal, totalRange, width);
    const color = getTagColor(event);
    const barWidth = Math.max(x2 - x1, 40);

    const el = document.createElement('div');
    el.className = 'timeline-event-range';
    el.style.left = `${x1}px`;
    el.style.width = `${barWidth}px`;
    el.style.animationDelay = `${index * 60}ms`;
    el.style.top = `calc(50% + ${isTop ? -28 : 10}px)`;

    const bar = document.createElement('div');
    bar.className = 'event-range-bar';
    bar.style.background = `linear-gradient(135deg, ${color}cc, ${color}88)`;
    bar.style.boxShadow = `0 2px 12px ${color}40`;

    const span = document.createElement('span');
    span.textContent = event.title;
    bar.appendChild(span);
    el.appendChild(bar);

    const dateLabel = document.createElement('div');
    dateLabel.className = `event-range-label ${isTop ? 'event-range-label-top' : 'event-range-label-bottom'}`;
    const startFmt = formatHistoricDate(event.start_year, event.start_month, event.start_day, event.start_era || 'DC');
    const endFmt = formatHistoricDate(event.end_year, event.end_month, event.end_day, event.end_era || 'DC');
    dateLabel.textContent = `${startFmt} — ${endFmt}`;
    el.appendChild(dateLabel);

    el.addEventListener('click', (e) => { e.stopPropagation(); onEventClick?.(event, el); });
    container.appendChild(el);
}

// ─── React Component ─────────────────────────────────────────────────────────

export default function TimelineCanvas({ events, onEventClick }) {
    const containerRef = useRef(null);
    const wrapperRef = useRef(null);
    const emptyRef = useRef(null);
    const zoomRef = useRef(1);
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, scroll: 0 });

    const redraw = useCallback(() => {
        if (!containerRef.current || !wrapperRef.current) return;
        renderTimeline(
            containerRef.current,
            wrapperRef.current,
            events,
            zoomRef.current,
            onEventClick,
            emptyRef.current,
        );
    }, [events, onEventClick]);

    useEffect(() => {
        redraw();
    }, [redraw]);

    // Drag to scroll
    useEffect(() => {
        const el = wrapperRef.current;
        if (!el) return;

        const onMouseDown = (e) => {
            if (e.target.closest('.timeline-event-point, .timeline-event-range')) return;
            isDraggingRef.current = true;
            dragStartRef.current = { x: e.pageX, scroll: el.scrollLeft };
            el.style.cursor = 'grabbing';
        };
        const onMouseMove = (e) => {
            if (!isDraggingRef.current) return;
            el.scrollLeft = dragStartRef.current.scroll - (e.pageX - dragStartRef.current.x);
        };
        const onMouseUp = () => {
            isDraggingRef.current = false;
            el.style.cursor = 'grab';
        };

        el.addEventListener('mousedown', onMouseDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        return () => {
            el.removeEventListener('mousedown', onMouseDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
    }, []);

    const zoomIn = () => {
        zoomRef.current = Math.min(zoomRef.current * 1.3, 5);
        redraw();
    };
    const zoomOut = () => {
        zoomRef.current = Math.max(zoomRef.current / 1.3, 0.3);
        redraw();
    };
    const fitToView = () => {
        zoomRef.current = 1;
        redraw();
        if (wrapperRef.current) wrapperRef.current.scrollLeft = 0;
    };

    return (
        <div className="timeline-wrapper">
            <div className="timeline-controls">
                <button className="btn btn-ghost btn-sm" title="Acercar" onClick={zoomIn}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="11" y1="8" x2="11" y2="14" /><line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                </button>
                <button className="btn btn-ghost btn-sm" title="Alejar" onClick={zoomOut}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                        <line x1="8" y1="11" x2="14" y2="11" />
                    </svg>
                </button>
                <button className="btn btn-ghost btn-sm" title="Ajustar" onClick={fitToView}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                    </svg>
                </button>
            </div>
            <div ref={wrapperRef} className="timeline-container">
                <div ref={containerRef} className="timeline" />
            </div>
            <p ref={emptyRef} className="empty-state hidden">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.4">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>No hay eventos aún. ¡Creá tu primer evento!</span>
            </p>
        </div>
    );
}
