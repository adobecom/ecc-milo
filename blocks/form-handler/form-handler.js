import { getLibs } from '../../scripts/utils.js';
import { getIcon, buildNoAccessScreen, yieldToMain } from '../../utils/utils.js';
import { createEvent, updateEvent, publishEvent, getEvent } from '../../utils/esp-controller.js';
import { ImageDropzone } from '../../components/image-dropzone/image-dropzone.js';
import { Profile } from '../../components/profile/profile.js';
import { Repeater } from '../../components/repeater/repeater.js';
import PartnerSelector from '../../components/partner-selector/partner-selector.js';
import AgendaFieldset from '../../components/agenda-fieldset/agenda-fieldset.js';
import { ProfileContainer } from '../../components/profile-container/profile-container.js';
import { CustomTextfield } from '../../components/custom-textfield/custom-textfield.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);
const { decorateButtons } = await import(`${getLibs()}/utils/decorate.js`);

// list of controllers for the handler to load
const VANILLA_COMPONENTS = [
  'checkbox',
  'event-format',
  'event-info',
  'img-upload',
  'venue-info',
  'profile',
  'event-agenda',
  'event-community-link',
  'event-partners',
  'terms-conditions',
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
];

async function initComponents(props) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const eventId = urlParams.get('eventId');

  if (eventId) props.payload = await getEvent(eventId);

  VANILLA_COMPONENTS.forEach((comp) => {
    const mappedComponents = props.el.querySelectorAll(`.${comp}-component`);
    if (!mappedComponents?.length) return;

    mappedComponents.forEach(async (component) => {
      const { default: initComponent } = await import(`./controllers/${comp}-component-controller.js`);
      await initComponent(component, props);
    });
  });

  customElements.define('image-dropzone', ImageDropzone);
  customElements.define('profile-ui', Profile);
  customElements.define('repeater-element', Repeater);
  customElements.define('partner-selector', PartnerSelector);
  customElements.define('agenda-fieldset', AgendaFieldset);
  customElements.define('profile-container', ProfileContainer);
  customElements.define('custom-textfield', CustomTextfield);
}

async function gatherValues(props) {
  const allComponentPromises = VANILLA_COMPONENTS.map(async (comp) => {
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
    props.payload = { ...props.payload, ...resp };
  } else if (props.currentStep < props.maxStep) {
    const resp = await publishEvent(props.payload.eventId, props.payload);
    props.payload = { ...props.payload, ...resp };
  } else {
    const resp = await updateEvent(props.payload.eventId, props.payload);
    props.payload = { ...props.payload, ...resp };
  }
  console.log('payload update', props.payload)
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
  const { search } = window.location;
  const urlParams = new URLSearchParams(search);
  const skipValidation = urlParams.get('skipValidation');

  if (skipValidation === 'true' && ['stage', 'local'].includes(window.miloConfig.env.name)) {
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

function updateImgDropzoneConfigs(frag, props) {
  const dropzones = frag.querySelectorAll('image-dropzone');

  dropzones.forEach((dz) => {
    const wrappingBlock = dz.closest('.form-component');

    if (wrappingBlock.classList.contains('img-upload-component')) {
      const type = `event-${wrappingBlock.classList[1]}-image`;

      const configs = {
        type,
        altText: `Event ${wrappingBlock.classList[1]} image`,
        targetUrl: `http://localhost:8500/v1/events/${props.payload.eventId}/images`,
      };
      dz.setAttribute('configs', JSON.stringify(configs));
    }
  });
}

function updateRequiredFields(props, stepIndex) {
  const frags = props.el.querySelectorAll('.fragment');
  const currentFrag = stepIndex || frags[props.currentStep];
  props[`required-fields-in-${currentFrag.id}`] = currentFrag.querySelectorAll(INPUT_TYPES.join());

  updateImgDropzoneConfigs(currentFrag, props);
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

async function buildECCForm(el) {
  const props = {
    el,
    currentStep: 0,
    farthestStep: 0,
    maxStep: el.querySelectorAll('.fragment').length - 1,
    payload: {},
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

      return true;
    },
  };

  const proxyProps = new Proxy(props, dataHandler);

  decorateForm(el);

  const frags = el.querySelectorAll('.fragment');

  frags.forEach((frag) => {
    props[`required-fields-in-${frag.id}`] = [];
  });

  initFormCtas(proxyProps);
  await initComponents(proxyProps);
  initRepeaters(proxyProps);
  initNavigation(proxyProps);
  updateRequiredFields(proxyProps);
}

export default async function init(el) {
  el.style.display = 'none';
  const miloLibs = getLibs();
  const promises = Array.from(SPECTRUM_COMPONENTS).map(async (component) => {
    await import(`${miloLibs}/features/spectrum-web-components/dist/${component}.js`);
  });
  await Promise.all([
    import(`${miloLibs}/deps/lit-all.min.js`),
    ...promises,
  ]);

  const profile = window.bm8tr.get('imsProfile');
  const { search } = window.location;
  const urlParams = new URLSearchParams(search);
  const devMode = urlParams.get('devMode');

  if (devMode === 'true' && ['stage', 'local'].includes(window.miloConfig.env.name)) {
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
