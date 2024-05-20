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

  // xhr.setRequestHeader('imageType', 'event-hero-image');
  // xhr.setRequestHeader('imageType', 'event-card-image');
  // xhr.setRequestHeader('imageType', 'venue-image');
  // xhr.setRequestHeader('imageType', 'speaker-photo');

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

export async function getClouds() {
  const resp = await fetch('https://www.adobe.com/chimera-api/tags').then((res) => res.json()).catch((error) => error);

  if (!resp.error) {
    const clouds = resp.namespaces.caas.tags['business-unit'].tags;
    return clouds;
  }

  return null;
}

export async function getSeries() {
  const resp = await fetch(
    'http://localhost:8500/v1/series',
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer',
      },
    },
  ).then((res) => res.json()).catch((error) => error);

  if (!resp.error) {
    const { series } = resp;
    return series;
  }

  return null;
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
