import { html } from '../htm-wrapper.js';
import Sidebar from '../components/Sidebar.js';
import ScheduleEditor from '../components/ScheduleEditor.js';
import SheetImporter from '../components/SheetImporter.js';
import { useNavigation } from '../context/NavigationContext.js';
import AddScheduleModal from '../components/AddScheduleModal.js';
import { useState } from '../../../scripts/deps/preact-hook.js';

function Schedules() {
  const { activePage } = useNavigation();
  const [isAddScheduleModalOpen, setIsAddScheduleModalOpen] = useState(false);

  const handleCloseAddScheduleModal = () => {
    setIsAddScheduleModalOpen(false);
  };

  return html`
    <div class="sm-page">
      <h1 class="sm-page__title">Schedule Maker</h1>
      <div class="sm-schedules__container">
        <div class="sm-schedules__sidebar">
          <${Sidebar} setIsAddScheduleModalOpen=${setIsAddScheduleModalOpen} />
        </div>
        <div class="sm-schedules__content">
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
