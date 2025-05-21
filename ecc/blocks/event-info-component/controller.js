/* eslint-disable no-unused-vars */
import { getCloud, getEvents, getLocales } from '../../scripts/esp-controller.js';
import BlockMediator from '../../scripts/deps/block-mediator.min.js';
import { LIBS } from '../../scripts/scripts.js';
import { changeInputValue, parse24HourFormat, convertTo24HourFormat } from '../../scripts/utils.js';
import { setPropsPayload } from '../form-handler/data-handler.js';
import { getAttribute, isValidAttribute } from '../../scripts/data-utils.js';
import initCalendar, { updateCalendarInput, parseFormattedDate } from './calendar.js';
import { buildErrorMessage } from '../form-handler/form-handler-helper.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

function refillFields(component, props, eventData) {
  const eventTitleInput = component.querySelector('#info-field-event-title');
  const eventDescription = component.querySelector('#info-field-event-description');
  const eventDescriptionRTE = component.querySelector('#event-info-details-rte');
  const eventDescriptionRTEOutput = component.querySelector('#event-info-details-rte-output');
  const startTimeInput = component.querySelector('#time-picker-start-time');
  const startAmpmInput = component.querySelector('#ampm-picker-start-time');
  const endTimeInput = component.querySelector('#time-picker-end-time');
  const endAmpmInput = component.querySelector('#ampm-picker-end-time');
  const startTime = component.querySelector('#time-picker-start-time-value');
  const endTime = component.querySelector('#time-picker-end-time-value');
  const datePicker = component.querySelector('#event-info-date-picker');
  const languagePicker = component.querySelector('#language-picker');
  const enTitleInput = component.querySelector('#event-info-url-input');
  const isPrivateInput = component.querySelector('#private-event');

  const title = getAttribute(eventData, 'title', props.locale);
  const description = getAttribute(eventData, 'description', props.locale);
  const eventDetails = getAttribute(eventData, 'eventDetails', props.locale);
  const localStartDate = getAttribute(eventData, 'localStartDate', props.locale);
  const localEndDate = getAttribute(eventData, 'localEndDate', props.locale);
  const localStartTime = getAttribute(eventData, 'localStartTime', props.locale);
  const localEndTime = getAttribute(eventData, 'localEndTime', props.locale);
  const timezone = getAttribute(eventData, 'timezone', props.locale);
  const enTitle = getAttribute(eventData, 'enTitle', props.locale);
  const defaultLocale = getAttribute(eventData, 'defaultLocale', props.locale);
  const isPrivate = getAttribute(eventData, 'isPrivate', props.locale);

  if (isValidAttribute(title)) eventTitleInput.value = title;
  if (isValidAttribute(description)) eventDescription.value = description;
  if (isValidAttribute(eventDetails)) {
    eventDescriptionRTE.content = eventDetails;
    eventDescriptionRTEOutput.value = eventDetails;
  }
  if (isValidAttribute(localStartDate)) datePicker.dataset.startDate = localStartDate;
  if (isValidAttribute(localEndDate)) datePicker.dataset.endDate = localEndDate;
  if (isValidAttribute(localStartTime)) {
    const startTimePieces = parse24HourFormat(localStartTime);
    changeInputValue(startTime, 'value', `${localStartTime}` || '');
    changeInputValue(startTimeInput, 'value', `${startTimePieces.hours}:${startTimePieces.minutes}` || '');
    changeInputValue(startAmpmInput, 'value', startTimePieces.period || '');
  }
  if (isValidAttribute(localEndTime)) {
    const endTimePieces = parse24HourFormat(localEndTime);
    changeInputValue(endTime, 'value', `${localEndTime}` || '');
    changeInputValue(endTimeInput, 'value', `${endTimePieces.hours}:${endTimePieces.minutes}` || '');
    changeInputValue(endAmpmInput, 'value', endTimePieces.period || '');
  }
  if (isValidAttribute(localStartDate) && isValidAttribute(localEndDate)) {
    updateCalendarInput(component, {
      selectedStartDate: parseFormattedDate(localStartDate),
      selectedEndDate: parseFormattedDate(localEndDate),
    });
  }
  if (isValidAttribute(timezone)) changeInputValue(component.querySelector('#time-zone-select-input'), 'value', `${timezone}` || '');
  if (isValidAttribute(defaultLocale)) changeInputValue(languagePicker, 'value', defaultLocale || props.locale);
  if (isValidAttribute(enTitle)) changeInputValue(enTitleInput, 'value', enTitle || '');
  if (isValidAttribute(isPrivate)) changeInputValue(isPrivateInput, 'checked', isPrivate || false);

  if (title && localStartDate && eventData.eventId) {
    BlockMediator.set('eventDupMetrics', {
      ...BlockMediator.get('eventDupMetrics'),
      ...{
        title,
        startDate: localStartDate,
        eventId: eventData.eventId,
      },
    });
  }

  if (eventData.eventId) {
    component.classList.add('prefilled');
  }
}

function dateTimeStringToTimestamp(dateString, timeString) {
  const dateTimeString = `${dateString}T${timeString}`;

  const date = new Date(dateTimeString);

  return date.getTime();
}

async function updateLanguagePicker(component, props) {
  const languagePicker = component.querySelector('#language-picker');
  const eventUrlInput = component.querySelector('#event-info-url-input');

  if (!languagePicker || !eventUrlInput) return;

  const { cloudType } = component.dataset;

  if (!cloudType) return;

  try {
    const [cloud, localesResp] = await Promise.all([getCloud(cloudType), getLocales()]);

    if (!cloud || cloud.error) {
      buildErrorMessage(component, 'Error loading cloud data. Please refresh the page or try again later.');
      window.lana?.log('Error loading cloud data. Please refresh the page or try again later.');
      return;
    }

    const { locales } = cloud;
    const allLocales = localesResp.localeNames;

    languagePicker.querySelectorAll('sp-menu-item').forEach((option) => {
      option.remove();
    });

    locales.forEach((l) => {
      const lang = allLocales[l];
      const opt = createTag('sp-menu-item', { value: l }, lang);
      languagePicker.append(opt);
    });

    const defaultLocale = props.eventDataResp?.defaultLocale;
    if (defaultLocale) {
      languagePicker.value = defaultLocale;
      languagePicker.dispatchEvent(new Event('change'));
    } else if (props.locale) {
      languagePicker.value = props.locale;
      languagePicker.dispatchEvent(new Event('change'));
    }

    languagePicker.disabled = !!defaultLocale;
  } catch (error) {
    buildErrorMessage(component, 'Error updating language picker. Please refresh the page or try again later.');
    window.lana?.log('Error updating language picker. Please refresh the page or try again later.');
  }
}

function initTitleWatcher(component, props) {
  const titleInput = component.querySelector('#info-field-event-title');
  const engTitle = component.querySelector('#event-info-url-input');

  let existingTitle = titleInput.value;

  if (!engTitle) return;

  engTitle.value = props.eventDataResp?.engTitle;
  if (!engTitle.value || engTitle.value === existingTitle) {
    engTitle.value = titleInput.value;
  }

  BlockMediator.set('eventDupMetrics', { ...BlockMediator.get('eventDupMetrics'), title: engTitle.value });

  titleInput.addEventListener('input', () => {
    if (engTitle.value === '' || engTitle.value === existingTitle) {
      engTitle.value = titleInput.value;
    }

    BlockMediator.set('eventDupMetrics', { ...BlockMediator.get('eventDupMetrics'), title: engTitle.value });

    existingTitle = titleInput.value;
  });
}

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const isPrivate = component.querySelector('#private-event').checked;
  const title = component.querySelector('#info-field-event-title').value;
  const description = component.querySelector('#info-field-event-description').value;
  const eventDetails = component.querySelector('#event-info-details-rte-output').value;
  const datePicker = component.querySelector('#event-info-date-picker');
  const enTitle = component.querySelector('#event-info-url-input').value;
  const localStartDate = datePicker.dataset.startDate;
  const localEndDate = datePicker.dataset.endDate;

  const localStartTime = component.querySelector('#time-picker-start-time-value').value;
  const localEndTime = component.querySelector('#time-picker-end-time-value').value;

  const timezone = component.querySelector('#time-zone-select-input').value;

  const localStartTimeMillis = dateTimeStringToTimestamp(localStartDate, localStartTime);
  const localEndTimeMillis = dateTimeStringToTimestamp(localEndDate, localEndTime);

  const eventInfo = {
    title,
    description,
    eventDetails,
    localStartDate,
    localEndDate,
    localStartTime,
    localEndTime,
    localStartTimeMillis,
    localEndTimeMillis,
    timezone,
    enTitle,
    isPrivate,
  };

  setPropsPayload(props, eventInfo);
}

export async function onPayloadUpdate(component, props) {
  const { cloudType } = props.payload;

  if (cloudType && cloudType !== component.dataset.cloudType) {
    component.dataset.cloudType = cloudType;
    await updateLanguagePicker(component, props);
  }
}

export async function onRespUpdate(component, props) {
  if (props.eventDataResp) {
    const { defaultLocale } = props.eventDataResp;

    if (defaultLocale) {
      await updateLanguagePicker(component, props);
    }
  }

  refillFields(component, props, props.eventDataResp);
}

function checkEventDuplication(event, compareMetrics) {
  const titleMatch = event.title === compareMetrics.title;
  const startDateMatch = event.localStartDate === compareMetrics.startDate;
  const venueIdMatch = event.venue?.city === compareMetrics.city;
  const eventIdNoMatch = event.eventId !== compareMetrics.eventId;
  const stateCodeMatch = event.venue?.stateCode === compareMetrics.stateCode;

  return titleMatch && startDateMatch && venueIdMatch && eventIdNoMatch && stateCodeMatch;
}

export default async function init(component, props) {
  const allEventsResp = await getEvents();
  const allEvents = allEventsResp?.events;
  const eventData = props.eventDataResp;
  const sameSeriesEvents = allEvents?.filter((e) => {
    const matchInPayload = e.seriesId === props.payload.seriesId;
    const matchInResp = e.seriesId === eventData.seriesId;
    return matchInPayload || matchInResp;
  }) || [];

  const eventTitleInput = component.querySelector('#info-field-event-title');
  const languagePicker = component.querySelector('#language-picker');
  const startTimeInput = component.querySelector('#time-picker-start-time');
  const allStartTimeOptions = startTimeInput.querySelectorAll('sp-menu-item');
  const startAmpmInput = component.querySelector('#ampm-picker-start-time');
  const startAmpmOptions = startAmpmInput.querySelectorAll('sp-menu-item');
  const endTimeInput = component.querySelector('#time-picker-end-time');
  const allEndTimeOptions = endTimeInput.querySelectorAll('sp-menu-item');
  const endAmpmInput = component.querySelector('#ampm-picker-end-time');
  const endAmpmOptions = endAmpmInput.querySelectorAll('sp-menu-item');
  const startTime = component.querySelector('#time-picker-start-time-value');
  const endTime = component.querySelector('#time-picker-end-time-value');
  const datePicker = component.querySelector('#event-info-date-picker');
  const descriptionRTE = component.querySelector('#event-info-details-rte');
  const descriptionRTEOutput = component.querySelector('#event-info-details-rte-output');

  initCalendar(component);

  const resetAllOptions = () => {
    [allEndTimeOptions, allStartTimeOptions, endAmpmOptions, startAmpmOptions]
      .forEach((options) => {
        options.forEach((option) => {
          option.disabled = false;
        });
      });
  };

  const sameDayEvent = () => datePicker.dataset.startDate
    && datePicker.dataset.endDate
    && datePicker.dataset.startDate === datePicker.dataset.endDate;

  const onEndTimeUpdate = () => {
    if (endAmpmInput.value && endTimeInput.value) {
      endTime.value = convertTo24HourFormat(`${endTimeInput.value} ${endAmpmInput.value}`);
    } else {
      endTime.value = null;
    }

    if (!sameDayEvent()) return;

    startAmpmOptions[1].disabled = endAmpmInput.value === 'AM';
    let onlyPossibleStartAmpm = startAmpmInput.value;
    if (!onlyPossibleStartAmpm && startAmpmOptions[1].disabled) onlyPossibleStartAmpm = 'AM';

    if (startTimeInput.value) {
      if (onlyPossibleStartAmpm) {
        const onlyPossibleStartTime = convertTo24HourFormat(`${startTimeInput.value} ${onlyPossibleStartAmpm}`);
        if (endAmpmInput.value) {
          allEndTimeOptions.forEach((option) => {
            const optionTime = convertTo24HourFormat(`${option.value} ${endAmpmInput.value}`);
            option.disabled = optionTime <= onlyPossibleStartTime;
          });
        }

        if (endTimeInput.value) {
          endAmpmOptions.forEach((option) => {
            const optionTime = convertTo24HourFormat(`${endTimeInput.value} ${option.value}`);
            option.disabled = optionTime <= onlyPossibleStartTime;
          });
        }
      }
    }

    if (endTime.value) {
      if (onlyPossibleStartAmpm) {
        allStartTimeOptions.forEach((option) => {
          const optionTime = convertTo24HourFormat(`${option.value} ${onlyPossibleStartAmpm}`);
          option.disabled = optionTime >= endTime.value;
        });
      }

      if (startTimeInput.value) {
        startAmpmOptions.forEach((option) => {
          const optionTime = convertTo24HourFormat(`${startTimeInput.value} ${option.value}`);
          option.disabled = optionTime >= endTime.value;
        });
      }
    }
  };

  const onStartTimeUpdate = () => {
    if (startAmpmInput.value && startTimeInput.value) {
      startTime.value = convertTo24HourFormat(`${startTimeInput.value} ${startAmpmInput.value}`);
    } else {
      startTime.value = null;
    }

    if (!sameDayEvent()) return;

    endAmpmOptions[0].disabled = startAmpmInput.value === 'PM';
    let onlyPossibleEndAmpm = endAmpmInput.value;
    if (!onlyPossibleEndAmpm && endAmpmOptions[0].disabled) onlyPossibleEndAmpm = 'PM';

    if (endTimeInput.value) {
      if (onlyPossibleEndAmpm) {
        const onlyPossibleEndTime = convertTo24HourFormat(`${endTimeInput.value} ${onlyPossibleEndAmpm}`);
        if (startAmpmInput.value) {
          allStartTimeOptions.forEach((option) => {
            const optionTime = convertTo24HourFormat(`${option.value} ${startAmpmInput.value}`);
            option.disabled = optionTime >= onlyPossibleEndTime;
          });
        }

        if (startTimeInput.value) {
          startAmpmOptions.forEach((option) => {
            const optionTime = convertTo24HourFormat(`${startTimeInput.value} ${option.value}`);
            option.disabled = optionTime >= onlyPossibleEndTime;
          });
        }
      }
    }

    if (startTime.value) {
      if (onlyPossibleEndAmpm) {
        allEndTimeOptions.forEach((option) => {
          const optionTime = convertTo24HourFormat(`${option.value} ${onlyPossibleEndAmpm}`);
          option.disabled = optionTime <= startTime.value;
        });
      }

      if (endTimeInput.value) {
        endAmpmOptions.forEach((option) => {
          const optionTime = convertTo24HourFormat(`${endTimeInput.value} ${option.value}`);
          option.disabled = optionTime <= startTime.value;
        });
      }
    }
  };

  const updateTimeOptionsBasedOnDate = () => {
    if (!sameDayEvent()) {
      resetAllOptions();
    } else {
      startTimeInput.value = '';
      startAmpmInput.value = '';
      endTimeInput.value = '';
      endAmpmInput.value = '';
      startTime.value = null;
      endTime.value = null;

      resetAllOptions();
    }
  };

  startTimeInput.addEventListener('change', onStartTimeUpdate);
  endTimeInput.addEventListener('change', onEndTimeUpdate);
  startAmpmInput.addEventListener('change', onStartTimeUpdate);
  endAmpmInput.addEventListener('change', onEndTimeUpdate);

  datePicker.addEventListener('change', (e) => {
    updateTimeOptionsBasedOnDate(e);
    BlockMediator.set('eventDupMetrics', { ...BlockMediator.get('eventDupMetrics'), startDate: datePicker.dataset.startDate });
  });

  if (descriptionRTE) {
    descriptionRTE.handleInput = (output) => {
      changeInputValue(descriptionRTEOutput, 'value', output);
    };
  }

  BlockMediator.subscribe('eventDupMetrics', (store) => {
    const metrics = store.newValue;
    const helpText = component.querySelector('sp-textfield#info-field-event-title sp-help-text');

    helpText.textContent = helpText.textContent
      .replace('[[seriesName]]', metrics.seriesName)
      .replace('[[eventName]]', metrics.title);

    const isDup = sameSeriesEvents?.some((e) => checkEventDuplication(e, metrics));
    if (isDup) {
      props.el.classList.add('show-dup-event-error');
      eventTitleInput.invalid = true;
    } else {
      props.el.classList.remove('show-dup-event-error');
      eventTitleInput.invalid = false;
    }

    eventTitleInput.dispatchEvent(new Event('change'));
  });

  initTitleWatcher(component, props);
  languagePicker.addEventListener('change', () => {
    props.locale = languagePicker.value;
  });
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
