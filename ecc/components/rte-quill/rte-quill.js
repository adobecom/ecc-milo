/* eslint-disable no-use-before-define */
/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { LIBS } from '../../scripts/scripts.js';
import { style } from './rte-quill.css.js';
const { loadScript, loadStyle } = await import(`${LIBS}/utils/utils.js`);
const { LitElement, html } = await import(`${LIBS}/deps/lit-all.min.js`);

export class RteQuill extends LitElement {
  static styles = style;

  constructor() {
    super();
  }

  async firstUpdated() {
    await Promise.all([loadScript('https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.js'), loadStyle('https://cdn.jsdelivr.net/npm/quill@2.0.3/dist/quill.snow.css')]);
    const editorEl = this.shadowRoot.getElementById('quill-editor');
    const outputEl = this.shadowRoot.getElementById('quill-output');
    const toolbarOptions = [
      ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
      ['blockquote', 'code-block'],
      ['link', 'image', 'video', 'formula'],

      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
      [{ 'direction': 'rtl' }],                         // text direction

      [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],

      [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
      [{ 'font': [] }],
      [{ 'align': [] }],

      ['clean']                                         // remove formatting button
    ];
    const quill = new Quill(editorEl, {
      modules: {
        toolbar: toolbarOptions
      },
      theme: 'snow',
    });

    quill.on('text-change', () => {
      outputEl.innerHTML = quill.getSemanticHTML();
    });
  }

  render() {
    return html`
            <div id="quill-editor"></div>
            <h2>Quill Output</h2>
            <div id="quill-output"></div>
        `;
  }
}
