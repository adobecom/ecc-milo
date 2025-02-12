/* stylelint-disable selector-class-pattern */
import { LIBS } from '../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
.rte-tiptap-toolbar button {
  margin: 2px;
}

.rte-tiptap-toolbar {
  margin-top: 24px;
}

.tiptap {
  min-height: 200px;
  margin-top: 5px;
  padding: 0 10px;
  font-size: 1rem;
  line-height: 1.5;
  color: var(--spectrum-color-text);
  border: 1px solid var(--spectrum-color-gray-500);
  border-radius: 4px;
}

.tiptap ul,.tiptap ol {
    padding: 0 1rem;
    margin: 1rem 1rem 1rem .4rem
}

.tiptap ul ul,.tiptap ol ol {
    padding: 0 1rem;
    margin-top: 0;
    margin-bottom: 0;
}

.tiptap ul li p,.tiptap ol li p {
    margin-top: 0;
    margin-bottom: 0;
}

.tiptap h1,.tiptap h2,.tiptap h3,.tiptap h4,.tiptap h5,.tiptap h6 {
    line-height: 1.1;
    text-wrap: pretty
}

.tiptap h1 {
    font-size: 1.4rem
}

.tiptap h2 {
    font-size: 1.2rem
}

.tiptap h3 {
    font-size: 1.1rem
}

.tiptap h4,.tiptap h5,.tiptap h6 {
    font-size: 1rem
}

.tiptap code {
    background-color: var(--spectrum-color-gray-300);
    color: black;
    border-radius: .4rem;
    font-size: .85rem;
    padding: .25em .3em
}

.tiptap pre {
    background: black;
    border-radius: .5rem;
    color: white;
    font-family: JetBrainsMono,monospace;
    margin: 1.5rem 0;
    padding: .75rem 1rem
}

.tiptap pre code {
    background: none;
    color: inherit;
    font-size: .8rem;
    padding: 0
}

.tiptap blockquote {
    border-left: 3px solid var(--spectrum-color-gray-300);
    margin: 1.5rem 0;
    padding-left: 1rem
}
`;
