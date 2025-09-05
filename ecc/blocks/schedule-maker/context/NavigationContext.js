import { useState, useContext } from '../../../scripts/libs/preact-hook.js';
import { createContext } from '../../../scripts/libs/preact.js';
import { html } from '../htm-wrapper.js';
import { PAGES_CONFIG } from '../constants.js';
import { useSchedules } from './SchedulesContext.js';

const NavigationContext = createContext();

const NavigationProvider = ({ children }) => {
  const [activePage, setActivePage] = useState(PAGES_CONFIG.editSchedule);
  const { hasUnsavedChanges } = useSchedules();

  const goToEditSchedule = () => {
    if (hasUnsavedChanges) {
      alert('You have unsaved changes. Please save or discard them before editing a schedule.');
      return;
    }
    setActivePage(PAGES_CONFIG.editSchedule);
  };

  const goToSheetImport = () => {
    if (hasUnsavedChanges) {
      alert('You have unsaved changes. Please save or discard them before importing a sheet.');
      return;
    }
    setActivePage(PAGES_CONFIG.importSheet);
  };

  const goToHome = () => {
    if (hasUnsavedChanges) {
      alert('You have unsaved changes. Please save or discard them before going to home.');
      return;
    }
    setActivePage(PAGES_CONFIG.home);
  };

  const value = {
    activePage,
    setActivePage,
    goToEditSchedule,
    goToSheetImport,
    goToHome,
  };

  return html`
    <${NavigationContext.Provider} value=${value}>
      ${children}
    </${NavigationContext.Provider}>
  `;
};

// A custom hook to use the NavigationContext
const useNavigation = () => {
  const context = useContext(NavigationContext);
  return context;
};

export { NavigationContext, NavigationProvider, useNavigation };
