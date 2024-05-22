import { getLibs } from '../../scripts/utils.js';
import { getIcon, buildNoAccessScreen, yieldToMain } from '../../utils/utils.js';
import { createEvent, updateEvent, publishEvent } from '../../scripts/esp-controller.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);
const { decorateButtons } = await import(`${getLibs()}/utils/decorate.js`);

// list of controllers for the handler to load
const SUPPORTED_COMPONENTS = [
  'checkbox',
  'event-format',
  'event-info',
  'img-upload',
  'venue-info',
  'profile',
  'event-agenda',
  'community-link',
];

const INPUT_TYPES = [
  'input[required]',
  'select[required]',
  'textarea[required]',
  'sp-textfield[required]',
  'sp-checkbox[required]',
];

async function initComponents(props) {
  SUPPORTED_COMPONENTS.forEach((comp) => {
    const mappedComponents = props.el.querySelectorAll(`.${comp}-component`);
    if (!mappedComponents?.length) return;

    mappedComponents.forEach(async (component) => {
      const { default: initComponent } = await import(`./controllers/${comp}-component-controller.js`);
      await initComponent(component);
    });
  });
}

async function gatherValues(props) {
  const allComponentPromises = SUPPORTED_COMPONENTS.map(async (comp) => {
    const mappedComponents = props.el.querySelectorAll(`.${comp}-component`);
    if (!mappedComponents.length) return {};

    const promises = Array.from(mappedComponents).map(async (component) => {
      const { onSubmit } = await import(`./controllers/${comp}-component-controller.js`);
      const componentPayload = await onSubmit(component, props);
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
        nav.classList.add('nav-item');

        if (index !== 0) {
          nav.classList.add('disabled');
        } else {
          nav.closest('li')?.classList.add('active');
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

async function saveEvent(props) {
  await gatherValues(props);
  if (props.currentStep === 0) {
    const resp = await createEvent(props.payload);
    props.payload = resp;
  } else if (props.currentStep < props.maxStep) {
    const resp = await publishEvent(props.payload.eventId, props.payload);
    props.payload = resp;
  } else {
    const resp = await updateEvent(props.payload.eventId, props.payload);
    props.payload = resp;
  }
}

function updateSideNav(props) {
  const sideNavs = props.el.querySelectorAll('.side-menu .nav-item');

  sideNavs.forEach((n, i) => {
    n.closest('li')?.classList.remove('active');
    if (i <= props.farthestStep) n.classList.remove('disabled');
    if (i === props.currentStep) n.closest('li')?.classList.add('active');
  });
}

function validateRequiredFields(fields) {
  const { search, hostname } = window.location;
  const urlParams = new URLSearchParams(search);
  const skipValidation = urlParams.get('skipValidation');

  if (skipValidation === 'true' && hostname === 'localhost') {
    return true;
  }

  return fields.length === 0 || Array.from(fields).every((f) => f.value);
}

function onStepValidate(props) {
  return function updateCtaStatus() {
    const frags = props.el.querySelectorAll('.fragment');
    const currentFrag = frags[props.currentStep];
    const stepValid = validateRequiredFields(props[`required-fields-in-${currentFrag.id}`]);
    const ctas = props.el.querySelectorAll('.form-handler-panel-wrapper a');

    ctas.forEach((cta) => {
      if (cta.classList.contains('back-btn')) {
        cta.classList.toggle('disabled', props.currentStep === 0);
      } else {
        cta.classList.toggle('disabled', !stepValid);
      }
    });
  };
}

function updateRequiredFields(props, stepIndex) {
  const frags = props.el.querySelectorAll('.fragment');
  const currentFrag = stepIndex || frags[props.currentStep];
  props[`required-fields-in-${currentFrag.id}`] = currentFrag.querySelectorAll(INPUT_TYPES.join());
}

function initRequiredFieldsValidation(props) {
  const frags = props.el.querySelectorAll('.fragment');
  const currentFrag = frags[props.currentStep];

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

  ctas.forEach((cta) => {
    if (cta.href) {
      const ctaUrl = new URL(cta.href);

      if (['#pre-event', '#post-event'].includes(ctaUrl.hash)) {
        cta.classList.add('fill');
        cta.addEventListener('click', async () => {
          await saveEvent(props);
          // TODO: use real .page links
          const targetRedirect = `${window.location.origin}/event/t3/dme/preview?eventId=${props.payload['event-id']}`;
          window.open(targetRedirect);
        });
      }

      if (['#save', '#next'].includes(ctaUrl.hash)) {
        if (ctaUrl.hash === '#next') {
          cta.classList.add('next-button');
          const [nextStateText, finalStateText, republishStateText] = cta.textContent.split('||');
          cta.textContent = nextStateText;
          cta.dataset.nextStateText = nextStateText;
          cta.dataset.finalStateText = finalStateText;
          cta.dataset.republishStateText = republishStateText;

          if (props.currentStep === frags.length - 1) {
            cta.textContent = finalStateText;
            cta.prepend(getIcon('golden-rocket'));
          } else {
            cta.textContent = nextStateText;
          }
        }

        cta.addEventListener('click', async () => {
          await saveEvent(props);

          if (ctaUrl.hash === '#next') {
            if (props.currentStep < props.maxStep) {
              navigateForm(props);
            }
          }
        });
      }
    }
  });

  backBtn.addEventListener('click', async () => {
    props.currentStep -= 1;
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
    nav.addEventListener('click', () => {
      if (!nav.closest('li')?.classList.contains('disabled')) {
        navigateForm(props, i);
      }
    });
  });
}

function prepopulateForm(props) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const eventId = urlParams.get('eventId');
  const frags = props.el.querySelectorAll('.fragment');

  if (!eventId) return;

  const eventObj = JSON.parse(localStorage.getItem(eventId));

  SUPPORTED_COMPONENTS.forEach((comp) => {
    const mappedComponents = props.el.querySelectorAll(`.${comp}-component`);
    if (!mappedComponents?.length) return;

    mappedComponents.forEach(async (component) => {
      const { onResume } = await import(`./controllers/${comp}-component-controller.js`);
      await onResume(component, eventObj);
    });
  });

  frags.forEach((frag, i) => {
    updateRequiredFields(props, i);

    if (validateRequiredFields(props[`required-fields-in-${frag.id}`])) {
      props.farthestStep = i + 1;
    }
  });
}

async function buildECCForm(el) {
  decorateForm(el);

  const props = {
    el,
    currentStep: 0,
    farthestStep: 0,
    maxStep: el.querySelectorAll('.fragment').length - 1,
    payload: {},
  };

  const frags = el.querySelectorAll('.fragment');

  frags.forEach((frag) => {
    props[`required-fields-in-${frag.id}`] = [];
  });

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

      return true;
    },
  };

  const proxyProps = new Proxy(props, dataHandler);

  initFormCtas(proxyProps);
  await initComponents(proxyProps);
  initRepeaters(proxyProps);
  initNavigation(proxyProps);
  prepopulateForm(proxyProps);
  updateRequiredFields(proxyProps);
}

export default async function init(el) {
  el.style.display = 'none';
  const miloLibs = getLibs();
  await Promise.all([
    import(`${miloLibs}/deps/lit-all.min.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/theme.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/textfield.js`),
  ]);

  const profile = window.bm8tr.get('imsProfile');
  const { search, hostname } = window.location;
  const urlParams = new URLSearchParams(search);
  const devMode = urlParams.get('devMode');

  if (devMode === 'true' && hostname === 'localhost') {
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
    const unsubscribe = window.bm8tr.subscribe('imsProfile', ({ newValue }) => {
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
