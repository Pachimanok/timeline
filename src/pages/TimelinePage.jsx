import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useEvents } from '../hooks/useEvents.js';
import { useTags } from '../hooks/useTags.js';
import { getUsers } from '../api.js';
import Topbar from '../components/Topbar.jsx';
import FiltersBar from '../components/FiltersBar.jsx';
import TimelineCanvas from '../components/TimelineCanvas.jsx';
import EventModal from '../components/EventModal.jsx';
import EventDetailPopover from '../components/EventDetailPopover.jsx';
import TagManagerModal from '../components/TagManagerModal.jsx';

export default function TimelinePage() {
    const { currentUser, logout } = useAuth();

    // Events
    const { events, loadEvents, saveEvent, removeEvent } = useEvents();
    const [activeTagIds, setActiveTagIds] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState(null);

    // Tags
    const { tags, loadTags, addTag, editTag, removeTag } = useTags();

    // Admin
    const [users, setUsers] = useState([]);

    // Modals
    const [eventModalOpen, setEventModalOpen] = useState(false);
    const [editingEvent, setEditingEvent] = useState(null);
    const [tagsModalOpen, setTagsModalOpen] = useState(false);

    // Popover
    const [popoverEvent, setPopoverEvent] = useState(null);
    const [popoverRect, setPopoverRect] = useState(null);

    // Initial load
    useEffect(() => {
        loadTags();
        loadEvents(selectedUserId);
        if (currentUser?.role === 'admin') {
            getUsers().then(setUsers).catch(console.error);
        }
    }, []);

    // Reload events when selectedUserId changes
    useEffect(() => {
        loadEvents(selectedUserId);
    }, [selectedUserId]);

    // Filtered events
    const filteredEvents = activeTagIds.length === 0
        ? events
        : events.filter((e) => e.tags?.some((t) => activeTagIds.includes(t.id)));

    // Handlers
    const handleEventClick = useCallback((event, el) => {
        setPopoverEvent(event);
        setPopoverRect(el.getBoundingClientRect());
    }, []);

    const handleSaveEvent = async (data, editId) => {
        try {
            await saveEvent(data, editId);
            await loadEvents(selectedUserId);
        } catch (err) {
            alert('Error al guardar: ' + err.message);
        }
    };

    const handleDeleteEvent = async (id) => {
        try {
            await removeEvent(id);
            setPopoverEvent(null);
            await loadEvents(selectedUserId);
        } catch (err) {
            alert('Error al eliminar: ' + err.message);
        }
    };

    const handleAddTag = async (name, color) => {
        await addTag(name, color);
    };

    const handleEditTag = async (id, name, color) => {
        await editTag(id, name, color);
    };

    const handleDeleteTag = async (id) => {
        await removeTag(id);
        await loadEvents(selectedUserId); // reload since tag links changed
    };

    return (
        <div className="page">
            <Topbar
                currentUser={currentUser}
                onAddEvent={() => { setEditingEvent(null); setEventModalOpen(true); }}
                onManageTags={() => setTagsModalOpen(true)}
                onLogout={logout}
                users={users}
                selectedUserId={selectedUserId}
                onSelectUser={setSelectedUserId}
            />

            <FiltersBar
                tags={tags}
                activeTagIds={activeTagIds}
                onFilter={setActiveTagIds}
            />

            <TimelineCanvas
                events={filteredEvents}
                onEventClick={handleEventClick}
            />

            {/* Event modal */}
            <EventModal
                open={eventModalOpen}
                event={editingEvent}
                tags={tags}
                onSave={handleSaveEvent}
                onDelete={handleDeleteEvent}
                onClose={() => setEventModalOpen(false)}
            />

            {/* Tag manager */}
            <TagManagerModal
                open={tagsModalOpen}
                tags={tags}
                onClose={() => setTagsModalOpen(false)}
                onAdd={handleAddTag}
                onEdit={handleEditTag}
                onDelete={handleDeleteTag}
            />

            {/* Event detail popover */}
            {popoverEvent && (
                <EventDetailPopover
                    event={popoverEvent}
                    anchorRect={popoverRect}
                    onEdit={() => {
                        setPopoverEvent(null);
                        setEditingEvent(popoverEvent);
                        setEventModalOpen(true);
                    }}
                    onClose={() => setPopoverEvent(null)}
                />
            )}
        </div>
    );
}
