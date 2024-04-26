/* eslint-disable no-use-before-define */
import { getLibs } from '../../../scripts/utils.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

function compareDates(date1, date2) {
  return date1.getFullYear() === date2.getFullYear()
         && date1.getMonth() === date2.getMonth()
         && date1.getDate() === date2.getDate();
}

function addTimeToDate(date, timeString) {
  const timeParts = timeString.match(/(\d+):(\d+)-(\w+)/);
  const hours = parseInt(timeParts[1], 10);
  const minutes = parseInt(timeParts[2], 10);
  const ampm = timeParts[3];

  const hoursIn24 = ampm.toLowerCase() === 'pm' ? (hours % 12) + 12 : hours % 12;

  date.setHours(hoursIn24, minutes, 0, 0);

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
  todayDate.setHours(0, 0, 0, 0); // Normalize today's date

  for (let i = 0; i < firstDayOfMonth; i += 1) {
    createTag('div', { class: 'calendar-day empty' }, '', { parent: calendarGrid });
  }
  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(state.currentYear, state.currentMonth, day);
    const dayElement = createTag('div', {
      class: 'calendar-day',
      tabindex: '0',
      'data-date': date,
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
    if (compareDates(date, todayDate)) {
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
}

function updateInput(component, state) {
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: state.timeZone,
  };

  const dateInput = component.querySelector('#event-info-date-picker');

  dateInput.dataset.startDate = state.selectedStartDate;
  dateInput.dataset.endDate = state.selectedEndDate;

  const localStartTime = state.selectedStartDate?.toLocaleString('en-GB', options) || '';
  const localEndTime = state.selectedEndDate?.toLocaleString('en-GB', options) || '';

  if (dateInput) {
    dateInput.value = `${localStartTime} - ${localEndTime}`;
  }
}

function updateSelectedDates(state) {
  const { parent } = state;
  parent.querySelectorAll('.calendar-day').forEach((dayElement) => {
    const date = new Date(dayElement.getAttribute('data-date'));
    dayElement.classList.toggle('selected', date >= state.selectedStartDate && date <= (state.selectedEndDate || state.selectedStartDate));
    dayElement.classList.toggle('range', date > state.selectedStartDate && date < (state.selectedEndDate || state.selectedStartDate));
    // Mark the start date and end date
    if (compareDates(date, state.selectedStartDate)
    && (state.selectedStartDate === state.selectedEndDate)) {
      dayElement.classList.add('start-date', 'end-date');
    } else if (state.selectedStartDate && compareDates(date, state.selectedStartDate)) {
      dayElement.classList.remove('end-date');
      dayElement.classList.add('start-date');
    } else if (state.selectedEndDate && compareDates(date, state.selectedEndDate)) {
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

function buildCalendar(component, parent) {
  const input = component.querySelector('#event-info-date-picker');

  if (!input) return;

  const state = {
    currentView: 'days',
    selectedStartDate: input.dataset.startDate ? new Date(input.dataset.startDate) : null,
    selectedEndDate: input.dataset.endDate ? new Date(input.dataset.endDate) : null,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
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
  const calendarIcon = datePickerContainer.querySelector('.icon-calendar-add');

  calendarIcon.addEventListener('click', () => {
    if (calendar) return;
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
}

export default function init(component) {
  initCalendar(component);
}

export function onSubmit(component) {
  const eventTitle = component.querySelector('#info-field-event-title').getAttribute('value');
  const eventDescription = component.querySelector('#info-field-event-description').getAttribute('value');

  const startTime = component.querySelector('#time-picker-start-time').getAttribute('value');
  const endTime = component.querySelector('#time-picker-end-time').getAttribute('value');

  const datePicker = component.querySelector('#event-info-date-picker');
  const startDate = new Date(datePicker.dataset.startDate);
  const endDate = new Date(datePicker.dataset.endDate);

  const eventStartDate = addTimeToDate(new Date(startDate), startTime);
  const eventEndDate = addTimeToDate(new Date(endDate), endTime);

  const eventInfo = {
    title: eventTitle,
    'event-title': eventTitle,
    description: eventDescription,
    'event-description': eventDescription,
    'event-start': eventStartDate,
    'event-end': eventEndDate,
  };

  return eventInfo;
}
