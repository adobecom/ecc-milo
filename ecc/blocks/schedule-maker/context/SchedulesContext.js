/* eslint-disable max-len */
import { createContext } from '../../../scripts/libs/preact.js';
import { useState, useContext, useCallback, useEffect, useMemo } from '../../../scripts/libs/preact-hook.js';
import { html } from '../htm-wrapper.js';
import { getSchedules as getSchedulesController, createSchedule as createScheduleController } from '../../../scripts/esp-controller.js';
import { decorateSchedules, assignIdToBlocks } from '../utils.js';

const SchedulesContext = createContext();

const SchedulesProvider = ({ children }) => {
  const [schedules, setSchedules] = useState([]);
  const [originalActiveSchedule, setOriginalActiveSchedule] = useState(null);
  const [activeSchedule, setActiveSchedule] = useState(null);

  const hasUnsavedChanges = useMemo(() => {
    const originalStringifiedSchedule = JSON.stringify(originalActiveSchedule);
    const currentStringifiedSchedule = JSON.stringify(activeSchedule);
    return originalStringifiedSchedule !== currentStringifiedSchedule;
  }, [originalActiveSchedule, activeSchedule]);

  // Granular loading states
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Error states
  const [error, setError] = useState(null);
  const [toastError, setToastError] = useState(null);

  // Get all schedules
  const getSchedules = useCallback(async () => {
    setIsInitialLoading(true);
    setError(null);
    try {
      const { schedules: responseSchedules } = await getSchedulesController();
      const decoratedSchedules = decorateSchedules(responseSchedules);
      setSchedules(decoratedSchedules);
    } catch (err) {
      setError(err);
    } finally {
      setIsInitialLoading(false);
    }
  }, []);

  const setActiveScheduleWithOriginal = useCallback((schedule) => {
    assignIdToBlocks(schedule);
    setOriginalActiveSchedule(schedule);
    setActiveSchedule(schedule);
  }, []);

  // Create a new schedule and add it to the schedules list
  const createAndAddSchedule = useCallback(async (schedule) => {
    setIsCreating(true);
    setToastError(null);
    try {
      const newSchedule = await createScheduleController(schedule);
      setSchedules([newSchedule, ...schedules]);
      return newSchedule;
    } catch (err) {
      setToastError(err.message || 'Failed to create schedule');
      throw err;
    } finally {
      setIsCreating(false);
    }
  }, [schedules]);

  // Update schedule (placeholder for future implementation)
  const updateSchedule = useCallback(async (scheduleId, updates) => {
    setIsUpdating(true);
    setToastError(null);
    try {
      // TODO: Implement updateScheduleController when available
      console.log('Update schedule:', scheduleId, updates);
      setToastError('Update functionality not yet implemented');
      throw new Error('Update functionality not yet implemented');
    } catch (err) {
      setToastError(err.message || 'Failed to update schedule');
      throw err;
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const addBlock = useCallback((block) => {
    console.log('Add block from context:', block);
    try {
      console.log('Active schedule from context:', activeSchedule);
      if (!activeSchedule) return;
      console.log('Active schedule from context:', activeSchedule);
      const updatedBlocks = [...activeSchedule.blocks, block];
      console.log('Updated blocks from context:', updatedBlocks);
      setActiveSchedule({ ...activeSchedule, blocks: updatedBlocks });
      setToastError(null);
    } catch (err) {
      setToastError(err.message || 'Failed to add block');
      throw err;
    }
  }, [activeSchedule]);

  const updateBlock = useCallback((blockId, updates) => {
    if (!activeSchedule) return;
    setToastError(null);
    try {
      console.log('Update block:', blockId, updates);
      setToastError('Update block functionality not yet implemented');
      throw new Error('Update block functionality not yet implemented');
    } catch (err) {
      setToastError(err.message || 'Failed to update block');
      throw err;
    }
  }, [activeSchedule]);

  // Delete schedule (placeholder for future implementation)
  const deleteSchedule = useCallback(async (scheduleId) => {
    setIsDeleting(true);
    setToastError(null);
    try {
      // TODO: Implement deleteScheduleController when available
      console.log('Delete schedule:', scheduleId);
      setToastError('Delete functionality not yet implemented');
      throw new Error('Delete functionality not yet implemented');
    } catch (err) {
      setToastError(err.message || 'Failed to delete schedule');
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  // Clear toast error
  const clearToastError = useCallback(() => {
    setToastError(null);
  }, []);

  // On mount, get schedules
  useEffect(() => {
    getSchedules();
  }, [getSchedules]);

  const value = {
    schedules,
    setSchedules,
    activeSchedule,
    setActiveSchedule: setActiveScheduleWithOriginal,
    isInitialLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    toastError,
    clearToastError,
    createAndAddSchedule,
    updateSchedule,
    addBlock,
    updateBlock,
    deleteSchedule,
    hasUnsavedChanges,
  };

  return html`
    <${SchedulesContext.Provider} value=${value}>
      ${children}
    </${SchedulesContext.Provider}>
  `;
};

const useSchedules = () => {
  const context = useContext(SchedulesContext);
  return context;
};

export { SchedulesContext, SchedulesProvider, useSchedules };
