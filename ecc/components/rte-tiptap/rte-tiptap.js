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
import { LINK_REGEX } from '../../scripts/constants.js';

const { loadScript } = await import(`${LIBS}/utils/utils.js`);

const { LitElement, html, repeat } = await import(`${LIBS}/deps/lit-all.min.js`);

export default class RteTiptap extends LitElement {
  static properties = {
    content: { type: String },
    handleInput: { type: Function },
  };

  static styles = style;

  constructor() {
    super();
    this.editor = () => {};
    this.content = this.content ?? '';
    this.handleInput = this.handleInput || null;
    this.editorInitialized = false;
    this.markdownInitialized = false;
    this.rteFormat = 'Paragraph';
    this.isBold = false;
    this.isItalic = false;
    this.isUnderline = false;
    this.isBulletList = false;
    this.isOrderedList = false;
    this.isLink = false;
  }

  updateButtonStates(editor) {
    this.isBold = editor.isActive('bold');
    this.isItalic = editor.isActive('italic');
    this.isUnderline = editor.isActive('underline');
    this.isBulletList = editor.isActive('bulletList');
    this.isOrderedList = editor.isActive('orderedList');
    this.isLink = editor.isActive('link');
    this.requestUpdate();
  }

  async firstUpdated() {
    await Promise.all([loadScript('https://unpkg.com/turndown/dist/turndown.js'), loadScript('https://unpkg.com/showdown/dist/showdown.min.js')]);
    this.markdownInitialized = true;
    this.requestUpdate();
  }

  initializeEditor() {
    const editorEl = this.shadowRoot.querySelector('.rte-tiptap-editor');
    const turndownService = new TurndownService();
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

        tiptap.handleInput(markdown);
      },
      onSelectionUpdate: ({ editor }) => {
        const currentNode = editor.state.selection.$anchor.parent;
        let formatValue = 'Paragraph';
        if (currentNode.type.name === 'heading') {
          formatValue = `Heading ${currentNode.attrs.level}`;
        } else if (currentNode.type.name === 'paragraph') {
          formatValue = 'Paragraph';
        }
        this.rteFormat = formatValue;
        this.updateButtonStates(editor);
      },
    });
    this.editorInitialized = true;
  }

  rteAddLink() {
    /* eslint-disable no-alert */
    const attrs = this.editor.getAttributes('link');
    const existingUrl = attrs.href || '';
    let url = prompt('Enter the URL:', existingUrl || 'https://');
    while (url !== null) {
      if (url.match(LINK_REGEX)) {
        this.editor.chain().focus().setLink({ href: url }).run();
        break;
      }
      alert(`Link must match pattern "${LINK_REGEX}"`);
      url = prompt('Enter the URL:', url || 'https://');
    }
    if (url === null) {
      this.editor.chain().focus().unsetLink().run();
    }
  }

  toggleFormat(format) {
    if (format === 'Paragraph') {
      this.editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(format.replace('Heading ', ''), 10);
      this.editor.chain().focus().toggleHeading({ level }).run();
    }
  }

  render() {
    if (this.handleInput && this.markdownInitialized && !this.editorInitialized) {
      this.initializeEditor();
    }
    return html`
            <div class="rte-tiptap-toolbar">
              <sp-picker class="rte-format-input select-input" label="Format" value=${this.rteFormat} @change=${(event) => { this.toggleFormat(event.target.value); }}>
                ${repeat(['Paragraph', 'Heading 1', 'Heading 2', 'Heading 3', 'Heading 4', 'Heading 5', 'Heading 6'], (p) => html`<sp-menu-item value=${p}>${p}</sp-menu-item>`)}
              </sp-picker>
              <button aria-label="Bold" class=${this.isBold ? 'active' : ''} @click=${() => { this.editor.chain().focus().toggleBold().run(); this.updateButtonStates(this.editor); }}>
                <img class="icon icon-rte-bold" src="/ecc/icons/rte-bold.svg" alt="rte-bold" />
              </button>
              <button aria-label="Italic" class=${this.isItalic ? 'active' : ''} @click=${() => { this.editor.chain().focus().toggleItalic().run(); this.updateButtonStates(this.editor); }}>
                <img class="icon icon-rte-italic" src="/ecc/icons/rte-italic.svg" alt="rte-italic" />
              </button>
              <button aria-label="Underline" class=${this.isUnderline ? 'active' : ''} @click=${() => { this.editor.chain().focus().toggleUnderline().run(); this.updateButtonStates(this.editor); }}>
                <img class="icon icon-rte-underline" src="/ecc/icons/rte-underline.svg" alt="rte-underline" />
              </button>
              <button aria-label="Bullet List" class=${this.isBulletList ? 'active' : ''} @click=${() => { this.editor.chain().focus().toggleBulletList().run(); this.updateButtonStates(this.editor); }}>
                <img class="icon icon-rte-bullet-list" src="/ecc/icons/rte-bullet-list.svg" alt="rte-bullet-list" />
              </button>
              <button aria-label="Ordered List" class=${this.isOrderedList ? 'active' : ''} @click=${() => { this.editor.chain().focus().toggleOrderedList().run(); this.updateButtonStates(this.editor); }}>
                <img class="icon icon-rte-ordered-list" src="/ecc/icons/rte-ordered-list.svg" alt="rte-ordered-list" />
              </button>
              <button aria-label="Link" class=${this.isLink ? 'active' : ''} @click=${() => { this.rteAddLink(); this.updateButtonStates(this.editor); }}>
                <img class="icon icon-rte-link" src="/ecc/icons/rte-link.svg" alt="rte-link" />
              </button>
            </div>
            <div class="rte-tiptap-editor"></div>
        `;
  }
}
