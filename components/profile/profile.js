/* eslint-disable import/prefer-default-export */
/* eslint-disable class-methods-use-this */
import { getLibs } from '../../scripts/utils.js';
import { style } from './profile.css.js';

const { LitElement, html, repeat, nothing } = await import(`${getLibs()}/deps/lit-all.min.js`);

const defaultFieldLabels = {
  heading: 'Profile',
  chooseType: 'Choose Type',
  name: 'Name',
  title: 'Add Title',
  bio: 'Add Bio',
  socialMedia: 'Social Medias',
  addSocialMedia: 'Add Social Media link',
  addSocialMediaRepeater: 'Add Social Media',
};

const speakerType = ['Presenter', 'Host', 'Speaker', 'Keynote'];

export class Profile extends LitElement {
  static properties = {
    fieldlabels: { type: Object, reflect: true },
    profile: { type: Object, reflect: true },
  };

  static styles = style;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.fieldlabels = this.fieldlabels ?? defaultFieldLabels;

    this.profile = this.profile ?? { socialMedia: [{ url: '' }] };
  }

  addSocialMedia() {
    const socialMedia = { url: '' };
    if (this.profile?.socialMedia) {
      this.profile.socialMedia.push(socialMedia);
    } else {
      this.profile.socialMedia = [socialMedia];
    }
    this.requestUpdate();
  }

  updateValue(key, value) {
    this.profile = { ...this.profile, [key]: value };
  }

  updateSocialMedia(index, value) {
    this.profile.socialMedia[index] = { url: value };
  }

  render() {
    const fieldLabelsJSON = {
      ...defaultFieldLabels,
      ...(this.fieldlabels ?? {}),
    };

    return html`
    <h2>${fieldLabelsJSON.heading}</h2>
    <div>
        <div><sp-field-label size="l" required>${fieldLabelsJSON.chooseType}</sp-field-label></div>
        <sp-picker label=${fieldLabelsJSON.chooseType} value=${this.profile?.type} size="l" @change=${(event) => this.updateValue('type', event.target.value)}>
            ${repeat(speakerType, (type) => html`
                <sp-menu-item value="${type}">${type}</sp-menu-item>
            `)}
        </sp-picker>
    </div>
    <sp-textfield placeholder=${fieldLabelsJSON.name} quiet size='l' class='text-input' value=${this.profile?.name} @change=${(event) => this.updateValue('name', event.target.value)}></sp-textfield>
    <image-dropzone configs=${JSON.stringify({
    type: 'speaker-photo',
    // TODO: get metadata from file
    altText: 'speaker image',
    targetUrl: `http://localhost:8500/v1/speakers/${this.profile.id}/images`,
  })}>
        <slot name="img-label" slot="img-label"></slot>
    </image-dropzone>
    <sp-textfield placeholder=${fieldLabelsJSON.title} quiet size='l' class='text-input' value=${this.profile?.title} @change=${(event) => this.updateValue('title', event.target.value)}></sp-textfield>
    <sp-textfield placeholder=${fieldLabelsJSON.bio} multiline grows quiet size='l' class='text-input' value=${this.profile?.bio}></sp-textfield>
    <h4>${fieldLabelsJSON.socialMedia}</h4>
    ${this.profile?.socialMedia ? repeat(
    this.profile?.socialMedia,
    (socialMedia, index) => html`
            <sp-textfield placeholder=${fieldLabelsJSON.addSocialMedia} value=${socialMedia.url} quiet size='l' class='text-input' @change=${(event) => this.updateSocialMedia(index, event.target.value)}></sp-textfield>
        `,
  ) : nothing}
    <repeater-element text=${fieldLabelsJSON.addSocialMediaRepeater} @repeat=${() => { this.addSocialMedia(); }}></repeater-element>
    `;
  }
}