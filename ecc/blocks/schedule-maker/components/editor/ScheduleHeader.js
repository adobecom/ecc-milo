import { html } from '../../htm-wrapper.js';
import { useSchedulesData, useSchedulesOperations, useSchedulesUI } from '../../context/SchedulesContext.js';
import { useState } from '../../../../scripts/deps/preact-hook.js';
import { ScheduleURLUtility, validateSchedule } from '../../utils.js';
import DeleteConfirmationModal from '../DeleteConfirmationModal.js';

export default function ScheduleHeader() {
  const { activeSchedule, hasUnsavedChanges } = useSchedulesData();
  const {
    updateScheduleLocally,
    deleteSchedule,
    updateSchedule,
    discardChangesToActiveSchedule,
  } = useSchedulesOperations();
  const { isUpdating, isDeleting, setToastSuccess, setToastError } = useSchedulesUI();

  const [isEditingScheduleTitle, setIsEditingScheduleTitle] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const handleDeleteClick = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = async () => {
    if (!activeSchedule) return;

    try {
      await deleteSchedule(activeSchedule.scheduleId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      window.lana?.log(`Error deleting schedule: ${error}`);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
  };

  const handleCopyLink = async () => {
    if (!activeSchedule) return;

    try {
      // Create a server-friendly version of the schedule (removes client-only properties)
      const didCopy = await ScheduleURLUtility.copyScheduleToClipboard(activeSchedule);

      if (didCopy) {
        setToastSuccess('Link copied to clipboard');
      } else {
        setToastError('Failed to copy link to clipboard');
      }
    } catch (error) {
      window.lana?.log(`Error copying link: ${error}`);
      setToastSuccess('Failed to copy link');
    }
  };

  const handleSave = async () => {
    if (!activeSchedule) return;

    // Validate schedule before submission
    const validationErrors = validateSchedule(activeSchedule);
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.join('\n');
      setToastError(errorMessage);
      return;
    }

    try {
      await updateSchedule(activeSchedule.scheduleId, activeSchedule);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      window.lana?.log(`Error saving schedule: ${error}`);
    }
  };

  const handleScheduleTitleChange = (event) => {
    updateScheduleLocally(event.target.value);
  };

  const handleEditScheduleTitle = () => {
    setIsEditingScheduleTitle(true);
    const scheduleTitleInput = document.getElementById('schedule-title-input');
    if (!scheduleTitleInput) return;
    requestAnimationFrame(() => {
      scheduleTitleInput.focus();
    });
  };

  if (!activeSchedule) {
    return html`
      <header class="sm-editor__header">
        <h2>No schedule selected</h2>
      </header>
    `;
  }

  return html`
    <header class="sm-editor__header">
      <div class="sm-editor__header-title">
        <sp-textfield \
          type="text" \
          size="xl" \
          id="schedule-title-input" \
          value=${activeSchedule?.title || ''} \
          onInput=${handleScheduleTitleChange} \
          class="sm-input--title ${isEditingScheduleTitle ? '' : 'sm-hidden'}" \
          onBlur=${() => setIsEditingScheduleTitle(false)} \
          onFocusIn=${() => setIsEditingScheduleTitle(true)} \
          placeholder="Enter schedule title" \
        ></sp-textfield>
        <button \
          class="sm-title-button sm-title-button--header ${isEditingScheduleTitle ? 'sm-hidden' : ''}" \
          onclick=${() => handleEditScheduleTitle()} \
        >
          ${activeSchedule?.title || ''}
          <span class="icon icon-edit"></span>
        </button>
      </div>
      <div class="sm-editor__header-actions">
        ${hasUnsavedChanges && html`
          <sp-action-button icon="close-circle" size="m" onclick=${discardChangesToActiveSchedule} title="Discard unsaved changes">
            <sp-icon slot="icon">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M1.72949 3.72895C2.12158 3.60834 2.54443 3.82954 2.6665 4.22553L3.19793 5.95569C4.63451 3.62543 7.19416 2.13031 10 2.13031C14.4111 2.13031 18 5.71918 18 10.1303C18 14.5414 14.4111 18.1303 10 18.1303C7.33838 18.1303 4.85839 16.812 3.36669 14.6035C3.13476 14.2602 3.22509 13.7939 3.56835 13.562C3.9121 13.3305 4.37792 13.4213 4.60985 13.7636C5.82225 15.5585 7.8374 16.6303 10 16.6303C13.584 16.6303 16.5 13.7143 16.5 10.1303C16.5 6.54633 13.584 3.63031 10 3.63031C7.79926 3.63031 5.78808 4.76465 4.60009 6.54547L6.14745 6.07025C6.54003 5.95111 6.96288 6.17035 7.08446 6.56683C7.20604 6.96283 6.98387 7.38226 6.58788 7.50384L3.208 8.54193C3.13476 8.56439 3.06054 8.57513 2.9873 8.57513C2.66699 8.57513 2.37011 8.3681 2.27099 8.04534L1.2329 4.66595C1.11132 4.26995 1.3335 3.85053 1.72949 3.72895Z"/>
              </svg>
            </sp-icon>
            Discard
          </sp-action-button>
        `}
        <sp-action-button icon="delete" size="m" onclick=${handleDeleteClick} disabled=${isDeleting}>
          <sp-icon slot="icon">
              <svg width="20" height="21" viewBox="0 0 20 21" fill="currentColor">
                <path d="M8.24903 15.5215C7.84864 15.5215 7.51563 15.2041 7.50098 14.8008L7.25098 8.30078C7.23438 7.88672 7.55762 7.53808 7.97071 7.52246C7.98145 7.52148 7.99122 7.52148 8.00098 7.52148C8.40137 7.52148 8.73438 7.83886 8.74903 8.24218L8.99903 14.7422C9.01563 15.1562 8.69239 15.5049 8.2793 15.5205C8.26856 15.5215 8.25879 15.5215 8.24903 15.5215Z"/>
                <path d="M11.751 15.5215C11.7412 15.5215 11.7314 15.5215 11.7207 15.5205C11.3076 15.5049 10.9844 15.1562 11.001 14.7422L11.251 8.24218C11.2656 7.83886 11.5986 7.52148 11.999 7.52148C12.0088 7.52148 12.0186 7.52148 12.0293 7.52246C12.4424 7.53808 12.7656 7.88672 12.749 8.30078L12.499 14.8008C12.4844 15.2041 12.1514 15.5215 11.751 15.5215Z"/>
                <path d="M17 4.5H13.5V3.75C13.5 2.50977 12.4902 1.5 11.25 1.5H8.75C7.50977 1.5 6.5 2.50977 6.5 3.75V4.5H3C2.58594 4.5 2.25 4.83594 2.25 5.25C2.25 5.66406 2.58594 6 3 6H3.52002L3.94238 16.3418C3.99023 17.5518 4.97851 18.5 6.19043 18.5H13.8096C15.0215 18.5 16.0098 17.5518 16.0576 16.3418L16.48 6H17C17.4141 6 17.75 5.66406 17.75 5.25C17.75 4.83594 17.4141 4.5 17 4.5ZM8 3.75C8 3.33691 8.33691 3 8.75 3H11.25C11.6631 3 12 3.33691 12 3.75V4.5H8V3.75ZM14.5596 16.2812C14.543 16.6846 14.2139 17 13.8096 17H6.19043C5.78613 17 5.45703 16.6846 5.44043 16.2812L5.02075 6H14.9792L14.5596 16.2812Z"/>
              </svg>
          </sp-icon>
          ${isDeleting ? 'Deleting...' : 'Delete All'}
        </sp-action-button>
        <sp-action-button size="m" disabled=${hasUnsavedChanges} onclick=${handleCopyLink}>
          <sp-icon slot="icon">
            <svg width="20" height="21" viewBox="0 0 20 21" fill="currentColor">
                <path d="M5.31348 19.248C4.27246 19.248 3.23243 18.8516 2.44043 18.0596C0.856446 16.4756 0.856446 13.8974 2.44043 12.3125L6.3457 8.40722C7.93066 6.82324 10.5078 6.82421 12.0928 8.40722C12.3096 8.62499 12.5 8.86425 12.6592 9.11718C12.8799 9.46777 12.7744 9.93066 12.4238 10.1514C12.0713 10.373 11.6103 10.2656 11.3896 9.91601C11.2891 9.75585 11.168 9.60449 11.0303 9.46679C10.0312 8.46777 8.40527 8.46874 7.40625 9.46777L3.50098 13.373C2.50196 14.373 2.50196 16 3.50098 16.999C4.50196 18 6.12793 17.9961 7.12696 16.999L9.07911 15.0469C9.37208 14.7539 9.84669 14.7539 10.1397 15.0469C10.4326 15.3398 10.4326 15.8144 10.1397 16.1074L8.18751 18.0596C7.39552 18.8516 6.35449 19.2471 5.31348 19.248ZM13.6543 12.5928L17.5596 8.6875C19.1435 7.10254 19.1435 4.52441 17.5596 2.94043C15.9756 1.35645 13.3965 1.35645 11.8125 2.94043L9.86035 4.89258C9.56738 5.18555 9.56738 5.66016 9.86035 5.95313C10.1533 6.2461 10.6279 6.2461 10.9209 5.95313L12.873 4.00098C13.8721 3.00293 15.498 3.00098 16.499 4.00098C17.498 5 17.498 6.62696 16.499 7.62696L12.5938 11.5322C11.5947 12.5312 9.96876 12.5322 8.96974 11.5332C8.83204 11.3955 8.71095 11.2441 8.61036 11.084C8.38966 10.7344 7.92872 10.627 7.57618 10.8486C7.22559 11.0693 7.12013 11.5322 7.34083 11.8828C7.50001 12.1357 7.69044 12.375 7.90724 12.5928C8.70021 13.3848 9.74025 13.7813 10.7813 13.7813C11.8213 13.7813 12.8623 13.3848 13.6543 12.5928Z" />
            </svg>
          </sp-icon>
            Copy link
        </sp-action-button>
        <sp-action-button icon="save" size="m" onclick=${handleSave} disabled=${isUpdating || !hasUnsavedChanges} class=${hasUnsavedChanges ? 'sm-button--unsaved' : ''}>
          <sp-icon slot="icon">
            <svg width="20" height="21" viewBox="0 0 20 21" fill="currentColor">
              <path d="M15.4067 17.5H3.71777C1.81445 17.5 0.266113 15.9512 0.266113 14.0478C0.266113 12.5547 1.23291 11.2676 2.58984 10.7978C2.54687 10.5674 2.52539 10.333 2.52539 10.0957C2.52539 7.91601 4.33496 6.14258 6.55908 6.14258C6.83887 6.14258 7.1167 6.17188 7.39013 6.23047C8.02734 4.27246 9.8662 2.88379 11.9785 2.88379C14.6494 2.88379 16.8228 5.05664 16.8228 7.72754C16.8228 8.16602 16.7603 8.60059 16.6357 9.02637C18.438 9.55762 19.7388 11.2178 19.7388 13.168C19.7388 15.5566 17.7954 17.5 15.4067 17.5ZM6.55908 7.64258C5.16211 7.64258 4.02539 8.74317 4.02539 10.0957C4.02539 10.4277 4.09473 10.7519 4.23144 11.0605C4.33105 11.2842 4.31445 11.543 4.18749 11.7529C4.06005 11.9629 3.83837 12.0967 3.59374 12.1123C2.56884 12.1777 1.7661 13.0283 1.7661 14.0478C1.7661 15.124 2.64159 16 3.71776 16H15.4067C16.9682 16 18.2388 14.7295 18.2388 13.168C18.2388 11.6709 17.0605 10.4346 15.5566 10.3535C15.3022 10.3398 15.0722 10.1973 14.9458 9.97657C14.8193 9.75489 14.8139 9.48438 14.9316 9.2588C15.1914 8.75978 15.3227 8.24415 15.3227 7.72755C15.3227 5.8838 13.8227 4.3838 11.9785 4.3838C10.3159 4.3838 8.89841 5.63575 8.68113 7.29591C8.65037 7.53126 8.50925 7.73829 8.30125 7.85353C8.09373 7.97072 7.84227 7.97951 7.62693 7.88087C7.27927 7.72267 6.92041 7.64258 6.55908 7.64258Z" />
            </svg>
          </sp-icon>
          ${isUpdating ? 'Saving...' : 'Save'}
        </sp-action-button>
      </div>
    </header>
    <${DeleteConfirmationModal} \
      isOpen=${showDeleteConfirmation} \
      onClose=${handleDeleteCancel} \
      onConfirm=${handleDeleteConfirm} \
      scheduleTitle=${activeSchedule?.title} \
    />
  `;
}
