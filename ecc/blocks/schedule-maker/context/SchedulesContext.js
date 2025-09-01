import { createContext } from '../../../scripts/libs/preact.js';
import { useState, useContext, useCallback, useEffect } from '../../../scripts/libs/preact-hook.js';
import { html } from '../htm-wrapper.js';
import { getSchedules as getSchedulesController, createSchedule as createScheduleController } from '../../../scripts/esp-controller.js';

const SchedulesContext = createContext();

const SchedulesProvider = ({ children }) => {
  const [schedules, setSchedules] = useState([]);
  const [activeSchedule, setActiveSchedule] = useState(null);

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
      // eslint-disable-next-line max-len
      const sortedByModificationTime = responseSchedules.sort((a, b) => new Date(b.modificationTime) - new Date(a.modificationTime));
      setSchedules(sortedByModificationTime);
    } catch (err) {
      setError(err);
    } finally {
      setIsInitialLoading(false);
    }
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
    setActiveSchedule,
    isInitialLoading,
    isCreating,
    isUpdating,
    isDeleting,
    error,
    toastError,
    clearToastError,
    createAndAddSchedule,
    updateSchedule,
    deleteSchedule,
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
