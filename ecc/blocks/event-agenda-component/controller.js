import { getAttribute } from '../../scripts/data-utils.js';
import { setPropsPayload } from '../form-handler/data-handler.js';

function timeToMinutes(timeString) {
  // Handle both "HH:MM" and "HH:MM:SS" formats
  const [hours, minutes] = timeString.split(':').map(Number);
  return hours * 60 + minutes;
}

function clampTimeSlots(timeSlotsString, startTime, endTime) {
  if (!timeSlotsString || !startTime || !endTime) {
    return timeSlotsString;
  }

  // Parse the timeslots string into an array
  const timeSlots = timeSlotsString.split(',');

  // Convert start and end times to comparable format (minutes since midnight)
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);

  // Filter timeslots that fall within the time range
  const clampedSlots = timeSlots.filter((slot) => {
    const slotMinutes = timeToMinutes(slot);
    return slotMinutes >= startMinutes && slotMinutes <= endMinutes;
  });

  return clampedSlots.join(',');
}

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
  const { payload, eventDataResp } = props;

  if (!checkbox || !payload) return;

  const agendaFieldSetGroup = component.querySelector('agenda-fieldset-group');

  // Store the original timeslots for restoration
  const originalTimeSlots = agendaFieldSetGroup.dataset.timeslots;
  const eventStartTime = payload.localStartTime || eventDataResp.localStartTime;
  const eventEndTime = payload.localEndTime || eventDataResp.localEndTime;

  checkbox.addEventListener('change', (e) => {
    console.log('e.target.checked', e.target.checked);
    const agendaTimeClamped = e.target.checked;

    if (agendaTimeClamped && eventStartTime && eventEndTime) {
      const clampedTimeSlots = clampTimeSlots(
        originalTimeSlots,
        eventStartTime,
        eventEndTime,
      );
      agendaFieldSetGroup.dataset.timeslots = clampedTimeSlots;
      console.log('Clamped timeslots:', clampedTimeSlots);
    } else {
      agendaFieldSetGroup.dataset.timeslots = originalTimeSlots;
      console.log('Time clamping disabled, restored original timeslots');
    }

    agendaFieldSetGroup.requestUpdate();
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
