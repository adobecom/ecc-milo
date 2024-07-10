import { LIBS, MILO_CONFIG } from '../../scripts/scripts.js';
import { getIcon, buildNoAccessScreen, yieldToMain, generateToolTip, camelToSentenceCase } from '../../scripts/utils.js';
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
import getJoinedData, { getFilteredCachedResponse, quickFilter, setPayloadCache, setResponseCache } from './data-handler.js';
import BlockMediator from '../../scripts/deps/block-mediator.min.js';

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
  'toast',
];

function buildErrorMessage(props, resp) {
  if (!resp) return;

  let toastArea = props.el.querySelector('.toast-area');

  if (!toastArea) {
    const spTheme = props.el.querySelector('sp-theme');
    if (!spTheme) return;
    toastArea = createTag('div', { class: 'toast-area' }, '', { parent: spTheme });
  }

  if (resp.errors) {
    const messages = [];

    resp.errors.forEach((error) => {
      const errorPathSegments = error.path.split('/');
      const text = `${camelToSentenceCase(errorPathSegments[errorPathSegments.length - 1])} ${error.message}`;
      messages.push(text);
    });

    messages.forEach((msg, i) => {
      const toast = createTag('sp-toast', { open: true, variant: 'negative', timeout: 6000 + (i * 1000) }, msg, { parent: toastArea });
      toast.addEventListener('close', () => {
        toast.remove();
      });
    });
  } else if (resp.message) {
    const toast = createTag('sp-toast', { open: true, variant: 'negative', timeout: 6000 }, resp.message, { parent: toastArea });
    toast.addEventListener('close', () => {
      toast.remove();
    });
  }
}

function replaceAnchorWithButton(anchor) {
  if (!anchor || anchor.tagName !== 'A') {
    console.error('The provided element is not an anchor tag.');
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

function enableSideNavForEditFlow(props) {
  const frags = props.el.querySelectorAll('.fragment');
  frags.forEach((frag, i) => {
    if (frag.querySelector('.form-component.prefilled')) {
      props.farthestStep = Math.max(props.farthestStep, i);
    }
  });
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
}

async function initComponents(props) {
  initCustomLitComponents();
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const eventId = urlParams.get('eventId');

  if (eventId) {
    const eventData = await getEvent(eventId);
    props.eventDataResp = { ...props.eventDataResp, ...eventData };
  }

  const componentPromises = VANILLA_COMPONENTS.map(async (comp) => {
    const mappedComponents = props.el.querySelectorAll(`.${comp}-component`);
    if (!mappedComponents?.length) return;

    const componentInitPromises = Array.from(mappedComponents).map(async (component) => {
      const { default: initComponent } = await import(`./controllers/${comp}-component-controller.js`);
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
      const { onSubmit } = await import(`./controllers/${comp}-component-controller.js`);
      await onSubmit(component, props);
    });

    return Promise.all(promises);
  });

  await Promise.all(allComponentPromises);
}

async function updateComponents(props) {
  const allComponentPromises = VANILLA_COMPONENTS.map(async (comp) => {
    const mappedComponents = props.el.querySelectorAll(`.${comp}-component`);
    if (!mappedComponents.length) return {};

    const promises = Array.from(mappedComponents).map(async (component) => {
      const { onUpdate } = await import(`./controllers/${comp}-component-controller.js`);
      const componentPayload = await onUpdate(component, props);
      return componentPayload;
    });

    return Promise.all(promises);
  });

  await Promise.all(allComponentPromises);
}

function decorateForm(el) {
  const app = createTag('sp-theme', { color: 'light', scale: 'medium' });
  const form = createTag('form', {}, '', { parent: app });
  const formDivs = el.querySelectorAll('.fragment');

  if (!formDivs.length) {
    el.remove();
    return;
  }

  formDivs.forEach((formDiv) => {
    formDiv.parentElement.replaceChild(app, formDiv);
    form.append(formDiv);
  });

  const cols = el.querySelectorAll(':scope > div:first-of-type > div');

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

async function saveEvent(props, options = { toPublish: false }) {
  await gatherValues(props);

  let resp;

  if (props.currentStep === 0 && !getFilteredCachedResponse().eventId) {
    resp = await createEvent(quickFilter(props.payload));
    props.eventDataResp = { ...props.eventDataResp, ...resp };
    if (resp?.eventId) document.dispatchEvent(new CustomEvent('eventcreated', { detail: { eventId: resp.eventId } }));
  } else if (props.currentStep <= props.maxStep && !options.toPublish) {
    resp = await updateEvent(
      getFilteredCachedResponse().eventId,
      getJoinedData(),
    );
    props.eventDataResp = { ...props.eventDataResp, ...resp };
  } else if (options.toPublish) {
    resp = await publishEvent(
      getFilteredCachedResponse().eventId,
      getJoinedData(),
    );
    props.eventDataResp = { ...props.eventDataResp, ...resp };
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

function validateRequiredFields(fields) {
  const { search } = window.location;
  const urlParams = new URLSearchParams(search);
  const skipValidation = urlParams.get('skipValidation');

  if (skipValidation === 'true' && ['stage', 'local'].includes(MILO_CONFIG.env.name)) {
    return true;
  }

  return fields.length === 0 || Array.from(fields).every((f) => f.value);
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

function updateProfileContainer(props) {
  const containers = document.querySelectorAll('profile-container');
  containers.forEach((c) => {
    c.setAttribute('seriesId', props.payload.seriesId);
    c.requestUpdate();
  });
}

function updateRequiredFields(props) {
  const currentFrag = getCurrentFragment(props);
  props[`required-fields-in-${currentFrag.id}`] = currentFrag.querySelectorAll(INPUT_TYPES.join());
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

function setRemoveEventListener(removeElement) {
  removeElement.addEventListener('click', (event) => {
    // FIXME : Use a generic approach to call remove of the handler.
    // event.currentTarget.getAttribute('deleteHandler')();
    event.currentTarget.parentNode.parentNode.parentNode.remove();
  });
}

function initRepeaters(props) {
  const repeaters = props.el.querySelectorAll('.repeater-element');
  repeaters.forEach((element) => {
    const vanillaNode = element.previousElementSibling.cloneNode(true);
    element.addEventListener('click', (event) => {
      const clonedNode = vanillaNode.cloneNode(true);
      const prevNode = event.currentTarget.previousElementSibling;
      clonedNode.setAttribute('repeatIdx', parseInt(prevNode.getAttribute('repeatIdx'), 10) + 1);

      // Reset delete icon state and add listener.
      const deleteIcon = clonedNode.querySelector('.repeater-delete-button');

      if (deleteIcon) {
        deleteIcon.classList.remove('hidden');
        setRemoveEventListener(deleteIcon);
      }

      prevNode.after(clonedNode);
      const tempProps = { el: clonedNode };
      yieldToMain().then(() => {
        updateRequiredFields(props);
        initRepeaters(tempProps);
      });
    });
  });
}

function renderFormNavigation(props, prevStep, currentStep) {
  const nextBtn = props.el.querySelector('.form-handler-ctas-panel .next-button');
  const backBtn = props.el.querySelector('.form-handler-ctas-panel .back-btn');
  const frags = props.el.querySelectorAll('.fragment');

  frags[prevStep].classList.add('hidden');
  frags[currentStep].classList.remove('hidden');

  if (currentStep === props.maxStep) {
    nextBtn.textContent = nextBtn.dataset.finalStateText;
  } else {
    nextBtn.textContent = nextBtn.dataset.nextStateText;
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

function initFormCtas(props) {
  const ctaRow = props.el.querySelector(':scope > div:last-of-type');
  const frags = props.el.querySelectorAll('.fragment');
  decorateButtons(ctaRow, 'button-l');
  const ctas = ctaRow.querySelectorAll('a');

  ctaRow.classList.add('form-handler-ctas-panel');

  const forwardActionsWrappers = ctaRow.querySelectorAll(':scope > div');

  const panelWrapper = createTag('div', { class: 'form-handler-panel-wrapper' }, '', { parent: ctaRow });
  const backwardWrapper = createTag('div', { class: 'form-handler-backward-wrapper' }, '', { parent: panelWrapper });
  const forwardWrapper = createTag('div', { class: 'form-handler-forward-wrapper' }, '', { parent: panelWrapper });

  forwardActionsWrappers.forEach((w) => {
    forwardWrapper.append(w);
  });

  const backBtn = createTag('a', { class: 'back-btn' }, getIcon('chev-left-white'));

  backwardWrapper.append(backBtn);

  const toggleBtnsSubmittingState = (submitting) => {
    ctas.forEach((c) => {
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
          if (cta.classList.contains('preview-not-ready')) return;
          const resp = await saveEvent(props);

          if (resp?.errors || resp?.message) {
            buildErrorMessage(props, resp);
          } else {
            window.open(cta.href);
          }

          toggleBtnsSubmittingState(false);
        });
      }

      if (['#save', '#next'].includes(ctaUrl.hash)) {
        if (ctaUrl.hash === '#next') {
          cta.classList.add('next-button');
          const [nextStateText, finalStateText, doneStateText, republishStateText] = cta.textContent.split('||');
          cta.textContent = nextStateText;
          cta.dataset.nextStateText = nextStateText;
          cta.dataset.finalStateText = finalStateText;
          cta.dataset.doneStateText = doneStateText;
          cta.dataset.republishStateText = republishStateText;

          if (props.currentStep === props.maxStep) {
            if (getJoinedData().published) {
              cta.textContent = republishStateText;
            } else {
              cta.textContent = finalStateText;
            }
            cta.prepend(getIcon('golden-rocket'));
          } else {
            cta.textContent = nextStateText;
          }
        }

        cta.addEventListener('click', async (e) => {
          e.preventDefault();
          toggleBtnsSubmittingState(true);

          if (ctaUrl.hash === '#next') {
            let resp;
            if (props.currentStep === props.maxStep) {
              resp = await saveEvent(props, { toPublish: true });
            } else {
              resp = await saveEvent(props);
            }

            if (resp?.errors || resp?.message) {
              buildErrorMessage(props, resp);
            } else if (props.currentStep === props.maxStep) {
              const dashboardLink = props.el.querySelector('.side-menu > ul > li > a');
              const msg = createTag('div', { class: 'toast-message dark success-message' }, 'Success! This event has been published.', { parent: cta });
              createTag('a', { class: 'con-button outline', href: dashboardLink.href }, 'Go to dashboard', { parent: msg });
              let toastArea = props.el.querySelector('.toast-area');
              cta.textContent = cta.dataset.doneStateText;
              cta.classList.add('disabled');
              if (!toastArea) {
                const spTheme = props.el.querySelector('sp-theme');
                if (!spTheme) return;
                toastArea = createTag('div', { class: 'toast-area' }, '', { parent: spTheme });
              }

              const toast = createTag('sp-toast', { open: true, variant: 'positive' }, msg, { parent: toastArea });
              toast.addEventListener('close', () => {
                toast.remove();
              });
            } else {
              navigateForm(props);
            }
          } else {
            const resp = await saveEvent(props);
            if (resp?.errors || resp?.message) {
              buildErrorMessage(props, resp);
            }
          }

          toggleBtnsSubmittingState(false);
        });
      }
    }
  });

  backBtn.addEventListener('click', async () => {
    props.currentStep -= 1;
  });
}

function updateCtas(props) {
  const formCtas = props.el.querySelectorAll('.form-handler-ctas-panel a');
  const filteredResponse = getFilteredCachedResponse();

  formCtas.forEach((a) => {
    if (a.classList.contains('preview-btns')) {
      const testTime = a.classList.contains('pre-event') ? +props.eventDataResp.localEndTimeMillis - 10 : +props.eventDataResp.localEndTimeMillis + 10;
      if (filteredResponse.detailPagePath) {
        a.href = `https://stage--events-milo--adobecom.hlx.page${filteredResponse.detailPagePath}?previewMode=true&timing=${testTime}`;
        a.classList.remove('preview-not-ready');
      }
    }

    if (a.classList.contains('next-button')) {
      if (props.currentStep === props.maxStep) {
        if (filteredResponse.published) {
          a.textContent = a.dataset.republishStateText;
        } else {
          a.textContent = a.dataset.finalStateText;
        }
      } else {
        a.textContent = a.dataset.nextStateText;
      }
    }
  });
}

function initNavigation(props) {
  const frags = props.el.querySelectorAll('.fragment');
  const navItems = props.el.querySelectorAll('.side-menu .nav-item');

  frags.forEach((frag, i) => {
    if (i !== 0) {
      frag.classList.add('hidden');
    }
  });

  navItems.forEach((nav, i) => {
    nav.addEventListener('click', async () => {
      if (!nav.disabled) {
        const resp = await saveEvent(props);
        if (resp?.errors || resp?.message) {
          buildErrorMessage(props, resp);
        } else {
          navigateForm(props, i);
        }
      }
    });
  });
}

function updateDashboardLink(props) {
  // FIXME: presuming first link is dashboard link is not good.
  if (!getFilteredCachedResponse().eventId) return;
  const dashboardLink = props.el.querySelector('.side-menu > ul > li > a');

  if (!dashboardLink) return;

  const url = new URL(dashboardLink.href);
  url.searchParams.set('newEventId', getFilteredCachedResponse().eventId);
  dashboardLink.href = url.toString();
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

      if (prop === 'currentStep') {
        renderFormNavigation(target, oldValue, value);
        updateSideNav(target);
        initRequiredFieldsValidation(target);
      }

      if (prop === 'farthestStep') {
        updateSideNav(target);
      }

      if (prop === 'payload') {
        console.log('payload updated with: ', value);
        setPayloadCache(value);
        updateComponents(target);
        updateProfileContainer(target);
        initRequiredFieldsValidation(target);
      }
      if (prop === 'eventDataResp') {
        console.log('response updated with: ', value);
        setResponseCache(value);
        updateCtas(target);
        updateDashboardLink(target);
        if (value.message || value.errors) {
          props.el.classList.add('show-error');
        } else {
          props.el.classList.remove('show-error');
        }
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

  initFormCtas(proxyProps);
  await initComponents(proxyProps);
  initRepeaters(proxyProps);
  initNavigation(proxyProps);
  updateRequiredFields(proxyProps);
  enableSideNavForEditFlow(proxyProps);
  initDeepLink(proxyProps);
}

export default async function init(el) {
  el.style.display = 'none';
  const miloLibs = LIBS;
  const promises = Array.from(SPECTRUM_COMPONENTS).map(async (component) => {
    await import(`${miloLibs}/features/spectrum-web-components/dist/${component}.js`);
  });
  await Promise.all([
    import(`${miloLibs}/deps/lit-all.min.js`),
    ...promises,
  ]);

  const profile = BlockMediator.get('imsProfile');
  const { search } = window.location;
  const urlParams = new URLSearchParams(search);
  const devMode = urlParams.get('devMode');

  if (devMode === 'true' && ['stage', 'local'].includes(MILO_CONFIG.env.name)) {
    buildECCForm(el);
    el.removeAttribute('style');
    return;
  }

  if (profile) {
    if (profile.noProfile || profile.account_type !== 'type3') {
      buildNoAccessScreen(el);
    } else {
      buildECCForm(el);
    }

    el.removeAttribute('style');
    return;
  }

  if (!profile) {
    const unsubscribe = BlockMediator.subscribe('imsProfile', ({ newValue }) => {
      if (newValue?.noProfile || newValue.account_type !== 'type3') {
        buildNoAccessScreen(el);
      } else {
        buildECCForm(el);
      }
      el.removeAttribute('style');
      unsubscribe();
    });
  }
}
