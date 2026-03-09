import { useState, useCallback } from 'react';
import * as api from '../api.js';

export function useTags() {
    const [tags, setTags] = useState([]);

    const loadTags = useCallback(async () => {
        const data = await api.getTags();
        setTags(data);
        return data;
    }, []);

    const addTag = useCallback(async (name, color) => {
        await api.createTag(name, color);
        const data = await api.getTags();
        setTags(data);
        return data;
    }, []);

    const editTag = useCallback(async (id, name, color) => {
        await api.updateTag(id, name, color);
        const data = await api.getTags();
        setTags(data);
        return data;
    }, []);

    const removeTag = useCallback(async (id) => {
        await api.deleteTag(id);
        const data = await api.getTags();
        setTags(data);
        return data;
    }, []);

    return { tags, loadTags, addTag, editTag, removeTag };
}
