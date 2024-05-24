export function onSubmit(component, props) {
  // TODO: agenda details
  const agendaItems = component.querySelectorAll('.agenda-input-fields-row');

  const agenda = [];

  agendaItems.forEach((item) => {
    const timeInput = item.querySelector('.time-picker-input');
    const detailsInput = item.querySelector('sp-textfield.text-input');

    if (timeInput && detailsInput) {
      agenda.push({
        startTime: timeInput.value,
        description: detailsInput.value,
      });
    }
  });

  const showAgendaPostEvent = component.querySelector('#checkbox-agenda-info').checked;

  const eventInfo = {
    showAgendaPostEvent,
    agenda,
  };

  props.payload = { ...props.payload, ...eventInfo };
  return eventInfo;
}

export default function init(component, props) {
  // TODO: init function and repopulate data from props if exists
  const agendaItems = component.querySelectorAll('.agenda-input-fields-row');
}
