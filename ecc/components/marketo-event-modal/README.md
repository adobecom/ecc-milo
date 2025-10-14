# Marketo Event Modal Component

A Lit-based modal component for asking users if they want to connect their new webinar to a Marketo Event.

## Usage

### Basic Usage

```html
<marketo-event-modal id="modal"></marketo-event-modal>

<script type="module">
import MarketoEventModal from './marketo-event-modal.js';

const modal = document.getElementById('modal');

// Open the modal
modal.openModal();

// Listen for user choice
modal.addEventListener('marketo-connect', (event) => {
  if (event.detail.connect) {
    console.log('User wants to connect to Marketo');
  } else {
    console.log('User does not want to connect to Marketo');
  }
});
</script>
```

### Customizing Content

```javascript
// Customize the modal content
modal.heading = 'Custom heading text';
modal.description = 'Custom description text';
modal.openModal();
```

## Properties

- `open` (Boolean): Controls whether the modal is open or closed
- `heading` (String): The main heading text (default: "Do you need to connect your new webinar to a Marketo Event?")
- `description` (String): The description text (default: "Connect your webinar to an existing Marketo event to sync the details.")

## Methods

- `openModal()`: Opens the modal
- `closeModal()`: Closes the modal

## Events

- `marketo-connect`: Fired when user clicks Yes or No
  - `event.detail.connect` (Boolean): `true` if Yes was clicked, `false` if No was clicked

## Demo

Open `demo.html` in a browser to see the component in action.

## Complete Modal Flow

This component orchestrates a complete 3-modal flow for Marketo connection:

### **Modal 1: Connection Question**
1. User starts webinar creation → "Do you need to connect to Marketo?" modal appears
2. User clicks "No" → Workflow continues without Marketo integration
3. User clicks "Yes" → Modal closes, proceeds to ID entry

### **Modal 2: ID Entry** 
4. "Enter your Marketo ID" modal opens automatically
5. User enters ID and clicks "Connect" → Validation occurs
6. If ID is valid → Success, workflow continues with Marketo integration
7. If ID is invalid → Error modal appears
8. User clicks "Cancel" → Workflow continues without integration

### **Modal 3: Error Handling**
9. "Cannot connect to Marketo" modal shows connection failure
10. User clicks "Go back" → Returns to ID entry modal with previous ID pre-filled
11. User can correct ID and try again, creating a retry loop

## Events

- `marketo-connect`: Fired when user makes a final decision
  - `event.detail.connect` (Boolean): `true` if they want to connect, `false` otherwise
  - `event.detail.marketoId` (String): The Marketo ID if provided, undefined otherwise

## Integration with Create Webinar Workflow

To integrate this modal into the create webinar workflow:

```javascript
// Example integration
async function startWebinarCreation() {
  // Ensure the component is loaded
  await import('./ecc/components/marketo-event-modal/marketo-event-modal.js');
  
  const modal = document.querySelector('marketo-event-modal');
  modal.openModal();
}

modal.addEventListener('marketo-connect', (event) => {
  if (event.detail.connect && event.detail.marketoId) {
    // User provided Marketo ID - proceed with integration
    console.log('Connecting to Marketo ID:', event.detail.marketoId);
    showMarketoIntegrationForm(event.detail.marketoId);
  } else {
    // User declined or canceled - proceed without integration  
    showStandardWebinarForm();
  }
});
```

## Spectrum Web Components Integration

This component uses Adobe's Spectrum Web Components for consistent design and behavior:

### Components Used
- `sp-theme`: Provides design system theming
- `sp-underlay`: Modal backdrop overlay
- `sp-dialog`: Main modal container
- `sp-button`: Action buttons with proper variants
- `sp-textfield`: Input field for Marketo ID (in child modal)

### Automatic Loading
The component automatically imports and initializes all required Spectrum components:
```javascript
// Spectrum components are loaded automatically
import('./ecc/components/marketo-event-modal/marketo-event-modal.js');
```

### Browser Support
- Modern browsers with ES modules support
- Progressive enhancement for older browsers
- Follows Spectrum Web Components requirements

## Error Simulation (Demo)

For demo purposes, the component simulates connection failures:
- Marketo IDs ending in '0' or '1' will trigger the error modal
- All other IDs will succeed
- In production, replace `validateMarketoConnection()` with actual API validation
