/* eslint-disable no-unused-vars */
/* eslint-disable no-use-before-define */
import { getLibs } from '../../../scripts/utils.js';
import { changeInputValue } from '../../../utils/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

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

    if (dateInput.dataset.startDate && dateInput.dataset.endDate) dateInput.value = `${dateInput.dataset.startDate} - ${dateInput.dataset.endDate}`;
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
    if (!(e.target.closest('.date-picker') || e.target.parentElement.classList.contains('calendar-grid')) && calendar) {
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

export function onSubmit(component, props) {
  if (component.closest('.fragment')?.classList.contains('hidden')) return;

  const title = component.querySelector('#info-field-event-title').value;
  const description = component.querySelector('#info-field-event-description').value;
  const datePicker = component.querySelector('#event-info-date-picker');
  const localStartDate = datePicker.dataset.startDate;
  const localEndDate = datePicker.dataset.endDate;

  const localStartTime = component.querySelector('#time-picker-start-time').value;
  const localEndTime = component.querySelector('#time-picker-end-time').value;

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

  props.payload = { ...props.payload, ...eventInfo };
}

export async function onUpdate(_component, _props) {
  // Do nothing
}

export default function init(component, props) {
  const eventData = props.eventDataResp;
  initCalendar(component);

  const {
    title,
    description,
    localStartDate,
    localEndDate,
    localStartTime,
    localEndTime,
    timezone,
  } = eventData;

  component.querySelector('#info-field-event-title').value = title || '';
  component.querySelector('#info-field-event-description').value = description || '';
  changeInputValue(component.querySelector('#time-picker-start-time'), 'value', localStartTime || '');
  changeInputValue(component.querySelector('#time-picker-end-time'), 'value', localEndTime || '');
  changeInputValue(component.querySelector('#time-zone-select-input'), 'value', `${timezone}` || '');

  const datePicker = component.querySelector('#event-info-date-picker');
  datePicker.dataset.startDate = localStartDate || '';
  datePicker.dataset.endDate = localEndDate || '';
  updateInput(component, {
    selectedStartDate: parseFormatedDate(localStartDate),
    selectedEndDate: parseFormatedDate(localEndDate),
  });
}
