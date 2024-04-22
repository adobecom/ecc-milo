import { getLibs } from '../../scripts/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

// list of controllers for the hanler to load
const SUPPORTED_COMPONENTS = [
  'checkbox',
  // 'event-info',
  // 'img-upload',
  // 'venu-info',
];

function initComponents(el) {
  SUPPORTED_COMPONENTS.forEach((comp) => {
    const mappedComponents = el.querySelectorAll(`.${comp}-component`);
    if (!mappedComponents?.length) return;

    mappedComponents.forEach(async (component) => {
      const { default: initComponent } = await import(`./controllers/${comp}-component-controller.js`);
      initComponent(component);
    });
  });
}

function decorateForm(el) {
  const cols = el.querySelectorAll(':scope > div > div');

  cols.forEach((col, i) => {
    if (i === 0) col.classList.add('side-menu');
    if (i === 1) col.classList.add('main-frame');
  });
}

export default function init(el) {
  const form = createTag('form');
  const formDiv = el.querySelector(':scope > div > div > .fragment');
  if (!formDiv) {
    el.remove();
    return;
  }

  formDiv.parentElement.replaceChild(form, formDiv);
  form.innerHTML = formDiv.innerHTML;

  decorateForm(el);
  initComponents(el);
}
