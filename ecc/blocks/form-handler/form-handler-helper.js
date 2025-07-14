import AgendaFieldsetGroup from '../../components/agenda-fieldset-group/agenda-fieldset-group.js';
import AgendaFieldset from '../../components/agenda-fieldset/agenda-fieldset.js';
import CustomSearch from '../../components/custom-search/custom-search.js';
import CustomTextfield from '../../components/custom-textfield/custom-textfield.js';
import ImageDropzone from '../../components/image-dropzone/image-dropzone.js';
import PartnerSelectorGroup from '../../components/partner-selector-group/partner-selector-group.js';
import PartnerSelector from '../../components/partner-selector/partner-selector.js';
import ProductSelectorGroup from '../../components/product-selector-group/product-selector-group.js';
import ProductSelector from '../../components/product-selector/product-selector.js';
import ProfileContainer from '../../components/profile-container/profile-container.js';
import Profile from '../../components/profile/profile.js';
import Repeater from '../../components/repeater/repeater.js';
import RTETiptap from '../../components/rte-tiptap/rte-tiptap.js';
import RsvpForm from '../../components/rsvp-form/rsvp-form.js';

import getJoinedData, {
  setPayloadCache,
  setResponseCache,
  setDeleteList,
} from './data-handler.js';

import { getUser, userHasAccessToBU, userHasAccessToEvent, userHasAccessToSeries } from '../../scripts/profile.js';
import { LIBS } from '../../scripts/scripts.js';

import {
  getIcon,
  buildNoAccessScreen,
  generateToolTip,
  getEventPageHost,
  replaceAnchorWithButton,
} from '../../scripts/utils.js';

import { getCurrentEnvironment } from '../../scripts/environment.js';

import {
  createEvent,
  updateEvent,
  publishEvent,
  getEvent,
  previewEvent,
} from '../../scripts/esp-controller.js';
import { getAttribute } from '../../scripts/data-utils.js';
import { EVENT_TYPES } from '../../scripts/constants.js';
import errorManager from '../../scripts/error-manager.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);
const { decorateButtons } = await import(`${LIBS}/utils/decorate.js`);

export function initCustomLitComponents() {
  customElements.define('image-dropzone', ImageDropzone);
  customElements.define('profile-ui', Profile);
  customElements.define('repeater-element', Repeater);
  customElements.define('partner-selector', PartnerSelector);
  customElements.define('partner-selector-group', PartnerSelectorGroup);
  customElements.define('agenda-fieldset', AgendaFieldset);
  customElements.define('agenda-fieldset-group', AgendaFieldsetGroup);
  customElements.define('product-selector', ProductSelector);
  customElements.define('product-selector-group', ProductSelectorGroup);
  customElements.define('profile-container', ProfileContainer);
  customElements.define('custom-textfield', CustomTextfield);
  customElements.define('custom-search', CustomSearch);
  customElements.define('rte-tiptap', RTETiptap);
  customElements.define('rsvp-form', RsvpForm);
}

export const SPECTRUM_COMPONENTS = [
  'theme',
  'textfield',
  'picker',
  'menu',
  'checkbox',
  'field-label',
  'divider',
  'button',
  'progress-circle',
  'overlay',
  'dialog',
  'button-group',
  'tooltip',
  'popover',
  'search',
  'toast',
  'icon',
  'action-button',
  'progress-circle',
  'switch',
];

export async function initSpectrumComponents() {
  const miloLibs = LIBS;
  const promises = Array.from(SPECTRUM_COMPONENTS).map(async (component) => {
    await import(`${miloLibs}/features/spectrum-web-components/dist/${component}.js`);
  });
  await Promise.all([
    import(`${miloLibs}/deps/lit-all.min.js`),
    ...promises,
  ]);
}

// list of controllers for the handler to load
export const VANILLA_COMPONENTS = [
  'event-format',
  'event-info',
  'img-upload',
  'venue-info',
  'profile',
  'event-agenda',
  'event-community-link',
  'event-partners',
  'terms-conditions',
  'product-promotion',
  'event-topics',
  'registration-details',
  'registration-fields',
  'secondary-cta',
  'video-content',
  'marketo-integration',
];

async function initVanillaComponents(props) {
  const componentPromises = VANILLA_COMPONENTS.map(async (comp) => {
    const mappedComponents = props.el.querySelectorAll(`.${comp}-component`);
    if (!mappedComponents?.length) return;

    const componentInitPromises = Array.from(mappedComponents).map(async (component) => {
      const { default: initComponent } = await import(`../${comp}-component/controller.js`);
      await initComponent(component, props);
    });

    await Promise.all(componentInitPromises);
  });

  await Promise.all(componentPromises);
}

export async function initComponents(props) {
  await initVanillaComponents(props);
}

const INPUT_TYPES = [
  'input[required]',
  'select[required]',
  'textarea[required]',
  'sp-textfield[required]',
  'sp-checkbox[required]',
  'sp-picker[required]',
];

export function buildErrorMessage(props, resp) {
  errorManager.handleErrorResponse(props, resp);
}

export function getCurrentFragment(props) {
  const frags = props.el.querySelectorAll('.fragment');
  const currentFrag = frags[props.currentStep];
  return currentFrag;
}

function validateRequiredFields(fields) {
  const enabledFields = Array.from(fields).filter((f) => !f.disabled);

  return enabledFields.length === 0
    || enabledFields.every((f) => f.value && !f.invalid);
}

function onStepValidate(props) {
  return function updateCtaStatus() {
    const currentFrag = getCurrentFragment(props);
    const requiredFields = props[`required-fields-in-${currentFrag.id}`];
    const stepValid = validateRequiredFields(requiredFields);

    const ctas = props.el.querySelectorAll('.form-handler-panel-wrapper a');
    const sideNavs = props.el.querySelectorAll('.side-menu .nav-item');

    ctas.forEach((cta) => {
      if (cta.classList.contains('back-btn')) {
        cta.classList.toggle('disabled', props.currentStep === 0);
      } else {
        cta.classList.toggle('disabled', !stepValid);
      }
    });

    sideNavs.forEach((nav, i) => {
      if (i !== props.currentStep) {
        nav.disabled = !stepValid;
      }
    });
  };
}

export function getUpdatedRequiredFields(props) {
  const currentFrag = getCurrentFragment(props);
  const requiredFields = currentFrag.querySelectorAll(INPUT_TYPES.join());

  return requiredFields;
}

export function initRequiredFieldsValidation(props) {
  const currentFrag = getCurrentFragment(props);

  const currentRequiredFields = props[`required-fields-in-${currentFrag.id}`];
  const inputValidationCB = onStepValidate(props);
  currentRequiredFields.forEach((field) => {
    field.removeEventListener('change', inputValidationCB);
  });

  props[`required-fields-in-${currentFrag.id}`] = getUpdatedRequiredFields(props);

  props[`required-fields-in-${currentFrag.id}`].forEach((field) => {
    field.addEventListener('change', inputValidationCB, { bubbles: true });
  });

  inputValidationCB();
}

export function navigateForm(props, stepIndex) {
  const index = stepIndex || stepIndex === 0 ? stepIndex : props.currentStep + 1;
  const frags = props.el.querySelectorAll('.fragment');

  if (index >= frags.length || index < 0) return;

  props.currentStep = index;
  props.farthestStep = Math.max(props.farthestStep, index);

  window.scrollTo(0, 0);
  initRequiredFieldsValidation(props);
}

function initDeepLink(props) {
  const { hash } = window.location;

  if (hash) {
    const frags = props.el.querySelectorAll('.fragment');

    const targetFragindex = Array.from(frags).findIndex((frag) => `#${frag.id}` === hash);

    if (targetFragindex && targetFragindex <= props.farthestStep) {
      navigateForm(props, targetFragindex);
    }
  }
}

function enableSideNavForEditFlow(props) {
  const frags = props.el.querySelectorAll('.fragment');
  const completeFirstStep = Array.from(frags[0].querySelectorAll('.form-component:not(.event-agenda-component)'))
    .every((fc) => fc.classList.contains('prefilled'));

  if (!completeFirstStep) return;

  frags.forEach((frag, i) => {
    const prefilledOtherSteps = i !== 0 && frag.querySelector('.form-component.prefilled');

    if (completeFirstStep || prefilledOtherSteps) {
      props.farthestStep = Math.max(props.farthestStep, i);
    }
  });
}

async function loadEventData(props) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const eventId = urlParams.get('eventId');

  if (eventId) {
    const [user, event] = await Promise.all([getUser(), getEvent(eventId)]);
    if (userHasAccessToEvent(user, eventId)
      || userHasAccessToSeries(user, event.seriesId)
      || userHasAccessToBU(user, event.cloudType)) {
      setTimeout(() => {
        if (!props.eventDataResp.eventId) {
          const toastArea = props.el.querySelector('.toast-area');
          if (!toastArea) return;

          const toast = createTag('sp-toast', { open: true, timeout: 10000 }, 'Event data is taking longer than usual to load. Please check if the Adobe corp. VPN is connected or if the eventId URL Param is valid.', { parent: toastArea });
          toast.addEventListener('close', () => {
            toast.remove();
          });
        }
      }, 5000);

      props.el.classList.add('disabled');
      const eventData = await getEvent(eventId);
      if (!eventData.error && eventData) {
        props.eventDataResp = eventData;
      } else {
        props.el.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: eventData.error } }));
      }
      props.el.classList.remove('disabled');
    } else {
      buildNoAccessScreen(props.el);
      props.el.classList.remove('loading');
    }
  }
}

async function gatherValues(props) {
  const allComponentPromises = VANILLA_COMPONENTS.map(async (comp) => {
    const mappedComponents = props.el.querySelectorAll(`.${comp}-component`);
    if (!mappedComponents.length) return {};

    const promises = Array.from(mappedComponents).map(async (component) => {
      const { onSubmit } = await import(`../${comp}-component/controller.js`);
      return onSubmit(component, props);
    });

    return Promise.all(promises);
  });

  await Promise.all(allComponentPromises);
}

async function handleEventUpdate(props) {
  const allComponentPromises = VANILLA_COMPONENTS.map(async (comp) => {
    const mappedComponents = props.el.querySelectorAll(`.${comp}-component`);
    if (!mappedComponents.length) return {};

    const promises = Array.from(mappedComponents).map(async (component) => {
      const { onTargetUpdate } = await import(`../${comp}-component/controller.js`);
      return onTargetUpdate(component, props);
    });

    return Promise.all(promises);
  });

  await Promise.all(allComponentPromises);
}

async function updateComponentsOnPayloadChange(props) {
  const allComponentPromises = VANILLA_COMPONENTS.map(async (comp) => {
    const mappedComponents = props.el.querySelectorAll(`.${comp}-component`);
    if (!mappedComponents.length) return {};

    const promises = Array.from(mappedComponents).map(async (component) => {
      const { onPayloadUpdate } = await import(`../${comp}-component/controller.js`);
      const componentPayload = await onPayloadUpdate(component, props);
      return componentPayload;
    });

    return Promise.all(promises);
  });

  await Promise.all(allComponentPromises);
}

async function updateComponentsOnRespChange(props) {
  const allComponentPromises = VANILLA_COMPONENTS.map(async (comp) => {
    const mappedComponents = props.el.querySelectorAll(`.${comp}-component`);
    if (!mappedComponents.length) return {};

    const promises = Array.from(mappedComponents).map(async (component) => {
      const { onRespUpdate } = await import(`../${comp}-component/controller.js`);
      const componentPayload = await onRespUpdate(component, props);
      return componentPayload;
    });

    return Promise.all(promises);
  });

  await Promise.all(allComponentPromises);
}

function showSaveSuccessMessage(props, detail = { message: 'Edits saved successfully' }) {
  const toastArea = props.el.querySelector('.toast-area');
  if (!toastArea) return;

  const previousMsgs = toastArea.querySelectorAll('.save-success-msg');

  previousMsgs.forEach((msg) => {
    msg.remove();
  });

  const toast = createTag('sp-toast', { class: 'save-success-msg', open: true, variant: 'positive', timeout: 6000 }, detail.message || 'Edits saved successfully', { parent: toastArea });
  toast.addEventListener('close', () => {
    toast.remove();
  });
}

function updateDashboardLink(props) {
  const dashboardLink = props.el.querySelector('.side-menu > ul > li > a');

  if (!dashboardLink) return;

  const url = new URL(dashboardLink.href);

  if (url.searchParams.has('eventId')) return;

  const eventId = getAttribute(props.eventDataResp, 'eventId', props.locale);
  if (!eventId) return;

  url.searchParams.set('newEventId', eventId);
  dashboardLink.href = url.toString();
}

async function saveEvent(props, toPublish = false) {
  try {
    await gatherValues(props);
  } catch (e) {
    const errorObj = { error: { message: e.message } };
    buildErrorMessage(props, errorObj);
    return errorObj;
  }

  let resp;

  const onEventSave = async () => {
    if (resp?.eventId) await handleEventUpdate(props);

    if (!resp.error) {
      showSaveSuccessMessage(props);
    }
  };

  if (props.currentStep === 0 && !getAttribute(props.eventDataResp, 'eventId', props.locale)) {
    resp = await createEvent(getJoinedData(), props.locale);
    if (!resp.error && resp) {
      const newEventData = await getEvent(resp.eventId);
      props.eventDataResp = newEventData;
    } else {
      props.el.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: resp.error } }));
    }
    updateDashboardLink(props);
    await onEventSave();
  } else if (props.currentStep <= props.maxStep && !toPublish) {
    const payload = getJoinedData();
    resp = await updateEvent(
      payload.eventId,
      payload,
    );
    if (!resp.error && resp) {
      const newEventData = await getEvent(resp.eventId);
      props.eventDataResp = newEventData;
    } else {
      props.el.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: resp.error } }));
    }
    await onEventSave();
  } else if (toPublish) {
    const payload = getJoinedData();
    resp = await publishEvent(
      payload.eventId,
      payload,
    );
    if (!resp.error && resp) {
      const newEventData = await getEvent(resp.eventId);
      props.eventDataResp = newEventData;
    } else {
      props.el.dispatchEvent(new CustomEvent('show-error-toast', { detail: { error: resp.error } }));
    }
    if (resp?.eventId) await handleEventUpdate(props);
  }

  return resp;
}

function updateSideNav(props) {
  const sideNavs = props.el.querySelectorAll('.side-menu .nav-item');

  sideNavs.forEach((n, i) => {
    n.closest('li')?.classList.remove('active');
    if (i <= props.farthestStep) n.disabled = false;
    if (i === props.currentStep) n.closest('li')?.classList.add('active');
  });
}

function renderFormNavigation(props, prevStep, currentStep) {
  const nextBtn = props.el.querySelector('.form-handler-ctas-panel .next-button');
  const backBtn = props.el.querySelector('.form-handler-ctas-panel .back-btn');
  const frags = props.el.querySelectorAll('.fragment');

  frags[prevStep].classList.add('hidden');
  frags[currentStep].classList.remove('hidden');

  if (props.currentStep === props.maxStep) {
    if (props.eventDataResp.published) {
      nextBtn.textContent = nextBtn.dataset.republishStateText;
    } else {
      nextBtn.textContent = nextBtn.dataset.finalStateText;
    }
    nextBtn.prepend(getIcon('golden-rocket'));
  } else {
    nextBtn.textContent = nextBtn.dataset.nextStateText;
    nextBtn.append(getIcon('chev-right-white'));
  }

  backBtn.classList.toggle('disabled', currentStep === 0);
}

function closeDialog(props) {
  const spTheme = props.el.querySelector('#form-app');
  if (!spTheme) return;

  const underlay = spTheme.querySelector('sp-underlay');
  const dialog = spTheme.querySelector('sp-dialog');

  if (underlay) underlay.open = false;
  if (dialog) dialog.innerHTML = '';
}

function buildPreviewLoadingDialog(props, targetHref, poll) {
  const spTheme = props.el.querySelector('#form-app');
  if (!spTheme) return null;

  const underlay = spTheme.querySelector('sp-underlay');
  const dialog = spTheme.querySelector('sp-dialog');

  if (!underlay || !dialog) return null;

  underlay.open = false;
  dialog.innerHTML = '';

  createTag('h1', { slot: 'heading' }, 'Generating your preview...', { parent: dialog });
  createTag('p', {}, 'This usually takes less than a minute, but in rare cases it might take up to 10 minutes. Please wait, and the preview will open in a new tab when it is ready.', { parent: dialog });
  createTag('p', {}, '<strong>Note: Please ensure pop-ups are allowed in your browser.</strong>', { parent: dialog });

  const style = createTag('style', {}, `
    @keyframes progress-bar-indeterminate {
      0% { transform: translateX(-100%); }
      50% { transform: translateX(0%); }
      100% { transform: translateX(200%); }
    }
  `);

  const progressBar = createTag('div', {
    style: `
      position: relative;
      width: 100%;
      height: 8px;
      background: #e6e6e6;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 1rem;
    `,
  });

  const progressBarIndicator = createTag('div', {
    style: `
      position: absolute;
      top: 0;
      left: 0;
      width: 50%;
      height: 100%;
      background: #1473e6;
      transform: translateX(0);
      animation: progress-bar-indeterminate 1.5s linear infinite;
    `,
  });

  progressBar.appendChild(progressBarIndicator);
  dialog.appendChild(style);
  dialog.appendChild(progressBar);

  const buttonContainer = createTag('div', { class: 'button-container' }, '', { parent: dialog });
  const seePreviewButton = createTag('sp-button', { variant: 'secondary', slot: 'button', id: 'see-preview' }, 'Go to preview page now', { parent: buttonContainer });
  const cancelButton = createTag('sp-button', { variant: 'cta', slot: 'button', id: 'cancel-preview' }, 'Cancel', { parent: buttonContainer });

  underlay.open = true;

  seePreviewButton.addEventListener('click', () => {
    seePreviewButton.disabled = true;
    cancelButton.disabled = true;
    window.open(targetHref);
    closeDialog(props);
    poll.cancel();
  });

  cancelButton.addEventListener('click', () => {
    seePreviewButton.disabled = true;
    cancelButton.disabled = true;
    closeDialog(props);
    poll.cancel();
  });

  return dialog;
}

function buildPreviewLoadingFailedDialog(props, targetHref) {
  const spTheme = props.el.querySelector('#form-app');
  if (!spTheme) return;

  const underlay = spTheme.querySelector('sp-underlay');
  const dialog = spTheme.querySelector('sp-dialog');

  if (!underlay || !dialog) return;

  underlay.open = false;
  dialog.innerHTML = '';

  createTag('h1', { slot: 'heading' }, 'Preview generation failed.', { parent: dialog });
  createTag('p', {}, 'Our system is working in the background to update the page.', { parent: dialog });
  const slackLink = createTag('a', { href: 'https://adobe.enterprise.slack.com/archives/C07KPJYA760' }, 'Slack');
  const emailLink = createTag('a', { href: 'mailto:Grp-acom-milo-events-support@adobe.com' }, 'Grp-acom-milo-events-support@adobe.com');
  createTag('p', {}, `Please try again later. If the issue persists, please feel free to contact us on <b>${slackLink.outerHTML}</b> or email <b>${emailLink.outerHTML}</b>`, { parent: dialog });
  const buttonContainer = createTag('div', { class: 'button-container' }, '', { parent: dialog });
  const seePreviewButton = createTag('sp-button', { variant: 'secondary', slot: 'button', id: 'see-preview' }, 'Go to preview page now', { parent: buttonContainer });
  const cancelButton = createTag('sp-button', { variant: 'cta', slot: 'button', id: 'cancel-preview' }, 'OK', { parent: buttonContainer });

  underlay.open = true;

  seePreviewButton.addEventListener('click', () => {
    window.open(targetHref);
    closeDialog(props);
    dialog.innerHTML = '';
  });

  cancelButton.addEventListener('click', () => {
    closeDialog(props);
    dialog.innerHTML = '';
  });
}

async function getNonProdPreviewDataById(props) {
  if (!props.eventDataResp) return null;

  const { eventId } = props.eventDataResp;

  if (!eventId) return null;

  const esEnv = getCurrentEnvironment();
  const resp = await fetch(`${getEventPageHost()}/events/default/${esEnv === 'prod' ? '' : `${esEnv}/`}metadata-preview.json`);
  if (resp.ok) {
    const json = await resp.json();
    const pageData = json.data.find((d) => d['event-id'] === eventId);

    if (pageData) return pageData;

    window.lana?.log('Failed to find non-prod metadata for current page');
    return { error: { message: 'Failed to find non-prod metadata for current page' } };
  }

  window.lana?.log(`Failed to fetch non-prod metadata:\n${JSON.stringify(resp, null, 2)}`);
  return { error: { message: 'Failed to fetch non-prod metadata' } };
}

async function validatePreview(props, cta) {
  let retryCount = 0;
  const previewHref = cta.href;

  const modificationTimeMatch = (metadataObj) => {
    const metadataModTimestamp = new Date(metadataObj['modification-time']).getTime();
    return metadataModTimestamp === props.eventDataResp.modificationTime;
  };

  return new Promise((resolve) => {
    let cancelled = false;
    let isResolved = false;

    const poll = {
      cancel: () => {
        if (isResolved) return;
        isResolved = true;
        cancelled = true;
        resolve();
      },
    };

    buildPreviewLoadingDialog(props, previewHref, poll);

    (async function pollLoop() {
      while (!cancelled && retryCount < 60) {
        retryCount += 1;
        const delay = Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000;
        // eslint-disable-next-line no-await-in-loop, no-promise-executor-return
        await new Promise((r) => setTimeout(r, delay));
        if (cancelled) break;
        try {
          // eslint-disable-next-line no-await-in-loop
          const metadataJson = await getNonProdPreviewDataById(props);
          if (metadataJson && modificationTimeMatch(metadataJson)) {
            closeDialog(props);
            window.open(previewHref);
            poll.cancel();
            return;
          }
          if (metadataJson?.error) {
            buildErrorMessage(props, metadataJson.error);
            buildPreviewLoadingFailedDialog(props, previewHref);
            poll.cancel();
            return;
          }
        } catch (error) {
          window.lana?.log(`Error in sequential poll:\n${JSON.stringify(error, null, 2)}`);
          break;
        }
      }

      if (!cancelled) {
        buildPreviewLoadingFailedDialog(props, previewHref);
        window.lana?.log('Failed to fetch metadata');
      }
      poll.cancel();
    }());
  });
}

function initFormCtas(props) {
  const ctaRow = props.el.querySelector(':scope > div:last-of-type');
  decorateButtons(ctaRow, 'button-l');
  const ctas = ctaRow.querySelectorAll('a');
  ctaRow.classList.add('form-handler-ctas-panel');

  const forwardActionsWrappers = ctaRow.querySelectorAll(':scope > div');

  const panelWrapper = createTag('div', { class: 'form-handler-panel-wrapper' }, '', { parent: ctaRow });
  const backwardWrapper = createTag('div', { class: 'form-handler-backward-wrapper' }, '', { parent: panelWrapper });
  const forwardWrapper = createTag('div', { class: 'form-handler-forward-wrapper' }, '', { parent: panelWrapper });

  forwardActionsWrappers.forEach((w) => {
    w.classList.add('action-area');
    forwardWrapper.append(w);
  });

  const backBtn = createTag('a', { class: 'back-btn' }, getIcon('chev-left-white'));

  backwardWrapper.append(backBtn);

  const toggleBtnsSubmittingState = (submitting) => {
    [...ctas, backBtn].forEach((c) => {
      c.classList.toggle('submitting', submitting);
    });
  };

  ctas.forEach((cta) => {
    if (cta.href) {
      const ctaUrl = new URL(cta.href);

      if (['#pre-event', '#post-event'].includes(ctaUrl.hash)) {
        cta.classList.add('fill', 'preview-btns', 'preview-not-ready', ctaUrl.hash.replace('#', ''));
        cta.addEventListener('click', async (e) => {
          e.preventDefault();
          toggleBtnsSubmittingState(true);

          const eventId = getAttribute(props.eventDataResp, 'eventId', props.locale);
          if (!eventId) {
            buildErrorMessage(props, { error: { message: 'Event ID is not found' } });
            toggleBtnsSubmittingState(false);
            return;
          }

          await gatherValues(props);

          const resp = await previewEvent(
            eventId,
            getJoinedData(),
          );

          if (resp.error) {
            buildErrorMessage(props, resp.error);
            toggleBtnsSubmittingState(false);
            return;
          }

          const newEventData = await getEvent(resp.eventId);
          props.eventDataResp = newEventData;

          if (resp?.eventId) await handleEventUpdate(props);

          if (!resp.error) {
            showSaveSuccessMessage(props);
          }

          if (cta.classList.contains('preview-not-ready')) return;
          validatePreview(props, cta).then(() => {
            toggleBtnsSubmittingState(false);
          });
        });
      }

      if (['#save', '#next'].includes(ctaUrl.hash)) {
        if (ctaUrl.hash === '#next') {
          cta.classList.add('next-button');
          const nextStateText = 'Next step';
          const finalStateText = 'Publish event';
          const doneStateText = 'Done';
          const republishStateText = 'Re-publish event';

          cta.textContent = nextStateText;
          cta.append(getIcon('chev-right-white'));
          cta.dataset.nextStateText = nextStateText;
          cta.dataset.finalStateText = finalStateText;
          cta.dataset.doneStateText = doneStateText;
          cta.dataset.republishStateText = republishStateText;
        }

        cta.addEventListener('click', async (e) => {
          e.preventDefault();
          toggleBtnsSubmittingState(true);

          if (ctaUrl.hash === '#next') {
            let resp;

            if (props.currentStep === props.maxStep) {
              resp = await saveEvent(props, true);
            } else {
              resp = await saveEvent(props);
            }

            if (resp && !resp.error) {
              if (props.currentStep === props.maxStep) {
                const toastArea = props.el.querySelector('.toast-area');
                cta.textContent = cta.dataset.doneStateText;
                cta.classList.add('disabled');

                if (toastArea) {
                  const toast = createTag('sp-toast', { open: true, variant: 'positive' }, 'Success! This event has been published.', { parent: toastArea });
                  const dashboardLink = props.el.querySelector('.side-menu > ul > li > a');

                  createTag(
                    'sp-button',
                    {
                      slot: 'action',
                      variant: 'overBackground',
                      treatment: 'outline',
                      href: dashboardLink.href,
                    },
                    'Go to dashboard',
                    { parent: toast },
                  );

                  toast.addEventListener('close', () => {
                    toast.remove();
                  });
                }
              } else {
                navigateForm(props);
              }
            }
          } else {
            await saveEvent(props);
          }

          toggleBtnsSubmittingState(false);
        });
      }
    }
  });

  backBtn.addEventListener('click', async () => {
    toggleBtnsSubmittingState(true);
    const resp = await saveEvent(props);
    if (resp && !resp.error) {
      props.currentStep -= 1;
    }

    toggleBtnsSubmittingState(false);
  });
}

function updateComponentsWithLocale(props) {
  const localeSensitiveComponents = props.el.querySelectorAll('[data-locale-sensitive]');
  localeSensitiveComponents.forEach((c) => {
    c.setAttribute('locale', props.locale);
    c.requestUpdate();
  });
}

function updateCtas(props) {
  const formCtas = props.el.querySelectorAll('.form-handler-ctas-panel a');
  const { eventDataResp } = props;

  formCtas.forEach((a) => {
    if (a.classList.contains('preview-btns')) {
      const testTime = a.classList.contains('pre-event') ? +props.eventDataResp.localEndTimeMillis - 10 : +props.eventDataResp.localEndTimeMillis + 10;
      if (eventDataResp.detailPagePath) {
        let previewUrl;

        try {
          previewUrl = new URL(eventDataResp.detailPagePath).href;
        } catch (e) {
          previewUrl = `${getEventPageHost()}${eventDataResp.detailPagePath}`;
        }

        a.href = `${previewUrl}?previewMode=true&cachebuster=${Date.now()}&timing=${testTime}`;
        a.classList.remove('preview-not-ready');
      }
    }

    if (a.classList.contains('next-button')) {
      if (props.currentStep === props.maxStep) {
        if (props.eventDataResp.published) {
          a.textContent = a.dataset.republishStateText;
        } else {
          a.textContent = a.dataset.finalStateText;
        }
        a.prepend(getIcon('golden-rocket'));
      } else {
        a.textContent = a.dataset.nextStateText;
        a.append(getIcon('chev-right-white'));
      }
    }
  });
}

function initNavigation(props) {
  const frags = props.el.querySelectorAll('.fragment');
  const sideMenu = props.el.querySelector('.side-menu');
  const navItems = sideMenu.querySelectorAll('.nav-item');

  frags.forEach((frag, i) => {
    if (i !== 0) {
      frag.classList.add('hidden');
    }
  });

  navItems.forEach((nav, i) => {
    nav.addEventListener('click', async () => {
      if (nav.closest('li').classList.contains('active')) return;
      if (!nav.disabled && !sideMenu.classList.contains('disabled')) {
        sideMenu.classList.add('disabled');

        const resp = await saveEvent(props);
        if (resp && !resp.error) {
          navigateForm(props, i);
        }

        sideMenu.classList.remove('disabled');
      }
    });
  });
}

function updateStatusTag(props) {
  const { eventDataResp } = props;

  if (eventDataResp?.published === undefined) return;

  const currentFragment = getCurrentFragment(props);

  const headingSection = currentFragment.querySelector(':scope > .section:first-child');

  const existingStatusTag = headingSection.querySelector('.event-status-tag');
  if (existingStatusTag) existingStatusTag.remove();

  const heading = headingSection.querySelector('h2', 'h3', 'h3', 'h4');
  const headingWrapper = createTag('div', { class: 'step-heading-wrapper' });
  const dot = eventDataResp.published ? getIcon('dot-purple') : getIcon('dot-green');
  const text = eventDataResp.published ? 'Published' : 'Draft';
  const statusTag = createTag('span', { class: 'event-status-tag' });

  statusTag.append(dot, text);
  heading.parentElement?.replaceChild(headingWrapper, heading);
  headingWrapper.append(heading, statusTag);
}

function toggleSections(props) {
  const sections = props.el.querySelectorAll('.section:not(:first-child)');

  sections.forEach((section) => {
    const allComponentsHidden = Array.from(section.querySelectorAll('.form-component')).every((fc) => {
      const hasHiddenClass = fc.classList.contains('hidden');
      const isCloudMismatch = (fc.classList.contains('dx-only') && fc.dataset.cloudType === 'CreativeCloud')
       || (fc.classList.contains('dme-only') && fc.dataset.cloudType === 'ExperienceCloud');

      return hasHiddenClass || isCloudMismatch;
    });

    section.classList.toggle('hidden', allComponentsHidden);
  });
}

function decorateForm(el) {
  const ctaRow = el.querySelector(':scope > div:last-of-type');
  const formBodyRow = el.querySelector(':scope > div:first-of-type');

  if (ctaRow) {
    const toastParent = createTag('sp-theme', { class: 'toast-parent', color: 'light', scale: 'medium' }, '', { parent: ctaRow });
    createTag('div', { class: 'toast-area' }, '', { parent: toastParent });
  }

  if (!formBodyRow) return;

  formBodyRow.classList.add('form-body');

  const app = createTag('sp-theme', { color: 'light', scale: 'medium', id: 'form-app' });
  createTag('sp-underlay', {}, '', { parent: app });
  createTag('sp-dialog', { size: 's' }, '', { parent: app });
  const form = createTag('form', {}, '', { parent: app });
  const formDivs = el.querySelectorAll('.fragment');

  if (!formDivs.length) {
    el.remove();
    return;
  }

  formDivs.forEach((formDiv) => {
    formDiv.parentElement.parentElement.replaceChild(app, formDiv.parentElement);
    form.append(formDiv.parentElement);
  });

  const cols = formBodyRow.querySelectorAll(':scope > div');

  cols.forEach((col, i) => {
    if (i === 0) {
      col.classList.add('side-menu');
      const navItems = col.querySelectorAll('a[href*="#"]');
      navItems.forEach((nav, index) => {
        const btn = replaceAnchorWithButton(nav);
        btn.classList.add('nav-item');

        if (index !== 0) {
          btn.disabled = true;
        } else {
          btn.closest('li')?.classList.add('active');
        }
      });
    }

    if (i === 1) {
      col.classList.add('main-frame');
      const frags = el.querySelectorAll('.fragment');

      frags.forEach((frag) => {
        const fragPathSegments = frag.dataset.path.split('/');
        const fragId = `form-step-${fragPathSegments[fragPathSegments.length - 1]}`;
        frag.id = fragId;
      });
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });
}

export async function handleSubmit(props) {
  const eventId = getAttribute(props.eventDataResp, 'eventId', props.locale);
  if (!eventId) return;

  const url = new URL(window.location.href);
  url.searchParams.set('newEventId', eventId);
  window.location.href = url;
}

function getEventType(classList) {
  // eslint-disable-next-line max-len
  return Object.values(EVENT_TYPES).find((type) => classList.contains(type.toLowerCase())) ?? EVENT_TYPES.IN_PERSON;
}

export async function buildECCForm(el) {
  const eventType = getEventType(el.classList);

  const props = {
    el,
    currentStep: 0,
    farthestStep: 0,
    maxStep: el.querySelectorAll('.fragment').length - 1,
    payload: {
      eventType,
      localizations: {},
    },
    eventDataResp: {},
    deleteList: {},
  };

  const dataHandler = {
    set(target, prop, value) {
      const oldValue = target[prop];
      target[prop] = value;

      switch (prop) {
        case 'currentStep':
        {
          renderFormNavigation(target, oldValue, value);
          updateSideNav(target);
          initRequiredFieldsValidation(target);
          updateStatusTag(target);
          break;
        }

        case 'farthestStep': {
          updateSideNav(target);
          break;
        }

        case 'payload': {
          setPayloadCache(value, props.locale);
          updateComponentsOnPayloadChange(target);
          initRequiredFieldsValidation(target);
          toggleSections(target);
          break;
        }

        case 'eventDataResp': {
          // TODO: supports defaultLocale only for LOC P1
          if (value.defaultLocale) props.locale = value.defaultLocale;
          setResponseCache(value, props.locale);
          updateComponentsOnRespChange(target);
          updateCtas(target);
          toggleSections(target);
          props.deleteList = [];
          if (value.error) {
            props.el.classList.add('show-error');
          } else {
            props.el.classList.remove('show-error');
          }
          break;
        }

        case 'locale': {
          updateComponentsWithLocale(target);
          break;
        }

        case 'deleteList': {
          setDeleteList(value);
          break;
        }

        default:
          break;
      }

      return true;
    },
  };

  decorateForm(el);

  const frags = el.querySelectorAll('.fragment');

  frags.forEach((frag) => {
    props[`required-fields-in-${frag.id}`] = [];

    frag.querySelectorAll(':scope > .section > .content').forEach((c) => {
      generateToolTip(c);
    });
  });

  const proxyProps = new Proxy(props, dataHandler);

  await loadEventData(proxyProps);
  initFormCtas(proxyProps);
  initNavigation(proxyProps);
  await initComponents(proxyProps);
  enableSideNavForEditFlow(proxyProps);
  initRequiredFieldsValidation(proxyProps);
  initDeepLink(proxyProps);
  updateStatusTag(proxyProps);
  toggleSections(proxyProps);

  errorManager.initErrorListeners(el, proxyProps);
}

export function buildLoadingScreen(el) {
  el.classList.add('loading');
  const loadingScreen = createTag('sp-theme', { color: 'light', scale: 'medium', class: 'loading-screen' });
  createTag('sp-progress-circle', { size: 'l', indeterminate: true }, '', { parent: loadingScreen });
  createTag('sp-field-label', {}, 'Loading Adobe Event Creation Console form...', { parent: loadingScreen });

  el.prepend(loadingScreen);
}
