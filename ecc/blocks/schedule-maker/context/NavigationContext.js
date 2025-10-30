import { useState, useContext, useCallback } from '../../../scripts/deps/preact-hook.js';
import { createContext } from '../../../scripts/deps/preact.js';
import { html } from '../htm-wrapper.js';
import { PAGES_CONFIG } from '../constants.js';
import { useSchedulesUI } from './SchedulesContext.js';

const NavigationContext = createContext();

const NavigationProvider = ({ children }) => {
  const [activePage, setActivePage] = useState(PAGES_CONFIG.home);
  const { hasUnsavedChanges } = useSchedulesUI();
  const [importSheetScheduleName, setImportSheetScheduleName] = useState(null);

  const goToEditSchedule = useCallback(() => {
    if (hasUnsavedChanges) {
      alert('You have unsaved changes. Please save or discard them before editing a schedule.');
      return;
    }
    setActivePage(PAGES_CONFIG.editSchedule);
  }, [hasUnsavedChanges]);

  const goToSheetImport = useCallback((scheduleName) => {
    if (hasUnsavedChanges) {
      alert('You have unsaved changes. Please save or discard them before importing a sheet.');
      return;
    }
    setActivePage(PAGES_CONFIG.importSheet);
    setImportSheetScheduleName(scheduleName);
  }, [hasUnsavedChanges]);

  const goToHome = useCallback(() => {
    if (hasUnsavedChanges) {
      alert('You have unsaved changes. Please save or discard them before going to home.');
      return;
    }
    setActivePage(PAGES_CONFIG.home);
  }, [hasUnsavedChanges]);

  const clearImportSheetScheduleName = useCallback(() => {
    setImportSheetScheduleName(null);
  }, []);

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
