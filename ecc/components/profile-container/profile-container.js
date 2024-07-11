/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { LIBS } from '../../scripts/scripts.js';
import { isEmptyObject } from '../../utils/utils.js';
import { style } from './profile-container.css.js';

const SPEAKERS = [{"firstName":"Qiyun","lastName":"Dai","bio":"test","speakerId":"1290af4c-df6f-4330-bbeb-33e5e287a348","socialMedia":[{"link":""}],"type":"Host","title":"Test","seriesId":"24d97c02-77e2-4911-a942-c2cdc3bb2c6e","creationTime":1719429871651,"modificationTime":1719429871651},{"firstName":"Qiyun","lastName":"Dai","bio":"test","photo":{"imageId":"82328b54-1694-48f1-9eaf-08b173fb48e7","s3Key":"static/images/speakers/1bf7c522-935c-470f-80cb-1b2d9cb8c421/speaker-photo.jpg","altText":"Speaker photo for: Qiyun Dai","creationTime":1719358571283,"sharepointUrl":null,"modificationTime":1719358571283,"imageUrl":"https://events-data-dev.aws125.adobeitc.com/images/speakers/1bf7c522-935c-470f-80cb-1b2d9cb8c421/speaker-photo.jpg","mimeType":"image/jpeg","imageKind":"speaker-photo","s3Bucket":"adobe-events-data-dev"},"speakerId":"1bf7c522-935c-470f-80cb-1b2d9cb8c421","socialMedia":[{"link":""}],"type":"Speaker","title":"test","seriesId":"24d97c02-77e2-4911-a942-c2cdc3bb2c6e","creationTime":1719358569649,"modificationTime":1719358571283},{"firstName":"Qiyun","lastName":"Dai","bio":"test","photo":{"imageId":"f93a0d69-49ea-47bd-873d-7176620bf944","s3Key":"static/images/speakers/ad94f58f-829d-4779-8048-480e60187623/speaker-photo.jpg","altText":"Speaker photo for: Qiyun Dai","creationTime":1719344313844,"sharepointUrl":null,"modificationTime":1719344313844,"imageUrl":"https://events-data-dev.aws125.adobeitc.com/images/speakers/ad94f58f-829d-4779-8048-480e60187623/speaker-photo.jpg","mimeType":"image/jpeg","imageKind":"speaker-photo","s3Bucket":"adobe-events-data-dev"},"speakerId":"ad94f58f-829d-4779-8048-480e60187623","socialMedia":[{"link":""}],"type":"Host","title":"test","seriesId":"24d97c02-77e2-4911-a942-c2cdc3bb2c6e","creationTime":1719344312164,"modificationTime":1719344313844},{"firstName":"Qiyun","lastName":"Dai","bio":"test","photo":{"imageId":"54611f03-41fb-4602-8ec4-938c2546a2ab","s3Key":"static/images/speakers/d2915ac1-7563-4f68-9095-7d8cf2aae5e4/speaker-photo.jpg","altText":"Speaker photo for: Qiyun Dai","creationTime":1719428488929,"sharepointUrl":null,"modificationTime":1719428488929,"imageUrl":"https://events-data-dev.aws125.adobeitc.com/images/speakers/d2915ac1-7563-4f68-9095-7d8cf2aae5e4/speaker-photo.jpg","mimeType":"image/jpeg","imageKind":"speaker-photo","s3Bucket":"adobe-events-data-dev"},"speakerId":"d2915ac1-7563-4f68-9095-7d8cf2aae5e4","socialMedia":[{"link":""}],"type":"Host","title":"test","seriesId":"24d97c02-77e2-4911-a942-c2cdc3bb2c6e","creationTime":1719428487245,"modificationTime":1719428488930},{"firstName":"Qiyun","lastName":"Dai","bio":"test","speakerId":"1290af4c-df6f-4330-bbeb-33e5e287a348","socialMedia":[{"link":""}],"type":"Host","title":"Test","seriesId":"24d97c02-77e2-4911-a942-c2cdc3bb2c6e","creationTime":1719429871651,"modificationTime":1719429871651},{"firstName":"Qiyun","lastName":"Dai","bio":"test","photo":{"imageId":"82328b54-1694-48f1-9eaf-08b173fb48e7","s3Key":"static/images/speakers/1bf7c522-935c-470f-80cb-1b2d9cb8c421/speaker-photo.jpg","altText":"Speaker photo for: Qiyun Dai","creationTime":1719358571283,"sharepointUrl":null,"modificationTime":1719358571283,"imageUrl":"https://events-data-dev.aws125.adobeitc.com/images/speakers/1bf7c522-935c-470f-80cb-1b2d9cb8c421/speaker-photo.jpg","mimeType":"image/jpeg","imageKind":"speaker-photo","s3Bucket":"adobe-events-data-dev"},"speakerId":"1bf7c522-935c-470f-80cb-1b2d9cb8c421","socialMedia":[{"link":""}],"type":"Speaker","title":"test","seriesId":"24d97c02-77e2-4911-a942-c2cdc3bb2c6e","creationTime":1719358569649,"modificationTime":1719358571283},{"firstName":"Qiyun","lastName":"Dai","bio":"test","photo":{"imageId":"f93a0d69-49ea-47bd-873d-7176620bf944","s3Key":"static/images/speakers/ad94f58f-829d-4779-8048-480e60187623/speaker-photo.jpg","altText":"Speaker photo for: Qiyun Dai","creationTime":1719344313844,"sharepointUrl":null,"modificationTime":1719344313844,"imageUrl":"https://events-data-dev.aws125.adobeitc.com/images/speakers/ad94f58f-829d-4779-8048-480e60187623/speaker-photo.jpg","mimeType":"image/jpeg","imageKind":"speaker-photo","s3Bucket":"adobe-events-data-dev"},"speakerId":"ad94f58f-829d-4779-8048-480e60187623","socialMedia":[{"link":""}],"type":"Host","title":"test","seriesId":"24d97c02-77e2-4911-a942-c2cdc3bb2c6e","creationTime":1719344312164,"modificationTime":1719344313844},{"firstName":"Qiyun","lastName":"Dai","bio":"test","photo":{"imageId":"54611f03-41fb-4602-8ec4-938c2546a2ab","s3Key":"static/images/speakers/d2915ac1-7563-4f68-9095-7d8cf2aae5e4/speaker-photo.jpg","altText":"Speaker photo for: Qiyun Dai","creationTime":1719428488929,"sharepointUrl":null,"modificationTime":1719428488929,"imageUrl":"https://events-data-dev.aws125.adobeitc.com/images/speakers/d2915ac1-7563-4f68-9095-7d8cf2aae5e4/speaker-photo.jpg","mimeType":"image/jpeg","imageKind":"speaker-photo","s3Bucket":"adobe-events-data-dev"},"speakerId":"d2915ac1-7563-4f68-9095-7d8cf2aae5e4","socialMedia":[{"link":""}],"type":"Host","title":"test","seriesId":"24d97c02-77e2-4911-a942-c2cdc3bb2c6e","creationTime":1719428487245,"modificationTime":1719428488930}];

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

  render() {
    const imageTag = this.fieldlabels.image;
    imageTag.setAttribute('slot', 'img-label');
    imageTag.classList.add('img-upload-text');

    // const searchDataReduced = this.searchdata.filter((speaker) => {
    const searchDataReduced = SPEAKERS.filter((speaker) => {
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
      <repeater-element text=${this.fieldlabels?.addProfileRepeater} @repeat=${this.addProfile}></repeater-element>`;
  }
}
