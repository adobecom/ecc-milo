import { Then } from '@cucumber/cucumber';
import { expect } from "@playwright/test";
const path = require('path');
const fs = require("fs");

Then(/^I have a new browser context$/, async function () {
  PW.context = await PW.browser.newContext(PW.contextOptions);
});


Then(/^I scroll to the "([^"]*)" header$/, async function (header) {
  const xpath = `//*[self::h1 or self::h2 or self::h3][text()="${header}"]`;
  await this.page.native.locator(xpath).waitFor({timeout: 5000});
  await this.page.native.evaluate((xpath) => {
    const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
    element.scrollIntoView();
  }, xpath);
});
