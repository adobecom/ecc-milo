/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { LIBS } from '../../scripts/scripts.js';
import { isEmptyObject } from '../../scripts/utils.js';
import { style } from './profile-container.css.js';

const { LitElement, html, repeat, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

const defaultProfile = { socialMedia: [{ link: '' }], isPlaceholder: true };

export class ProfileContainer extends LitElement {
  static properties = {
    fieldlabels: { type: Object, reflect: true },
    profiles: { type: Array, reflect: true },
    seriesId: { type: String },
    searchdata: { type: Array },
  };

  static styles = style;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.profiles = this.profiles ?? [defaultProfile];
    this.searchdata = this.searchdata ?? [];
  }

  addProfile() {
    const profile = { ...defaultProfile };
    this.profiles.push(profile);
    this.requestUpdate();
  }

  updateProfile(index, profile) {
    this.profiles[index] = profile;
    this.requestUpdate();
  }

  isValidSpeaker(profile) {
    return profile.firstName && profile.lastName && profile.title && profile.bio;
  }

  getProfiles() {
    return this.profiles
      .filter((p) => !p.isPlaceholder && !isEmptyObject(p) && this.isValidSpeaker(p))
      .map((profile, index) => {
        const { speakerId, type } = profile;

        return {
          speakerId,
          ordinal: index,
          speakerType: type,
        };
      });
  }

  enableRepeater() {
    // eslint-disable-next-line max-len
    return this.profiles.every((profile) => !profile.isPlaceholder && profile.type);
  }

  render() {
    const imageTag = this.fieldlabels.image;
    imageTag.setAttribute('slot', 'img-label');
    imageTag.classList.add('img-upload-text');

    const searchDataReduced = this.searchdata.filter((speaker) => {
      if (this.profiles.find((p) => p.speakerId === speaker.speakerId) !== undefined) {
        return false;
      }
      return true;
    });

    return html`${
      repeat(this.profiles, (profile, index) => {
        const fieldlabels = { ...this.fieldlabels };
        const imgTag = imageTag.cloneNode(true);
        return html`
        <div class="profile-container">
        <profile-ui seriesId=${this.seriesId} profile=${JSON.stringify(profile)} fieldlabels=${JSON.stringify(fieldlabels)} class="form-component" searchdata=${JSON.stringify(searchDataReduced)} @update-profile=${(event) => this.updateProfile(index, event.detail.profile)}>${imgTag}</profile-ui>
        ${this.profiles?.length > 1 ? html`<img class="icon-remove-circle" src="/ecc/icons/remove-circle.svg" alt="remove-repeater" @click=${() => {
    this.profiles.splice(index, 1);
    this.requestUpdate();
  }}></img>` : nothing}
          </div>`;
      })}
      ${this.enableRepeater() ? html`<repeater-element text=${this.fieldlabels?.addProfileRepeater} @repeat=${this.addProfile}></repeater-element>` : nothing}`;
  }
}
