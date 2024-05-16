import { getLibs } from '../../scripts/utils.js';
import { getIcon, handlize, buildNoAccessScreen, yieldToMain, querySelectorAllDeep } from '../../utils/utils.js';

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

function initComponents(props) {
  SUPPORTED_COMPONENTS.forEach((comp) => {
    const mappedComponents = props.el.querySelectorAll(`.${comp}-component`);
    if (!mappedComponents?.length) return;

    mappedComponents.forEach(async (component) => {
      const { default: initComponent } = await import(`./controllers/${comp}-component-controller.js`);
      await initComponent(component);
    });
  });
}

async function gatherValues(props, inputMap) {
  const allComponentPromises = SUPPORTED_COMPONENTS.map(async (comp) => {
    const mappedComponents = props.el.querySelectorAll(`.${comp}-component`);
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

async function saveEvent(props, inputMap) {
  const payload = await gatherValues(props, inputMap);
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

function updateSideNav(props) {
  const sideNavs = props.el.querySelectorAll('.side-menu .nav-item');

  sideNavs.forEach((n, i) => {
    n.closest('li')?.classList.remove('active');
    if (i <= props.farthestStep) n.classList.remove('disabled');
    if (i === props.currentStep) n.closest('li')?.classList.add('active');
  });
}

function validateRequiredFields(fields) {
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
  props[`required-fields-in-${currentFrag.id}`] = querySelectorAllDeep('input[required], select[required], textarea[required]', currentFrag);
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
    event.currentTarget.parentElement.remove();
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
      yieldToMain().then(() => {
        updateRequiredFields(props);
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

  if (currentStep === frags.length - 1) {
    nextBtn.textContent = nextBtn.dataset.finalStateText;
  } else {
    nextBtn.textContent = nextBtn.dataset.nextStateText;
  }

  backBtn.classList.toggle('disabled', currentStep === 0);
}

function navigateForm(props, stepIndex) {
  const index = stepIndex || props.currentStep + 1;
  const frags = props.el.querySelectorAll('.fragment');

  if (index >= frags.length || index < 0) return;

  props.currentStep = index;
  props.farthestStep = Math.max(props.farthestStep, index);

  updateRequiredFields(props);
}

function initFormCtas(props, inputMap) {
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
          const payload = await saveEvent(props, inputMap);
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

          if (props.currentStep === frags.length - 1) {
            cta.textContent = finalStateText;
            cta.prepend(getIcon('golden-rocket'));
          } else {
            cta.textContent = nextStateText;
          }
        }

        cta.addEventListener('click', async () => {
          const payload = await saveEvent(props, inputMap);

          if (ctaUrl.hash === '#next') {
            if (props.currentStep === frags.length - 1) {
              postForm(payload);
            } else {
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

async function getInputMap(el) {
  const jsonRow = el.querySelector(':scope > div:last-of-type');
  const jsonUrl = jsonRow.querySelector('a')?.href || jsonRow.textContent.trim();
  jsonRow.remove();

  const json = await fetch(jsonUrl)
    .then((resp) => resp.json())
    .catch((error) => console.log(error));

  return json.data;
}

function prepopulateForm(props, inputMap) {
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
      await onResume(component, eventObj, inputMap);
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
  const inputMap = await getInputMap(el);

  const props = {
    el,
    currentStep: 0,
    farthestStep: 0,
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

  initFormCtas(proxyProps, inputMap);
  initComponents(proxyProps);
  initRepeaters(proxyProps);
  initNavigation(proxyProps);
  prepopulateForm(proxyProps, inputMap);
  updateRequiredFields(proxyProps);
}

export default async function init(el) {
  el.style.display = 'none';
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
