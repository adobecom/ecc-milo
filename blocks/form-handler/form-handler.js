import { getLibs } from '../../scripts/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

const COMPONENT_MAP = {
  'checkbox-component': {
    configCallback: (component) => {
      const minReg = component.className.match(/min-(.*?)( |$)/);
      const maxReg = component.className.match(/max-(.*?)( |$)/);
      const required = !!minReg;
      const min = minReg ? parseInt(minReg[1], 10) : 0;
      const max = maxReg ? parseInt(maxReg[1], 10) : 0;

      return {
        required,
        min,
        max,
      };
    },
    ruleCallback: (cbs, configs) => {
      let boxesChecked = 0;
      cbs.forEach((cb) => {
        cb.addEventListener('change', () => {
          if (cb.checked) {
            boxesChecked += 1;
          } else {
            boxesChecked -= 1;
          }

          cbs.forEach((c) => {
            c.required = boxesChecked < configs.min;
          });

          if (boxesChecked === configs.max) {
            cbs.forEach((c) => {
              if (!c.checked) c.disabled = true;
            });
          } else {
            cbs.forEach((c) => {
              c.disabled = false;
            });
          }
        });
      });
    },
  },
};

function applyRules(el) {
  Object.entries(COMPONENT_MAP).forEach(([k, v]) => {
    const mappedComponents = el.querySelectorAll(`.${k}`);
    if (!mappedComponents?.length) return;

    mappedComponents.forEach((component) => {
      const configs = v.configCallback(component);
      const checkboxes = component.querySelectorAll('input[type="checkbox"]');
      v.ruleCallback(checkboxes, configs);
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
  applyRules(el);
}
