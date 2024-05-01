import { getLibs } from '../../scripts/utils.js';
import { handlize } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);
const { decorateButtons } = await import(`${getLibs()}/utils/decorate.js`);
const { default: getUuid } = await import(`${getLibs()}/utils/getUuid.js`);

// list of controllers for the hanler to load
const SUPPORTED_COMPONENTS = [
  'checkbox',
  'event-format',
  'event-info',
  'img-upload',
  'venue-info',
];

const formState = {
  currentStep: 0,
  farthestStep: 0,
};

function initComponents(el) {
  SUPPORTED_COMPONENTS.forEach((comp) => {
    const mappedComponents = el.querySelectorAll(`.${comp}-component`);
    if (!mappedComponents?.length) return;

    mappedComponents.forEach(async (component) => {
      const { default: initComponent } = await import(`./controllers/${comp}-component-controller.js`);
      await initComponent(component);
    });
  });
}

async function gatherValues(el, inputMap) {
  const allComponentPromises = SUPPORTED_COMPONENTS.map(async (comp) => {
    const mappedComponents = el.querySelectorAll(`.${comp}-component`);
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
    if (i === 1) col.classList.add('main-frame');
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

async function saveEvent(el, inputMap) {
  const payload = await gatherValues(el, inputMap);
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

function navigateForm(el, stepIndex = formState.currentStep + 1) {
  const frags = el.querySelectorAll('.fragment');
  const sideNavs = el.querySelectorAll('.side-menu .nav-item');
  const nextBtn = el.querySelector('.form-handler-ctas-panel .next-button');

  if (stepIndex >= frags.length) return;

  const prevStep = formState.currentStep;
  formState.currentStep = stepIndex;
  formState.farthestStep = Math.max(formState.farthestStep, stepIndex);

  frags[prevStep].classList.add('hidden');
  frags[formState.currentStep].classList.remove('hidden');
  sideNavs.forEach((n, i) => {
    n.closest('li')?.classList.remove('active');
    if (i <= formState.farthestStep) n.classList.remove('disabled');
    if (i === formState.currentStep) n.closest('li')?.classList.add('active');
  });

  if (formState.currentStep === frags.length - 1) {
    nextBtn.textContent = nextBtn.dataset.finalStateText;
  } else {
    nextBtn.textContent = nextBtn.dataset.nextStateText;
  }
}

function initFormCtas(el, inputMap) {
  const ctaRow = el.querySelector(':scope > div:last-of-type');
  const frags = el.querySelectorAll('.fragment');
  decorateButtons(ctaRow, 'button-l');
  const ctas = ctaRow.querySelectorAll('a');

  ctaRow.classList.add('form-handler-ctas-panel');
  ctas.forEach((cta) => {
    if (cta.href) {
      const ctaUrl = new URL(cta.href);

      if (['#pre-event', '#post-event'].includes(ctaUrl.hash)) {
        cta.classList.add('fill');
        cta.addEventListener('click', async () => {
          const payload = await saveEvent(el, inputMap);
          const targetRedirect = `${window.location.origin}/event/t3/dme/preview?eventId=${payload['event-id']}`;
          window.open(targetRedirect);
        });
      }

      if (['#save', '#next'].includes(ctaUrl.hash)) {
        if (ctaUrl.hash === '#next') {
          cta.classList.add('next-button');
          const [nextStateText, finalStateText] = cta.textContent.split('||');
          cta.textContent = nextStateText;
          cta.dataset.nextStateText = nextStateText;
          cta.dataset.finalStateText = finalStateText;

          if (formState.currentStep === frags.length - 1) {
            cta.textContent = finalStateText;
          } else {
            cta.textContent = nextStateText;
          }
        }

        cta.addEventListener('click', async () => {
          const payload = await saveEvent(el, inputMap);

          if (ctaUrl.hash === '#next') {
            if (formState.currentStep === frags.length - 1) {
              postForm(payload);
            } else {
              navigateForm(el);
            }
          }
        });
      }
    }
  });
}

function initNavigation(el) {
  const frags = el.querySelectorAll('.fragment');
  const navItems = el.querySelectorAll('.side-menu .nav-item');

  frags.forEach((frag, i) => {
    if (i !== 0) {
      frag.classList.add('hidden');
    }
  });

  navItems.forEach((nav, i) => {
    nav.addEventListener('click', () => {
      if (!nav.closest('li')?.classList.contains('disabled')) {
        navigateForm(el, i);
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

function prepopulateForm(el, inputMap) {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  const eventId = urlParams.get('eventId');

  if (!eventId) return;

  const eventObj = JSON.parse(localStorage.getItem(eventId));

  inputMap.forEach((input) => {
    const element = el.querySelector(input.selector);
    if (!element) return;

    if (element[input.accessPoint] !== undefined) {
      element[input.accessPoint] = eventObj[input.key];
    } else {
      element.setAttirbute(input.accessPoint, eventObj[input.key]);
    }
  });
}

export default async function init(el) {
  const form = createTag('form');
  const formDivs = el.querySelectorAll('.fragment');

  if (!formDivs.length) {
    el.remove();
    return;
  }

  formDivs.forEach((formDiv) => {
    formDiv.parentElement.replaceChild(form, formDiv);
    form.append(formDiv);
  });

  const inputMap = await getInputMap(el);
  decorateForm(el);
  initFormCtas(el, inputMap);
  initComponents(el);
  initNavigation(el);
  prepopulateForm(el, inputMap);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });
}
