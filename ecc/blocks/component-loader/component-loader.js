/* eslint-disable no-undef */
import { Editor } from 'https://esm.sh/@tiptap/core';
import StarterKit from 'https://esm.sh/@tiptap/starter-kit';
import { LIBS } from '../../scripts/scripts.js';
import { RichTextEditor } from '../../components/rich-text-editor/rich-text-editor.js';

const { createTag, loadScript, loadStyle } = await import(`${LIBS}/utils/utils.js`);

export default async function init(el) {
  el.innerHTML = '';

  createTag('h1', {}, 'QuillRich Text Editor', { parent: el });
  createTag('div', { id: 'quill' }, '', { parent: el });
  createTag('h2', {}, 'Quill Output', { parent: el });
  const quillOutput = createTag('div', {}, '', { parent: el });

  await Promise.all([loadScript('https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js'), loadStyle('https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css')]);

  const quill = new Quill('#quill', { theme: 'snow' });

  quill.on('text-change', () => {
    quillOutput.innerHTML = quill.root.innerHTML;
  });

  createTag('hr', {}, '', { parent: el });

  createTag('h1', {}, 'Tiptap Rich Text Editor', { parent: el });
  const tiptap = createTag('div', { id: 'tiptap' }, '', { parent: el });
  createTag('h2', {}, 'Tiptap Output', { parent: el });
  const tiptapOutput = createTag('div', {}, '', { parent: el });

  const tiptapEditor = new Editor({
    element: tiptap,
    extensions: [StarterKit],
    content: '<p>Hello World!</p>',
    onUpdate({ editor }) {
      tiptapOutput.innerHTML = editor.getHTML();
    },
  });
}
