import { LIBS } from '../../scripts/scripts.js';
import {
  getIcon,
  buildNoAccessScreen,
  generateToolTip,
  camelToSentenceCase,
  signIn,
  getEventServiceEnv,
  getDevToken,
} from '../../scripts/utils.js';
import {
  createSeries,
  updateSeries,
  publishSeries,
  getSeriesById,
} from '../../scripts/esp-controller.js';
import getJoinedData, { getFilteredCachedResponse, quickFilter, setPayloadCache, setResponseCache } from './data-handler.js';
import { initProfileLogicTree } from '../../scripts/profile.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);
const { decorateButtons } = await import(`${LIBS}/utils/decorate.js`);

// list of controllers for the handler to load
const VANILLA_COMPONENTS = [
  'series-details',
  'series-templates',
  'series-additional-info',
];

const REQUIRED_INPUT_TYPES = [
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

const PUBLISHABLE_ATTRS = [
  'seriesName',
  'cloudType',
  'templateId',
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
      if (resp.status === 409 || resp.error.message === 'Request to ESP failed: {"message":"Series update invalid. The series has been modified since last fetch"}') {
        const toast = createTag('sp-toast', { open: true, variant: 'negative' }, 'The series has been updated by a different session since your last save.', { parent: toastArea });
        const url = new URL(window.location.href);
        url.searchParams.set('seriesId', getFilteredCachedResponse().seriesId);

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

function validateFields(fields) {
  return fields.length === 0 || Array.from(fields).every((f) => f.value && !f.invalid);
}

function onStepValidate(props) {
  return function updateSaveCtaStatus() {
    const currentFrag = getCurrentFragment(props);
    const stepValid = validateFields(props[`required-fields-in-${currentFrag.id}`]);
    const saveButton = props.el.querySelector('.series-creation-form-ctas-panel .save-button');
    const sideNavs = props.el.querySelectorAll('.side-menu .nav-item');

    saveButton.classList.toggle('disabled', !stepValid);

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

function validatePublishFields(props) {
  const publishAttributesFilled = PUBLISHABLE_ATTRS.every((attr) => props.payload[attr]);
  const publishButton = props.el.querySelector('.series-creation-form-ctas-panel .next-button');

  publishButton.classList.toggle('disabled', !publishAttributesFilled);
}

function enableSideNavForEditFlow(props) {
  const frags = props.el.querySelectorAll('.fragment');
  const completeFirstStep = Array.from(frags[0].querySelectorAll('.form-component'))
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
  // no-op
}

async function loadData(props) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const seriesId = urlParams.get('seriesId');

  if (seriesId) {
    props.el.classList.add('disabled');
    const data = await getSeriesById(seriesId);
    props.response = { ...props.response, ...data };
    props.el.classList.remove('disabled');
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

async function handleSeriesUpdate(props) {
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

  const cols = formBodyRow.querySelectorAll(':scope > div, :scope > sp-theme');

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
  if (!getFilteredCachedResponse().seriesId) return;
  const dashboardLink = props.el.querySelector('.side-menu > ul > li > a');

  if (!dashboardLink) return;

  const url = new URL(dashboardLink.href);

  if (url.searchParams.has('seriesId')) return;

  url.searchParams.set('newEventId', getFilteredCachedResponse().seriesId);
  dashboardLink.href = url.toString();
}

async function save(props, toPublish = false) {
  try {
    await gatherValues(props);
  } catch (e) {
    return { error: { message: e.message } };
  }

  let resp = props.response;

  const onSave = async () => {
    if (resp?.seriesId) await handleSeriesUpdate(props);

    if (!resp.error) {
      showSaveSuccessMessage(props);
    }
  };

  if (!resp.seriesId) {
    resp = await createSeries(quickFilter(props.payload));
    props.response = { ...props.response, ...resp };
    updateDashboardLink(props);
    await onSave();
  } else if (!toPublish) {
    resp = await updateSeries(
      resp.seriesId,
      getJoinedData(),
    );
    props.response = { ...props.response, ...resp };
    await onSave();
  } else if (toPublish) {
    resp = await publishSeries(
      resp.seriesId,
      getJoinedData(),
    );
    props.response = { ...props.response, ...resp };
    if (resp?.seriesId) await handleSeriesUpdate(props);
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
  props[`required-fields-in-${currentFrag.id}`] = currentFrag.querySelectorAll(REQUIRED_INPUT_TYPES.join());
}

function renderFormNavigation(props, prevStep, currentStep) {
  const nextBtn = props.el.querySelector('.series-creation-form-ctas-panel .next-button');
  const backBtn = props.el.querySelector('.series-creation-form-ctas-panel .back-btn');
  const frags = props.el.querySelectorAll('.fragment');

  frags[prevStep].classList.add('hidden');
  frags[currentStep].classList.remove('hidden');

  if (props.currentStep === props.maxStep) {
    if (props.response.published) {
      nextBtn.textContent = nextBtn.dataset.republishStateText;
    } else {
      nextBtn.textContent = nextBtn.dataset.finalStateText;
      nextBtn.prepend(getIcon('golden-rocket'));
    }
  } else {
    nextBtn.textContent = nextBtn.dataset.finalStateText;
    nextBtn.prepend(getIcon('golden-rocket'));
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
  decorateButtons(ctaRow, 'button-l');
  const ctas = ctaRow.querySelectorAll('a');
  ctaRow.classList.add('series-creation-form-ctas-panel');

  const forwardActionsWrappers = ctaRow.querySelectorAll(':scope > div');

  const panelWrapper = createTag('div', { class: 'series-creation-form-panel-wrapper' }, '', { parent: ctaRow });
  createTag('div', { class: 'series-creation-form-backward-wrapper' }, '', { parent: panelWrapper });
  const forwardWrapper = createTag('div', { class: 'series-creation-form-forward-wrapper' }, '', { parent: panelWrapper });

  forwardActionsWrappers.forEach((w) => {
    w.classList.add('action-area');
    forwardWrapper.append(w);
  });

  const toggleBtnsSubmittingState = (submitting) => {
    ctas.forEach((c) => {
      c.classList.toggle('submitting', submitting);
    });
  };

  ctas.forEach((cta) => {
    if (cta.href) {
      const ctaUrl = new URL(cta.href);

      if (['#save', '#next'].includes(ctaUrl.hash)) {
        if (ctaUrl.hash === '#next') {
          cta.classList.add('next-button');
          const [finalStateText, doneStateText, republishStateText] = cta.textContent.split('||');

          cta.textContent = finalStateText;
          cta.prepend(getIcon('golden-rocket'));
          cta.dataset.finalStateText = finalStateText;
          cta.dataset.doneStateText = doneStateText;
          cta.dataset.republishStateText = republishStateText;
        }

        if (ctaUrl.hash === '#save') {
          cta.classList.add('save-button');
        }

        cta.addEventListener('click', async (e) => {
          e.preventDefault();
          toggleBtnsSubmittingState(true);

          if (ctaUrl.hash === '#next') {
            let resp;
            if (props.currentStep === props.maxStep) {
              resp = await save(props, true);
            } else {
              resp = await save(props);
            }

            if (resp?.error) {
              buildErrorMessage(props, resp);
            } else if (props.currentStep === props.maxStep) {
              const toastArea = props.el.querySelector('.toast-area');
              cta.textContent = cta.dataset.doneStateText;
              cta.classList.add('disabled');

              if (toastArea) {
                const toast = createTag('sp-toast', { open: true, variant: 'positive' }, 'Success! This series has been published.', { parent: toastArea });
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
            const resp = await save(props);
            if (resp?.error) {
              buildErrorMessage(props, resp);
            }
          }

          toggleBtnsSubmittingState(false);
        });
      }
    }
  });
}

function updateCtas(props) {
  const formCtas = props.el.querySelectorAll('.series-creation-form-ctas-panel a');

  formCtas.forEach((a) => {
    if (a.classList.contains('next-button')) {
      if (props.currentStep === props.maxStep) {
        if (props.response.published) {
          a.textContent = a.dataset.republishStateText;
        } else {
          a.textContent = a.dataset.finalStateText;
          a.prepend(getIcon('golden-rocket'));
        }
      } else {
        a.textContent = a.dataset.finalStateText;
        a.prepend(getIcon('golden-rocket'));
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

        const resp = await save(props);
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
  const { response } = props;

  if (response?.published === undefined) return;

  const currentFragment = getCurrentFragment(props);

  const headingSection = currentFragment.querySelector(':scope > .section:first-child');

  const eixstingStatusTag = headingSection.querySelector('.status-tag');
  if (eixstingStatusTag) eixstingStatusTag.remove();

  const heading = headingSection.querySelector('h2', 'h3', 'h3', 'h4');
  const headingWrapper = createTag('div', { class: 'step-heading-wrapper' });
  const dot = response.published ? getIcon('dot-purple') : getIcon('dot-green');
  const text = response.published ? 'Published' : 'Draft';
  const statusTag = createTag('span', { class: 'status-tag' });

  statusTag.append(dot, text);
  heading.parentElement?.replaceChild(headingWrapper, heading);
  headingWrapper.append(heading, statusTag);
}

async function buildForm(el) {
  const props = {
    el,
    currentStep: 0,
    farthestStep: 0,
    maxStep: el.querySelectorAll('.fragment').length - 1,
    payload: {},
    response: {},
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
          validatePublishFields(target);
          break;
        }

        case 'response': {
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

  await loadData(proxyProps);
  initFormCtas(proxyProps);
  initNavigation(proxyProps);
  await initComponents(proxyProps);
  validatePublishFields(proxyProps);
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
  createTag('sp-field-label', {}, 'Loading Adobe event series creation form...', { parent: loadingScreen });

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
    buildForm(el).then(() => {
      el.classList.remove('loading');
    });
    return;
  }

  initProfileLogicTree('series-creation-form', {
    noProfile: () => {
      signIn();
    },
    noAccessProfile: () => {
      buildNoAccessScreen(el);
      el.classList.remove('loading');
    },
    validProfile: () => {
      buildForm(el).then(() => {
        el.classList.remove('loading');
      });
    },
  });
}
