import { useState } from '../../../scripts/libs/preact-hook.js';
import { createContext } from '../../../scripts/libs/preact.js';
import { html } from '../htm-wrapper.js';
import { PAGES_CONFIG } from '../constants.js';

const NavigationContext = createContext();

const NavigationProvider = ({ children }) => {
  const [activePage, setActivePage] = useState(PAGES_CONFIG.editSchedule);

  const goToEditSchedule = () => {
    setActivePage(PAGES_CONFIG.editSchedule);
  };

  const goToSheetImport = () => {
    setActivePage(PAGES_CONFIG.importSheet);
  };

  const goToHome = () => {
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

export { NavigationContext, NavigationProvider };
