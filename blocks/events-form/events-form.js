import { getLibs } from '../../scripts/utils.js';
import { getAttendeeData, getProfile, getEventId, submitToSplashThat } from '../../utils/event-apis.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);
const { default: sanitizeComment } = await import(`${getLibs()}/utils/sanitizeComment.js`);

const RULE_OPERATORS = {
  equal: '=',
  notEqual: '!=',
  lessThan: '<',
  lessThanOrEqual: '<=',
  greaterThan: '>',
  greaterThanOrEqual: '>=',
  includes: 'inc',
  excludes: 'exc',
};

function snakeToCamel(str) {
  return str
    .split('_')
    .map((word, index) => (index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
    .join('');
}

function createSelect({ field, placeholder, options, defval, required }) {
  const select = createTag('select', { id: field });
  if (placeholder) select.append(createTag('option', { selected: '', disabled: '' }, placeholder));
  options.split(',').forEach((o) => {
    const text = o.trim();
    const option = createTag('option', { value: text }, text);
    select.append(option);
    if (defval === text) select.value = text;
  });
  if (required === 'x') select.setAttribute('required', 'required');
  return select;
}

function constructPayload(form) {
  const payload = {};
  [...form.elements].filter((el) => el.tagName !== 'BUTTON').forEach((fe) => {
    if (fe.type.match(/(?:checkbox|radio)/)) {
      if (fe.checked) {
        payload[fe.name] = payload[fe.name] ? `${fe.value}, ${payload[fe.name]}` : fe.value;
      } else {
        payload[fe.name] = payload[fe.name] || '';
      }
      return;
    }
    payload[fe.id] = fe.value;
  });
  return payload;
}

async function submitForm(form) {
  const payload = constructPayload(form);
  payload.timestamp = new Date().toJSON();
  Object.keys(payload).forEach((key) => {
    const field = form.querySelector(`[data-field-id=${key}]`);
    if (!payload[key] && field.querySelector('.group-container.required')) {
      const el = form.querySelector(`input[name="${key}"]`);
      el.setCustomValidity('A selection is required');
      el.reportValidity();
      const cb = () => {
        el.setCustomValidity('');
        el.reportValidity();
        field.removeEventListener('input', cb);
      };
      field.addEventListener('input', cb);
      return false;
    }
    payload[key] = sanitizeComment(payload[key]);
    return true;
  });

  const response = await submitToSplashThat(payload);

  return response;
}

function clearForm(form) {
  [...form.elements].forEach((fe) => {
    if (fe.type.match(/(?:checkbox|radio)/)) {
      fe.checked = false;
    } else {
      fe.value = '';
    }
  });
}

function createButton({ type, label }, thankYou) {
  const button = createTag('button', { class: 'button' }, label);
  if (type === 'submit') {
    button.addEventListener('click', async (event) => {
      const form = button.closest('form');
      if (form.checkValidity()) {
        event.preventDefault();
        button.setAttribute('disabled', '');
        const submission = await submitForm(form);
        button.removeAttribute('disabled');
        if (!submission) return;
        clearForm(form);
        const handleThankYou = thankYou.querySelector('a') ? thankYou.querySelector('a').href : thankYou.innerHTML;
        if (!thankYou.innerHTML.includes('href')) {
          const thanksText = createTag('h4', { class: 'thank-you' }, handleThankYou);
          form.append(thanksText);
          setTimeout(() => thanksText.remove(), 2000);
          /* c8 ignore next 3 */
        } else {
          window.location.href = handleThankYou;
        }
      }
    });
  }
  if (type === 'clear') {
    button.classList.add('outline');
    button.addEventListener('click', (e) => {
      e.preventDefault();
      const form = button.closest('form');
      clearForm(form);
    });
  }
  return button;
}

function createHeading({ label }, el) {
  return createTag(el, {}, label);
}

function createInput({ type, field, placeholder, required, defval }) {
  const input = createTag('input', { type, id: field, placeholder, value: defval });
  if (required === 'x') input.setAttribute('required', 'required');
  return input;
}

function createTextArea({ field, placeholder, required, defval }) {
  const input = createTag('textarea', { id: field, placeholder, value: defval });
  if (required === 'x') input.setAttribute('required', 'required');
  return input;
}

function createlabel({ field, label, required }) {
  return createTag('label', { for: field, class: required ? 'required' : '' }, label);
}

function createCheckItem(item, type, id, def) {
  const itemKebab = item.toLowerCase().replaceAll(' ', '-');
  const defList = def.split(',').map((defItem) => defItem.trim());
  const pseudoEl = createTag('span', { class: `check-item-button ${type}-button` });
  const label = createTag('label', { class: `check-item-label ${type}-label`, for: `${id}-${itemKebab}` }, item);
  const input = createTag(
    'input',
    { type, name: id, value: item, class: `check-item-input ${type}-input`, id: `${id}-${itemKebab}` },
  );
  if (item && defList.includes(item)) input.setAttribute('checked', '');
  return createTag('div', { class: `check-item-wrap ${type}-input-wrap` }, [input, pseudoEl, label]);
}

function createCheckGroup({ options, field, defval, required }, type) {
  const optionsMap = options.split(',').map((item) => createCheckItem(item.trim(), type, field, defval));
  return createTag(
    'div',
    { class: `group-container ${type}-group-container${required === 'x' ? ' required' : ''}` },
    optionsMap,
  );
}

function createDivider() {
  return '';
}

function processNumRule(tf, operator, a, b) {
  /* c8 ignore next 3 */
  if (!tf.dataset.type.match(/(?:number|date)/)) {
    throw new Error(`Comparison field must be of type number or date for ${operator} rules`);
  }
  const { type } = tf.dataset;
  const a2 = type === 'number' ? parseInt(a, 10) : Date.parse(a);
  const b2 = type === 'number' ? parseInt(b, 10) : Date.parse(b);
  return [a2, b2];
}

function processRule(tf, operator, payloadKey, value, comparisonFunction) {
  if (payloadKey === '') return true;
  try {
    const [a, b] = processNumRule(tf, operator, payloadKey, value);
    return comparisonFunction(a, b);
    /* c8 ignore next 5 */
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn(`Invalid rule, ${e}`);
    return false;
  }
}

function applyRules(form, rules) {
  const payload = constructPayload(form);
  rules.forEach((field) => {
    const { type, condition: { key, operator, value } } = field.rule;
    const fw = form.querySelector(`[data-field-id=${field.fieldId}]`);
    const tf = form.querySelector(`[data-field-id=${key}]`);
    let force = false;
    switch (operator) {
      case RULE_OPERATORS.equal:
        force = (payload[key] === value);
        break;
      case RULE_OPERATORS.notEqual:
        force = (payload[key] !== value);
        break;
      case RULE_OPERATORS.includes:
        force = (payload[key].split(',').map((s) => s.trim()).includes(value));
        break;
      case RULE_OPERATORS.excludes:
        force = (!payload[key].split(',').map((s) => s.trim()).includes(value));
        break;
      case RULE_OPERATORS.lessThan:
        force = processRule(tf, operator, payload[key], value, (a, b) => a < b);
        break;
      case RULE_OPERATORS.lessThanOrEqual:
        force = processRule(tf, operator, payload[key], value, (a, b) => a <= b);
        break;
      case RULE_OPERATORS.greaterThan:
        force = processRule(tf, operator, payload[key], value, (a, b) => a > b);
        break;
      case RULE_OPERATORS.greaterThanOrEqual:
        force = processRule(tf, operator, payload[key], value, (a, b) => a >= b);
        break;
      default:
        // eslint-disable-next-line no-console
        console.warn(`Unsupported operator ${operator}`);
        return false;
    }
    fw.classList.toggle(type, force);
    return false;
  });
}

function lowercaseKeys(obj) {
  return Object.keys(obj).reduce((acc, key) => {
    acc[key.toLowerCase() === 'default' ? 'defval' : key.toLowerCase()] = obj[key];
    return acc;
  }, {});
}

function insertAvatar(form, avatar) {
  if (!avatar) return;

  const firstFormDivider = form.querySelector('.divider');
  const oldAvatarCont = avatar.parentElement;
  if (!firstFormDivider) {
    form.append(avatar);
  } else {
    const firstSec = createTag('div', { class: 'first-form-section events-form-full-width' });
    const inputsWrapper = createTag('div', { class: 'first-form-section-input-wrapper' });
    const firstFormSecEls = [];
    let previousNode = firstFormDivider.previousElementSibling;

    while (previousNode && firstFormSecEls.length <= 4) {
      if (['text', 'email', 'phone'].includes(previousNode.querySelector('input')?.type)) firstFormSecEls.push(previousNode);
      previousNode = previousNode.previousElementSibling;
    }

    firstFormSecEls.forEach((el) => {
      inputsWrapper.prepend(el);
    });

    form.prepend(firstSec);
    firstSec.append(avatar, inputsWrapper);
  }

  if (!oldAvatarCont?.innerHTML?.trim() && !oldAvatarCont?.className) oldAvatarCont.remove();
}

async function createForm(formURL, thankYou, formData, avatar, actionUrl = '') {
  const { pathname } = new URL(formURL);
  let json = formData;
  /* c8 ignore next 4 */
  if (!formData) {
    const resp = await fetch(pathname);
    json = await resp.json();
  }
  json.data = json.data.map((obj) => lowercaseKeys(obj));
  const form = createTag('form');
  const rules = [];
  const [action] = pathname.split('.json');
  form.dataset.action = actionUrl || action;

  const typeToElement = {
    select: { fn: createSelect, params: [], label: true, classes: [] },
    heading: { fn: createHeading, params: ['h3'], label: false, classes: [] },
    legal: { fn: createHeading, params: ['p'], label: false, classes: [] },
    checkbox: { fn: createCheckGroup, params: ['checkbox'], label: true, classes: ['field-group-wrapper'] },
    'checkbox-group': { fn: createCheckGroup, params: ['checkbox'], label: true, classes: ['field-group-wrapper'] },
    'radio-group': { fn: createCheckGroup, params: ['radio'], label: true, classes: ['field-group-wrapper'] },
    'text-area': { fn: createTextArea, params: [], label: true, classes: [] },
    submit: { fn: createButton, params: [thankYou], label: false, classes: ['field-button-wrapper'] },
    clear: { fn: createButton, params: [thankYou], label: false, classes: ['field-button-wrapper'] },
    divider: { fn: createDivider, params: [], label: false, classes: ['divider'] },
    default: { fn: createInput, params: [], label: true, classes: [] },
  };

  json.data.forEach((fd) => {
    fd.type = fd.type || 'text';
    const style = fd.extra ? ` events-form-${fd.extra}` : '';
    const fieldWrapper = createTag(
      'div',
      { class: `field-wrapper events-form-${fd.type}-wrapper${style}`, 'data-field-id': fd.field, 'data-type': fd.type },
    );

    const elParams = typeToElement[fd.type] || typeToElement.default;
    if (elParams.label) fieldWrapper.append(createlabel(fd));
    fieldWrapper.append(elParams.fn(fd, ...elParams.params));
    fieldWrapper.classList.add(...elParams.classes);

    if (fd.rules?.length) {
      try {
        rules.push({ fieldId: fd.field, rule: JSON.parse(fd.rules) });
        /* c8 ignore next 4 */
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn(`Invalid Rule ${fd.rules}: ${e}`);
      }
    }
    form.append(fieldWrapper);
  });

  form.addEventListener('input', () => applyRules(form, rules));
  applyRules(form, rules);

  insertAvatar(form, avatar);
  return form;
}

function personalizeForm(form, resp) {
  if (!resp || !form) return;

  Object.entries(resp).forEach(([key, value]) => {
    const matchedInput = form.querySelector(`#${snakeToCamel(key)}`);
    if (matchedInput) matchedInput.value = value;
  });
}

function decorateHero(heroEl) {
  heroEl.classList.add('event-form-hero');
}

async function decorateRSVPStatus(bp, profile) {
  const data = await getAttendeeData(profile.email, getEventId());
  if (!data) return;

  if (data.registered) {
    const successLabel = createTag('div', { class: 'rsvp-status-label' }, 'You have previously registered for this event. Feel free to use the form below to RSVP for another guest.');
    bp.formContainer.before(successLabel);
  }
}

async function updateDynamicContent(bp) {
  const { block, eventHero } = bp;
  await Promise.all([
    import(`${getLibs()}/utils/getUuid.js`),
    import('../../utils/event-apis.js'),
    import('../page-server/page-server.js'),
  ]).then(async ([{ default: getUuid }, caasApiMod, { autoUpdateContent }]) => {
    const hash = await getUuid(window.location.pathname);
    let profile;

    try {
      profile = await getProfile();
    } catch (e) {
      eventHero.querySelectorAll('p')?.forEach((p) => p.remove());
    }

    if (profile) {
      await decorateRSVPStatus(bp, profile);
    }

    await autoUpdateContent(block, { ...await caasApiMod.default(hash), ...profile }, true);
    eventHero.classList.remove('loading');
    personalizeForm(block, profile);
  });
}

async function buildEventform(bp, formData) {
  if (!bp.formContainer || !bp.form) return;
  bp.formContainer.classList.add('form-container');
  const avatar = bp.formContainer.querySelector('div:first-of-type > picture');
  const constructedForm = await createForm(
    bp.form.href,
    bp.thankYou,
    formData,
    avatar,
    bp.eventAction?.href,
  );
  if (constructedForm) bp.form.replaceWith(constructedForm);
}

export default async function decorate(block, formData = null) {
  block.style.opacity = 0;
  const bp = {
    block,
    eventHero: block.querySelector(':scope > div:nth-of-type(1)'),
    formContainer: block.querySelector(':scope > div:nth-of-type(2)'),
    form: block.querySelector(':scope > div:nth-of-type(2) a[href$=".json"]'),
    thankYou: block.querySelector(':scope > div:nth-of-type(3) > div'),
    eventAction: block.querySelector(':scope > div:last-of-type > div > a'),
  };

  bp.thankYou?.remove();
  decorateHero(bp.eventHero);
  buildEventform(bp, formData)
    .then(async () => { await updateDynamicContent(bp); })
    .then(() => {
      block.style.opacity = 1;
    }).catch(() => {
      block.innerHTML = 'Failed to load registration form. Please refresh the page.';
    });
}
