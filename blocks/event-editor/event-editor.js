import { getLibs } from '../../scripts/utils.js';

const { html, render, useRef, useState } = await import(`${getLibs()}/deps/htm-preact.js`);

export default function init(el) {
  // Mock search function
  const mockSearch = () => new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: '6c0ce564-3335-5d20-95f6-cb35ccee571b',
        styles: {
          typeOverride: 'event',
          backgroundImage: 'https://summit.adobe.com/_assets/images/home/speakers-promo@2x.jpg',
          mnemonic: '',
        },
        arbitrary: [
          { key: 'promoId', value: 'splash-that|458926431' },
          { key: 'timezone', value: 'America/Los_Angeles' },
          { key: 'venue', value: 'La Costa Resort and Spa' },
        ],
        contentArea: {
          detailText: 'detail',
          title: 'TestTier3Event1',
          url: 'https://main--events-milo--adobecom.hlx.page/t3/event/03-12-2024/chicago/il/adobe-events-seminar',
          description: 'TestTier3Event1',
        },
        footer: [{
          divider: false,
          left: [],
          center: [],
          right: [{
            type: 'button',
            style: '',
            text: 'Read now',
            href: 'https://main--events-milo--adobecom.hlx.page/t3/event/03-12-2024/chicago/il/adobe-events-seminar',
          }],
        }],
      });
    }, 1000);
  });

  // DynamicForm Component
  const DynamicForm = ({ data }) => {
    // Updating state to handle both speakers and hosts
    const [participants, setParticipants] = useState([]);

    const handleSubmit = (event) => {
      event.preventDefault();
      // Prepare and log the data to be submitted
      const formData = new FormData(event.target);
      // Example of handling form data here
      console.log(formData, 'Form submitted with updated data');
      alert('Check the console for submitted data.');
    };

    const addParticipant = (type) => {
      setParticipants([
        ...participants,
        { id: Math.random().toString(16).slice(2), type },
      ]);
    };

    const removeParticipant = (id) => {
      setParticipants((current) => current.filter((p) => p.id !== id));
    };

    const renderInputField = (name, value, label) => html`
      <div>
        <label for=${name}>${label}</label>
        <input type="text" id=${name} name=${name} value=${value} key=${name} />
      </div>
    `;

    const renderParticipantInputs = (participant) => html`
          <fieldset key=${participant.id}>
            <legend>${participant.type.charAt(0).toUpperCase() + participant.type.slice(1)} Details</legend>
            <div>
              <label for=${`firstName-${participant.id}`}>First Name</label>
              <input type="text" id=${`firstName-${participant.id}`} name=${`firstName-${participant.id}`} placeholder="First Name" />
            </div>
            <div>
              <label for=${`lastName-${participant.id}`}>Last Name</label>
              <input type="text" id=${`lastName-${participant.id}`} name=${`lastName-${participant.id}`} placeholder="Last Name" />
            </div>
            <div>
              <label for=${`title-${participant.id}`}>Title</label>
              <input type="text" id=${`title-${participant.id}`} name=${`title-${participant.id}`} placeholder="Title" />
            </div>
            <div>
              <label for=${`img-${participant.id}`}>Image</label>
              <input type="file" id=${`img-${participant.id}`} name=${`img-${participant.id}`} accept="image/*" />
            </div>
            <div>
              <label for=${`bio-${participant.id}`}>Bio</label>
              <textarea id=${`bio-${participant.id}`} name=${`bio-${participant.id}`} placeholder="Short Bio"></textarea>
            </div>
            <button type="button" onClick=${() => removeParticipant(participant.id)} class="remove-participant-btn">
              Remove ${participant.type.charAt(0).toUpperCase() + participant.type.slice(1)}
            </button>
          </fieldset>
        `;

    return html`
        <form onSubmit=${handleSubmit}>
          ${Object.entries(data).map(([key, value]) => {
    if (typeof value === 'object' && !Array.isArray(value) && value !== null) {
      return Object.entries(value).map(([subKey, subValue]) => renderInputField(`${key}.${subKey}`, subValue, `${subKey.charAt(0).toUpperCase() + subKey.slice(1)}`));
    } if (typeof value === 'string') {
      return renderInputField(key, value, `${key.charAt(0).toUpperCase() + key.slice(1)}`);
    }
    return null;
  })}
          <div class="sub-grid">
            ${participants.map(renderParticipantInputs)}
            <div class="addition-button-wrapper">
              <button type="button" onClick=${() => addParticipant('speaker')}>Add Speaker</button>
              <button type="button" onClick=${() => addParticipant('host')}>Add Host</button>
            </div>
          </div>
          <button type="submit">Update</button>
        </form>
      `;
  };

  // App Component
  const App = () => {
    const [data, setData] = useState(null);
    const inputRef = useRef(null);

    const handleSubmit = async (event) => {
      event.preventDefault();
      const url = inputRef.current.value;
      const result = await mockSearch(url);
      setData(result);
    };

    return html`
      <div>
        ${!data ? html`
          <form onSubmit=${handleSubmit}>
            <input type="text" name="url" placeholder="Enter URL or Pathname of your event details page" ref=${inputRef} required />
            <button type="submit">Submit</button>
          </form>
        ` : html`
          <${DynamicForm} data=${data} />
        `}
      </div>
    `;
  };

  // Render the App
  render(html`<${App} />`, el);
}
