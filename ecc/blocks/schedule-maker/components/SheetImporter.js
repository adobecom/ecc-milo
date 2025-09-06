import { html } from '../htm-wrapper.js';
import { useState, useEffect } from '../../../scripts/libs/preact-hook.js';
import { useSchedules } from '../context/SchedulesContext.js';
import { decorateBlocks } from '../utils.js';
import { useNavigation } from '../context/NavigationContext.js';
import useIcons from '../useIcons.js';

export default function SheetImporter() {
  const { importSheetScheduleName } = useNavigation();
  const { createAndAddSchedule, setActiveSchedule } = useSchedules();
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
    mobileRiderSessionId: '',
    fragmentPath: '',
  });

  useEffect(() => {
    const fetchLibrary = async () => {
      const { default: XLSX } = await import('../../../scripts/libs/xlsx.js');
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
          mobileRiderSessionId: '',
          fragmentPath: '',
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error reading file:', error);
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
          block[property] = row[columnIndex] || '';
        }
      });

      // Ensure we have an id for the block
      block.id = `block-${Math.random().toString(36).substring(2, 15)}`;
      block.liveStream = Boolean(block.mobileRiderSessionId);
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
    const decoratedBlocks = decorateBlocks(blocks);

    if (decoratedBlocks.length === 0) {
      // eslint-disable-next-line no-alert
      alert('No valid blocks found. Please check your column mapping.');
      return;
    }

    const newSchedule = await createAndAddSchedule({
      title: importSheetScheduleName,
      blocks: decoratedBlocks,
    });

    // Reset the form and go to edit schedule
    setUploadedFile(null);
    setWorkbook(null);
    setSelectedSheet('');
    setSheetData([]);
    setColumnMapping({
      startDateTime: '',
      title: '',
      mobileRiderSessionId: '',
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
          <label for="sheet-select">Select a sheet</label>
          <select \
            id="sheet-select" \
            value=${selectedSheet} \
            onChange=${(e) => handleSheetSelection(e.target.value)} \
          >
            <option value="">Choose a sheet...</option>
            ${workbook.SheetNames.map((sheetName) => html`
              <option value=${sheetName}>${sheetName}</option>
            `)}
          </select>
        </div>
      ` : ''}

      <!-- Column Mapping -->
      ${selectedSheet && sheetData.length > 0 ? html`
        <div class="sheet-importer__mapping">
          <h3>Map Columns to Properties</h3>
          <div class="sheet-importer__mapping-grid">
            ${Object.entries(columnMapping).map(([property, selectedColumn]) => html`
              <div class="sheet-importer__mapping-item">
                <label for=${`mapping-${property}`}>${property}:</label>
                <select \
                  id=${`mapping-${property}`} \
                  value=${selectedColumn} \
                  onChange=${(e) => handleColumnMappingChange(property, e.target.value)} \
                >
                  <option value="">Select column...</option>
                  ${getAvailableColumns().map((column) => html`
                    <option value=${column}>${column}</option>
                  `)}
                </select>
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
          <button \
            class="sheet-importer__add-button" \
            onClick=${handleAddSchedule} \
            disabled=${!Object.values(columnMapping).some((v) => v)} \
          >
            <span class="icon icon-add-circle sm-icon-sm"></span>
            Add ${convertToBlocks().length} blocks to schedule
          </button>
        </div>
      ` : ''}
    </div>
  `;
}
