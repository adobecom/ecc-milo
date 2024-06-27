/* eslint-disable no-unused-vars */
export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const agendaGroup = component.querySelector('agenda-fieldset-group');
  const showAgendaPostEvent = component.querySelector('#checkbox-agenda-info')?.checked;

  let agenda = [];

  if (agendaGroup) agenda = agendaGroup.getAgendas();

  const agendaInfo = {
    showAgendaPostEvent,
    agenda,
  };

  props.payload = { ...props.payload, ...agendaInfo };
}

export async function onUpdate(_component, _props) {
  // Do nothing
}

export default function init(component, props) {
  const eventData = props.eventDataResp;
  const agendaGroup = component.querySelector('agenda-fieldset-group');
  const showAgendaPostEvent = component.querySelector('#checkbox-agenda-info');

  if (eventData.agenda?.length) {
    agendaGroup.agendaItems = eventData.agenda;
    component.classList.add('prefilled');
  }

  showAgendaPostEvent.checked = eventData.showAgendaPostEvent;
}
