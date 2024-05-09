import { getLibs } from '../../scripts/utils.js';
import { getIcon, handlize, buildNoAccessScreen } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);
const { decorateButtons } = await import(`${getLibs()}/utils/decorate.js`);
const { default: getUuid } = await import(`${getLibs()}/utils/getUuid.js`);

// list of controllers for the handler to load
const SUPPORTED_COMPONENTS = [
  'checkbox',
  'event-format',
  'event-info',
  'img-upload',
  'venue-info',
];

let formElement;

const formState = {
  currentStep: 0,
  farthestStep: 0,
  steps: {},
};

function initComponents() {
  SUPPORTED_COMPONENTS.forEach((comp) => {
    const mappedComponents = formElement.querySelectorAll(`.${comp}-component`);
    if (!mappedComponents?.length) return;

    mappedComponents.forEach(async (component) => {
      const { default: initComponent } = await import(`./controllers/${comp}-component-controller.js`);
      await initComponent(component);
    });
  });
}

async function gatherValues(inputMap) {
  const allComponentPromises = SUPPORTED_COMPONENTS.map(async (comp) => {
    const mappedComponents = formElement.querySelectorAll(`.${comp}-component`);
    if (!mappedComponents.length) return {};

    const promises = Array.from(mappedComponents).map(async (component) => {
      const { onSubmit } = await import(`./controllers/${comp}-component-controller.js`);
      const componentPayload = await onSubmit(component, inputMap);
      return componentPayload;
    });

    return Promise.all(promises).then((r) => r.reduce((acc, curr) => ({ ...acc, ...curr }), {}));
  });

  const results = await Promise.all(allComponentPromises);
  const finalPayload = results.reduce((acc, p) => (p ? { ...acc, ...p } : acc), {});
  return finalPayload;
}

function decorateForm() {
  const app = createTag('sp-theme', { color: 'light', scale: 'medium' });
  const form = createTag('form', {}, '', { parent: app });
  const formDivs = formElement.querySelectorAll('.fragment');

  if (!formDivs.length) {
    formElement.remove();
    return;
  }

  formDivs.forEach((formDiv) => {
    formDiv.parentElement.replaceChild(app, formDiv);
    form.append(formDiv);
  });

  const cols = formElement.querySelectorAll(':scope > div:first-of-type > div');

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
      const frags = formElement.querySelectorAll('.fragment');

      frags.forEach((frag) => {
        const fragPathSegments = frag.dataset.path.split('/');
        const fragId = `form-step-${fragPathSegments[fragPathSegments.length - 1]}`;
        frag.id = fragId;
        formState.steps[fragId] = {};
      })
    }
  });

  return form;
}

function formatDate(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${month}-${day}-${year}`;
}

function formatDateTime(date) {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

async function getEventIdAndUrl(payload) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const eventId = urlParams.get('eventId');

  if (eventId) {
    const eventUrl = JSON.parse(localStorage.getItem(eventId)).url;
    return [eventId, eventUrl];
  }

  const date = new Date(payload['event-start']);
  const formattedDate = formatDate(date);
  const pathname = `/event/t3/${formattedDate}/${payload.city}/${payload.state}/${handlize(payload['event-title'])}`;
  const hash = await getUuid(pathname);

  return [hash, pathname];
}

async function saveEvent(inputMap) {
  const payload = await gatherValues(inputMap);
  const [hash, pathname] = await getEventIdAndUrl(payload);
  payload['event-id'] = hash;
  payload.url = pathname;
  localStorage.setItem(payload['event-id'], JSON.stringify(payload));
  return payload;
}

async function postForm(payload) {
  const myHeaders = new Headers();
  myHeaders.append('Host', 'cchome-stage.adobe.io');
  myHeaders.append('x-api-key', 'SplashThatWebhook');
  myHeaders.append('content-type', 'application/json');

  const raw = JSON.stringify({
    eventId: payload['event-id'],
    title: payload['event-title'],
    eventType: 'Networking Event',
    startDate: formatDateTime(new Date(payload['event-start'])),
    endDate: formatDateTime(new Date(payload['event-end'])),
    timezone: payload['time-zone'] || 'America/Los_Angeles',
    venue: payload['event-venue'],
    venueAddress: payload['event-address'],
    venueCity: payload.city,
    venueState: payload.state,
    venueZipcode: payload.zipCode,
    venueCountry: payload.country,
    creationTime: formatDateTime(new Date()),
    modificationTime: formatDateTime(new Date()),
    description: payload['event-description'],
    thumbnail: 'https://images.unsplash.com/photo-1429667947446-3c93a979b7e0?ixlib=rb-1.2.1&q=80&fm=jpg&crop=entropy&cs=tinysrgb&w=1080&fit=max&ixid=eyJhcHBfaWQiOjk1MTh9',
  });

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow',
  };

  fetch('https://cchome-stage.adobe.io/lod/v1/webhooks/platforms/splash-that/resources/event?=', requestOptions)
    .then((response) => response.text())
    .then((result) => console.log(result))
    .catch((error) => console.error(error));
}

function updateSideNav() {
  const sideNavs = formElement.querySelectorAll('.side-menu .nav-item');

  sideNavs.forEach((n, i) => {
    n.closest('li')?.classList.remove('active');
    if (i <= formState.farthestStep) n.classList.remove('disabled');
    if (i === formState.currentStep) n.closest('li')?.classList.add('active');
  });
}

function validateRequiredFields(fields) {
  return fields.length === 0 || Array.from(fields).every((f) => f.value)
}

function updateCtaStatus() {
  const frags = formElement.querySelectorAll('.fragment');
  const currentFrag = frags[formState.currentStep];
  const stepValid = validateRequiredFields(formState.steps[currentFrag.id].requiredFields);
  const ctas = formElement.querySelectorAll('.form-handler-panel-wrapper a');
  
  ctas.forEach((cta) => {
    if (cta.classList.contains('back-btn')) {
      cta.classList.toggle('disabled', !stepValid || formState.currentStep === 0);
    } else {
      cta.classList.toggle('disabled', !stepValid);
    }
  })
}

export function initRequiredFieldsValidation() {
  const frags = formElement.querySelectorAll('.fragment');
  const currentFrag = frags[formState.currentStep];
  formState.steps[currentFrag.id].requiredFields = querySelectorAllDeep('input[required], select[required], textarea[required]', currentFrag);
  updateCtaStatus()

  formState.steps[currentFrag.id].requiredFields.forEach((field) => {
    field.removeEventListener('change', updateCtaStatus)
    field.addEventListener('change', updateCtaStatus, { bubbles: true });
  })
}

function navigateForm(stepIndex = formState.currentStep + 1) {
  const frags = formElement.querySelectorAll('.fragment');

  const nextBtn = formElement.querySelector('.form-handler-ctas-panel .next-button');
  const backBtn = formElement.querySelector('.form-handler-ctas-panel .back-btn');

  if (stepIndex >= frags.length || stepIndex < 0) return;

  const prevStep = formState.currentStep;
  formState.currentStep = stepIndex;
  formState.farthestStep = Math.max(formState.farthestStep, stepIndex);

  frags[prevStep].classList.add('hidden');
  frags[formState.currentStep].classList.remove('hidden');


  if (formState.currentStep === frags.length - 1) {
    nextBtn.textContent = nextBtn.dataset.finalStateText;
  } else {
    nextBtn.textContent = nextBtn.dataset.nextStateText;
  }

  backBtn.classList.toggle('disabled', formState.currentStep === 0);
  updateSideNav();
  initRequiredFieldsValidation();
}

function initFormCtas(inputMap) {
  const ctaRow = formElement.querySelector(':scope > div:last-of-type');
  const frags = formElement.querySelectorAll('.fragment');
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
          const payload = await saveEvent(inputMap);
          const targetRedirect = `${window.location.origin}/event/t3/dme/preview?eventId=${payload['event-id']}`;
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

          if (formState.currentStep === frags.length - 1) {
            cta.textContent = finalStateText;
            cta.prepend(getIcon('golden-rocket'));
          } else {
            cta.textContent = nextStateText;
          }
        }

        cta.addEventListener('click', async () => {
          const payload = await saveEvent(inputMap);

          if (ctaUrl.hash === '#next') {
            if (formState.currentStep === frags.length - 1) {
              postForm(payload);
            } else {
              navigateForm();
            }
          }
        });
      }
    }
  });

  backBtn.addEventListener('click', async () => {
    navigateForm(formState.currentStep - 1);
  });
}

function initNavigation() {
  const frags = formElement.querySelectorAll('.fragment');
  const navItems = formElement.querySelectorAll('.side-menu .nav-item');

  frags.forEach((frag, i) => {
    if (i !== 0) {
      frag.classList.add('hidden');
    }
  });

  navItems.forEach((nav, i) => {
    nav.addEventListener('click', () => {
      if (!nav.closest('li')?.classList.contains('disabled')) {
        navigateForm(i);
      }
    });
  });
}

async function getInputMap(el) {
  const jsonRow = el.querySelector(':scope > div:last-of-type');
  const jsonUrl = jsonRow.querySelector('a')?.href || jsonRow.textContent.trim();
  jsonRow.remove();

  const json = await fetch(jsonUrl)
    .then((resp) => resp.json())
    .catch((error) => console.log(error));

  return json.data;
}

function querySelectorAllDeep(selector, root = document) {
  const elements = [];

  function recursiveQuery(root) {
      elements.push(...root.querySelectorAll(selector));

      root.querySelectorAll('*').forEach(el => {
          if (el.shadowRoot) {
              recursiveQuery(el.shadowRoot);
          }
      });
  }

  recursiveQuery(root);

  return elements;
}

function prepopulateForm(inputMap) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const eventId = urlParams.get('eventId');
  const frags = formElement.querySelectorAll('.fragment');

  if (!eventId) return;

  const eventObj = JSON.parse(localStorage.getItem(eventId));

  SUPPORTED_COMPONENTS.forEach((comp) => {
    const mappedComponents = formElement.querySelectorAll(`.${comp}-component`);
    if (!mappedComponents?.length) return;

    mappedComponents.forEach(async (component) => {
      const { onResume } = await import(`./controllers/${comp}-component-controller.js`);
      await onResume(component, eventObj, inputMap);
    });
  });

  frags.forEach((frag, i) => {
    const requiredFields = querySelectorAllDeep('input[required], select[required], textarea[required]', frag);

    if (validateRequiredFields(requiredFields)) {
      formState.farthestStep = i + 1;
    }
  })

  updateSideNav(formElement);
}

async function buildECCForm(el) {
  formElement = el;
  const inputMap = await getInputMap(el);
  const form = decorateForm();
  initFormCtas(inputMap);
  initComponents();
  initNavigation();
  prepopulateForm(inputMap);
  initRequiredFieldsValidation();

  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });
}

export default async function init(el) {
  const miloLibs = getLibs();
  await Promise.all([
    import(`${miloLibs}/deps/lit-all.min.js`),
    import(`${miloLibs}/features/spectrum-web-components/dist/theme.js`),
  ]);

  const profile = window.bm8tr.get('imsProfile');
  const { search, hostname } = window.location;
  const urlParams = new URLSearchParams(search);
  const devMode = urlParams.get('devMode');

  if (devMode === 'true' && hostname === 'localhost') {
    buildECCForm(el);
    return;
  }

  if (profile) {
    if (profile.noProfile || profile.account_type !== 'type3') {
      buildNoAccessScreen(el);
    } else {
      buildECCForm(el);
    }

    return;
  }

  if (!profile) {
    const unsubscribe = window.bm8tr.subscribe('imsProfile', ({ newValue }) => {
      if (newValue?.noProfile || newValue.account_type !== 'type3') {
        buildNoAccessScreen(el);
      } else {
        buildECCForm(el);
      }

      unsubscribe();
    });
  }
}
