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

export async function onPayloadUpdate(component, props) {
  const { payload } = props;

  if (!payload) return;

  const sameDayEvent = payload.localStartDate === payload.localEndDate;

  if (!sameDayEvent) {
    const timeClampRow = component.querySelector('.time-clamp-options-row');
    if (timeClampRow) {
      const checkbox = timeClampRow.querySelector('.time-clamp-checkbox');
      if (checkbox) {
        checkbox.checked = false;
      }
      timeClampRow.classList.add('hidden');
    }
  }
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
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
