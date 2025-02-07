/* eslint-disable no-use-before-define */
/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { LIBS } from '../../scripts/scripts.js';
import { style } from './rich-text-editor.css.js';

const { LitElement, html } = await import(`${LIBS}/deps/lit-all.min.js`);

export class RichTextEditor extends LitElement {
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
    const markdown = this.htmlToMarkdown(innerHTML);
    output.textContent = markdown;
  }

  /**
     * Converts a DOM element (or any HTML string) to a Markdown string.
     * This function recursively processes the DOM tree and returns a Markdown version.
     */
  htmlToMarkdown(el) {
    // Recursive function to process nodes
    function processNode(node) {
      // If it's a text node, return its text.
      if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }
      // If it's an element node, process based on its tag.
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();
        let md = '';
        switch (tag) {
          case 'h1':
          case 'h2':
          case 'h3':
          case 'h4':
          case 'h5':
          case 'h6': {
            // Heading: use as many '#' as the heading level
            const level = parseInt(tag.substring(1), 10);
            md += `${'#'.repeat(level)} ${processChildNodes(node).trim()}\n\n`;
            break;
          }
          case 'p': {
            md += `${processChildNodes(node).trim()}\n\n`;
            break;
          }
          case 'br': {
            md += '  \n';
            break;
          }
          case 'hr': {
            md += '---\n\n';
            break;
          }
          case 'em':
          case 'i': {
            md += `*${processChildNodes(node)}*`;
            break;
          }
          case 'strong':
          case 'b': {
            md += `**${processChildNodes(node)}**`;
            break;
          }
          case 'code': {
            // If the parent is a <pre>, the code is handled there.
            if (node.parentNode && node.parentNode.tagName && node.parentNode.tagName.toLowerCase() === 'pre') {
              md += node.textContent;
            } else {
              md += `\`${processChildNodes(node)}\``;
            }
            break;
          }
          case 'pre': {
            // Look for a <code> element inside, if present.
            let codeContent = '';
            const codeElem = node.querySelector('code');
            if (codeElem) {
              codeContent = codeElem.textContent;
            } else {
              codeContent = processChildNodes(node);
            }
            md += `\`\`\`\n${codeContent.trim()}\n\`\`\`\n\n`;
            break;
          }
          case 'a': {
            const href = node.getAttribute('href') || '';
            md += `[${processChildNodes(node).trim()}](${href})`;
            break;
          }
          case 'img': {
            const alt = node.getAttribute('alt') || '';
            const src = node.getAttribute('src') || '';
            md += `![${alt}](${src})`;
            break;
          }
          case 'ul': {
            // Process unordered list items
            Array.from(node.children).forEach((li) => {
              if (li.tagName.toLowerCase() === 'li') {
                // Prepend each list item with "- " (you could also use "*" or "+")
                md += `- ${processChildNodes(li).trim().replace(/\n/g, '\n  ')}\n`;
              }
            });
            md += '\n';
            break;
          }
          case 'ol': {
            // Process ordered list items
            let index = 1;
            Array.from(node.children).forEach((li) => {
              if (li.tagName.toLowerCase() === 'li') {
                md += `${index}. ${processChildNodes(li).trim().replace(/\n/g, '\n   ')}\n`;
                index += 1;
              }
            });
            md += '\n';
            break;
          }
          case 'blockquote': {
            // For blockquotes, prefix each line with "> "
            const content = processChildNodes(node).trim();
            const lines = content.split('\n').map((line) => `> ${line}`);
            md += `${lines.join('\n')}\n\n`;
            break;
          }
          default: {
            // For any other element, process its children.
            md += processChildNodes(node);
          }
        }
        return md;
      }
      return '';
    }

    // Helper to process all child nodes of a given parent node.
    function processChildNodes(parent) {
      let md = '';
      parent.childNodes.forEach((child) => {
        md += processNode(child);
      });
      return md;
    }

    // If the provided value is a string of HTML, use a temporary container.
    let container;
    if (typeof el === 'string') {
      container = document.createElement('div');
      container.innerHTML = el;
    } else {
      container = el;
    }

    return processChildNodes(container).trim();
  }
}
