/* stylelint-disable selector-class-pattern */
import { LIBS } from '../../scripts/scripts.js';

const { css } = await import(`${LIBS}/deps/lit-all.min.js`);

// eslint-disable-next-line import/prefer-default-export
export const style = css`
.rte-tiptap-toolbar .rte-format-input {
  margin-right: 2px;
}

.rte-tiptap-toolbar button {
  margin: 0 2px;
  padding: 0;
  width: 32px;
  height: 32px;
  border-radius: 2px;
  border-width: 1px;
}

.rte-tiptap-toolbar button.active {
  background-color: var(--spectrum-color-gray-200);
}

.rte-tiptap-toolbar button img {
  width: 100%;
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

.tiptap ul,
.tiptap ol {
    padding: 0 1rem;
    margin: 1rem 1rem 1rem .6rem
}

.tiptap ul ul,
.tiptap ul ol,
.tiptap ol ol,
.tiptap ol ul {
    padding: 0 1rem;
    margin-top: 0;
    margin-bottom: 0;
}

.tiptap li p {
    margin: 0.5em 0;
}

.tiptap h1,
.tiptap h2,
.tiptap h3,
.tiptap h4,
.tiptap h5,
.tiptap h6 {
    text-wrap: pretty;
}

.tiptap h1 {
  font-size: var(--type-heading-xl-size);
  line-height: var(--type-heading-xl-lh);
}

.tiptap h2 {
  font-size: var(--type-heading-l-size);
  line-height: var(--type-heading-l-lh);
}

.tiptap h3 {
  font-size: var(--type-heading-m-size);
  line-height: var(--type-heading-m-lh);
}

.tiptap h4 {
  font-size: var(--type-heading-s-size);
  line-height: var(--type-heading-s-lh);
}

.tiptap h5 {
  font-size: var(--type-heading-xs-size);
  line-height: var(--type-heading-xs-lh);
}

.tiptap h6 {
  font-size: var(--type-heading-xs-size);
  line-height: var(--type-heading-xs-lh);
}

.tiptap a {
  color: var(--link-color);
  text-decoration: underline;
}

.tiptap a:hover {
  color: var(--link-hover-color);
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
    margin: 0 0 var(--spacing-s) 0;
    padding-left: 1rem
}
`;
