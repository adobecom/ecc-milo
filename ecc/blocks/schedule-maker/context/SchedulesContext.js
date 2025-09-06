/* eslint-disable max-len */
import { createContext } from '../../../scripts/libs/preact.js';
import { useState, useContext, useCallback, useEffect, useMemo } from '../../../scripts/libs/preact-hook.js';
import { html } from '../htm-wrapper.js';
import {
  getSchedules as getSchedulesController,
  createSchedule as createScheduleController,
  updateSchedule as updateScheduleController,
  deleteSchedule as deleteScheduleController,
} from '../../../scripts/esp-controller.js';
import {
  decorateSchedules,
  decorateSchedule,
  assignIdToBlocks,
  isBlockComplete,
  isScheduleComplete,
  createServerFriendlySchedule,
} from '../utils.js';

const SchedulesContext = createContext();

const SchedulesProvider = ({ children }) => {
  const [schedules, setSchedules] = useState([]);
  const [originalActiveSchedule, setOriginalActiveSchedule] = useState(null);
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [toastSuccess, setToastSuccess] = useState(null);

  const hasUnsavedChanges = useMemo(() => {
    const originalStringifiedSchedule = JSON.stringify(createServerFriendlySchedule(originalActiveSchedule));
    const currentStringifiedSchedule = JSON.stringify(createServerFriendlySchedule(activeSchedule));
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
      setError(err.message || 'Failed to get schedules');
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
      const serverFriendlySchedule = createServerFriendlySchedule(schedule);
      const newSchedule = await createScheduleController(serverFriendlySchedule);
      const decoratedNewSchedule = decorateSchedule(newSchedule);
      setSchedules([decoratedNewSchedule, ...schedules]);
      setToastSuccess('Schedule created successfully');
      return decoratedNewSchedule;
    } catch (err) {
      setToastError(err.message || 'Failed to create schedule');
      return err;
    } finally {
      setIsCreating(false);
    }
  }, [schedules]);

  // Update schedule
  const updateSchedule = useCallback(async (scheduleId, schedule) => {
    setIsUpdating(true);
    setToastError(null);
    try {
      const serverFriendlySchedule = createServerFriendlySchedule(schedule);
      const updatedScheduleResponse = await updateScheduleController(scheduleId, serverFriendlySchedule);
      const updatedSchedule = { ...schedule, modificationTime: updatedScheduleResponse.modificationTime, isComplete: isScheduleComplete(schedule) };
      const decoratedUpdatedSchedule = decorateSchedule(updatedSchedule);
      setSchedules(schedules.map((s) => (s.scheduleId === scheduleId ? decoratedUpdatedSchedule : s)));
      setActiveScheduleWithOriginal(decoratedUpdatedSchedule);
      setToastError(null);
      setToastSuccess('Schedule updated successfully');
      return decoratedUpdatedSchedule;
    } catch (err) {
      setToastError(err.message || 'Failed to update schedule');
      return err;
    } finally {
      setIsUpdating(false);
    }
  }, [schedules]);

  // Delete schedule
  const deleteSchedule = useCallback(async (scheduleId) => {
    setIsDeleting(true);
    setToastError(null);
    try {
      await deleteScheduleController(scheduleId);
      setSchedules(schedules.filter((schedule) => schedule.scheduleId !== scheduleId));
      setActiveSchedule(null);
      setOriginalActiveSchedule(null);
      setToastError(null);
      setToastSuccess('Schedule deleted successfully');
      return true;
    } catch (err) {
      setToastError(err.message || 'Failed to delete schedule');
      return err;
    } finally {
      setIsDeleting(false);
    }
  }, [schedules]);

  // Update schedule locally
  const updateScheduleLocally = useCallback((title) => {
    setToastError(null);
    const updatedSchedule = { ...activeSchedule, title };
    const isScheduleCompleted = isScheduleComplete(updatedSchedule);
    setActiveSchedule({ ...updatedSchedule, isComplete: isScheduleCompleted });
    setToastError(null);
  }, [activeSchedule]);

  // Discard changes locally
  const discardChangesToActiveSchedule = useCallback(() => {
    setActiveSchedule(originalActiveSchedule);
    setToastError(null);
  }, [originalActiveSchedule]);

  // Add block locally
  const addBlockLocally = useCallback((block) => {
    if (!activeSchedule) return;
    const updatedBlocks = [...activeSchedule.blocks, block];
    const isScheduleCompleted = isScheduleComplete(activeSchedule);
    setActiveSchedule({ ...activeSchedule, blocks: updatedBlocks, isComplete: isScheduleCompleted });
    setToastError(null);
  }, [activeSchedule]);

  // Update block locally
  const updateBlockLocally = useCallback((blockId, updates) => {
    if (!activeSchedule) return;
    const blockToUpdate = activeSchedule.blocks.find((b) => b.id === blockId);
    if (!blockToUpdate) return;
    const updatedBlock = { ...blockToUpdate, ...updates };
    updatedBlock.isComplete = isBlockComplete(updatedBlock);
    const updatedBlocks = activeSchedule.blocks.map((b) => (b.id === blockId ? updatedBlock : b));
    const isScheduleCompleted = isScheduleComplete(activeSchedule);
    setActiveSchedule({ ...activeSchedule, blocks: updatedBlocks, isComplete: isScheduleCompleted });
    setToastError(null);
  }, [activeSchedule]);

  // Delete block locally
  const deleteBlockLocally = useCallback((blockId) => {
    if (!activeSchedule) return;
    const updatedBlocks = activeSchedule.blocks.filter((b) => b.id !== blockId);
    setActiveSchedule({ ...activeSchedule, blocks: updatedBlocks });
  }, [activeSchedule]);

  // Clear toast error
  const clearToastError = useCallback(() => {
    setToastError(null);
  }, []);

  // Clear toast success
  const clearToastSuccess = useCallback(() => {
    setToastSuccess(null);
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
    discardChangesToActiveSchedule,
    updateScheduleLocally,
    addBlockLocally,
    updateBlockLocally,
    deleteBlockLocally,
    deleteSchedule,
    hasUnsavedChanges,
    toastSuccess,
    clearToastSuccess,
    setToastSuccess,
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
