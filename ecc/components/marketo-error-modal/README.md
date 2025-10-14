# Marketo Error Modal Component

A Lit-based modal component that displays an error message when Marketo connection fails, providing users with the option to go back and retry.

## Features

- **Warning Icon**: Red warning triangle to clearly indicate error state
- **Error Message**: Clear messaging about connection failure
- **Go Back Action**: Single button to return to previous step
- **Accessibility**: Proper ARIA labels and semantic structure
- **Responsive Design**: Mobile-friendly layout

## Usage

### Basic Usage

```html
<marketo-error-modal id="errorModal"></marketo-error-modal>

<script type="module">
import MarketoErrorModal from './marketo-error-modal.js';

const errorModal = document.getElementById('errorModal');

// Open the modal with optional Marketo ID
errorModal.openModal('12345678');

// Listen for user action
errorModal.addEventListener('marketo-error-back', (event) => {
  const { action, marketoId } = event.detail;
  console.log('User wants to go back, previous ID:', marketoId);
  // Reopen previous modal with the ID for editing
});
</script>
```

### Customizing Content

```javascript
errorModal.heading = 'Connection Failed';
errorModal.message = 'Unable to verify your Marketo ID. Please check and try again.';
errorModal.openModal();
```

## Properties

- `open` (Boolean): Controls whether the modal is open or closed
- `heading` (String): The main error heading (default: "Cannot connect to Marketo")
- `message` (String): The error description (default: "Make sure you entered your Marketo ID correctly.")
- `marketoId` (String): The ID that failed connection (stored for "go back" functionality)

## Methods

- `openModal(marketoId)`: Opens the modal, optionally storing the failed Marketo ID
- `closeModal()`: Closes the modal

## Events

- `marketo-error-back`: Fired when user clicks "Go back"
  - `event.detail.action` (String): Always "back"
  - `event.detail.marketoId` (String): The Marketo ID that failed (if provided)

## Design Features

### Visual Elements
- **Warning Icon**: SVG triangle with exclamation mark in red color
- **Clean Layout**: Icon and text properly aligned
- **Single Action**: Only one button to reduce cognitive load

### Responsive Behavior
- **Desktop**: Icon and text side-by-side with proper spacing
- **Mobile**: Adjusted spacing and font sizes for smaller screens

## Integration

This component is designed to work as part of the complete Marketo connection flow:

1. User attempts to connect with Marketo ID
2. Connection validation fails (API error, invalid ID, etc.)
3. This error modal appears with clear error message
4. User clicks "Go back" to return to ID entry modal
5. Previous modal reopens with the failed ID pre-filled for editing

## Error Flow Example

```javascript
// In your connection validation logic
async function validateMarketoConnection(marketoId) {
  try {
    const response = await fetch(`/api/marketo/validate/${marketoId}`);
    if (!response.ok) {
      // Show error modal
      const errorModal = document.querySelector('marketo-error-modal');
      errorModal.openModal(marketoId);
      return false;
    }
    return true;
  } catch (error) {
    // Show error modal
    const errorModal = document.querySelector('marketo-error-modal');
    errorModal.openModal(marketoId);
    return false;
  }
}
```

## Styling

The component uses Spectrum design system colors and follows the established modal patterns:

- **Red Warning Color**: `var(--spectrum-red-600)` for error indication
- **Consistent Spacing**: Matches other modals in the flow
- **Button Styling**: Secondary variant with hover states
- **Typography**: Proper hierarchy with heading and body text

## Accessibility Features

- **ARIA Labels**: Proper `aria-labelledby` for screen readers
- **Semantic HTML**: Uses appropriate heading and paragraph tags
- **Color Contrast**: Meets WCAG guidelines for text readability
- **Focus Management**: Automatic focus handling when modal opens
