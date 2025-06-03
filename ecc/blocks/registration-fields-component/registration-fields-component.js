import { getRegistrationFields } from '../../scripts/esp-controller.js';
import { LIBS } from '../../scripts/scripts.js';
import { generateToolTip } from '../../scripts/utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

async function decorateRSVPFields(el) {
  const row = el.querySelector(':scope > div:last-of-type');

  if (!row) return;

  // const configSheetLocation = row.querySelector('a')?.href;
  // const config = await fetch(configSheetLocation)
  //   .then((resp) => (resp.ok ? resp.json() : null))
  //   .catch((err) => window.lana?.log(`Failed to load RSVP fields config: ${err}`));

  row.innerHTML = '';

  const mockFields = await getRegistrationFields('CreativeCloud', 'en-US');

  createTag(
    'rsvp-form',
    { class: 'rsvp-form', data: JSON.stringify(mockFields) },
    '',
    { parent: row },
  );
}

export default async function init(el) {
  el.classList.add('form-component');
  generateToolTip(el.querySelector(':scope > div:first-of-type'));
  await decorateRSVPFields(el);
}
