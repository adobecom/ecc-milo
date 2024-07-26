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

  setProfile(index, profile) {
    const selectedProfile = this.searchdata.find((speaker) => speaker.speakerId === profile.id);
    const updatedProfile = { ...selectedProfile, type: profile.type, isPlaceholder: false };
    this.updateProfile(index, updatedProfile);
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
    const firstNameSearch = searchDataReduced.map((speaker) => ({
      id: speaker.speakerId,
      displayValue: `${speaker.firstName} ${speaker.lastName}`,
      image: speaker?.photo?.imageUrl,
      value: speaker.firstName,
    }));
    const lastNameSearch = searchDataReduced.map((speaker) => ({
      id: speaker.speakerId,
      displayValue: `${speaker.firstName} ${speaker.lastName}`,
      image: speaker?.photo?.imageUrl,
      value: speaker.lastName,
    }));

    return html`${
      repeat(this.profiles, (profile, index) => {
        const fieldlabels = { ...this.fieldlabels };
        const imgTag = imageTag.cloneNode(true);
        return html`
        <div class="profile-container">
        <profile-ui seriesId=${this.seriesId} profile=${JSON.stringify(profile)} fieldlabels=${JSON.stringify(fieldlabels)} class="form-component" firstnamesearch=${JSON.stringify(firstNameSearch)} lastnamesearch=${JSON.stringify(lastNameSearch)} @update-profile=${(event) => this.updateProfile(index, event.detail.profile)} @select-profile=${(event) => this.setProfile(index, event.detail.profile)}>${imgTag}</profile-ui>
        ${this.profiles?.length > 1 || !this.profiles[0].isPlaceholder ? html`<img class="icon-remove-circle" src="/ecc/icons/remove-circle.svg" alt="remove-repeater" @click=${() => {
    if (this.profiles.length === 1) {
      this.profiles = [defaultProfile];
    } else {
      this.profiles.splice(index, 1);
    }
    this.requestUpdate();
  }}></img>` : nothing}
          </div>`;
      })}
      ${this.enableRepeater() ? html`<repeater-element text=${this.fieldlabels?.addProfileRepeater} @repeat=${this.addProfile}></repeater-element>` : nothing}`;
  }
}
