/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { getLibs } from '../../scripts/utils.js';
import { style } from './profile-container.css.js';

const { LitElement, html, repeat } = await import(`${getLibs()}/deps/lit-all.min.js`);

const defaultProfile = { socialMedia: [{ url: '' }] };

export class ProfileContainer extends LitElement {
  static properties = {
    fieldlabels: { type: Object, reflect: true },
    profiles: { type: Array, reflect: true },
  };

  static styles = style;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.profiles = this.profiles ?? [defaultProfile];
  }

  addProfile() {
    const profile = { ...defaultProfile };
    this.profiles.push(profile);
    this.requestUpdate();
  }

  getProfiles() {
    return [...this.querySelectorAll('profile-ui')].map((profileUI) => profileUI.profile);
  }

  render() {
    const imageTag = this.fieldlabels.image;
    imageTag.setAttribute('slot', 'img-label');
    imageTag.classList.add('img-upload-text');
    return html`${
      repeat(this.profiles, (profile) => profile.id, (profile, index) => {
        const fieldlabels = { ...this.fieldlabels };
        const imgTag = imageTag.cloneNode(true);
        return html`<profile-ui profile=${JSON.stringify(profile)} fieldlabels=${JSON.stringify(fieldlabels)} class="form-component">${imgTag}</profile-ui>`})}
      <repeater-element text=${this.fieldlabels?.addProfileRepeater} @repeat=${this.addProfile}></repeater-element>`;
  }
}
