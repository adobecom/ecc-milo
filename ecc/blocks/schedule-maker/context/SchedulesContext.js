import { createContext } from '../../../scripts/libs/preact.js';
import { useState, useContext, useCallback, useEffect } from '../../../scripts/libs/preact-hook.js';
import { html } from '../htm-wrapper.js';
import { getSchedules as getSchedulesController, createSchedule as createScheduleController } from '../../../scripts/esp-controller.js';

const SchedulesContext = createContext();

const SchedulesProvider = ({ children }) => {
  const [schedules, setSchedules] = useState([]);
  const [activeSchedule, setActiveSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get all schedules
  const getSchedules = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getSchedulesController();
      setSchedules(response.schedules);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Create a new schedule and add it to the schedules list
  const createAndAddSchedule = useCallback(async (schedule) => {
    const newSchedule = await createScheduleController(schedule);
    setSchedules([...schedules, newSchedule]);
    return newSchedule;
  }, [schedules]);

  // On mount, get schedules
  useEffect(() => {
    getSchedules();
  }, [getSchedules]);

  const value = {
    schedules,
    setSchedules,
    activeSchedule,
    setActiveSchedule,
    isLoading,
    setIsLoading,
    error,
    setError,
    createAndAddSchedule,
  };

  return html`
    <${SchedulesContext.Provider} value=${value}>
      ${children}
    </${SchedulesContext.Provider}>
  `;
};

const useSchedules = () => {
  const {
    schedules,
    setSchedules,
    activeSchedule,
    setActiveSchedule,
    isLoading,
    setIsLoading,
    error,
    setError,
    createAndAddSchedule,
  } = useContext(SchedulesContext);

  return {
    schedules,
    setSchedules,
    activeSchedule,
    setActiveSchedule,
    isLoading,
    setIsLoading,
    error,
    setError,
    createAndAddSchedule,
  };
};

export { SchedulesContext, SchedulesProvider, useSchedules };
