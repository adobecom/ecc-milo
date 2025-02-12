/* eslint-disable no-use-before-define */
/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { Editor } from 'https://esm.sh/@tiptap/core';
import StarterKit from 'https://esm.sh/@tiptap/starter-kit';
import Link from 'https://esm.sh/@tiptap/extension-link';
import ListItem from 'https://esm.sh/@tiptap/extension-list-item';

import { LIBS } from '../../scripts/scripts.js';
import { style } from './rte-tiptap.css.js';

const { LitElement, html } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class RteTiptap extends LitElement {
  static styles = style;

  constructor() {
    super();
    this.editor = () => {};
  }

  firstUpdated() {
    const editorEl = this.shadowRoot.querySelector('.rte-tiptap-editor');
    const outputEl = this.shadowRoot.querySelector('.rte-tiptap-output');
    this.editor = new Editor({
      element: editorEl,
      extensions: [
        StarterKit,
        Link.configure({
          openOnClick: false, // avoid opening links immediately when clicked
          autolink: true, // auto-detects links
          HTMLAttributes: {
              rel: 'noopener noreferrer',
              target: '_blank',
          },
        }),
        ListItem.extend({
          content: 'block*',
        })
      ],
      onUpdate({ editor }) {
        outputEl.innerHTML = editor.getHTML();
      },
    });
  }
  
  rteAddLink() {
    const url = prompt("Enter the URL:");
    if (url) {
        this.editor.chain().focus().setLink({ href: url }).run();
    } else {
        this.editor.chain().focus().unsetLink().run();
    }
  }

  render() {
    return html`
            <div class="rte-tiptap-toolbar">
              <button @click=${() => this.editor.chain().focus().toggleBold().run()}>Bold</button>
              <button @click=${() => this.editor.chain().focus().toggleItalic().run()}>Italic</button>
              <button @click=${() => this.editor.chain().focus().toggleStrike().run()}>Strike</button>
              <button @click=${() => this.editor.chain().focus().setParagraph().run()}>Paragraph</button>
              <button @click=${() => this.editor.chain().focus().toggleHeading({ level: 1 }).run()}>H1</button>
              <button @click=${() => this.editor.chain().focus().toggleHeading({ level: 2 }).run()}>H2</button>
              <button @click=${() => this.editor.chain().focus().toggleHeading({ level: 3 }).run()}>H3</button>
              <button @click=${() => this.editor.chain().focus().toggleHeading({ level: 4 }).run()}>H4</button>
              <button @click=${() => this.editor.chain().focus().toggleHeading({ level: 5 }).run()}>H5</button>
              <button @click=${() => this.editor.chain().focus().toggleHeading({ level: 6 }).run()}>H6</button>
              <button @click=${() => this.editor.chain().focus().toggleBulletList().run()}>Bullet List</button>
              <button @click=${() => this.editor.chain().focus().toggleOrderedList().run()}>Ordered List</button>
              <button @click=${() => this.editor.chain().focus().toggleBlockquote().run()}>Blockquote</button>
              <button @click=${() => this.editor.chain().focus().setHorizontalRule().run()}>Horizontal rule</button>
              <button @click=${this.rteAddLink}>Link</button>
            </div>
            <div class="rte-tiptap-editor"></div>
            <h2>TipTap Output</h2>
            <div class="rte-tiptap-output"></div>
        `;
  }
}
