/**
 * Social Share Dialog Component
 *
 * A reusable component for displaying a social media share dialog.
 * Allows users to share content on LinkedIn, Facebook, and X (Twitter).
 *
 * @module social-share-dialog
 *
 * @example
 * // Basic usage with URL and title
 * import { showSocialShareDialog } from './social-share-dialog.js';
 *
 * showSocialShareDialog({
 *   targetElement: document.querySelector('.my-container'),
 *   url: 'https://example.com/event',
 *   title: 'Check out this amazing event!',
 * });
 *
 * @example
 * // Usage with event object
 * import { showEventShareDialog } from './social-share-dialog.js';
 *
 * showEventShareDialog({
 *   targetElement: props.el,
 *   eventObj: eventData,
 *   getEventPageHost: () => 'https://example.com',
 *   onClose: () => console.log('Dialog closed'),
 * });
 */

import { LIBS } from '../../scripts/scripts.js';
import { getIcon } from '../../scripts/utils.js';
import { getAttribute } from '../../scripts/data-utils.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

// Share types enum
const ShareType = {
  LinkedIn: 'linkedin',
  Facebook: 'facebook',
  X: 'x',
};

/**
 * Opens a share popup window for the specified social media platform
 * @param {string} shareType - The type of share (linkedin, facebook, x)
 * @param {string} url - The URL to share
 * @param {string} title - The title/text to share (used for X/Twitter)
 */
function openSharePopup(shareType, url, title = '') {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  let shareUrl = '';

  switch (shareType) {
    case ShareType.LinkedIn:
      shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
      break;
    case ShareType.Facebook:
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
      break;
    case ShareType.X:
      shareUrl = `https://x.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
      break;
    default:
      window.lana?.log(`Unknown share type: ${shareType}`, { tags: 'errorType=warn,module=social-share-dialog' });
      return;
  }

  // Copy title to clipboard for user convenience
  const prefilledText = 'Join us at our Adobe meetup — connect, learn, and build what\'s next together.';
  navigator.clipboard.writeText(prefilledText).catch((err) => {
    window.lana?.log(`Failed to copy to clipboard: ${err}`, { tags: 'errorType=warn,module=social-share-dialog' });
  });

  // Open popup window
  const width = 600;
  const height = 600;
  const left = (window.innerWidth - width) / 2;
  const top = (window.innerHeight - height) / 2;
  const features = `width=${width},height=${height},left=${left},top=${top},toolbar=0,menubar=0,scrollbars=1,resizable=1`;

  window.open(shareUrl, '_blank', features);
}

// CSS for social share dialog
const SOCIAL_SHARE_DIALOG_CSS = `
  .social-share-icons {
    display: flex;
    gap: 24px;
    justify-content: center;
    align-items: center;
    padding: 24px 0;
    margin: 16px 0;
  }

  .social-share-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background-color: var(--color-gray-200);
    transition: all 0.3s ease;
    cursor: pointer;
    text-decoration: none;
    border: none;
    padding: 0;
  }

  .social-share-icon:hover {
    background-color: var(--color-gray-300);
    transform: scale(1.1);
  }

  .social-share-icon:focus {
    outline: 2px solid var(--color-info-accent);
    outline-offset: 2px;
  }

  .social-share-icon img.icon {
    width: 28px;
    height: 28px;
    pointer-events: none;
  }
`;

let cssInjected = false;

/**
 * Injects the CSS for the social share dialog into the document
 */
function injectCSS() {
  if (cssInjected) return;

  const style = document.createElement('style');
  style.textContent = SOCIAL_SHARE_DIALOG_CSS;
  style.setAttribute('data-social-share-dialog', '');
  document.head.appendChild(style);
  cssInjected = true;
}

/**
 * Shows a social share dialog for sharing events on social media platforms
 * @param {Object} options - Configuration options
 * @param {HTMLElement} options.targetElement - The element containing sp-theme.toast-area
 * @param {string} options.url - The URL to share
 * @param {string} options.title - The title/text to share (optional)
 * @param {Function} options.onClose - Callback when dialog is closed (optional)
 */
export function showSocialShareDialog(options) {
  const {
    targetElement,
    url,
    title = '',
    onClose,
  } = options;

  if (!targetElement) {
    window.lana?.log('Target element is required for social share dialog', { tags: 'errorType=warn,module=social-share-dialog' });
    return;
  }

  const spTheme = targetElement.querySelector('sp-theme.toast-area');
  if (!spTheme) {
    window.lana?.log('sp-theme.toast-area not found in target element', { tags: 'errorType=warn,module=social-share-dialog' });
    return;
  }

  // Inject CSS if not already injected
  injectCSS();

  const underlay = spTheme.querySelector('sp-underlay');
  const dialog = spTheme.querySelector('sp-dialog');

  // Clear any existing dialog content
  dialog.innerHTML = '';

  // Create dialog content
  createTag('h1', { slot: 'heading' }, 'Share Your Event', { parent: dialog });
  createTag('p', {}, 'Promote the event on your social media platforms.', { parent: dialog });

  // Get event URL for sharing
  const shareUrl = url || '#';

  // Create social media icons container
  const socialIconsContainer = createTag('div', { class: 'social-share-icons' }, '', { parent: dialog });

  // LinkedIn share
  const linkedinIcon = getIcon('linkedin');
  const linkedinBtn = createTag('button', {
    type: 'button',
    class: 'social-share-icon',
    title: 'Share on LinkedIn',
    'aria-label': 'Share on LinkedIn',
  }, linkedinIcon, { parent: socialIconsContainer });
  linkedinBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openSharePopup(ShareType.LinkedIn, shareUrl, title);
  });

  // Facebook share
  const facebookIcon = getIcon('facebook3');
  const facebookBtn = createTag('button', {
    type: 'button',
    class: 'social-share-icon',
    title: 'Share on Facebook',
    'aria-label': 'Share on Facebook',
  }, facebookIcon, { parent: socialIconsContainer });
  facebookBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openSharePopup(ShareType.Facebook, shareUrl, title);
  });

  // X (Twitter) share
  const xIcon = getIcon('x');
  const xBtn = createTag('button', {
    type: 'button',
    class: 'social-share-icon',
    title: 'Share on X',
    'aria-label': 'Share on X',
  }, xIcon, { parent: socialIconsContainer });
  xBtn.addEventListener('click', (e) => {
    e.preventDefault();
    openSharePopup(ShareType.X, shareUrl, title);
  });

  const buttonContainer = createTag('div', { class: 'button-container' }, '', { parent: dialog });
  const dialogConfirmBtn = createTag('sp-button', { variant: 'cta', slot: 'button' }, 'Ok', { parent: buttonContainer });

  // Show dialog
  underlay.open = true;

  // Handle close
  const closeDialog = () => {
    underlay.open = false;
    dialog.innerHTML = '';
    if (onClose) {
      onClose();
    }
  };

  dialogConfirmBtn.addEventListener('click', closeDialog);
}

/**
 * Shows a social share dialog for an event object
 * @param {Object} options - Configuration options
 * @param {HTMLElement} options.targetElement - The element containing sp-theme.toast-area
 * @param {Object} options.eventObj - Event object containing event details
 * @param {Function} options.onClose - Callback when dialog is closed (optional)
 */
export function showEventShareDialog(options) {
  const {
    targetElement,
    eventObj,
    onClose,
  } = options;

  // Get event URL for sharing
  let eventUrl = '';
  try {
    eventUrl = 'https://www.adobe.com/events/create-now/create-now-portland-design-month/portland/or/us/2025-10-16.html';//eventObj.detailPagePath?.startsWith('http')
      //? `${eventObj.detailPagePath}.html`
      //: `${getEventPageHost()}${eventObj.detailPagePath}.html`;
  } catch (err) {
    eventUrl = '#';
  }

  // Get event title
  const defaultLocale = eventObj.defaultLocale || Object.keys(eventObj.localizations || {})[0] || 'en-US';
  const eventTitle = getAttribute(eventObj, 'title', defaultLocale);

  // Show the dialog
  showSocialShareDialog({
    targetElement,
    url: eventUrl,
    title: eventTitle,
    onClose,
  });
}
