import { LIBS } from '../../scripts/scripts.js';
import {
  getIcon,
  buildNoAccessScreen,
  generateToolTip,
  camelToSentenceCase,
  getEventPageHost,
  signIn,
  getEventServiceEnv,
  getDevToken,
} from '../../scripts/utils.js';
import {
  createEvent,
  updateEvent,
  publishEvent,
  getEvent,
} from '../../scripts/esp-controller.js';
import { ImageDropzone } from '../../components/image-dropzone/image-dropzone.js';
import { Profile } from '../../components/profile/profile.js';
import { Repeater } from '../../components/repeater/repeater.js';
import AgendaFieldset from '../../components/agenda-fieldset/agenda-fieldset.js';
import AgendaFieldsetGroup from '../../components/agenda-fieldset-group/agenda-fieldset-group.js';
import { ProfileContainer } from '../../components/profile-container/profile-container.js';
import { CustomTextfield } from '../../components/custom-textfield/custom-textfield.js';
import ProductSelector from '../../components/product-selector/product-selector.js';
import ProductSelectorGroup from '../../components/product-selector-group/product-selector-group.js';
import PartnerSelector from '../../components/partner-selector/partner-selector.js';
import PartnerSelectorGroup from '../../components/partner-selector-group/partner-selector-group.js';
import getJoinedData, { getFilteredCachedResponse, hasContentChanged, quickFilter, setPayloadCache, setResponseCache } from '../../scripts/event-data-handler.js';
import { CustomSearch } from '../../components/custom-search/custom-search.js';
import { getUser, initProfileLogicTree, userHasAccessToEvent } from '../../scripts/profile.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);
const { decorateButtons } = await import(`${LIBS}/utils/decorate.js`);

// list of controllers for the handler to load
const VANILLA_COMPONENTS = [
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
];

const INPUT_TYPES = [
  'input[required]',
  'select[required]',
  'textarea[required]',
  'sp-textfield[required]',
  'sp-checkbox[required]',
  'sp-picker[required]',
];

const SPECTRUM_COMPONENTS = [
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
];

export function buildErrorMessage(props, resp) {
  if (!resp) return;

  const toastArea = resp.targetEl ? resp.targetEl.querySelector('.toast-area') : props.el.querySelector('.toast-area');

  if (resp.error) {
    const messages = [];
    const errorBag = resp.error.errors;
    const errorMessage = resp.error.message;

    if (errorBag) {
      errorBag.forEach((error) => {
        const errorPathSegments = error.path.split('/');
        const text = `${camelToSentenceCase(errorPathSegments[errorPathSegments.length - 1])} ${error.message}`;
        messages.push(text);
      });

      messages.forEach((msg, i) => {
        const toast = createTag('sp-toast', { open: true, variant: 'negative', timeout: 6000 + (i * 3000) }, msg, { parent: toastArea });
        toast.addEventListener('close', (e) => {
          e.stopPropagation();
          toast.remove();
        }, { once: true });
      });
    } else if (errorMessage) {
      if (resp.status === 409 || resp.error.message === 'Request to ESP failed: {"message":"Event update invalid, event has been modified since last fetch"}') {
        const toast = createTag('sp-toast', { open: true, variant: 'negative' }, 'The event has been updated by a different session since your last save.', { parent: toastArea });
        const url = new URL(window.location.href);
        url.searchParams.set('eventId', getFilteredCachedResponse().eventId);

        createTag('sp-button', {
          slot: 'action',
          variant: 'overBackground',
          href: `${url.toString()}`,
        }, 'See the latest version', { parent: toast });

        toast.addEventListener('close', (e) => {
          e.stopPropagation();
          toast.remove();
        }, { once: true });
      } else {
        const toast = createTag('sp-toast', { open: true, variant: 'negative', timeout: 6000 }, errorMessage, { parent: toastArea });
        toast.addEventListener('close', (e) => {
          e.stopPropagation();
          toast.remove();
        }, { once: true });
      }
    }
  }
}

function replaceAnchorWithButton(anchor) {
  if (!anchor || anchor.tagName !== 'A') {
    return null;
  }

  const attributes = {};
  for (let i = 0; i < anchor.attributes.length; i += 1) {
    const attr = anchor.attributes[i];
    attributes[attr.name] = attr.value;
  }

  const button = createTag('button', attributes, anchor.innerHTML);

  anchor.parentNode.replaceChild(button, anchor);
  return button;
}

function getCurrentFragment(props) {
  const frags = props.el.querySelectorAll('.fragment');
  const currentFrag = frags[props.currentStep];
  return currentFrag;
}

function validateRequiredFields(fields) {
  return fields.length === 0 || Array.from(fields).every((f) => f.value && !f.invalid);
}

function onStepValidate(props) {
  return function updateCtaStatus() {
    const currentFrag = getCurrentFragment(props);
    const stepValid = validateRequiredFields(props[`required-fields-in-${currentFrag.id}`]);
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

function initRequiredFieldsValidation(props) {
  const currentFrag = getCurrentFragment(props);

  const inputValidationCB = onStepValidate(props);
  props[`required-fields-in-${currentFrag.id}`].forEach((field) => {
    field.removeEventListener('change', inputValidationCB);
    field.addEventListener('change', inputValidationCB, { bubbles: true });
  });

  inputValidationCB();
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

  initRequiredFieldsValidation(props);
}

function initCustomLitComponents() {
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
}

async function loadEventData(props) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const eventId = urlParams.get('eventId');

  if (eventId) {
    const user = await getUser();
    if (userHasAccessToEvent(user, eventId)) {
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
      props.eventDataResp = { ...props.eventDataResp, ...eventData };
      props.el.classList.remove('disabled');
    } else {
      buildNoAccessScreen(props.el);
      props.el.classList.remove('loading');
      return;
    }
  }
}

async function initComponents(props) {
  initCustomLitComponents();

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
  // FIXME: presuming first link is dashboard link is not good.
  if (!getFilteredCachedResponse().eventId) return;
  const dashboardLink = props.el.querySelector('.side-menu > ul > li > a');

  if (!dashboardLink) return;

  const url = new URL(dashboardLink.href);

  if (url.searchParams.has('eventId')) return;

  url.searchParams.set('newEventId', getFilteredCachedResponse().eventId);
  dashboardLink.href = url.toString();
}

async function saveEvent(props, toPublish = false) {
  try {
    await gatherValues(props);
  } catch (e) {
    return { error: { message: e.message } };
  }

  let resp;

  const onEventSave = async () => {
    if (resp?.eventId) await handleEventUpdate(props);

    if (!resp.error) {
      showSaveSuccessMessage(props);
    }
  };

  if (props.currentStep === 0 && !getFilteredCachedResponse().eventId) {
    resp = await createEvent(quickFilter(props.payload));
    props.eventDataResp = { ...props.eventDataResp, ...resp };
    updateDashboardLink(props);
    await onEventSave();
  } else if (props.currentStep <= props.maxStep && !toPublish) {
    resp = await updateEvent(
      getFilteredCachedResponse().eventId,
      getJoinedData(),
    );
    props.eventDataResp = { ...props.eventDataResp, ...resp };
    await onEventSave();
  } else if (toPublish) {
    resp = await publishEvent(
      getFilteredCachedResponse().eventId,
      getJoinedData(),
    );
    props.eventDataResp = { ...props.eventDataResp, ...resp };
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

function updateRequiredFields(props) {
  const currentFrag = getCurrentFragment(props);
  props[`required-fields-in-${currentFrag.id}`] = currentFrag.querySelectorAll(INPUT_TYPES.join());
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

function navigateForm(props, stepIndex) {
  const index = stepIndex || stepIndex === 0 ? stepIndex : props.currentStep + 1;
  const frags = props.el.querySelectorAll('.fragment');

  if (index >= frags.length || index < 0) return;

  props.currentStep = index;
  props.farthestStep = Math.max(props.farthestStep, index);

  window.scrollTo(0, 0);
  updateRequiredFields(props);
}

function closeDialog(props) {
  const spTheme = props.el.querySelector('#form-app');
  if (!spTheme) return;

  const underlay = spTheme.querySelector('sp-underlay');
  const dialog = spTheme.querySelector('sp-dialog');

  if (underlay) underlay.open = false;
  if (dialog) dialog.innerHTML = '';
}

function buildPreviewLoadingDialog(props) {
  const spTheme = props.el.querySelector('#form-app');
  if (!spTheme) return null;

  const underlay = spTheme.querySelector('sp-underlay');
  const dialog = spTheme.querySelector('sp-dialog');

  if (!underlay || !dialog) return null;

  underlay.open = false;
  dialog.innerHTML = '';

  createTag('h1', { slot: 'heading' }, 'Generating your preview...', { parent: dialog });
  createTag('p', {}, 'This usually takes 10-30 seconds, but it might take up to 10 minutes in rare cases. Please wait, and the preview will open in a new tab when it’s ready.', { parent: dialog });
  createTag('p', {}, '<strong>Note: Please make sure pop-up is allowed in your browser settings.</strong>', { parent: dialog });
  const style = createTag('style', {}, `
    @keyframes progress-bar-indeterminate {
      0% {
        transform: translateX(-100%);
      }
      50% {
        transform: translateX(0%);
      }
      100% {
        transform: translateX(200%);
      }
    }
  `);

  // Create the progress bar container
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

  // Create the progress bar indicator
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

  // Append the elements to the shadow root
  progressBar.appendChild(progressBarIndicator);
  dialog.appendChild(style);
  dialog.appendChild(progressBar);
  const buttonContainer = createTag('div', { class: 'button-container' }, '', { parent: dialog });
  createTag('sp-button', { variant: 'cta', slot: 'button', id: 'cancel-preview' }, 'Cancel', { parent: buttonContainer });

  underlay.open = true;

  return dialog;
}

function buildPreviewLoadingFailedDialog(props) {
  const spTheme = props.el.querySelector('#form-app');
  if (!spTheme) return;

  const underlay = spTheme.querySelector('sp-underlay');
  const dialog = spTheme.querySelector('sp-dialog');

  if (!underlay || !dialog) return;

  underlay.open = false;
  dialog.innerHTML = '';

  createTag('h1', { slot: 'heading' }, 'Preview generation failed.', { parent: dialog });
  createTag('p', {}, 'Your changes have been saved. Our system is working in the background to update the page.', { parent: dialog });
  const slackLink = createTag('a', { href: 'https://adobe.enterprise.slack.com/archives/C07KPJYA760' }, 'Slack');
  const emailLink = createTag('a', { href: 'mailto:Grp-acom-milo-events-support@adobe.com' }, 'Grp-acom-milo-events-support@adobe.com');
  createTag('p', {}, `Please try again later. If the issue persists, please feel free to contact us on <b>${slackLink.outerHTML}</b> or email <b>${emailLink.outerHTML}</b>`, { parent: dialog });
  const buttonContainer = createTag('div', { class: 'button-container' }, '', { parent: dialog });
  const cancelButton = createTag('sp-button', { variant: 'cta', slot: 'button', id: 'cancel-preview' }, 'OK', { parent: buttonContainer });

  underlay.open = true;

  cancelButton.addEventListener('click', () => {
    closeDialog(props);
    dialog.innerHTML = '';
  });
}

async function getNonProdPreviewDataById(props) {
  if (!props.eventDataResp) return null;

  const { eventId } = props.eventDataResp;

  if (!eventId) return null;

  const esEnv = getEventServiceEnv();
  const resp = await fetch(`${getEventPageHost()}/events/default/${esEnv === 'prod' ? '' : `${esEnv}/`}metadata-preview.json`);
  if (resp.ok) {
    const json = await resp.json();
    const pageData = json.data.find((d) => d['event-id'] === eventId);

    if (pageData) return pageData;

    window.lana?.log('Failed to find non-prod metadata for current page');
    return null;
  }

  window.lana?.log('Failed to fetch non-prod metadata:', resp);
  return null;
}

async function validatePreview(props, oldResp, cta) {
  let retryCount = 0;

  const currentData = { ...props.eventDataResp };
  const oldData = { ...oldResp };

  if (!hasContentChanged(currentData, oldData) || !Object.keys(oldData).length) {
    window.open(cta.href);
    return Promise.resolve();
  }

  const modificationTimeMatch = (metadataObj) => {
    const metadataModTimestamp = new Date(metadataObj['modification-time']).getTime();
    return metadataModTimestamp === props.eventDataResp.modificationTime;
  };

  return new Promise((resolve) => {
    const interval = setInterval(async () => {
      try {
        retryCount += 1;
        const metadataJson = await getNonProdPreviewDataById(props);

        if (metadataJson && modificationTimeMatch(metadataJson)) {
          clearInterval(interval);
          closeDialog(props);
          window.open(cta.href);
          resolve();
        } else if (retryCount >= 30) {
          clearInterval(interval);
          buildPreviewLoadingFailedDialog(props);
          window.lana?.log('Error: Failed to match metadata after 30 retries');
          resolve();
        }
      } catch (error) {
        window.lana?.log('Error in interval fetch:', error);
        clearInterval(interval);
        resolve();
      }
    }, Math.floor(Math.random() * (2000 - 1000 + 1)) + 1000);

    const dialog = buildPreviewLoadingDialog(props, interval);

    if (dialog) {
      const cancelButton = dialog.querySelector('#cancel-preview');
      cancelButton.addEventListener('click', () => {
        closeDialog(props);
        if (interval) clearInterval(interval);
        resolve();
      });
    }
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

  let oldResp = { ...props.eventDataResp };
  ctas.forEach((cta) => {
    if (cta.href) {
      const ctaUrl = new URL(cta.href);

      if (['#pre-event', '#post-event'].includes(ctaUrl.hash)) {
        cta.classList.add('fill', 'preview-btns', 'preview-not-ready', ctaUrl.hash.replace('#', ''));
        cta.addEventListener('click', async (e) => {
          e.preventDefault();
          toggleBtnsSubmittingState(true);
          if (cta.classList.contains('preview-not-ready')) return;
          validatePreview(props, oldResp, cta).then(() => {
            toggleBtnsSubmittingState(false);
          });
        });
      }

      if (['#save', '#next'].includes(ctaUrl.hash)) {
        if (ctaUrl.hash === '#next') {
          cta.classList.add('next-button');
          const [nextStateText, finalStateText, doneStateText, republishStateText] = cta.textContent.split('||');

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
              oldResp = { ...props.eventDataResp };
              resp = await saveEvent(props, true);
            } else {
              oldResp = { ...props.eventDataResp };
              resp = await saveEvent(props);
            }

            if (resp?.error) {
              buildErrorMessage(props, resp);
            } else if (props.currentStep === props.maxStep) {
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
          } else {
            oldResp = { ...props.eventDataResp };
            const resp = await saveEvent(props);
            if (resp?.error) {
              buildErrorMessage(props, resp);
            }
          }

          toggleBtnsSubmittingState(false);
        });
      }
    }
  });

  backBtn.addEventListener('click', async () => {
    toggleBtnsSubmittingState(true);
    oldResp = { ...props.eventDataResp };
    const resp = await saveEvent(props);
    if (resp?.error) {
      buildErrorMessage(props, resp);
    } else {
      props.currentStep -= 1;
    }

    toggleBtnsSubmittingState(false);
  });
}

function updateCtas(props) {
  const formCtas = props.el.querySelectorAll('.form-handler-ctas-panel a');
  const { eventDataResp } = props;

  formCtas.forEach((a) => {
    if (a.classList.contains('preview-btns')) {
      const testTime = a.classList.contains('pre-event') ? +props.eventDataResp.localEndTimeMillis - 10 : +props.eventDataResp.localEndTimeMillis + 10;
      if (eventDataResp.detailPagePath) {
        a.href = `${getEventPageHost()}${eventDataResp.detailPagePath}?previewMode=true&cachebuster=${Date.now()}&timing=${testTime}`;
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
        if (resp?.error) {
          buildErrorMessage(props, resp);
        } else {
          navigateForm(props, i);
        }

        sideMenu.classList.remove('disabled');
      }
    });
  });
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

function updateStatusTag(props) {
  const { eventDataResp } = props;

  if (eventDataResp?.published === undefined) return;

  const currentFragment = getCurrentFragment(props);

  const headingSection = currentFragment.querySelector(':scope > .section:first-child');

  const eixstingStatusTag = headingSection.querySelector('.event-status-tag');
  if (eixstingStatusTag) eixstingStatusTag.remove();

  const heading = headingSection.querySelector('h2', 'h3', 'h3', 'h4');
  const headingWrapper = createTag('div', { class: 'step-heading-wrapper' });
  const dot = eventDataResp.published ? getIcon('dot-purple') : getIcon('dot-green');
  const text = eventDataResp.published ? 'Published' : 'Draft';
  const statusTag = createTag('span', { class: 'event-status-tag' });

  statusTag.append(dot, text);
  heading.parentElement?.replaceChild(headingWrapper, heading);
  headingWrapper.append(heading, statusTag);
}

async function buildECCForm(el) {
  const props = {
    el,
    currentStep: 0,
    farthestStep: 0,
    maxStep: el.querySelectorAll('.fragment').length - 1,
    payload: {},
    eventDataResp: {},
  };

  const dataHandler = {
    set(target, prop, value) {
      const oldValue = target[prop];
      target[prop] = value;

      if (prop.startsWith('required-fields-in-')) {
        initRequiredFieldsValidation(target);
      }

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
          setPayloadCache(value);
          updateComponentsOnPayloadChange(target);
          initRequiredFieldsValidation(target);
          break;
        }

        case 'eventDataResp': {
          setResponseCache(value);
          updateComponentsOnRespChange(target);
          updateCtas(target);
          if (value.error) {
            props.el.classList.add('show-error');
          } else {
            props.el.classList.remove('show-error');
          }
          break;
        }

        default:
          break;
      }

      return true;
    },
  };

  const proxyProps = new Proxy(props, dataHandler);

  decorateForm(el);

  const frags = el.querySelectorAll('.fragment');

  frags.forEach((frag) => {
    props[`required-fields-in-${frag.id}`] = [];

    frag.querySelectorAll(':scope > .section > .content').forEach((c) => {
      generateToolTip(c);
    });
  });

  await loadEventData(proxyProps);
  initFormCtas(proxyProps);
  initNavigation(proxyProps);
  await initComponents(proxyProps);
  updateRequiredFields(proxyProps);
  enableSideNavForEditFlow(proxyProps);
  initDeepLink(proxyProps);
  updateStatusTag(proxyProps);

  el.addEventListener('show-error-toast', (e) => {
    e.stopPropagation();
    e.preventDefault();
    buildErrorMessage(proxyProps, e.detail);
  });

  el.addEventListener('show-success-toast', (e) => {
    e.stopPropagation();
    e.preventDefault();
    showSaveSuccessMessage(proxyProps, e.detail);
  });
}

function buildLoadingScreen(el) {
  el.classList.add('loading');
  const loadingScreen = createTag('sp-theme', { color: 'light', scale: 'medium', class: 'loading-screen' });
  createTag('sp-progress-circle', { size: 'l', indeterminate: true }, '', { parent: loadingScreen });
  createTag('sp-field-label', {}, 'Loading Adobe Event Creation Console form...', { parent: loadingScreen });

  el.prepend(loadingScreen);
}

export default async function init(el) {
  buildLoadingScreen(el);
  const miloLibs = LIBS;
  const promises = Array.from(SPECTRUM_COMPONENTS).map(async (component) => {
    await import(`${miloLibs}/features/spectrum-web-components/dist/${component}.js`);
  });
  await Promise.all([
    import(`${miloLibs}/deps/lit-all.min.js`),
    ...promises,
  ]);

  const devToken = getDevToken();
  if (devToken && getEventServiceEnv() === 'local') {
    buildECCForm(el).then(() => {
      el.classList.remove('loading');
    });
    return;
  }

  await initProfileLogicTree({
    noProfile: () => {
      signIn();
    },
    noAccessProfile: () => {
      buildNoAccessScreen(el);
      el.classList.remove('loading');
    },
    validProfile: () => {
      buildECCForm(el).then(() => {
        el.classList.remove('loading');
      });
    },
  });
}
