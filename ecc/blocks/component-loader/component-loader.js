import { LIBS } from '../../scripts/scripts.js';
import { RichTextEditor } from '../../components/rich-text-editor/rich-text-editor.js';

const { createTag } = await import(`${LIBS}/utils/utils.js`);

export default async function init(el) {
  customElements.define('rich-text-editor', RichTextEditor);

  const editor = createTag('rich-text-editor');
  el.append(editor);
}
