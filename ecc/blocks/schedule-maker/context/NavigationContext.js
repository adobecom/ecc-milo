import { useState, useContext } from '../../../scripts/libs/preact-hook.js';
import { createContext } from '../../../scripts/libs/preact.js';
import { html } from '../htm-wrapper.js';
import { PAGES_CONFIG } from '../constants.js';
import { useSchedules } from './SchedulesContext.js';

const NavigationContext = createContext();

const NavigationProvider = ({ children }) => {
  const [activePage, setActivePage] = useState(PAGES_CONFIG.editSchedule);
  const { hasUnsavedChanges } = useSchedules();
  const [importSheetScheduleName, setImportSheetScheduleName] = useState(null);

  const goToEditSchedule = () => {
    if (hasUnsavedChanges) {
      alert('You have unsaved changes. Please save or discard them before editing a schedule.');
      return;
    }
    setActivePage(PAGES_CONFIG.editSchedule);
  };

  const goToSheetImport = (scheduleName) => {
    if (hasUnsavedChanges) {
      alert('You have unsaved changes. Please save or discard them before importing a sheet.');
      return;
    }
    setActivePage(PAGES_CONFIG.importSheet);
    setImportSheetScheduleName(scheduleName);
  };

  const goToHome = () => {
    if (hasUnsavedChanges) {
      alert('You have unsaved changes. Please save or discard them before going to home.');
      return;
    }
    setActivePage(PAGES_CONFIG.home);
  };

  const clearImportSheetScheduleName = () => {
    setImportSheetScheduleName(null);
  };

  const value = {
    activePage,
    setActivePage,
    importSheetScheduleName,
    goToEditSchedule,
    goToSheetImport,
    goToHome,
    clearImportSheetScheduleName,
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
