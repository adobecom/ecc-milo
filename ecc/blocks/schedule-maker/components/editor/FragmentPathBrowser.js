import { useState, useEffect, useCallback, useRef } from '../../../../scripts/deps/preact-hook.js';
import { html } from '../../htm-wrapper.js';
import Modal from '../Modal.js';
import { SUPPORTED_REPOS } from '../../repos.js';

// Re-exported so existing imports of DEFAULT_FRAGMENT_ROOTS from this file keep working.
export { SUPPORTED_REPOS as DEFAULT_FRAGMENT_ROOTS };

async function waitForImsToken(maxMs = 5000) {
  // da.live is a prod service — stage IMS tokens won't work locally.
  // To test locally, grab a prod IMS token from the prod ECC maker and run:
  //   localStorage.setItem('devDaToken', '<prod-token>')
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    const devToken = localStorage.getItem('devDaToken');
    if (devToken) return devToken;
  }
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const token = window.adobeIMS?.getAccessToken()?.token;
    if (token) return token;
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 100));
  }
  return null;
}

async function daFetch(url) {
  const token = await waitForImsToken();
  const opts = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  return fetch(url, opts);
}

async function fetchDAItems(org, repo, contentPath) {
  const resp = await daFetch(`https://admin.da.live/list/${org}/${repo}${contentPath}`);
  if (resp.status === 401) throw new Error('Unauthorized — you may need DA access. Try signing in at da.live first.');
  if (!resp.ok) throw new Error(`Failed to load (${resp.status})`);
  const items = await resp.json();
  return items.sort((a, b) => {
    if (!a.ext && b.ext) return -1;
    if (a.ext && !b.ext) return 1;
    return a.path.localeCompare(b.path);
  });
}

function getItemName(fullPath) {
  return fullPath.split('/').pop();
}

function stripOrgRepo(fullPath, org, repo) {
  return fullPath.replace(`/${org}/${repo}`, '');
}

export default function FragmentPathBrowser({
  isOpen,
  onClose,
  onSelect,
  roots = SUPPORTED_REPOS,
  selectedPath = null,
}) {
  const [selectedRootIndex, setSelectedRootIndex] = useState(0);
  // columnItems[0] is always the roots list (virtual). columnItems[1+] are fetched.
  // columnPaths[i] is the contentPath whose children are shown in column i+1.
  const [columnPaths, setColumnPaths] = useState([]);
  const [columnItems, setColumnItems] = useState([]);
  const [loadingColIndex, setLoadingColIndex] = useState(null);
  const [error, setError] = useState(null);
  const [isDaAuthError, setIsDaAuthError] = useState(false);
  const [selectedFilePath, setSelectedFilePath] = useState(null);
  // Track which folder path is "active" (highlighted) in each data column
  const [activeFolderPaths, setActiveFolderPaths] = useState([]);

  const columnsRef = useRef(null);
  const currentRoot = roots[selectedRootIndex];

  useEffect(() => {
    if (columnsRef.current) {
      columnsRef.current.scrollLeft = columnsRef.current.scrollWidth;
    }
  }, [columnItems.length]);

  const loadColumn = useCallback(async (colIndex, org, repo, contentPath) => {
    setLoadingColIndex(colIndex);
    setError(null);
    try {
      const items = await fetchDAItems(org, repo, contentPath);
      setColumnItems((prev) => {
        const next = prev.slice(0, colIndex);
        next[colIndex] = items;
        return next;
      });
      setColumnPaths((prev) => {
        const next = prev.slice(0, colIndex);
        next[colIndex] = contentPath;
        return next;
      });
    } catch (err) {
      const is401 = err.message.includes('401') || err.message.toLowerCase().includes('unauthorized');
      setIsDaAuthError(is401);
      setError(is401 ? null : err.message);
    } finally {
      setLoadingColIndex(null);
    }
  }, []);

  // Loads each segment of targetPath as its own column so the full hierarchy is visible.
  // e.g. /events/events-shared/fragments renders col 0=/events, col 1=/events/events-shared, col 2=/events/events-shared/fragments
  const expandToPath = useCallback(async (org, repo, targetPath) => {
    setError(null);
    setIsDaAuthError(false);
    setColumnItems([]);
    setColumnPaths([]);
    setActiveFolderPaths([]);
    setSelectedFilePath(null);

    const segments = targetPath.split('/').filter(Boolean);
    // Always start from '/' so every level of the hierarchy is a visible column.
    const pathsToLoad = ['/', ...segments.map((_, i) => `/${segments.slice(0, i + 1).join('/')}`)];
    // Remove duplicate '/' if targetPath itself was '/'.
    const uniquePathsToLoad = [...new Set(pathsToLoad)];

    for (let i = 0; i < uniquePathsToLoad.length; i += 1) {
      setLoadingColIndex(i);
      try {
        // eslint-disable-next-line no-await-in-loop
        const items = await fetchDAItems(org, repo, uniquePathsToLoad[i]);
        const colPath = uniquePathsToLoad[i];
        setColumnItems((prev) => { const next = [...prev]; next[i] = items; return next; });
        setColumnPaths((prev) => { const next = [...prev]; next[i] = colPath; return next; });
        if (i < uniquePathsToLoad.length - 1) {
          const activeChild = uniquePathsToLoad[i + 1];
          setActiveFolderPaths((prev) => { const next = [...prev]; next[i] = activeChild; return next; });
        }
      } catch (err) {
        const is401 = err.message.includes('401') || err.message.toLowerCase().includes('unauthorized');
        setIsDaAuthError(is401);
        setError(is401 ? null : err.message);
        setLoadingColIndex(null);
        return;
      }
    }
    setLoadingColIndex(null);
  }, []);

  // Reset and expand when modal opens or root changes.
  // If a selectedPath is provided, expand to its parent dir and pre-select the file.
  useEffect(() => {
    if (!isOpen) return;
    (async () => {
      if (selectedPath?.startsWith('/')) {
        const lastSlash = selectedPath.lastIndexOf('/');
        const parentDir = lastSlash > 0 ? selectedPath.slice(0, lastSlash) : '/';
        await expandToPath(currentRoot.org, currentRoot.repo, parentDir);
        setSelectedFilePath(selectedPath);
      } else {
        expandToPath(currentRoot.org, currentRoot.repo, currentRoot.initialPath);
      }
    })();
  }, [isOpen, selectedRootIndex]);

  const handleRootClick = (index) => {
    setSelectedRootIndex(index);
    // useEffect above handles the reset + load
  };

  const handleFolderClick = (colIndex, item) => {
    const root = roots[selectedRootIndex];
    const contentPath = stripOrgRepo(item.path, root.org, root.repo);
    // Highlight this folder in its column, clear deeper selections
    setActiveFolderPaths((prev) => {
      const next = prev.slice(0, colIndex + 1);
      next[colIndex] = contentPath;
      return next;
    });
    setSelectedFilePath(null);
    loadColumn(colIndex + 1, root.org, root.repo, contentPath);
  };

  const handleFileClick = (colIndex, item) => {
    const root = roots[selectedRootIndex];
    const rawPath = stripOrgRepo(item.path, root.org, root.repo);
    const contentPath = item.ext ? rawPath.slice(0, -(item.ext.length + 1)) : rawPath;
    // Clear any columns deeper than this
    setColumnItems((prev) => prev.slice(0, colIndex + 1));
    setColumnPaths((prev) => prev.slice(0, colIndex + 1));
    setActiveFolderPaths((prev) => prev.slice(0, colIndex));
    setSelectedFilePath(contentPath);
  };

  const handleConfirm = () => {
    if (!selectedFilePath) return;
    onSelect(selectedFilePath);
    onClose();
  };

  // Build breadcrumb from active path
  const buildBreadcrumb = () => {
    const parts = [];
    parts.push({ label: currentRoot.label, path: null });
    const deepestActive = selectedFilePath
      || activeFolderPaths[activeFolderPaths.length - 1];

    if (deepestActive) {
      const segments = deepestActive.split('/').filter(Boolean);
      segments.forEach((seg, i) => {
        parts.push({ label: seg, path: `/${segments.slice(0, i + 1).join('/')}` });
      });
    }
    return parts;
  };

  const handleBreadcrumbClick = (path) => {
    if (!path) {
      expandToPath(currentRoot.org, currentRoot.repo, '/');
      return;
    }
    const colIndex = columnPaths.indexOf(path);
    if (colIndex !== -1) {
      // Already a loaded column — trim deeper columns
      setColumnItems((prev) => prev.slice(0, colIndex + 1));
      setColumnPaths((prev) => prev.slice(0, colIndex + 1));
      setActiveFolderPaths((prev) => prev.slice(0, colIndex));
      setSelectedFilePath(null);
    } else {
      // Ancestor not yet loaded — expand to that path
      expandToPath(currentRoot.org, currentRoot.repo, path);
    }
  };

  const renderRootColumn = () => html`
    <div class="fpb-column fpb-column--root">
      ${roots.map((root, i) => html`
        <div \
          key=${root.label} \
          class="fpb-item fpb-item--folder ${selectedRootIndex === i ? 'fpb-item--active' : ''}" \
          onClick=${() => handleRootClick(i)} \
          role="button" \
          tabIndex="0" \
          onKeyDown=${(e) => e.key === 'Enter' && handleRootClick(i)} \
        >
          <span class="fpb-item-icon"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 18 18"><path fill="currentColor" d="M1,4.5v10A1.5,1.5,0,0,0,2.5,16h13A1.5,1.5,0,0,0,17,14.5V6.5A1.5,1.5,0,0,0,15.5,5H9.664a.5.5,0,0,1-.39-.188L7.546,2.688A1.5,1.5,0,0,0,6.378,2.1H2.5A1.5,1.5,0,0,0,1,3.6Z"/></svg></span>
          <span class="fpb-item-name">${root.label}</span>
          <span class="fpb-item-chevron">›</span>
        </div>
      `)}
    </div>
  `;

  const renderDataColumn = (items, colIndex) => html`
    <div class="fpb-column" key=${colIndex}>
      ${items.map((item) => {
        const isFolder = !item.ext;
        const root = roots[selectedRootIndex];
        const rawPath = stripOrgRepo(item.path, root.org, root.repo);
        const contentPath = isFolder ? rawPath : (item.ext ? rawPath.slice(0, -(item.ext.length + 1)) : rawPath);
        const isActiveFolder = isFolder && activeFolderPaths[colIndex] === rawPath;
        const isSelectedFile = !isFolder && selectedFilePath === contentPath;

        return html`
          <div \
            key=${item.path} \
            class="fpb-item ${isFolder ? 'fpb-item--folder' : 'fpb-item--file'} ${isActiveFolder || isSelectedFile ? 'fpb-item--active' : ''}" \
            onClick=${() => isFolder ? handleFolderClick(colIndex, item) : handleFileClick(colIndex, item)} \
            role="button" \
            tabIndex="0" \
            onKeyDown=${(e) => e.key === 'Enter' && (isFolder ? handleFolderClick(colIndex, item) : handleFileClick(colIndex, item))} \
          >
            <span class="fpb-item-icon">
              ${isFolder
                ? html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 18 18"><path fill="currentColor" d="M1,4.5v10A1.5,1.5,0,0,0,2.5,16h13A1.5,1.5,0,0,0,17,14.5V6.5A1.5,1.5,0,0,0,15.5,5H9.664a.5.5,0,0,1-.39-.188L7.546,2.688A1.5,1.5,0,0,0,6.378,2.1H2.5A1.5,1.5,0,0,0,1,3.6Z"/></svg>`
                : html`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 18 18"><path fill="currentColor" d="M15.573,5.573l-3.146-3.146A1.5,1.5,0,0,0,11.368,2H4.5A1.5,1.5,0,0,0,3,3.5v11A1.5,1.5,0,0,0,4.5,16h9A1.5,1.5,0,0,0,15,14.5V6.632A1.5,1.5,0,0,0,15.573,5.573ZM13.5,14.5H4.5V3.5h6.378l.005,0,2.614,2.614,0,.005V14.5Z"/></svg>`
              }
            </span>
            <span class="fpb-item-name">${isFolder ? getItemName(item.path) : getItemName(item.path).replace(/\.[^/.]+$/, '')}</span>
            ${isFolder && html`<span class="fpb-item-chevron">›</span>`}
            ${isSelectedFile && html`<span class="fpb-item-check">✓</span>`}
          </div>
        `;
      })}
    </div>
  `;

  const renderLoadingColumn = () => html`
    <div class="fpb-column fpb-column--loading">
      <div class="fpb-loading">
        <sp-progress-circle indeterminate size="s"></sp-progress-circle>
      </div>
    </div>
  `;

  const breadcrumb = buildBreadcrumb();

  return html`
    <${Modal} \
      isOpen=${isOpen} \
      onClose=${onClose} \
      title="Browse Fragments" \
      confirmText="Select" \
      cancelText="Cancel" \
      onConfirm=${handleConfirm} \
      showActions=${true} \
      size="large" \
    >
      <div class="fpb-wrapper">
        ${error && html`<div class="fpb-error">${error}</div>`}
        ${isDaAuthError && html`
          <div class="fpb-auth-error">
            <p class="fpb-auth-error-msg">Sign-in required to browse Document Authoring fragments.</p>
            <div class="fpb-auth-error-actions">
              <a \
                href="https://da.live/#/${currentRoot.org}/${currentRoot.repo}${currentRoot.initialPath}" \
                target="_blank" \
                rel="noopener noreferrer" \
                class="fpb-open-da-btn" \
              >Open in DA to browse & copy path</a>
              <button class="fpb-retry-btn" onClick=${() => loadColumn(0, currentRoot.org, currentRoot.repo, currentRoot.initialPath)}>Retry</button>
            </div>
          </div>
        `}
        <div class="fpb-columns ${isDaAuthError ? 'fpb-columns--hidden' : ''}" ref=${columnsRef}>
          ${renderRootColumn()}
          ${columnItems.map((items, i) => renderDataColumn(items, i))}
          ${loadingColIndex !== null && renderLoadingColumn()}
        </div>
        <nav class="fpb-breadcrumbs" aria-label="Path breadcrumb">
          ${breadcrumb.map((crumb, i) => html`
            ${i > 0 && html`<span class="fpb-breadcrumb-sep">›</span>`}
            <button \
              class="fpb-breadcrumb-btn ${i === breadcrumb.length - 1 ? 'fpb-breadcrumb-btn--current' : ''}" \
              onClick=${() => handleBreadcrumbClick(crumb.path)} \
              disabled=${i === breadcrumb.length - 1} \
            >${crumb.label}</button>
          `)}
        </nav>
        ${selectedFilePath && html`
          <div class="fpb-selected-path">
            <span class="fpb-selected-label">Selected:</span>
            <code class="fpb-selected-value">${selectedFilePath}</code>
          </div>
        `}
      </div>
    </${Modal}>
  `;
}
