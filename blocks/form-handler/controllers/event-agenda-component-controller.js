export function onSubmit(component) {
  // TODO: agenda details
  const time = component.querySelector('#time-picker').value;
  const agendaInfoVisible = component.querySelector('#checkbox-agenda-info').checked;

  const eventInfo = {
    agendaInfoVisible,
    time,
  };

  return eventInfo;
}

export function onResume(component, eventObj) {
  // TODO: agenda resume function

}

export default function init(component, props) {
  // TODO: agenda init function
}
