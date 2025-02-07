/* eslint-disable no-undef */
import { LIBS } from '../../scripts/scripts.js';
import { RteQuill } from '../../components/rte-quill/rte-quill.js';
import { RteTiptap } from '../../components/rte-tiptap/rte-tiptap.js';
import { RichTextEditor } from '../../components/rich-text-editor/rich-text-editor.js';

const { createTag, loadScript, loadStyle } = await import(`${LIBS}/utils/utils.js`);

export default async function init(el) {

  el.innerHTML = '';

  await Promise.all([loadScript('https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js'), loadScript('https://unpkg.com/turndown/dist/turndown.js'), loadScript('https://cdn.jsdelivr.net/npm/dompurify/dist/purify.min.js'), loadStyle('https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css')]);

  createTag('h1', {}, 'Quill Rich Text Editor', { parent: el });
  createTag('div', { id: 'quill' }, '', { parent: el });
  createTag('h2', {}, 'Quill Output', { parent: el });
  const quillOutput = createTag('div', {}, '', { parent: el });

  const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'], 
    ['blockquote', 'code-block'],
    ['link', 'image', 'video', 'formula'],

    [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],
    [{ 'indent': '-1'}, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],

    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],

    ['clean']
  ];

  const quill = new Quill('#quill', { 
    modules: {
      toolbar: toolbarOptions
    },
    theme: 'snow' 
  });

  const turndownService = new TurndownService();
  /*
  turndownService.addRule('keepParagraphs', {
    filter: 'p',
    replacement: function (content) {
      return `<p>${content}</p>`;
    }
  });
  */
  quill.on('text-change', () => {
    const markdown = turndownService.turndown(quill.getSemanticHTML());
    const clean = DOMPurify.sanitize(quill.getSemanticHTML());
    quillOutput.innerHTML = `<pre>${markdown}</pre>`;
    // quillOutput.innerHTML = clean;
    // quillOutput.innerHTML = quill.getSemanticHTML();
  });

  createTag('hr', {}, '', { parent: el });

  /* RTE TipTap */
  createTag('h1', {}, 'Tiptap Rich Text Editor', { parent: el });
  customElements.define('rte-tiptap', RteTiptap);

  const rteTiptap = createTag('rte-tiptap');
  el.append(rteTiptap);

  createTag('hr', {}, '', { parent: el });

  /* RTE Custom test request */
  createTag('h1', {}, 'Custom Rich Text Editor', { parent: el });

  customElements.define('rich-text-editor', RichTextEditor);

  const rteCustom = createTag('rich-text-editor');
  el.append(rteCustom);
}
