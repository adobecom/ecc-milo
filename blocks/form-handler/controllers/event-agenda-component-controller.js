export function onSubmit(component, inputMap) {
  //Todo agenda details
  const agendaDetails = component.querySelector('#textfield > input');
  const time = component.querySelector('#time-picker-time').value;
  const agendaInfoVisible = component.querySelector('#checkbox-agenda-info-will-appear-post-event').checked;
 
 
 
 
  const eventInfo = {
    ...getMappedInputsOutput(component, inputMap),
    agendaInfoVisible,
    'Time': time,
  };
 
 
  return eventInfo;
 }
 
 
 