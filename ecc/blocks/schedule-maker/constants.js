const PAGES = {
  home: 'home',
  schedules: 'schedules',
};

const PAGES_CONFIG = {
  home: {
    label: 'Home',
    pageComponent: PAGES.home,
  },
  editSchedule: {
    label: 'Edit Schedule',
    pageComponent: PAGES.schedules,
    mode: 'edit',
  },
  importSheet: {
    label: 'Import Sheet',
    pageComponent: PAGES.schedules,
    mode: 'import',
  },
};

export { PAGES, PAGES_CONFIG };
