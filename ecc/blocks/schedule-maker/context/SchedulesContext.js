/* eslint-disable max-len */
import { createContext } from '../../../scripts/deps/preact.js';
import { useState, useContext, useCallback, useEffect, useMemo } from '../../../scripts/deps/preact-hook.js';
import { html } from '../htm-wrapper.js';
import {
  getSchedules as getSchedulesController,
  createSchedule as createScheduleController,
  updateSchedule as updateScheduleController,
  deleteSchedule as deleteScheduleController,
} from '../../../scripts/esp-controller.js';
import {
  processSchedules,
  assignIdToBlocks,
  isBlockComplete,
  isScheduleComplete,
  prepareScheduleForServer,
  prepareScheduleForClient,
  validateSchedule,
} from '../utils.js';

const SchedulesContext = createContext();

const SchedulesProvider = ({ children }) => {
  const [schedules, setSchedules] = useState([]);
  const [originalActiveSchedule, setOriginalActiveSchedule] = useState(null);
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [toastSuccess, setToastSuccess] = useState(null);

  const hasUnsavedChanges = useMemo(() => {
    const originalStringifiedSchedule = JSON.stringify(prepareScheduleForServer(originalActiveSchedule));
    const currentStringifiedSchedule = JSON.stringify(prepareScheduleForServer(activeSchedule));
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
      const sortedSchedules = processSchedules(responseSchedules);
      setSchedules(sortedSchedules);
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
      // Validate schedule before creation
      const validationErrors = validateSchedule(schedule);
      if (validationErrors.length > 0) {
        const errorMessage = validationErrors.join('\n');
        setToastError(errorMessage);
        setIsCreating(false);
        return { error: errorMessage };
      }

      const serverFriendlySchedule = prepareScheduleForServer(schedule);
      const newSchedule = await createScheduleController(serverFriendlySchedule);
      const decoratedNewSchedule = prepareScheduleForClient(newSchedule);
      setSchedules((prevSchedules) => [decoratedNewSchedule, ...prevSchedules]);
      setToastSuccess('Schedule created successfully');
      return decoratedNewSchedule;
    } catch (err) {
      setToastError(err.message || 'Failed to create schedule');
      return err;
    } finally {
      setIsCreating(false);
    }
  }, []); // Removed schedules dependency - using functional update instead

  // Update schedule
  const updateSchedule = useCallback(async (scheduleId, schedule) => {
    setIsUpdating(true);
    setToastError(null);
    try {
      const serverFriendlySchedule = prepareScheduleForServer(schedule);
      const updatedScheduleResponse = await updateScheduleController(scheduleId, serverFriendlySchedule);
      const decoratedUpdatedSchedule = prepareScheduleForClient(updatedScheduleResponse);
      setSchedules((prevSchedules) => prevSchedules.map((s) => (s.scheduleId === scheduleId ? decoratedUpdatedSchedule : s)));
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
  }, []); // Removed schedules dependency - using functional update instead

  // Delete schedule
  const deleteSchedule = useCallback(async (scheduleId) => {
    setIsDeleting(true);
    setToastError(null);
    try {
      await deleteScheduleController(scheduleId);
      setSchedules((prevSchedules) => prevSchedules.filter((schedule) => schedule.scheduleId !== scheduleId));
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
  }, []); // Removed schedules dependency - using functional update instead

  // Update schedule locally
  const updateScheduleLocally = useCallback((title) => {
    setToastError(null);
    setActiveSchedule((prevSchedule) => {
      if (!prevSchedule) return prevSchedule;
      const updatedSchedule = { ...prevSchedule, title };
      const isScheduleCompleted = isScheduleComplete(updatedSchedule);
      return { ...updatedSchedule, isComplete: isScheduleCompleted };
    });
    setToastError(null);
  }, []); // Removed activeSchedule dependency - using functional update instead

  // Discard changes locally
  const discardChangesToActiveSchedule = useCallback(() => {
    setActiveSchedule(originalActiveSchedule);
    setToastError(null);
  }, [originalActiveSchedule]);

  // Add block locally
  const addBlockLocally = useCallback((block) => {
    setActiveSchedule((prevSchedule) => {
      if (!prevSchedule) return prevSchedule;
      const updatedBlocks = [...prevSchedule.blocks, block];
      const isScheduleCompleted = isScheduleComplete({ ...prevSchedule, blocks: updatedBlocks });
      return { ...prevSchedule, blocks: updatedBlocks, isComplete: isScheduleCompleted };
    });
    setToastError(null);
  }, []); // Removed activeSchedule dependency - using functional update instead

  // Update block locally
  const updateBlockLocally = useCallback((blockId, updates) => {
    setActiveSchedule((prevSchedule) => {
      if (!prevSchedule) return prevSchedule;
      const blockToUpdate = prevSchedule.blocks.find((b) => b.id === blockId);
      if (!blockToUpdate) return prevSchedule;

      const updatedBlock = { ...blockToUpdate, ...updates };
      updatedBlock.isComplete = isBlockComplete(updatedBlock);
      const updatedBlocks = prevSchedule.blocks.map((b) => (b.id === blockId ? updatedBlock : b));
      const isScheduleCompleted = isScheduleComplete({ ...prevSchedule, blocks: updatedBlocks });
      return { ...prevSchedule, blocks: updatedBlocks, isComplete: isScheduleCompleted };
    });
    setToastError(null);
  }, []); // Removed activeSchedule dependency - using functional update instead

  // Delete block locally
  const deleteBlockLocally = useCallback((blockId) => {
    setActiveSchedule((prevSchedule) => {
      if (!prevSchedule) return prevSchedule;
      const updatedBlocks = prevSchedule.blocks.filter((b) => b.id !== blockId);
      const isScheduleCompleted = isScheduleComplete({ ...prevSchedule, blocks: updatedBlocks });
      return { ...prevSchedule, blocks: updatedBlocks, isComplete: isScheduleCompleted };
    });
  }, []); // Removed activeSchedule dependency - using functional update instead

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
    setToastError,
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

// Selective hooks for better performance - components only re-render when specific data changes
export const useSchedulesData = () => {
  const context = useContext(SchedulesContext);
  return {
    schedules: context.schedules,
    activeSchedule: context.activeSchedule,
    originalActiveSchedule: context.originalActiveSchedule,
    setSchedules: context.setSchedules,
    setActiveSchedule: context.setActiveSchedule,
    hasUnsavedChanges: context.hasUnsavedChanges,
  };
};

export const useSchedulesOperations = () => {
  const context = useContext(SchedulesContext);
  return {
    createAndAddSchedule: context.createAndAddSchedule,
    updateSchedule: context.updateSchedule,
    deleteSchedule: context.deleteSchedule,
    updateScheduleLocally: context.updateScheduleLocally,
    addBlockLocally: context.addBlockLocally,
    updateBlockLocally: context.updateBlockLocally,
    deleteBlockLocally: context.deleteBlockLocally,
    discardChangesToActiveSchedule: context.discardChangesToActiveSchedule,
  };
};

export const useSchedulesUI = () => {
  const context = useContext(SchedulesContext);
  return {
    isInitialLoading: context.isInitialLoading,
    isCreating: context.isCreating,
    isUpdating: context.isUpdating,
    isDeleting: context.isDeleting,
    error: context.error,
    toastError: context.toastError,
    toastSuccess: context.toastSuccess,
    clearToastError: context.clearToastError,
    clearToastSuccess: context.clearToastSuccess,
    setToastSuccess: context.setToastSuccess,
    setToastError: context.setToastError,
  };
};

export { SchedulesContext, SchedulesProvider, useSchedules };
