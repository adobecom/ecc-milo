import { getLibs } from '../../scripts/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

// mapping block names to their init callbacks
const COMPONENT_CB_MAP = {
  'checkbox-component': (component) => {
    const checkboxes = component.querySelectorAll('input[type="checkbox"]');
    const minReg = component.className.match(/min-(.*?)( |$)/);
    const maxReg = component.className.match(/max-(.*?)( |$)/);
    const required = !!minReg;
    const min = minReg ? parseInt(minReg[1], 10) : 0;
    const max = maxReg ? parseInt(maxReg[1], 10) : 0;

    const configs = {
      required,
      min,
      max,
    };

    let boxesChecked = 0;
    checkboxes.forEach((cb) => {
      cb.addEventListener('change', () => {
        if (cb.checked) {
          boxesChecked += 1;
        } else {
          boxesChecked -= 1;
        }

        checkboxes.forEach((c) => {
          c.required = boxesChecked < configs.min;
        });

        if (boxesChecked === configs.max) {
          checkboxes.forEach((c) => {
            if (!c.checked) c.disabled = true;
          });
        } else {
          checkboxes.forEach((c) => {
            c.disabled = false;
          });
        }
      });
    });
  },
};

function initComponents(el) {
  Object.entries(COMPONENT_CB_MAP).forEach(([blockName, cb]) => {
    const mappedComponents = el.querySelectorAll(`.${blockName}`);
    if (!mappedComponents?.length) return;

    mappedComponents.forEach((component) => {
      cb(component);
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
