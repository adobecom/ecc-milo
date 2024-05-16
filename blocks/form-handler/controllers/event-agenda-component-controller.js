export function onSubmit(component) {
  // TODO: agenda details
  const time = component.querySelector('#time-picker-time').value;
  const agendaInfoVisible = component.querySelector('#checkbox-agenda-info-will-appear-post-event').checked;

  const eventInfo = {
    agendaInfoVisible,
    Time: time,
  };

  return eventInfo;
}

export function onResume(component, eventObj) {
  // TODO: agenda resume function

}

export default function init(component) {
  // TODO: agenda init function
}
