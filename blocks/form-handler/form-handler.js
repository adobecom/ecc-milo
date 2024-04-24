import { getLibs } from '../../scripts/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);
const { decorateButtons } = await import(`${getLibs()}/utils/decorate.js`);

// list of controllers for the hanler to load
const SUPPORTED_COMPONENTS = [
  // 'checkbox',
  'event-info',
  'venue-info',
  // 'img-upload',
  // 'venue-info',
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

function gatherValues(el) {
  let payload = {};

  SUPPORTED_COMPONENTS.forEach((comp) => {
    const mappedComponents = el.querySelectorAll(`.${comp}-component`);
    if (!mappedComponents?.length) return;

    mappedComponents.forEach(async (component) => {
      const { onSubmit } = await import(`./controllers/${comp}-component-controller.js`);
      const componentPayload = onSubmit(component);
      payload = { ...payload, componentPayload };
    });
  });

  return payload;
}

function decorateForm(el) {
  const cols = el.querySelectorAll(':scope > div:first-of-type > div');

  cols.forEach((col, i) => {
    if (i === 0) col.classList.add('side-menu');
    if (i === 1) col.classList.add('main-frame');
  });
}

function postForm(el) {
  const payload = gatherValues(el);
  console.log(payload);
}

function decorateFormCtas(el) {
  const ctaRow = el.querySelector(':scope > div:last-of-type');
  decorateButtons(ctaRow, 'button-l');
  const ctas = ctaRow.querySelectorAll('a');

  ctaRow.classList.add('form-handler-ctas-panel');
  ctas.forEach((cta) => {
    if (cta.href) {
      const ctaUrl = new URL(cta.href);

      if (['#pre-event', '#post-event'].includes(ctaUrl.hash)) {
        cta.classList.add('fill');
      }

      if (['#save', '#next'].includes(ctaUrl.hash)) {
        cta.addEventListener('click', () => { postForm(el); });
      }
    }
  });
}

export default function init(el) {
  const form = createTag('form');
  const formDivs = el.querySelectorAll('.fragment');

  if (!formDivs.length) {
    el.remove();
    return;
  }

  formDivs.forEach((formDiv) => {
    formDiv.parentElement.replaceChild(form, formDiv);
    form.append(formDiv);
  });

  decorateForm(el);
  decorateFormCtas(el);
  initComponents(el);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });
}
