import { LIBS } from '../../scripts/scripts.js';

const { createTag, getConfig } = await import(`${LIBS}/utils/utils.js`);

const state = {
  currentView: 'days',
  selectedStartDate: null,
  selectedEndDate: null,
  currentYear: new Date().getFullYear(),
  currentMonth: new Date().getMonth(),
  headerTitle: null,
  parent: null,
};

function formatDate(date) {
  let month = `${date.getMonth() + 1}`;
  let day = `${date.getDate()}`;
  const year = date.getFullYear();

  if (month.length < 2) month = `0${month}`;
  if (day.length < 2) day = `0${day}`;

  return [year, month, day].join('-');
}

export function parseFormattedDate(string) {
  if (!string) return null;

  const [year, month, day] = string.split('-');
  const date = new Date(year, +month - 1, day);

  return date;
}

function isSameDay(date1, date2) {
  return date1.getFullYear() === date2.getFullYear()
         && date1.getMonth() === date2.getMonth()
         && date1.getDate() === date2.getDate();
}

function updateSelectedDates() {
  const { parent } = state;
  parent.querySelectorAll('.calendar-day').forEach((dayElement) => {
    if (!dayElement.getAttribute('data-date')) return;

    const clickedDate = parseFormattedDate(dayElement.getAttribute('data-date'));
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

export function updateCalendarInput(component, incomingState = null) {
  const newState = { ...state, ...incomingState };
  const dateInput = component.querySelector('#event-info-date-picker');

  if (dateInput) {
    if (newState.selectedStartDate) {
      dateInput.dataset.startDate = formatDate(newState.selectedStartDate);
    }
    if (newState.selectedEndDate) {
      dateInput.dataset.endDate = formatDate(newState.selectedEndDate);
    }

    if (dateInput.dataset.startDate && dateInput.dataset.endDate) {
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      const dateLocale = getConfig().locale?.ietf || 'en-US';
      const startDateTime = newState.selectedStartDate
        .toLocaleDateString(dateLocale, options);
      const endDateTime = newState.selectedEndDate
        .toLocaleDateString(dateLocale, options);
      const dateValue = dateInput.dataset.startDate === dateInput.dataset.endDate
        ? startDateTime : `${startDateTime} - ${endDateTime}`;
      dateInput.value = dateValue;
    }
  }
}

function selectDate(component, date) {
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

  updateSelectedDates();
  updateCalendarInput(component);
  input.dispatchEvent(new Event('change'));
}

function updateDayView(component, parent) {
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
          selectDate(component, date);
          event.preventDefault();
        }
      });
      dayElement.addEventListener('click', () => selectDate(component, date));
    }

    // Mark today's date
    if (date === todayDate) {
      dayElement.classList.add('today');
    }
  }
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

function updateCalendar(component, parent) {
  const updateMonthView = () => {
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
          updateCalendar(component, parent);
        });
      }
    });
  };

  const updateYearView = () => {
    state.headerTitle.textContent = `${state.currentYear - 10} - ${state.currentYear + 10}`;
    const calendarGrid = createTag('div', { class: 'calendar-grid year-view' }, null, { parent });
    const currentYear = new Date().getFullYear();

    Array.from({ length: 21 }, (_, i) => state.currentYear - 10 + i).forEach((year) => {
      const yearElement = createTag('div', {
        class: 'calendar-year',
        'data-year': year,
      }, year.toString(), { parent: calendarGrid });

      // Disable past years
      if (year < currentYear) {
        yearElement.classList.add('disabled');
      } else {
        const targetYear = year; // Capture the current year value
        yearElement.addEventListener('click', () => {
          state.currentYear = targetYear;
          state.currentView = 'months';
          updateCalendar(component, parent);
        });
      }
    });
  };

  parent.querySelectorAll('.calendar-grid, .weekdays').forEach((e) => e.remove());
  if (state.currentView === 'days') {
    updateDayView(component, parent);
  } else if (state.currentView === 'months') {
    updateMonthView(component, parent);
  } else if (state.currentView === 'years') {
    updateYearView(component, parent);
  }

  if (state.selectedStartDate && state.selectedEndDate) {
    updateSelectedDates();
  }
}

function changeCalendarPage(component, delta) {
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

  updateCalendar(component, state.parent);
}

function switchToFirstEnabledMonth(component, calendar) {
  if (!calendar || state.currentView !== 'days') return;

  const enabledDays = calendar.querySelectorAll('.calendar-day:not(.disabled):not(.empty)');

  if (enabledDays.length === 0) {
    changeCalendarPage(component, 1);
  }
}

function buildCalendar(component, parent) {
  const input = component.querySelector('#event-info-date-picker');

  if (!input) return;

  state.parent = parent;
  state.headerTitle = createTag('span', { class: 'header-title' }, '', { parent });

  if (input.dataset.startDate) {
    state.selectedStartDate = parseFormattedDate(input.dataset.startDate);
  }
  if (input.dataset.endDate) {
    state.selectedEndDate = parseFormattedDate(input.dataset.endDate);
  }

  state.currentYear = new Date().getFullYear();
  state.currentMonth = new Date().getMonth();

  const header = createTag('div', { class: 'calendar-header' }, null, { parent });
  const prevButton = createTag('a', { class: 'prev-button', role: 'button' }, '<', { parent: header });
  header.append(state.headerTitle);
  const nextButton = createTag('a', { class: 'next-button', role: 'button' }, '>', { parent: header });

  prevButton.onclick = () => changeCalendarPage(component, -1);
  nextButton.onclick = () => changeCalendarPage(component, 1);

  state.headerTitle.addEventListener('click', () => {
    // eslint-disable-next-line no-nested-ternary
    state.currentView = state.currentView === 'days' ? 'months' : state.currentView === 'months' ? 'years' : 'days';
    updateCalendar(component, parent);
  });

  updateCalendar(component, parent);
}

export default function initCalendar(component) {
  let calendar;
  const datePickerContainer = component.querySelector('.date-picker');
  const input = component.querySelector('#event-info-date-picker');

  datePickerContainer.addEventListener('click', () => {
    if (calendar || input.disabled) return;
    calendar = createTag('div', { class: 'calendar-container' });
    datePickerContainer.append(calendar);
    buildCalendar(component, calendar);
    switchToFirstEnabledMonth(component, calendar);
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
