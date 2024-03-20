import { readFile } from '@web/test-runner-commands';
import { expect } from '@esm-bundle/chai';
import { decorateArea } from '../../scripts/utils.js';

document.head.innerHTML = await readFile({ path: './mocks/head.html' });
const marqueeMain = await readFile({ path: './mocks/body-with-marquee.html' });
const heroMain = await readFile({ path: './mocks/body-without-marquee.html' });

describe('Decorating LCP', () => {
  it('with marquee', () => {
    document.body.innerHTML = marqueeMain;
    decorateArea(document.querySelector('main'));
    console.log(document.body.querySelector('img')?.loading);
    expect(document.body.querySelector('img').getAttribute('loading')).to.equal(null);
  });

  it('without marquee', () => {
    document.body.innerHTML = heroMain;
    decorateArea(document.querySelector('main'));
    expect(document.body.querySelector('img').getAttribute('loading')).to.equal(null);
  });
});
