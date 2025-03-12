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

export async function onPayloadUpdate(_component, _props) {
  // Do nothing
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
}

export default function init(component, props) {
  const eventData = props.eventDataResp;
  const agendaGroup = component.querySelector('agenda-fieldset-group');
  const showAgendaPostEvent = component.querySelector('#checkbox-agenda-info');

  const localeEventData = eventData.localization?.[props.lang] || eventData;
  if (localeEventData.agenda?.length) {
    agendaGroup.agendaItems = localeEventData.agenda;
    component.classList.add('prefilled');
  }

  showAgendaPostEvent.checked = localeEventData.showAgendaPostEvent;
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
