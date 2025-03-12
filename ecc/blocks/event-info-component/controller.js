/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */
import { getCloud, getEvents } from '../../scripts/esp-controller.js';
import BlockMediator from '../../scripts/deps/block-mediator.min.js';
import { LIBS } from '../../scripts/scripts.js';
import { changeInputValue, parse24HourFormat, convertTo24HourFormat } from '../../scripts/utils.js';
import { setPropsPayload } from '../form-handler/data-handler.js';

const { createTag, getConfig } = await import(`${LIBS}/utils/utils.js`);

function formatDate(date) {
  let month = `${date.getMonth() + 1}`;
  let day = `${date.getDate()}`;
  const year = date.getFullYear();

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;

  return [year, month, day].join('-');
}

function parseFormatedDate(string) {
  if (!string) return null;

  const [year, month, day] = string.split('-');
  const date = new Date(year, +month - 1, day);

  return date;
}

// Function to generate a calendar
function updateCalendar(component, parent, state) {
  parent.querySelectorAll('.calendar-grid, .weekdays').forEach((e) => e.remove());
  if (state.currentView === 'days') {
    updateDayView(component, parent, state);
  } else if (state.currentView === 'months') {
    updateMonthView(component, parent, state);
  } else if (state.currentView === 'years') {
    updateYearView(component, parent, state);
  }

  if (state.selectedStartDate && state.selectedEndDate) {
    updateSelectedDates(state);
  }
}

function updateDayView(component, parent, state) {
  state.headerTitle.textContent = `${new Date(state.currentYear, state.currentMonth).toLocaleString('default', { month: 'long' })} ${state.currentYear}`;
  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const weekdaysRow = createTag('div', { class: 'weekdays' }, null, { parent });
  weekdays.forEach((day) => {
    createTag('div', { class: 'weekday' }, day, { parent: weekdaysRow });
  });

  const daysInMonth = new Date(state.currentYear, state.currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(state.currentYear, state.currentMonth, 1).getDay();
  const calendarGrid = createTag('div', { class: 'calendar-grid' }, null, { parent });
  const todayDate = new Date();

  for (let i = 0; i < firstDayOfMonth; i += 1) {
    createTag('div', { class: 'calendar-day empty' }, '', { parent: calendarGrid });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(state.currentYear, state.currentMonth, day);
    const dayElement = createTag('div', {
      class: 'calendar-day',
      tabindex: '0',
      'data-date': formatDate(date),
    }, day.toString(), { parent: calendarGrid });

    if (date < todayDate) {
      dayElement.classList.add('disabled');
    } else {
      dayElement.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          selectDate(component, state, date);
          event.preventDefault();
        }
      });
      dayElement.addEventListener('click', () => selectDate(component, state, date));
    }

    // Mark today's date
    if (date === todayDate) {
      dayElement.classList.add('today');
    }
  }
}

function updateMonthView(component, parent, state) {
  state.headerTitle.textContent = `${state.currentYear}`;
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const calendarGrid = createTag('div', { class: 'calendar-grid month-view' }, null, { parent });
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  months.forEach((month, index) => {
    const monthElement = createTag('div', {
      class: 'calendar-month',
      'data-month': index,
    }, month, { parent: calendarGrid });

    // Disable past months in the current year
    if ((state.currentYear === currentYear && index < currentMonth)
    || state.currentYear < currentYear) {
      monthElement.classList.add('disabled');
    } else {
      monthElement.addEventListener('click', () => {
        state.currentMonth = index;
        state.currentView = 'days';
        updateCalendar(component, parent, state);
      });
    }
  });
}

function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear()
         && date1.getMonth() === date2.getMonth()
         && date1.getDate() === date2.getDate();
}

function updateYearView(component, parent, state) {
  state.headerTitle.textContent = `${state.currentYear - 10} - ${state.currentYear + 10}`;
  const calendarGrid = createTag('div', { class: 'calendar-grid year-view' }, null, { parent });
  const currentYear = new Date().getFullYear();

  for (let year = state.currentYear - 10; year <= state.currentYear + 10; year += 1) {
    const yearElement = createTag('div', {
      class: 'calendar-year',
      'data-year': year,
    }, year.toString(), { parent: calendarGrid });

    // Disable past years
    if (year < currentYear) {
      yearElement.classList.add('disabled');
    } else {
      yearElement.addEventListener('click', () => {
        state.currentYear = year;
        state.currentView = 'months';
        updateCalendar(component, parent, state);
      });
    }
  }
}

function selectDate(component, state, date) {
  const input = component.querySelector('#event-info-date-picker');

  if (!input) return;

  if (!state.selectedStartDate || (state.selectedStartDate !== state.selectedEndDate)) {
    state.selectedStartDate = date;
    state.selectedEndDate = date;
  } else if ((state.selectedStartDate && !state.selectedEndDate)
  || (state.selectedStartDate === state.selectedEndDate)) {
    if (date < state.selectedStartDate) {
      state.selectedEndDate = state.selectedStartDate;
      state.selectedStartDate = date;
    } else {
      state.selectedEndDate = date;
    }
  }

  updateSelectedDates(state);
  updateInput(component, state);
  input.dispatchEvent(new Event('change'));
}

function updateInput(component, state) {
  const dateInput = component.querySelector('#event-info-date-picker');

  if (dateInput) {
    if (state.selectedStartDate) dateInput.dataset.startDate = formatDate(state.selectedStartDate);
    if (state.selectedEndDate) dateInput.dataset.endDate = formatDate(state.selectedEndDate);

    if (dateInput.dataset.startDate && dateInput.dataset.endDate) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const dateLocale = getConfig().locale?.ietf || 'en-US';
      const startDateTime = state.selectedStartDate
        .toLocaleDateString(dateLocale, options);
      const endDateTime = state.selectedEndDate
        .toLocaleDateString(dateLocale, options);
      const dateValue = dateInput.dataset.startDate === dateInput.dataset.endDate
        ? startDateTime : `${startDateTime} - ${endDateTime}`;
      dateInput.value = dateValue;
    }
  }
}

function updateSelectedDates(state) {
  const { parent } = state;
  parent.querySelectorAll('.calendar-day').forEach((dayElement) => {
    if (!dayElement.getAttribute('data-date')) return;

    const clickedDate = parseFormatedDate(dayElement.getAttribute('data-date'));
    dayElement.classList.toggle('selected', clickedDate >= state.selectedStartDate && clickedDate <= (state.selectedEndDate || state.selectedStartDate));
    dayElement.classList.toggle('range', clickedDate > state.selectedStartDate && clickedDate < (state.selectedEndDate || state.selectedStartDate));
    // Mark the start date and end date

    if (isSameDay(clickedDate, state.selectedStartDate)
    && isSameDay(state.selectedStartDate, state.selectedEndDate)) {
      dayElement.classList.add('start-date', 'end-date');
    } else if (state.selectedStartDate && isSameDay(clickedDate, state.selectedStartDate)) {
      dayElement.classList.remove('end-date');
      dayElement.classList.add('start-date');
    } else if (state.selectedEndDate && isSameDay(clickedDate, state.selectedEndDate)) {
      dayElement.classList.remove('start-date');
      dayElement.classList.add('end-date');
    } else {
      dayElement.classList.remove('start-date', 'end-date');
    }

    parent.classList.toggle('range-selected', state.selectedStartDate && state.selectedEndDate);
  });
}

function changeCalendarPage(component, state, delta) {
  if (state.currentView === 'days') {
    state.currentMonth += delta;
    if (state.currentMonth < 0) {
      state.currentMonth = 11;
      state.currentYear -= 1;
    } else if (state.currentMonth > 11) {
      state.currentMonth = 0;
      state.currentYear += 1;
    }
  } else if (state.currentView === 'months') {
    state.currentYear += delta;
  } else if (state.currentView === 'years') {
    state.currentYear += delta * 10;
  }
  updateCalendar(component, state.parent, state);
}

function initInputWatcher(input, onChange) {
  const config = { attributes: true, childList: false, subtree: false };

  const callback = (mutationList) => {
    const [mutation] = mutationList;
    if (mutation.target.disabled) {
      onChange();
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(input, config);
}

function buildCalendar(component, parent) {
  const input = component.querySelector('#event-info-date-picker');

  if (!input) return;

  const state = {
    currentView: 'days',
    selectedStartDate: input.dataset.startDate ? parseFormatedDate(input.dataset.startDate) : null,
    selectedEndDate: input.dataset.endDate ? parseFormatedDate(input.dataset.endDate) : null,
    currentYear: new Date().getFullYear(),
    currentMonth: new Date().getMonth(),
    headerTitle: createTag('span', { class: 'header-title' }, '', { parent }),
    parent,
  };

  const header = createTag('div', { class: 'calendar-header' }, null, { parent });
  const prevButton = createTag('a', { class: 'prev-button' }, '<', { parent: header });
  header.append(state.headerTitle);
  const nextButton = createTag('a', { class: 'next-button' }, '>', { parent: header });

  prevButton.onclick = () => changeCalendarPage(component, state, -1);
  nextButton.onclick = () => changeCalendarPage(component, state, 1);

  state.headerTitle.addEventListener('click', () => {
    // eslint-disable-next-line no-nested-ternary
    state.currentView = state.currentView === 'days' ? 'months' : state.currentView === 'months' ? 'years' : 'days';
    updateCalendar(component, parent, state);
  });

  updateCalendar(component, parent, state);
}

function initCalendar(component) {
  let calendar;
  const datePickerContainer = component.querySelector('.date-picker');
  const input = component.querySelector('#event-info-date-picker');

  datePickerContainer.addEventListener('click', () => {
    if (calendar || input.disabled) return;
    calendar = createTag('div', { class: 'calendar-container' });
    datePickerContainer.append(calendar);
    buildCalendar(component, calendar);
  });

  document.addEventListener('click', (e) => {
    if (!(e.target.closest('.date-picker') || e.target.parentElement?.classList.contains('calendar-grid')) && calendar) {
      calendar.remove();
      calendar = '';
    }
  });

  initInputWatcher(input, () => {
    calendar.remove();
    calendar = '';
  });
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

  const cloud = await getCloud(cloudType);

  if (!cloud || cloud.error) return;
  const { locales } = cloud;

  // TODO: remove dictionary
  const dictionary = {
    'en-US': 'English (United States)',
    'es-ES': 'Spanish (Spain)',
    'fr-FR': 'French (France)',
    'de-DE': 'German (Germany)',
    'it-IT': 'Italian (Italy)',
    'ja-JP': 'Japanese (Japan)',
    'ko-KR': 'Korean (South Korea)',
    'vi-VN': 'Vietnamese (Vietnam)',
    'es-AR': 'Spanish (Argentina)',
    'pt-BR': 'Portuguese (Brazil)',
    'en-CA': 'English (Canada)',
    'fr-CA': 'French (Canada)',
    'es-CL': 'Spanish (Chile)',
    'es-CO': 'Spanish (Colombia)',
    'es-CR': 'Spanish (Costa Rica)',
    'es-EC': 'Spanish (Ecuador)',
    'es-EL': 'Spanish (El Salvador)',
    'es-GT': 'Spanish (Guatemala)',
    'es-LA': 'Spanish (Latin America)',
    'es-MX': 'Spanish (Mexico)',
    'es-PE': 'Spanish (Peru)',
    'es-PR': 'Spanish (Puerto Rico)',
    'en-africa': 'English (Africa)',
    'fr-BE': 'French (Belgium)',
    'en-BE': 'English (Belgium)',
    'nl-BE': 'Dutch (Belgium)',
    'en-CY': 'English (Cyprus)',
    'da-DK': 'Danish (Denmark)',
    'et-EE': 'Estonian (Estonia)',
    'ar-EG': 'Arabic (Egypt)',
    'en-GB': 'English (United Kingdom)',
    'lv-LV': 'Latvian (Latvia)',
    'lt-LT': 'Lithuanian (Lithuania)',
    'de-LU': 'German (Luxembourg)',
    'en-LU': 'English (Luxembourg)',
    'fr-LU': 'French (Luxembourg)',
    'hu-HU': 'Hungarian (Hungary)',
    'en-MT': 'English (Malta)',
    'en-mena': 'English (MENA)',
    'ar-mena': 'Arabic (MENA)',
    'en-NG': 'English (Nigeria)',
    'nl-NL': 'Dutch (Netherlands)',
    'no-NO': 'Norwegian (Norway)',
    'pl-PL': 'Polish (Poland)',
    'pt-PT': 'Portuguese (Portugal)',
    'ar-QA': 'Arabic (Qatar)',
    'ro-RO': 'Romanian (Romania)',
    'en-sa': 'English (Saudi Arabia)',
    'fr-CH': 'French (Switzerland)',
    'de-CH': 'German (Switzerland)',
    'it-CH': 'Italian (Switzerland)',
    'sl-SI': 'Slovenian (Slovenia)',
    'sk-SK': 'Slovak (Slovakia)',
    'fi-FI': 'Finnish (Finland)',
    'sv-SE': 'Swedish (Sweden)',
    'tr-TR': 'Turkish (Turkey)',
    'en-ae': 'English (United Arab Emirates)',
    'de-AT': 'German (Austria)',
    'cs-CZ': 'Czech (Czech Republic)',
    'bg-BG': 'Bulgarian (Bulgaria)',
    'ru-RU': 'Russian (Russia)',
    'uk-UA': 'Ukrainian (Ukraine)',
    'ar-ae': 'Arabic (United Arab Emirates)',
    'ar-sa': 'Arabic (Saudi Arabia)',
    'en-ZA': 'English (South Africa)',
    'en-AU': 'English (Australia)',
    'en-HK': 'English (Hong Kong)',
    'en-IN': 'English (India)',
    'hi-IN': 'Hindi (India)',
    'zh-CN': 'Chinese (Simplified, China)',
    'zh-HK': 'Chinese (Traditional, Hong Kong)',
    'zh-TW': 'Chinese (Traditional, Taiwan)',
  };

  languagePicker.querySelectorAll('sp-menu-item').forEach((option) => {
    option.remove();
  });

  locales.forEach((l, i) => {
    const lang = dictionary[l];
    const opt = createTag('sp-menu-item', { value: l }, lang);
    languagePicker.append(opt);

    if (props.locale === l) {
      languagePicker.value = l;
    } else if (i === 0) {
      languagePicker.value = l;
    }
  });

  languagePicker.disabled = false;
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

  const title = component.querySelector('#info-field-event-title').value;
  const description = component.querySelector('#info-field-event-description').value;
  const datePicker = component.querySelector('#event-info-date-picker');
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
    localStartDate,
    localEndDate,
    localStartTime,
    localEndTime,
    localStartTimeMillis,
    localEndTimeMillis,
    timezone,
  };

  setPropsPayload(props, eventInfo);
}

export async function onPayloadUpdate(component, props) {
  const { cloudType } = props.payload;

  if (cloudType && cloudType !== component.dataset.cloudType) {
    component.dataset.cloudType = cloudType;
  }

  updateLanguagePicker(component, props);
}

export async function onRespUpdate(_component, _props) {
  // Do nothing
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
  const localeEventData = eventData.localizations?.[props.lang] || eventData;
  const sameSeriesEvents = allEvents?.filter((e) => {
    const matchInPayload = e.seriesId === props.payload.seriesId;
    const matchInResp = e.seriesId === localeEventData.seriesId;
    return matchInPayload || matchInResp;
  }) || [];

  const eventTitleInput = component.querySelector('#info-field-event-title');
  const eventDescriptionInput = component.querySelector('#info-field-event-description');
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

  const {
    title,
    description,
    localStartDate,
    localEndDate,
    localStartTime,
    localEndTime,
    timezone,
  } = localeEventData;

  if (title
    && description
    && localStartDate
    && localEndDate
    && localStartTime
    && localEndTime
    && timezone) {
    const startTimePieces = parse24HourFormat(localStartTime);
    const endTimePieces = parse24HourFormat(localEndTime);

    datePicker.dataset.startDate = localStartDate || '';
    datePicker.dataset.endDate = localEndDate || '';
    updateInput(component, {
      selectedStartDate: parseFormatedDate(localStartDate),
      selectedEndDate: parseFormatedDate(localEndDate),
    });

    eventTitleInput.value = title || '';
    eventDescriptionInput.value = description || '';
    changeInputValue(startTime, 'value', `${localStartTime}` || '');
    changeInputValue(endTime, 'value', `${localEndTime}` || '');
    changeInputValue(startTimeInput, 'value', `${startTimePieces.hours}:${startTimePieces.minutes}` || '');
    changeInputValue(startAmpmInput, 'value', startTimePieces.period || '');
    changeInputValue(endTimeInput, 'value', `${endTimePieces.hours}:${endTimePieces.minutes}` || '');
    changeInputValue(endAmpmInput, 'value', endTimePieces.period || '');
    changeInputValue(component.querySelector('#time-zone-select-input'), 'value', `${timezone}` || '');

    BlockMediator.set('eventDupMetrics', {
      ...BlockMediator.get('eventDupMetrics'),
      ...{
        title,
        startDate: localStartDate,
        eventId: eventData.eventId,
      },
    });

    component.classList.add('prefilled');
  }

  initTitleWatcher(component, props);
  languagePicker.addEventListener('change', () => {
    props.locale = languagePicker.value;
  });
}

export function onTargetUpdate(component, props) {
  // Do nothing
}
