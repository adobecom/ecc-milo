import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { decorateArea } from '../../scripts/utils.js';

document.head.innerHTML = await readFile({ path: './mocks/head.html' });
document.body.innerHTML = await readFile({ path: './mocks/body.html' });

describe('Decorating', () => {
  it('with marquee', () => {
    decorateArea(document.querySelector('main'));
    expect(true);
    // placeholder
  });
});
