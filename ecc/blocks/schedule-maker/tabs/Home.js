import { html } from '../htm-wrapper.js';
import BuildTableIcon from '../components/BuildTableIcon.js';

export default function Home() {
  return html`
    <div class="home">
      <h1>Schedule Maker</h1>
      <div class="home__quick-actions">
        <div class="home__quick-actions__icon">
          ${html`<${BuildTableIcon} />`}
        </div>
        <div class="home__quick-actions__content">
          <h2>Create a new schedule</h2>
          <div class="home__quick-actions__content__buttons">
            <sp-button size="l" static-color="black" treatment="outline">
              Create Manually
            </sp-button>
            <sp-button size="l">
              Create from Sheet
            </sp-button>
          </div>
        </div>
      </div>
    </div>
  `;
}
