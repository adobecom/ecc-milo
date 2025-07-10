# Image Dropzone Component

A LitElement component for image upload with optional Adobe Creative Cloud Everywhere cropping functionality.

## Features

- Drag and drop image upload
- File validation (size and type)
- Image preview
- Delete functionality
- Optional Adobe CC Everywhere image cropping (via ExpressCropDialog integration)

## Usage

### Basic Usage

```html
<image-dropzone 
  .handleImage=${this.handleImage}
  .handleDelete=${this.handleDelete}>
  <span slot="img-label">Upload an image</span>
</image-dropzone>
```

### With Cropper Enabled

```html
<image-dropzone 
  .handleImage=${this.handleImage}
  .handleDelete=${this.handleDelete}
  .enableCropper=${true}>
  <span slot="img-label">Upload an image</span>
</image-dropzone>
```

## Properties

- `file` (Object): The current file object
- `handleImage` (Function): Callback function when image is uploaded/changed
- `handleDelete` (Function): Custom delete handler (optional)
- `enableCropper` (Boolean): Enable Adobe CC Everywhere cropping functionality

## Events

- `image-change`: Fired when the image changes (upload, crop, or delete)
- `show-error-toast`: Fired when an error occurs (for toast notifications)

## Cropper Integration

The cropper functionality is provided by the `ExpressCropDialog` component (`cc-everywhere-cropper`):

1. **Component Integration**: The image-dropzone imports and uses the existing `ExpressCropDialog` component
2. **Lazy Loading**: The cropper component is only rendered when `enableCropper` is true
3. **Event Handling**: Listens for `file-ready` events from the cropper to update the image
4. **Seamless UX**: Crop button appears next to delete button when enabled

### How It Works

1. **Crop Button**: When `enableCropper` is true, a crop icon appears next to the delete button
2. **Dialog Opening**: Clicking the crop button opens the ExpressCropDialog with the current image
3. **Cropping Process**: User can crop the image using Adobe's CC Everywhere SDK
4. **File Update**: The cropped image replaces the original file and triggers `image-change` event

### Cropper Features

- **Adobe CC Everywhere SDK**: Powered by Adobe's official cropping tools
- **Credential Management**: Automatically reads credentials from `./sdk-package/credential.json`
- **Multiple Export Options**: Editor, Download, and Host options available
- **Error Handling**: Comprehensive error handling with user-friendly messages

## Styling

The component uses CSS custom properties for theming:

```css
:host {
  --color-gray-100: #f5f5f5;
  --color-gray-400: #d1d5db;
  --type-body-xs-size: 12px;
}
```

## Dependencies

- LitElement
- ExpressCropDialog component (`cc-everywhere-cropper`)
- Adobe Creative Cloud Everywhere SDK (loaded by ExpressCropDialog)
- Image validation utilities

## Component Architecture

```
ImageDropzone
├── File upload/drop functionality
├── Image preview
├── Delete functionality
└── ExpressCropDialog (when enableCropper=true)
    ├── Adobe CC Everywhere SDK
    ├── Crop interface
    └── File processing
``` 
