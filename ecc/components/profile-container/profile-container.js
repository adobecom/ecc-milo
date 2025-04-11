/* eslint-disable class-methods-use-this */
import { getProfileAttr } from '../../scripts/data-utils.js';
import { getSpeakers } from '../../scripts/esp-controller.js';
import { LIBS } from '../../scripts/scripts.js';
import { isEmptyObject } from '../../scripts/utils.js';
import { style } from './profile-container.css.js';

const { LitElement, html, repeat, nothing } = await import(`${LIBS}/deps/lit-all.min.js`);

const defaultProfile = { socialLinks: [{ link: '' }], isPlaceholder: true };

export default class ProfileContainer extends LitElement {
  static properties = {
    fieldlabels: { type: Object, reflect: true },
    profiles: { type: Array, reflect: true },
    seriesId: { type: String },
    searchdata: { type: Array },
    locale: { type: String },
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

  reloadSearchData = async () => {
    const spResp = await getSpeakers(this.seriesId);
    // eslint-disable-next-line max-len
    const filterdSpeakers = spResp.speakers.filter((speaker) => speaker.localizations && typeof speaker.localizations === 'object' && this.locale in speaker.localizations);
    if (filterdSpeakers) this.searchdata = filterdSpeakers;
  };

  updateProfile(index, profile) {
    this.profiles[index] = profile;
    this.reloadSearchData();
    this.requestUpdate();
  }

  isValidSpeaker(profile) {
    const firstName = getProfileAttr(profile, 'firstName', this.locale);
    const lastName = getProfileAttr(profile, 'lastName', this.locale);
    const title = getProfileAttr(profile, 'title', this.locale);

    return firstName && lastName && title;
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

    let searchDataReduced = [];
    if (this.searchdata) {
      searchDataReduced = this.searchdata.filter((speaker) => {
        if (this.profiles.find((p) => p.speakerId === speaker.speakerId) !== undefined) {
          return false;
        }
        return true;
      });
    }
    const firstNameSearch = searchDataReduced.map((speaker) => ({
      id: speaker.speakerId,
      displayValue: `${speaker.firstName} ${speaker.lastName}`,
      image: speaker?.photo?.imageUrl || '/ecc/icons/profile.svg',
      value: speaker.firstName,
    }));
    const lastNameSearch = searchDataReduced.map((speaker) => ({
      id: speaker.speakerId,
      displayValue: `${speaker.firstName} ${speaker.lastName}`,
      image: speaker?.photo?.imageUrl || '/ecc/icons/profile.svg',
      value: speaker.lastName,
    }));

    return html`${
      repeat(this.profiles, (profile, index) => {
        const profileJSON = JSON.stringify({
          ...profile,
          firstName: getProfileAttr(profile, 'firstName', this.locale),
          lastName: getProfileAttr(profile, 'lastName', this.locale),
          title: getProfileAttr(profile, 'title', this.locale),
          bio: getProfileAttr(profile, 'bio', this.locale),
          socialLinks: getProfileAttr(profile, 'socialLinks', this.locale),
          photo: getProfileAttr(profile, 'photo', this.locale),
          speakerId: getProfileAttr(profile, 'speakerId', this.locale),
        });
        const imgTag = imageTag.cloneNode(true);

        return html`
        <div class="profile-container">
        <profile-ui locale=${this.locale} seriesId=${this.seriesId} profile=${profileJSON} fieldlabels=${JSON.stringify(this.fieldlabels)} class="form-component" firstnamesearch=${JSON.stringify(firstNameSearch)} lastnamesearch=${JSON.stringify(lastNameSearch)} @update-profile=${(event) => this.updateProfile(index, event.detail.profile)} @select-profile=${(event) => this.setProfile(index, event.detail.profile)}>${imgTag}</profile-ui>
        ${this.profiles?.length > 1 || !this.profiles[0].isPlaceholder ? html`<img class="icon-remove-circle" src="${this.profiles.length === 1 ? '/ecc/icons/delete.svg' : '/ecc/icons/remove-circle.svg'}" alt="remove-repeater" @click=${() => {
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
