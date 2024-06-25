/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { getLibs } from '../../events/scripts/utils.js';
import { isEmptyObject } from '../../utils/utils.js';
import { style } from './profile-container.css.js';

const { LitElement, html, repeat, nothing } = await import(`${getLibs()}/deps/lit-all.min.js`);

const defaultProfile = { socialMedia: [{ link: '' }], isPlaceholder: true };

export class ProfileContainer extends LitElement {
  static properties = {
    fieldlabels: { type: Object, reflect: true },
    profiles: { type: Array, reflect: true },
    seriesId: { type: String },
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

  isValidSpeaker(profileUI) {
    return profileUI.profile.firstName && profileUI.profile.lastName && profileUI.profile.title;
  }

  getProfiles() {
    return [...this.shadowRoot.querySelectorAll('profile-ui')]
      .filter((p) => !p.isPlaceholder && !isEmptyObject(p) && this.isValidSpeaker(p))
      .map((profileUI, index) => {
        const { id, type } = profileUI.profile;

        return {
          speakerId: id,
          ordinal: index,
          speakerType: type,
        };
      });
  }

  render() {
    const imageTag = this.fieldlabels.image;
    imageTag.setAttribute('slot', 'img-label');
    imageTag.classList.add('img-upload-text');
    return html`${
      repeat(this.profiles, (profile) => profile.id, (profile, index) => {
        const fieldlabels = { ...this.fieldlabels };
        const imgTag = imageTag.cloneNode(true);
        return html`
        <div class="profile-container">
        <profile-ui seriesId=${this.seriesId} profile=${JSON.stringify(profile)} fieldlabels=${JSON.stringify(fieldlabels)} class="form-component">${imgTag}</profile-ui>
        ${this.profiles?.length > 1 ? html`<img class="icon-remove-circle" src="/icons/remove-circle.svg" alt="remove-repeater" @click=${() => {
    this.profiles.splice(index, 1);
    this.requestUpdate();
  }}></img>` : nothing}
          </div>`;
      })}
      <repeater-element text=${this.fieldlabels?.addProfileRepeater} @repeat=${this.addProfile}></repeater-element>`;
  }
}
