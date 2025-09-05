import { html } from '../htm-wrapper.js';
import Sidebar from '../components/Sidebar.js';
import ScheduleEditor from '../components/ScheduleEditor.js';
import SheetImporter from '../components/SheetImporter.js';
import { useNavigation } from '../context/NavigationContext.js';
import AddScheduleModal from '../components/AddScheduleModal.js';
import { useState } from '../../../scripts/libs/preact-hook.js';

function Schedules({ schedules, activeSchedule, setActiveSchedule }) {
  const { activePage } = useNavigation();
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);

  const handleCloseAddScheduleModal = () => {
    setIsAddScheduleModalOpen(false);
  };

  return html`
    <div class="schedules-page">
      <h1>Schedule Maker</h1>
      <div class="schedules-page-content-container">
        <div class="schedules-page-sidebar">
          <${Sidebar} \
            schedules=${schedules} \
            activeSchedule=${activeSchedule} \
            setActiveSchedule=${setActiveSchedule} \
            setIsAddScheduleModalOpen=${setIsAddScheduleModalOpen} \
          />
        </div>
        <div class="schedules-page-content">
          ${activePage.mode === 'edit' ? html`
            <${ScheduleEditor} />` : html`
            <${SheetImporter} />`}
        </div>
      </div>
      <${AddScheduleModal} isOpen=${isAddScheduleModalOpen} onClose=${handleCloseAddScheduleModal} />
    </div>
  `;
}

export default Schedules;
