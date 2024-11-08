import { LIBS } from '../../../scripts/scripts.js';
import { getCaasTags } from '../../../scripts/esp-controller.js';
import { isEmptyObject } from '../../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

const checkboxSvg = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="Frame"><path id="iconFill" fill-rule="evenodd" clip-rule="evenodd" d="M14.6 1H3.4C2.76348 1 2.15303 1.25286 1.70294 1.70294C1.25286 2.15303 1 2.76348 1 3.4V14.6C1 14.9152 1.06208 15.2273 1.18269 15.5184C1.3033 15.8096 1.48008 16.0742 1.70294 16.2971C1.9258 16.5199 2.19038 16.6967 2.48156 16.8173C2.77274 16.9379 3.08483 17 3.4 17H14.6C14.9152 17 15.2273 16.9379 15.5184 16.8173C15.8096 16.6967 16.0742 16.5199 16.2971 16.2971C16.5199 16.0742 16.6967 15.8096 16.8173 15.5184C16.9379 15.2273 17 14.9152 17 14.6V3.4C17 3.08483 16.9379 2.77274 16.8173 2.48156C16.6967 2.19038 16.5199 1.9258 16.2971 1.70294C16.0742 1.48008 15.8096 1.3033 15.5184 1.18269C15.2273 1.06208 14.9152 1 14.6 1ZM14.4225 6.1885L7.283 13.3275C7.20799 13.4025 7.10629 13.4446 7.00025 13.4446C6.89421 13.4446 6.79251 13.4025 6.7175 13.3275L3.5775 10.1885C3.50254 10.1135 3.46044 10.0118 3.46044 9.90575C3.46044 9.79971 3.50254 9.69801 3.5775 9.623L4.823 8.3775C4.89801 8.30254 4.99971 8.26044 5.10575 8.26044C5.21179 8.26044 5.31349 8.30254 5.3885 8.3775L7 9.99L12.6115 4.3775C12.6865 4.30254 12.7882 4.26044 12.8942 4.26044C13.0003 4.26044 13.102 4.30254 13.177 4.3775L14.4225 5.623C14.4975 5.69801 14.5396 5.79971 14.5396 5.90575C14.5396 6.01179 14.4975 6.11349 14.4225 6.1885Z" fill="#FFFFFF"/></g></svg>';

async function buildTopicsCheckboxes(el, cloudType) {
  const cw = el.querySelector('.checkbox-wrapper') || createTag('div', { class: 'checkbox-wrapper' });
  const caasTags = await getCaasTags();

  if (!caasTags) return;

  cw.innerHTML = '';

  if (cloudType === 'CreativeCloud') {
    const productTags = caasTags.namespaces.caas.tags['product-categories'].tags;
    Object.values(productTags).forEach((p) => {
      if (isEmptyObject(p.tags)) return;
      const button = createTag('sp-action-button', { name: p.title, toggles: true, 'data-value': JSON.stringify(p) }, p.title, { parent: cw });
      const checkboxIcon = createTag('sp-icon', { size: 's', slot: 'icon' }, checkboxSvg);
      button.prepend(checkboxIcon);
    });

    el.append(cw);
  }

  if (cloudType === 'DX') {
    const productTags = caasTags.namespaces.caas.tags.events.tags.products.tags;
    Object.values(productTags).forEach((p) => {
      const button = createTag('sp-action-button', { name: p.title, 'data-value': JSON.stringify(p) }, p.title, { parent: cw });
      const checkboxIcon = createTag('sp-icon', { size: 's', slot: 'icon' }, checkboxSvg);
      button.prepend(checkboxIcon);

      button.addEventListener('click', () => {
        button.toggleAttribute('selected');
      });
    });

    el.append(cw);
  }
}

function prefillTopics(component, eventData) {
  const actionButtons = component.querySelectorAll('sp-action-button');
  const selectedButtons = [];

  if (eventData.topics?.length !== 0) {
    actionButtons.forEach((cb) => {
      if (eventData.topics?.includes(cb.getAttribute('name'))) {
        cb.selected = true;
        selectedButtons.push(cb);
      }
    });

    const topics = selectedButtons.map((cb) => cb.getAttribute('name'));
    const fullTopicsValue = Array.from(selectedButtons).map((cb) => cb.dataset.value);

    return { topics, fullTopicsValue };
  }

  return {};
}

/* eslint-disable no-unused-vars */
export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const selectedButtons = component.querySelectorAll('sp-action-button[selected]');
  const topics = Array.from(selectedButtons).map((cb) => cb.getAttribute('name'));
  const fullTopicsValue = Array.from(selectedButtons).map((cb) => cb.dataset.value);

  props.payload = { ...props.payload, topics, fullTopicsValue };
}

export async function onPayloadUpdate(component, props) {
  const { cloudType } = props.payload;

  if (cloudType && cloudType !== component.dataset.cloudType) {
    await buildTopicsCheckboxes(component, cloudType);
    component.dataset.cloudType = cloudType;
  }
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

export default async function init(component, props) {
  component.dataset.cloudType = props.payload.cloudType;
  const eventData = props.eventDataResp;

  await buildTopicsCheckboxes(component, component.dataset.cloudType);
  const prefilledTopics = prefillTopics(component, eventData);
  props.payload = { ...props.payload, ...prefilledTopics };
}

export function onEventUpdate(component, props) {
  // Do nothing
}
