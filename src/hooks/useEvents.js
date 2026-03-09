import { useState, useCallback } from 'react';
import * as api from '../api.js';

export function useEvents() {
    const [events, setEvents] = useState([]);

    const loadEvents = useCallback(async (userId = null) => {
        try {
            const data = await api.getEvents(userId);
            setEvents(data);
            return data;
        } catch (err) {
            console.error('Error loading events:', err);
            return [];
        }
    }, []);

    const saveEvent = useCallback(async (data, editId = null) => {
        if (editId) {
            await api.updateEvent(editId, data);
        } else {
            await api.createEvent(data);
        }
    }, []);

    const removeEvent = useCallback(async (id) => {
        await api.deleteEvent(id);
    }, []);

    return { events, loadEvents, saveEvent, removeEvent };
}
