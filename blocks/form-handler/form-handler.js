import { getLibs } from '../../scripts/utils.js';
import { handlize } from '../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);
const { decorateButtons } = await import(`${getLibs()}/utils/decorate.js`);
const { default: getUuid } = await import(`${getLibs()}/utils/getUuid.js`);

// list of controllers for the hanler to load
const SUPPORTED_COMPONENTS = [
  // 'checkbox',
  'event-info',
  // 'img-upload',
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
      initComponent(component);
    });
  });
}

async function gatherValues(el) {
  const allComponentPromises = SUPPORTED_COMPONENTS.map(async (comp) => {
    const mappedComponents = el.querySelectorAll(`.${comp}-component`);
    if (!mappedComponents.length) return {};

    const promises = Array.from(mappedComponents).map(async (component) => {
      const { onSubmit } = await import(`./controllers/${comp}-component-controller.js`);
      const componentPayload = await onSubmit(component);
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
    if (i === 0) col.classList.add('side-menu');
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

async function generateEventId(payload) {
  const date = new Date(payload['event-start']);
  const formattedDate = formatDate(date);
  const pathname = `/event/t3/${formattedDate}/${payload.city}/${payload.state}/${handlize(payload['event-title'])}`;
  const hash = await getUuid(pathname);
  payload['event-id'] = hash;
  payload.url = pathname;
}

async function saveEvent(el) {
  const payload = await gatherValues(el);
  await generateEventId(payload);
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
    endDate: formatDateTime(new Date(payload['end-start'])),
    timezone: payload['time-zone'] || 'America/Los_Angeles',
    venue: payload['event-title'],
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
    if (i < formState.farthestStep) n.classList.remove('disabled');
  });

  if (formState.currentStep === frags.length - 1) {
    nextBtn.textContent = '🎬 Publish event';
  }
}

function decorateFormCtas(el) {
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
          const payload = await saveEvent(el);
          const targetRedirect = `${window.location.origin}/event/t3/dme/preview?eventId=${payload['event-id']}`;
          window.open(targetRedirect);
        });
      }

      if (['#save', '#next'].includes(ctaUrl.hash)) {
        cta.addEventListener('click', () => {
          const payload = saveEvent(el);

          if (ctaUrl.hash === '#next') {
            cta.classList.add('next-button');
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
  const sideMenu = el.querySelector('.side-menu');
  const navItems = sideMenu.querySelectorAll('a[href*="#"]');

  frags.forEach((frag, i) => {
    if (i !== 0) {
      frag.classList.add('hidden');
    }
  });

  navItems.forEach((nav, i) => {
    if (i !== 0) {
      nav.classList.add('nav-item', 'disabled');
    } else {
      nav.closest('li')?.classList.add('active');
    }

    nav.addEventListener('click', () => {
      if (!nav.closest('li')?.classList.contains('disabled')) {
        navigateForm(el, i);
      }
    });
  });
}

export default function init(el) {
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

  decorateForm(el);
  decorateFormCtas(el);
  initComponents(el);
  initNavigation(el);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
  });
}
