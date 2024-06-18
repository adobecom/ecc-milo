export function onSubmit(component, props) {
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
  if (component.closest('.fregment')?.classList.contains('hidden')) return;

  const agendaGroup = component.querySelector('agenda-fieldset-group');
  const showAgendaPostEvent = component.querySelector('#checkbox-agenda-info');

  if (props.payload?.agenda) {
    agendaGroup.dataset.agendaItems = JSON.stringify(props.payload.agenda);
  }

  showAgendaPostEvent.checked = props.payload?.showAgendaPostEvent;
}
