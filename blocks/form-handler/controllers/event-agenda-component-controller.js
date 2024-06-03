export function onSubmit(component, props) {
  // TODO: agenda details
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

export default function init(component, props) {
  // TODO: init function and repopulate data from props if exists
}
