import { LIBS } from '../../scripts/scripts.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

export default async function init(el) {
  // Import the dashboard component
  await import('./components/dashboard.js');
  
  // Fetch the mock data
  const data = await fetch('/ecc/blocks/system-health-dashboard/mock-report-data.json');
  const json = await data.json();
  
  // Create and configure the dashboard
  const dashboard = createTag('system-health-dashboard');
  dashboard.data = json;
  
  // Append to the element
  el.append(dashboard);
}
