function prepopulateTimeZone(component) {
  const currentTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!currentTimeZone) return;

  const timeZoneInput = component.querySelector('#time-zone-select-input');

  if (!timeZoneInput) return;

  const options = timeZoneInput.querySelectorAll('option');

  options.forEach((opt) => {
    if (opt.value === currentTimeZone) {
      options[0].removeAttribute('selected');
      opt.selected = true;
    }
  });
}

function initStepLock(component) {
  const { search, hostname } = window.location;
  const urlParams = new URLSearchParams(search);
  const skipValidation = urlParams.get('skipValidation');

  if (skipValidation === 'true' && hostname === 'localhost') {
    return;
  }

  const step = component.closest('.fragment');
  const inputs = component.querySelectorAll('#bu-select-input, #series-select-input');

  const onFormatChange = () => {
    const componentSections = step.querySelectorAll('.section:not(:first-of-type)');

    if (Array.from(inputs).every((input) => !!input.value)) {
      componentSections.forEach((s) => {
        if (s !== component.closest('.section')) {
          s.classList.remove('hidden');
        }
      });
    } else {
      componentSections.forEach((s) => {
        if (s !== component.closest('.section')) {
          s.classList.add('hidden');
        }
      });
    }
  };

  inputs.forEach((input) => {
    input.addEventListener('change', onFormatChange);
  });

  onFormatChange();
}

export default function init(component) {
  prepopulateTimeZone(component);
  initStepLock(component);
}

export function onSubmit(component, props) {
  // TODO: init function and repopulate data from props if exists
  const eventType = 'InPerson';
  const cloudType = component.querySelector('#bu-select-input').value;
  const seriesId = component.querySelector('#series-select-input').value;
  const rsvpRequired = component.querySelector('#rsvp-required-check').checked;

  const eventFormat = {
    // TODO: add the other text field values
    eventType,
    cloudType,
    seriesId,
    rsvpRequired,
  };

  props.payload = { ...props.payload, ...eventFormat };
  return eventFormat;
}
