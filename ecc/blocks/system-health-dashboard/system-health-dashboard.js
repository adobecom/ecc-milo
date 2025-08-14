import { LIBS } from '../../scripts/scripts.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

export default async function init(el) {
  const dashboard = createTag('system-health-dashboard');
  const data = await fetch('/ecc/blocks/system-health-dashboard/mock-report-data.json');
  const json = await data.json();
  dashboard.data = json;
  el.append(dashboard);
}
