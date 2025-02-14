/* eslint-disable no-use-before-define */
/* eslint-disable import/no-unresolved */
/* eslint-disable no-undef */
/* eslint-disable func-names */
/* eslint-disable object-shorthand */
import { Editor } from 'https://esm.sh/@tiptap/core';
import StarterKit from 'https://esm.sh/@tiptap/starter-kit';
import Underline from 'https://esm.sh/@tiptap/extension-underline';
import Link from 'https://esm.sh/@tiptap/extension-link';

import { LIBS } from '../../scripts/scripts.js';
import { style } from './rte-tiptap.css.js';

const { loadScript } = await import(`${LIBS}/utils/utils.js`);

const { LitElement, html } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class RteTiptap extends LitElement {
  static properties = {
    content: { type: String },
    handleChange: { type: Function },
  };

  static styles = style;

  constructor() {
    super();
    this.editor = () => {};
    this.content = '';
    this.handleInput = () => {};
  }

  async firstUpdated() {
    await Promise.all([loadScript('https://unpkg.com/turndown/dist/turndown.js'), loadScript('https://unpkg.com/showdown/dist/showdown.min.js')]);
    const editorEl = this.shadowRoot.querySelector('.rte-tiptap-editor');
    const outputHtmlEl = this.shadowRoot.querySelector('.rte-tiptap-html');
    const outputHtmlToMarkdownEl = this.shadowRoot.querySelector('.rte-tiptap-html-to-markdown');
    const outputMarkdownToHtmlEl = this.shadowRoot.querySelector('.rte-tiptap-markdown-to-html');
    const turndownService = new TurndownService({ headingStyle: 'setText' });
    turndownService.keep(['u']);
    const showdownService = new showdown.Converter();
    const content = this.content ? showdownService.makeHtml(this.content) : '';
    const tiptap = this;
    this.editor = new Editor({
      content: content,
      element: editorEl,
      extensions: [
        StarterKit,
        Underline,
        Link.configure({
          openOnClick: false, // avoid opening links immediately when clicked
          autolink: true, // auto-detects links
          HTMLAttributes: {
            rel: 'noopener noreferrer',
            target: '_blank',
          },
        }),
      ],
      onUpdate({ editor }) {
        const outputHtml = editor.getHTML();
        const markdown = turndownService.turndown(outputHtml);
        const showdown = showdownService.makeHtml(markdown);
        outputHtmlEl.innerHTML = outputHtml;
        outputHtmlToMarkdownEl.innerHTML = markdown;
        outputMarkdownToHtmlEl.innerHTML = showdown;
        tiptap.handleInput(markdown);
      },
    });
  }

  rteAddLink() {
    /* eslint-disable no-alert */
    const url = prompt('Enter the URL:');
    if (url) {
      this.editor.chain().focus().setLink({ href: url }).run();
    } else {
      this.editor.chain().focus().unsetLink().run();
    }
  }

  render() {
    return html`
            <div class="rte-tiptap-toolbar">
              <button @click=${() => this.editor.chain().focus().setParagraph().run()}>Paragraph</button>
              <button @click=${() => this.editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
              <button @click=${() => this.editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
              <button @click=${() => this.editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
              <button @click=${() => this.editor.chain().focus().toggleHeading({ level: 4 }).run()}>H4</button>
              <button @click=${() => this.editor.chain().focus().toggleHeading({ level: 5 }).run()}>H5</button>
              <button @click=${() => this.editor.chain().focus().toggleHeading({ level: 6 }).run()}>H6</button>
              <button @click=${() => this.editor.chain().focus().toggleBold().run()}>Bold</button>
              <button @click=${() => this.editor.chain().focus().toggleItalic().run()}>Italic</button>
              <button @click=${() => this.editor.chain().focus().toggleUnderline().run()}>Underline</button>
              <button @click=${() => this.editor.chain().focus().toggleBulletList().run()}>Bullet List</button>
              <button @click=${() => this.editor.chain().focus().toggleOrderedList().run()}>Ordered List</button>
              <button @click=${this.rteAddLink}>Link</button>
            </div>
            <div class="rte-tiptap-editor"></div>
            <h2>TipTap HTML</h2>
            <div class="rte-tiptap-html"></div>
            <hr>
            <h2>HTML to Markdown</h2>
            <pre id="venue-additional-info-rte-output" class="rte-tiptap-html-to-markdown"></pre>
            <hr>
            <h2>Markdown to HTML</h2>
            <div class="rte-tiptap-markdown-to-html"></div>
        `;
  }
}
