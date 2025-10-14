# Marketo ID Modal Component

A Lit-based modal component for collecting a user's Marketo ID when they want to connect their webinar to a Marketo Event.

## Features

- Input validation for Marketo ID (6-10 digits)
- Real-time validation with error messages
- Keyboard support (Enter to submit, Escape to cancel)
- Responsive design for mobile devices
- Accessibility features with proper ARIA labels
- Auto-focus on input field when modal opens

## Usage

### Basic Usage

```html
<marketo-id-modal id="idModal"></marketo-id-modal>

<script type="module">
import MarketoIdModal from './marketo-id-modal.js';

const idModal = document.getElementById('idModal');

// Open the modal
idModal.openModal();

// Listen for user submission
idModal.addEventListener('marketo-id-submit', (event) => {
  const { marketoId, action } = event.detail;
  
  if (action === 'connect' && marketoId) {
    console.log('User wants to connect with Marketo ID:', marketoId);
  } else {
    console.log('User canceled');
  }
});
</script>
```

### Customizing the Heading

```javascript
idModal.heading = 'Please provide your Marketo ID';
idModal.openModal();
```

## Properties

- `open` (Boolean): Controls whether the modal is open or closed
- `heading` (String): The modal heading text (default: "Enter your Marketo ID")
- `marketoId` (String): The current value of the Marketo ID input
- `isValid` (Boolean): Whether the current input is valid
- `errorMessage` (String): Current error message (empty if valid)

## Methods

- `openModal()`: Opens the modal and focuses the input field
- `closeModal()`: Closes the modal and resets the form
- `resetForm()`: Clears the input and error state

## Events

- `marketo-id-submit`: Fired when user clicks Connect or Cancel
  - `event.detail.marketoId` (String): The entered Marketo ID (null if canceled)
  - `event.detail.action` (String): Either 'connect' or 'cancel'

## Validation Rules

The component validates Marketo IDs with the following rules:
- Must not be empty
- Must contain only digits
- Must be between 6-10 digits long

## Keyboard Navigation

- **Enter**: Submit the form (if valid)
- **Escape**: Cancel and close the modal
- **Tab**: Navigate between input and buttons

## Integration with Marketo Event Modal

This component is designed to work with the `marketo-event-modal` component. When a user clicks "Yes" on the connection question, this modal automatically opens to collect their Marketo ID.

```javascript
// The marketo-event-modal handles this integration automatically
const eventModal = document.querySelector('marketo-event-modal');
eventModal.openModal(); // Will chain to this modal when user clicks Yes
```

## Styling

The component uses Spectrum Web Components and CSS custom properties for theming. Key styling features:

- Rounded input field and buttons
- Dark "Connect" button to match design
- Responsive layout for mobile devices
- Error message styling with red color
- Disabled state for Connect button when input is invalid

## Demo

See the integrated demo in the `marketo-event-modal` component's demo.html file to see both modals working together.
