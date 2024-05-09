import { yieldToMain } from '../../../utils/utils.js';
import { initRequiredFieldsValidation } from '../form-handler.js';

async function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);

  await fetch('http://localhost:8000/upload', {
    method: 'POST',
    body: formData,
  })
    .then((response) => response.json())
    .then((data) => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
}

function uploadBinaryFile(file) {
  // TODO: replace with real endpoint
  const url = 'http://localhost:8000/upload';

  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);

  // TODO: set required headers
  // xhr.setRequestHeader('Content-Type', 'application/json');

  xhr.onload = function () {
    if (xhr.status === 200) {
      console.log('Success:', xhr.responseText);
    } else {
      console.error('Error Status:', xhr.status);
    }
  };

  xhr.onerror = function () {
    console.error('Network error');
  };

  xhr.send(file);
}

function handleImageFiles(wrapper, files) {
  const previewWrapper = wrapper.querySelector('.preview-wrapper');
  const imgPlaceholder = wrapper.querySelector('.preview-img-placeholder');
  const fileInput = wrapper.querySelector('.img-file-input');
  const dz = wrapper.querySelector('.img-file-input-label');
  const deleteBtn = wrapper.querySelector('.icon-delete');

  if (files.length > 0) {
    const file = files[0];
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();

      reader.onload = async (e) => {
        const img = new Image();
        img.src = e.target.result;
        previewWrapper.classList.remove('hidden');
        dz.classList.add('hidden');
        imgPlaceholder.innerHTML = '';
        imgPlaceholder.append(img);

        await uploadImage(file);
      };

      reader.readAsDataURL(file);
    }
  }

  deleteBtn.addEventListener('click', () => {
    fileInput.value = '';
    previewWrapper.classList.add('hidden');
    imgPlaceholder.innerHTML = '';
    dz.classList.remove('hidden');
  });
}

function getElementOutput(element, accessPoint) {
  if (!element) return null;

  const propertyValue = element[accessPoint];
  if (propertyValue !== undefined) {
    return propertyValue;
  }

  return element.getAttribute(accessPoint) || '';
}

export function getMappedInputsOutput(component, inputMap) {
  const output = {};

  inputMap.forEach((row) => {
    const inputFound = component.querySelector(row.selector);

    if (inputFound) {
      const { key, accessPoint, shadowRootSelector } = row;
      let targetInput = inputFound;

      if (shadowRootSelector) {
        targetInput = inputFound.shadowRoot.querySelector(shadowRootSelector);
      }

      output[key] = getElementOutput(targetInput, accessPoint);
    }
  });

  return output;
}

export default function makeFileInputDropZone(inputWrapper) {
  const dropZone = inputWrapper.querySelector('.img-file-input-label');
  const fileInput = inputWrapper.querySelector('input[type="file"].img-file-input');

  if (dropZone) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((event) => {
      dropZone.addEventListener(event, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });

    dropZone.addEventListener('dragover', (e) => {
      e.currentTarget.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', (e) => {
      e.currentTarget.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      const { files } = e.dataTransfer;
      handleImageFiles(inputWrapper, files);
      e.currentTarget.classList.remove('dragover');
    });
  }

  fileInput?.addEventListener('change', (e) => {
    const { files } = e.currentTarget;
    handleImageFiles(inputWrapper, files);
  });
}

function setRemoveEventListener(removeElement) {
  removeElement.addEventListener('click', (event) => {
    event.currentTarget.parentElement.remove();
  });
}

export function initRepeater(component) {
  const repeaters = component.querySelectorAll('.repeater-element');
  repeaters.forEach((element) => {
    const vanillaNode = element.previousElementSibling.cloneNode(true);
    element.addEventListener('click', (event) => {
      const clonedNode = vanillaNode.cloneNode(true);
      const prevNode = event.currentTarget.previousElementSibling;
      clonedNode.setAttribute('repeatIdx', parseInt(prevNode.getAttribute('repeatIdx'), 10) + 1);

      // Reset delete icon state and add listener.
      const deleteIcon = clonedNode.querySelector('.repeater-delete-button');

      if (deleteIcon) {
        deleteIcon.classList.remove('hidden');
        setRemoveEventListener(deleteIcon);
      }

      prevNode.after(clonedNode);
      yieldToMain().then(() => {
        initRequiredFieldsValidation();
      });
    });
  });
}

export function initRemove(component) {
  const removeIcons = component.querySelectorAll('.repeater-delete-button');
  removeIcons.forEach((removeIcon) => setRemoveEventListener(removeIcon));
}
