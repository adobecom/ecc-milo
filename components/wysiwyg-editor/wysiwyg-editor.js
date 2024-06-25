/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { getLibs } from '../../scripts/utils.js';
import { style } from './wysiwyg-editor.css.js';

const { LitElement, html } = await import(`${getLibs()}/deps/lit-all.min.js`);

export class WYSIWYGEditor extends LitElement {
  static styles = style;

  render() {
    return html`
            <div id="toolbar">
                <button @click=${() => this.execCommand('bold')}>B</button>
                <button @click=${() => this.execCommand('italic')}>I</button>
                <button @click=${() => this.execCommand('underline')}>U</button>
                <button @click=${this.insertCheckbox}>Checkbox</button>
                <button @click=${() => this.execCommand('insertUnorderedList')}>Bullet List</button>
            </div>
            <div id="editor" contenteditable="true"></div>
            <button @click=${this.convertToMarkdown}>Convert to Markdown</button>
            <pre id="output"></pre>
        `;
  }

  execCommand(command) {
    document.execCommand(command, false, null);
  }

  insertCheckbox() {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    this.shadowRoot.getElementById('editor').appendChild(checkbox);
    this.shadowRoot.getElementById('editor').appendChild(document.createTextNode(' '));
  }

  convertToMarkdown() {
    const editor = this.shadowRoot.getElementById('editor');
    const output = this.shadowRoot.getElementById('output');
    const { innerHTML } = editor;
    const markdown = this.convertHtmlToMarkdown(innerHTML);
    output.textContent = markdown;
  }

  convertHtmlToMarkdown(innerHTML) {
    const markdown = innerHTML
      .replace(/<b>(.*?)<\/b>/g, '**$1**')
      .replace(/<i>(.*?)<\/i>/g, '*$1*')
      .replace(/<u>(.*?)<\/u>/g, '__$1__')
      .replace(/<ul>/g, '')
      .replace(/<\/ul>/g, '')
      .replace(/<li>(.*?)<\/li>/g, '- $1')
      .replace(/<input type="checkbox"(.*?)>/g, '- [ ]')
      .replace(/&nbsp;/g, ' ')
      .replace(/<br>/g, '\n');
    return markdown;
  }
}
