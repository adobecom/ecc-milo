/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { LIBS } from '../../scripts/scripts.js';
import { style } from './repeater.css.js';

const { LitElement, html } = await import(`${LIBS}/deps/lit-all.min.js`);

export class Repeater extends LitElement {
  static properties = { text: { type: String, reflect: true } };

  static styles = style;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  render() {
    return html`
        <div class="repeater-element" @click=${() => this.dispatchEvent(new CustomEvent('repeat'))}>
        <h3 class="repeater-element-title">${this.text}</h3>
        <img class="icon icon-add-circle" src="/ecc/icons/add-circle.svg" alt="add-circle">
        </img></div>`;
  }
}
