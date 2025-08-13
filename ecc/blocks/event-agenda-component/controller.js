import { getAttribute } from '../../scripts/data-utils.js';
import { setPropsPayload } from '../form-handler/data-handler.js';

/* eslint-disable no-unused-vars */
export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const agendaGroup = component.querySelector('agenda-fieldset-group');
  const showAgendaPostEvent = component.querySelector('#checkbox-agenda-info')?.checked;

  let agenda = [];

  if (agendaGroup) agenda = agendaGroup.getCompleteAgenda();

  const agendaInfo = {
    showAgendaPostEvent,
    agenda,
  };

  setPropsPayload(props, agendaInfo);
}

function initTimeClamping(component, props) {
  const checkbox = component.querySelector('.time-clamp-checkbox');
  const { payload } = props;

  if (!checkbox || !payload) return;

  const agendaFieldSetGroup = component.querySelector('agenda-fieldset-group');
  const currentTimeSlots = agendaFieldSetGroup.dataset.timeslots;

  checkbox.addEventListener('change', (e) => {
    console.log('e.target.checked', e.target.checked);
    const agendaTimeClamped = e.target.checked;

    const currentTimeSlots = agendaFieldSetGroup.dataset.timeslots;
    // TODO: clamp the timeslots with payloadLocaleStartTime and payloadLocaleEndTime
  });
}

function updateTimeClampOptions(component, props) {
  const { payload } = props;

  if (!payload) return;

  const timeClampRow = component.querySelector('.time-clamp-options-row');
  const checkbox = timeClampRow.querySelector('.time-clamp-checkbox');

  if (!timeClampRow || !checkbox) return;

  const sameDayEvent = payload.localStartDate === payload.localEndDate;

  if (!sameDayEvent) {
    checkbox.checked = false;
    timeClampRow.classList.add('hidden');
  }

  console.log('payload.localStartTime', payload.localStartTime);
  console.log('payload.localEndTime', payload.localEndTime);
}

export async function onPayloadUpdate(component, props) {
  const { payload } = props;

  if (!payload) return;

  updateTimeClampOptions(component, props);
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

export default function init(component, props) {
  const eventData = props.eventDataResp;
  const agendaGroup = component.querySelector('agenda-fieldset-group');
  const showAgendaPostEventElement = component.querySelector('#checkbox-agenda-info');

  const agenda = getAttribute(eventData, 'agenda', props.locale);
  const showAgendaPostEvent = getAttribute(eventData, 'showAgendaPostEvent', props.locale);
  if (agenda?.length) {
    agendaGroup.agendaItems = agenda;
    component.classList.add('prefilled');
  }

  showAgendaPostEventElement.checked = showAgendaPostEvent;

  initTimeClamping(component, props);
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
