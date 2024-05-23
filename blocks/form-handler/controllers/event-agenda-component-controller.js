export function onSubmit(component, props) {
  // TODO: agenda details
  const time = component.querySelector('#time-picker').value;
  const agendaInfoVisible = component.querySelector('#checkbox-agenda-info').checked;

  const eventInfo = {
    agendaInfoVisible,
    time,
  };

  return eventInfo;
}

export default function init(component, props) {
  // TODO: init function and repopulate data from props if exists
}
