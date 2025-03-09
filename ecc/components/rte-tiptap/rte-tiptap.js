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
    this.showLinkDialog = false;
    this.linkDialogUrl = 'https://';
    this.linkDialogError = false;
    this.isEditingLink = false;
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
    const attrs = this.editor.getAttributes('link');
    this.linkDialogUrl = attrs.href || 'https://';
    this.isEditingLink = !!attrs.href;
    this.showLinkDialog = true;
    this.requestUpdate();
  }

  handleLinkDialogCancel() {
    this.showLinkDialog = false;
    const attrs = this.editor.getAttributes('link');
    if (!attrs.href) {
      this.editor.chain().focus().unsetLink().run();
    }
    this.requestUpdate();
  }

  handleLinkDialogConfirm() {
    if (this.linkDialogUrl.match(LINK_REGEX)) {
      this.editor.chain().focus().setLink({ href: this.linkDialogUrl }).run();
      this.showLinkDialog = false;
    } else {
      this.linkDialogError = true;
    }
    this.requestUpdate();
  }

  handleLinkDialogInput(e) {
    this.linkDialogUrl = e.target.value;
    this.linkDialogError = false;
    this.requestUpdate();
  }

  handleLinkUnlink() {
    this.editor.chain().focus().unsetLink().run();
    this.showLinkDialog = false;
    this.requestUpdate();
  }

  toggleFormat(format) {
    if (format === 'Paragraph') {
      this.editor.chain().focus().setParagraph().run();
    } else {
      const level = parseInt(format.replace('Heading ', ''), 10);
      this.editor.chain().focus().toggleHeading({ level }).run();
    }
  }

  // Helper method to select current word if no selection exists
  selectWordAtCursor() {
    const { editor } = this;
    const { selection } = editor.state;
    // If there's already a selection, keep it
    if (!selection.empty) return;

    // Get the position of cursor
    const pos = selection.$anchor;
    // Find the start of the current word
    let start = pos.pos;
    while (start > 0 && /\w/.test(editor.state.doc.textBetween(start - 1, start))) {
      start -= 1;
    }
    // Find the end of the current word
    let end = pos.pos;
    while (end < editor.state.doc.content.size && /\w/.test(editor.state.doc.textBetween(end, end + 1))) {
      end += 1;
    }

    // Set the new selection
    editor.chain().focus().setTextSelection({ from: start, to: end }).run();
  }

  selectLinkAtCursor() {
    const { editor } = this;
    const { selection } = editor.state;

    // If there's already a selection, keep it
    if (!selection.empty) return;

    // If cursor is in a link, extend selection to entire link
    if (editor.isActive('link')) {
      editor.chain().focus().extendMarkRange('link').run();
      return;
    }

    // If not in a link, fall back to selecting current word
    this.selectWordAtCursor();
  }

  render() {
    if (this.handleInput && this.markdownInitialized && !this.editorInitialized) {
      this.initializeEditor();
    }
    /* eslint-disable indent */
    return html`
            <div class="rte-tiptap-toolbar">
              <sp-picker class="rte-format-input select-input" label="Format" value=${this.rteFormat} @change=${(event) => { this.toggleFormat(event.target.value); }}>
                ${repeat(['Paragraph', 'Heading 1', 'Heading 2', 'Heading 3', 'Heading 4', 'Heading 5', 'Heading 6'], (p) => html`<sp-menu-item value=${p}>${p}</sp-menu-item>`)}
              </sp-picker>
              <button aria-label="Bold" class=${this.isBold ? 'active' : ''} @click=${() => {
                this.selectWordAtCursor();
                this.editor.chain().focus().toggleBold().run();
                this.updateButtonStates(this.editor);
              }}>
                <img class="icon icon-rte-bold" src="/ecc/icons/rte-bold.svg" alt="rte-bold" />
              </button>
              <button aria-label="Italic" class=${this.isItalic ? 'active' : ''} @click=${() => {
                this.selectWordAtCursor();
                this.editor.chain().focus().toggleItalic().run();
                this.updateButtonStates(this.editor);
              }}>
                <img class="icon icon-rte-italic" src="/ecc/icons/rte-italic.svg" alt="rte-italic" />
              </button>
              <button aria-label="Underline" class=${this.isUnderline ? 'active' : ''} @click=${() => {
                this.selectWordAtCursor();
                this.editor.chain().focus().toggleUnderline().run();
                this.updateButtonStates(this.editor);
              }}>
                <img class="icon icon-rte-underline" src="/ecc/icons/rte-underline.svg" alt="rte-underline" />
              </button>
              <button aria-label="Bullet List" class=${this.isBulletList ? 'active' : ''} @click=${() => {
                this.editor.chain().focus().toggleBulletList().run();
                this.updateButtonStates(this.editor);
              }}>
                <img class="icon icon-rte-bullet-list" src="/ecc/icons/rte-bullet-list.svg" alt="rte-bullet-list" />
              </button>
              <button aria-label="Ordered List" class=${this.isOrderedList ? 'active' : ''} @click=${() => {
                this.editor.chain().focus().toggleOrderedList().run();
                this.updateButtonStates(this.editor);
              }}>
                <img class="icon icon-rte-ordered-list" src="/ecc/icons/rte-ordered-list.svg" alt="rte-ordered-list" />
              </button>
              <button aria-label="Link" class=${this.isLink ? 'active' : ''} @click=${() => {
                this.selectLinkAtCursor();
                this.rteAddLink();
                this.updateButtonStates(this.editor);
              }}>
                <img class="icon icon-rte-link" src="/ecc/icons/rte-link.svg" alt="rte-link" />
              </button>
            </div>
            <div class="rte-tiptap-editor"></div>
            
            <sp-underlay dir="ltr" ?open=${this.showLinkDialog}></sp-underlay>
            ${this.showLinkDialog ? html`
              <sp-dialog
                class="rte-tiptap-dialog"
                size="small" 
                .open=${this.showLinkDialog}
                @close=${() => {
                  this.showLinkDialog = false;
                  this.requestUpdate();
                }}
              >
                <h1 slot="heading">${this.isEditingLink ? 'Edit Link' : 'Add Link'}</h1>
                <sp-textfield
                  label="URL"
                  .value=${this.linkDialogUrl}
                  .invalid=${this.linkDialogError}
                  @input=${this.handleLinkDialogInput}
                ></sp-textfield>
                
                ${this.linkDialogError ? html`
                  <sp-help-text variant="negative">
                    Link must match pattern "${LINK_REGEX}"
                  </sp-help-text>
                ` : ''}
                
                <div slot="button" style="display: flex; gap: 8px;">
                  <sp-button 
                    variant="secondary"
                    @click=${this.handleLinkDialogCancel}
                  >
                    Cancel
                  </sp-button>
                  ${this.isEditingLink ? html`
                    <sp-button 
                      variant="negative"
                      @click=${this.handleLinkUnlink}
                    >
                      Remove Link
                    </sp-button>
                  ` : ''}
                  <sp-button 
                    variant="cta"
                    @click=${this.handleLinkDialogConfirm}
                  >
                    ${this.isEditingLink ? 'Update' : 'Add'} Link
                  </sp-button>
                </div>
              </sp-dialog>
            ` : ''}
        `;
  }
}
