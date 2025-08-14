import { LIBS } from '../../scripts/scripts.js';
import SystemHealthDashboard from './components/dashboard.js';
import DashboardToolbar from './components/dashboard-toolbar.js';
import MetricCard from './components/metric-card.js';
import { dashboardStore } from './store/dashboard-store.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

export default async function init(el) {
  // Register custom elements
  customElements.define('system-health-dashboard', SystemHealthDashboard);
  customElements.define('dashboard-toolbar', DashboardToolbar);
  customElements.define('metric-card', MetricCard);

  // Set loading state
  dashboardStore.setLoading(true);

  try {
    // Fetch the mock data
    const data = await fetch('/ecc/blocks/system-health-dashboard/mock-report-data.json');
    const json = await data.json();

    // Set data in the store
    dashboardStore.setData(json);

    // Create the dashboard component
    const dashboard = createTag('system-health-dashboard');

    // Append to the element
    el.append(dashboard);
  } catch (error) {
    dashboardStore.setError(error.message);
  }
}
