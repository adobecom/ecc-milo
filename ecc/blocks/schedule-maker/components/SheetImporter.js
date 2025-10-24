import { html } from '../htm-wrapper.js';
import { useState, useEffect } from '../../../scripts/deps/preact-hook.js';
import { useSchedulesOperations, useSchedulesData } from '../context/SchedulesContext.js';
import { useNavigation } from '../context/NavigationContext.js';
import useIcons from '../useIcons.js';

export default function SheetImporter() {
  const { importSheetScheduleName } = useNavigation();
  const { createAndAddSchedule } = useSchedulesOperations();
  const { setActiveSchedule } = useSchedulesData();
  const { goToEditSchedule, clearImportSheetScheduleName } = useNavigation();
  const [xlsx, setXlsx] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [workbook, setWorkbook] = useState(null);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [sheetData, setSheetData] = useState([]);
  const [columnMapping, setColumnMapping] = useState({
    startDateTime: '',
    title: '',
    streamId: '',
    fragmentPath: '',
  });

  useEffect(() => {
    const fetchLibrary = async () => {
      const { default: XLSX } = await import('../../../scripts/deps/xlsx.js');
      setXlsx(XLSX);
      setIsLoading(false);
    };
    fetchLibrary();
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const parsedWorkbook = xlsx.read(data, { type: 'array' });
        setWorkbook(parsedWorkbook);

        // Reset selections when new file is uploaded
        setSelectedSheet('');
        setSheetData([]);
        setColumnMapping({
          startDateTime: '',
          title: '',
          streamId: '',
          fragmentPath: '',
        });
      } catch (error) {
        window.lana?.log(`Error reading file: ${error}`);
        // eslint-disable-next-line no-alert
        alert('Error reading file. Please make sure it\'s a valid Excel file.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSheetSelection = (sheetName) => {
    setSelectedSheet(sheetName);
    if (workbook && workbook.Sheets[sheetName]) {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = xlsx.utils.sheet_to_json(worksheet, { header: 1 });
      setSheetData(jsonData);
    }
  };

  const getAvailableColumns = () => {
    if (sheetData.length === 0) return [];
    return sheetData[0] || [];
  };

  const renderPreviewRows = () => {
    const rows = sheetData.slice(1, 4);
    const mappedColumns = Object.entries(columnMapping).filter(([, col]) => col);

    return rows.map((row) => {
      const cells = mappedColumns.map(([, col]) => {
        const colIndex = getAvailableColumns().indexOf(col);
        return html`<td>${row[colIndex] || ''}</td>`;
      });
      return html`<tr>${cells}</tr>`;
    });
  };

  const handleColumnMappingChange = (property, columnName) => {
    setColumnMapping((prev) => ({
      ...prev,
      [property]: columnName,
    }));
  };

  const convertToBlocks = () => {
    if (sheetData.length < 2) return [];

    const headers = sheetData[0];
    const rows = sheetData.slice(1);

    return rows.map((row) => {
      const block = {};

      // Map each property to its corresponding column value
      Object.entries(columnMapping).forEach(([property, columnName]) => {
        if (columnName && headers.includes(columnName)) {
          const columnIndex = headers.indexOf(columnName);
          const value = row[columnIndex] || '';

          // Handle streamId separately to build the liveStream object
          if (property === 'streamId') {
            block.liveStream = { provider: 'MobileRider', streamId: value };
            block.includeLiveStream = Boolean(value);
          } else {
            block[property] = value;
          }
        }
      });

      // Ensure we have an id for the block
      block.id = `block-${Math.random().toString(36).substring(2, 15)}`;

      // Initialize liveStream if not set
      if (!block.liveStream) {
        block.liveStream = { provider: 'MobileRider', streamId: '' };
        block.includeLiveStream = false;
      }

      if (!block.fragmentPath) {
        block.fragmentPath = '/remember/to/add/fragment/path';
      }
      // ensure startDateTime is a timestamp
      block.startDateTime = new Date(block.startDateTime).getTime() || 0;
      block.isComplete = false;
      block.isEditingBlockTitle = false;
      return block;
    }).filter((block) => block.title && block.startDateTime);
  };

  const handleAddSchedule = async () => {
    const blocks = convertToBlocks();

    if (blocks.length === 0) {
      // eslint-disable-next-line no-alert
      alert('No valid blocks found. Please check your column mapping.');
      return;
    }

    const newSchedule = await createAndAddSchedule({
      title: importSheetScheduleName,
      blocks,
    });

    // Reset the form and go to edit schedule
    setUploadedFile(null);
    setWorkbook(null);
    setSelectedSheet('');
    setSheetData([]);
    setColumnMapping({
      startDateTime: '',
      title: '',
      streamId: '',
      fragmentPath: '',
    });

    setActiveSchedule(newSchedule);
    clearImportSheetScheduleName();
    goToEditSchedule();
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setWorkbook(null);
    setSelectedSheet('');
    setSheetData([]);
  };
  useIcons();

  if (isLoading) {
    return html`<div class="sheet-importer"><p>Loading...</p></div>`;
  }

  return html`
    <div class="sheet-importer">
      <h2>Import sheet</h2>
      
      <!-- File Upload Section -->
        ${!uploadedFile ? html`
        <label for="file-upload" class="sheet-importer__file-label" aria-label="Choose a file">
          <span>Choose a file</span>
        </label>
        <input \
          id="file-upload" \
          type="file" \
          accept=".xlsx,.xls" \
          onChange=${handleFileUpload} \
          style="display: none;" \
        />` : html`
          <button class="sheet-importer__file-remove" onClick=${handleRemoveFile} aria-label="Remove file">
            ${uploadedFile.name}
            <span class="icon icon-close"></span>
          </button>
        `}

      <!-- Sheet Selection -->
      ${workbook ? html`
        <div class="sheet-importer__sheet-selection">
          <sp-field-label for="sheet-select" size="l">Select a sheet</sp-field-label>
          <sp-picker\
            id="sheet-select" \
            class="sheet-importer__sheet-select" \
            size="l" \
            value=${selectedSheet} \
            onChange=${(e) => handleSheetSelection(e.target.value)} \
          >
            <span slot="label">Choose a sheet...</span>
            ${workbook.SheetNames.map((sheetName) => html`
              <sp-menu-item value=${sheetName}>${sheetName}</sp-menu-item>
            `)}
          </sp-picker>
        </div>
      ` : ''}

      <!-- Column Mapping -->
      ${selectedSheet && sheetData.length > 0 ? html`
        <div class="sheet-importer__mapping">
          <h3>Map fields to columns</h3>
          <div class="sheet-importer__mapping-items">
            ${Object.entries(columnMapping).map(([property, selectedColumn]) => html`
              <div class="sheet-importer__mapping-item">
                <sp-field-label for=${`mapping-${property}`} size="l">${property}:</sp-field-label>
                <sp-picker \
                  id=${`mapping-${property}`} \
                  class="sheet-importer__mapping-picker" \
                  size="l" \
                  value=${selectedColumn} \
                  onChange=${(e) => handleColumnMappingChange(property, e.target.value)} \
                >
                  <span slot="label">Select column...</span>
                  ${getAvailableColumns().map((column) => html`
                    <sp-menu-item value=${column}>${column}</sp-menu-item>
                  `)}
                </sp-picker>
              </div>
            `)}
          </div>
        </div>
      ` : ''}

      <!-- Preview -->
      ${selectedSheet && sheetData.length > 0 && Object.values(columnMapping).some((v) => v) ? html`
        <div class="sheet-importer__preview">
          <h3>Preview (First 3 rows)</h3>
          <div class="sheet-importer__preview-table">
            <table>
              <thead>
                <tr>
                  ${Object.entries(columnMapping).filter(([, col]) => col).map(([prop]) => html`
                    <th>${prop}</th>
                  `)}
                </tr>
              </thead>
              <tbody>
                ${renderPreviewRows()}
              </tbody>
            </table>
          </div>
        </div>
      ` : ''}

      <!-- Add Schedule Button -->
      ${selectedSheet && sheetData.length > 0 ? html`
        <div class="sheet-importer__actions">
          <sp-button \
            class="sheet-importer__add-button" \
            size="l" \
            static-color="black" \
            onClick=${handleAddSchedule} \
            disabled=${!Object.values(columnMapping).some((v) => v)} \
          >
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
            Add schedule
          </sp-button>
        </div>
      ` : ''}
    </div>
  `;
}
