import { getAttribute } from '../../scripts/data-utils.js';
import { setPropsPayload } from '../form-handler/data-handler.js';
import { getToastArea } from '../../scripts/utils.js';
import ToastManager from '../../scripts/toast-manager.js';

/* eslint-disable no-unused-vars */
export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const agendaGroup = component.querySelector('agenda-fieldset-group');
  const showAgendaPostEvent = component.querySelector('#checkbox-agenda-info')?.checked;

  let agenda = [];

  if (agendaGroup) {
    // Check for incomplete agenda items before getting complete agenda
    const incompleteItems = agendaGroup.getIncompleteAgendaItems();

    if (incompleteItems.length > 0) {
      const toastManager = new ToastManager(getToastArea(props));
      const incompleteCount = incompleteItems.length;
      const message = incompleteCount === 1
        ? '1 incomplete agenda item was not saved. Please add a time and either a title or description to save it.'
        : `${incompleteCount} incomplete agenda items were not saved. Please add a time and either a title or description to save them.`;

      toastManager.showInfo(message, {
        timeout: 8000,
        showCloseButton: true,
      });
    }

    agenda = agendaGroup.getCompleteAgenda();
  }

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
