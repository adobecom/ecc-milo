import { useState } from '../../../scripts/libs/preact-hook.js';
import { html } from '../htm-wrapper.js';
import { useSchedulesData, useSchedulesOperations } from '../context/SchedulesContext.js';
import { useNavigation } from '../context/NavigationContext.js';
import UnsavedChangesModal from './UnsavedChangesModal.js';
import SearchInput from './SearchInput.js';

function Sidebar({ setIsAddScheduleModalOpen }) {
  const [search, setSearch] = useState('');
  const [isUnsavedChangesModalOpen, setIsUnsavedChangesModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [pendingSchedule, setPendingSchedule] = useState(null);
  const { goToEditSchedule } = useNavigation();
  const { schedules, activeSchedule, setActiveSchedule, hasUnsavedChanges } = useSchedulesData();
  const { discardChangesToActiveSchedule } = useSchedulesOperations();

  const handleAddSchedule = () => {
    if (hasUnsavedChanges) {
      setPendingAction('add');
      setIsUnsavedChangesModalOpen(true);
      return;
    }
    setIsAddScheduleModalOpen(true);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(e.target.value);
  };

  const handleSelectSchedule = (schedule) => {
    if (hasUnsavedChanges) {
      setPendingAction('switch');
      setPendingSchedule(schedule);
      setIsUnsavedChangesModalOpen(true);
      return;
    }
    setActiveSchedule(schedule);
    goToEditSchedule();
  };

  const handleProceedWithAction = () => {
    discardChangesToActiveSchedule();
    if (pendingAction === 'add') {
      setIsAddScheduleModalOpen(true);
    } else if (pendingAction === 'switch' && pendingSchedule) {
      setActiveSchedule(pendingSchedule);
      goToEditSchedule();
    }
    // Reset pending state
    setPendingAction(null);
    setPendingSchedule(null);
  };

  const handleCloseUnsavedChangesModal = () => {
    setIsUnsavedChangesModalOpen(false);
    setPendingAction(null);
    setPendingSchedule(null);
  };

  const filteredSchedules = schedules?.filter(
    (schedule) => {
      const searchTerm = search.toLowerCase();
      const title = schedule.title.toLowerCase();
      return title.includes(searchTerm);
    },
  );

  return html`
    <div class="sm-sidebar">
      <sp-button class="sm-sidebar__button" size="l" static-color="black" onclick=${handleAddSchedule}>
        <sp-icon slot="icon">
          <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
            <mask id="mask0_2489_9865" style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="22" height="22">
                <path d="M11 20.6572C5.69228 20.6572 1.375 16.3399 1.375 11.0322C1.375 5.72451 5.69228 1.40723 11 1.40723C16.3077 1.40723 20.625 5.72451 20.625 11.0322C20.625 16.3399 16.3077 20.6572 11 20.6572ZM11 3.05723C6.60215 3.05723 3.025 6.63437 3.025 11.0322C3.025 15.4301 6.60215 19.0072 11 19.0072C15.3979 19.0072 18.975 15.4301 18.975 11.0322C18.975 6.63437 15.3979 3.05723 11 3.05723Z" fill="#292929"/>
                <path d="M14.5751 10.1751H11.8251V7.4251C11.8251 6.96963 11.4556 6.6001 11.0001 6.6001C10.5446 6.6001 10.1751 6.96963 10.1751 7.4251V10.1751H7.4251C6.96963 10.1751 6.6001 10.5446 6.6001 11.0001C6.6001 11.4556 6.96963 11.8251 7.4251 11.8251H10.1751V14.5751C10.1751 15.0306 10.5446 15.4001 11.0001 15.4001C11.4556 15.4001 11.8251 15.0306 11.8251 14.5751V11.8251H14.5751C15.0306 11.8251 15.4001 11.4556 15.4001 11.0001C15.4001 10.5446 15.0306 10.1751 14.5751 10.1751Z" fill="#292929"/>
            </mask>
            <g mask="url(#mask0_2489_9865)">
                <rect width="22" height="22" fill="white"/>
            </g>
          </svg>
        </sp-icon>
        Add Schedule
      </sp-button>
      <${SearchInput} \
        placeholder="Search schedules" \
        value="${search}" \
        onInput="${handleSearch}" \
        className="sm-sidebar__search" \
      />
      <p class="sm-sidebar__select-schedule">Select schedule</p>
      <div class="sm-sidebar__schedules">
          ${filteredSchedules?.map((schedule) => html`
            <button \
              key="${schedule.id}" \
              class="sm-sidebar__schedule ${activeSchedule?.scheduleId === schedule.scheduleId ? 'sm-sidebar__schedule--active' : ''}" \
              onclick=${() => handleSelectSchedule(schedule)} \
            >
              ${schedule.title}
              ${!schedule.isComplete && html`
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M9.99936 15.1233C9.76871 15.1315 9.54398 15.0496 9.37275 14.895C9.04242 14.5304 9.04242 13.9751 9.37275 13.6104C9.5421 13.4521 9.76758 13.3677 9.99939 13.3757C10.2357 13.3662 10.4653 13.4559 10.6324 13.6231C10.7945 13.7908 10.8816 14.017 10.8738 14.2499C10.8862 14.4846 10.8042 14.7145 10.6461 14.8886C10.4725 15.0531 10.2382 15.1382 9.99936 15.1233Z" fill="#F03823"/>
                    <path d="M10 11.75C9.58594 11.75 9.25 11.4141 9.25 11V7C9.25 6.58594 9.58594 6.25 10 6.25C10.4141 6.25 10.75 6.58594 10.75 7V11C10.75 11.4141 10.4141 11.75 10 11.75Z" fill="#F03823"/>
                    <path d="M16.7334 18H3.2666C2.46631 18 1.74365 17.5898 1.33398 16.9023C0.924314 16.2148 0.906734 15.3838 1.28759 14.6797L8.021 2.23242C8.41455 1.50488 9.17286 1.05273 10 1.05273C10.8271 1.05273 11.5855 1.50488 11.979 2.23242L18.7124 14.6797C19.0933 15.3838 19.0757 16.2148 18.666 16.9023C18.2563 17.5898 17.5337 18 16.7334 18ZM10 2.55273C9.86572 2.55273 9.53223 2.59082 9.34033 2.94531L2.60693 15.3926C2.42382 15.7314 2.55664 16.0244 2.62255 16.1338C2.68798 16.2441 2.88183 16.5 3.26659 16.5H16.7334C17.1182 16.5 17.312 16.2441 17.3774 16.1338C17.4434 16.0244 17.5762 15.7314 17.3931 15.3926L10.6597 2.94531C10.4678 2.59082 10.1343 2.55273 10 2.55273Z" fill="#F03823"/>
                  </svg>
              `}
            </button>
          `)}
      </div>
      
      <${UnsavedChangesModal} \
        isOpen=${isUnsavedChangesModalOpen} \
        onClose=${handleCloseUnsavedChangesModal} \
        onProceed=${handleProceedWithAction} \
      />
    </div>
  `;
}

export default Sidebar;
