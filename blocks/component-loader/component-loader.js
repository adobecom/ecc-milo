import { getLibs } from '../../scripts/utils.js';
import { RichTextEditor } from '../../components/rich-text-editor/rich-text-editor.js';

const { createTag } = await import(`${getLibs()}/utils/utils.js`);

export default async function init(el) {
  customElements.define('rich-text-editor', RichTextEditor);

  const editor = createTag('rich-text-editor');
  el.append(editor);
}
