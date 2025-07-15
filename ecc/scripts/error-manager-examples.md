# Error Manager Usage Examples

The ErrorManager provides a centralized way to handle all error display patterns in the ECC application. Here are examples of how to use it:

## Basic Usage

### Import the Error Manager
```javascript
import errorManager from '../../scripts/error-manager.js';
```

## Error Handling Patterns

### 1. Handling API Response Errors
```javascript
// Old way
if (resp.error) {
  buildErrorMessage(props, resp);
}

// New way
errorManager.handleErrorResponse(props, resp);
```

### 2. Showing Simple Error Messages
```javascript
// Old way
const toast = createTag('sp-toast', { open: true, variant: 'negative' }, 'Error message');
toast.addEventListener('close', () => toast.remove());

// New way
errorManager.showError(props, 'Error message');
```

### 3. Showing Success Messages
```javascript
// Old way
const toast = createTag('sp-toast', { open: true, variant: 'positive' }, 'Success!');
toast.addEventListener('close', () => toast.remove());

// New way
errorManager.showSuccess(props, 'Success!');
```

### 4. Handling Custom Error Events
```javascript
// Old way
el.addEventListener('show-error-toast', (e) => {
  e.stopPropagation();
  e.preventDefault();
  buildErrorMessage(props, e.detail);
});

// New way
errorManager.initErrorListeners(el, props);
```

### 5. Handling Exceptions
```javascript
// Old way
try {
  await someAsyncOperation();
} catch (error) {
  const toast = createTag('sp-toast', { open: true, variant: 'negative' }, error.message);
  toast.addEventListener('close', () => toast.remove());
}

// New way
try {
  await someAsyncOperation();
} catch (error) {
  errorManager.handleException(props, error);
}
```

### 6. Wrapping Async Functions
```javascript
// Old way
async function saveData() {
  try {
    return await apiCall();
  } catch (error) {
    showError(error.message);
    throw error;
  }
}

// New way
const saveData = errorManager.wrapAsyncFunction(
  async () => await apiCall(),
  props,
  { timeout: 8000 }
);
```

## Migration Examples

### Form Handler Helper
```javascript
// Before
export function buildErrorMessage(props, resp) {
  if (!resp) return;
  const toastArea = resp.targetEl ? resp.targetEl.querySelector('.toast-area') : props.el.querySelector('.toast-area');
  // ... complex error handling logic
}

// After
export function buildErrorMessage(props, resp) {
  errorManager.handleErrorResponse(props, resp);
}
```

### Dashboard
```javascript
// Before
function showToast(props, msg, options = {}) {
  const toastArea = props.el.querySelector('sp-theme.toast-area');
  const toast = createTag('sp-toast', { open: true, ...options }, msg, { parent: toastArea });
  toast.addEventListener('close', () => {
    toast.remove();
  });
}

// After
function showToast(props, msg, options = {}) {
  errorManager.showToast(props, msg, options);
}
```

### Component Error Events
```javascript
// Before
this.dispatchEvent(new CustomEvent('show-error-toast', { 
  detail: { error: { message: 'Error message' } }, 
  bubbles: true, 
  composed: true 
}));

// After (same event, but handled by error manager)
this.dispatchEvent(new CustomEvent('show-error-toast', { 
  detail: { error: { message: 'Error message' } }, 
  bubbles: true, 
  composed: true 
}));
```

## Advanced Usage

### Custom Toast Options
```javascript
errorManager.showError(props, 'Custom error', {
  timeout: 10000,
  variant: 'negative',
  showCloseButton: false
});
```

### Handling Different Error Types
```javascript
// The error manager automatically detects and handles:
// - Validation errors (error bag)
// - Concurrency errors (409 status)
// - General API errors
// - Network errors
// - Custom error messages
```

### Legacy Compatibility
The error manager provides legacy methods for backward compatibility:
- `errorManager.buildErrorMessage(props, resp)` - replaces old buildErrorMessage
- `errorManager.showToast(props, msg, options)` - replaces old showToast

## Benefits

1. **Centralized Logic**: All error handling is in one place
2. **Consistent UI**: All errors look and behave the same
3. **Easier Maintenance**: Changes to error handling only need to be made in one file
4. **Better Error Recovery**: Automatic handling of common error patterns
5. **Legacy Support**: Existing code continues to work
6. **Type Safety**: Better error handling with proper error types 
