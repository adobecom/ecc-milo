import { Then } from "@cucumber/cucumber";
import { EventCreation } from "../page-objects/event-creation.page";
import { expect } from "@playwright/test";
const path = require("path");
const fs = require("fs");

Then(/^I am on the event creation page$/, async function () {
  this.page = new EventCreation();
  await this.page.open();
});

Then(/^I fill out the Event Format card with ([^\"]*) and ([^\"]*) data$/, async function (cloudType, series) {
  this.context(EventCreation);

  await this.page.eventFormatCard.waitFor({ timeout: 30000 });

  await this.page.selectDropdownOption("Select a cloud", cloudType);
  await this.page.selectDropdownOption("Select a series", series);
});

Then(/^I fill out the Event Information card with ([^\"]*) and ([^\"]*)$/, async function (title, description) {
  this.context(EventCreation);

  await this.page.eventInformationCard.waitFor({ timeout: 5000 });

  await this.page.eventTitle.fill(title);
  await this.page.eventDescription.fill(description);
});

Then(/^I select a future date for the event$/, async function () {
  this.context(EventCreation);

  await this.page.selectFutureDate();
});

Then(/^I select the event ([^\"]*) and ([^\"]*) time in ([^\"]*)$/, async function (start, end, timezone) {
  this.context(EventCreation);

  await this.page.selectTime("Start time", start);
  await this.page.selectTime("End time", end);

  await this.page.selectDropdownOption("Time zone", timezone);
});

Then(/^I add the agenda "([^\"]*)" and "([^\"]*)"$/, async function (time, details) {
  this.context(EventCreation);

  await this.page.selectAgendaTime(time);
  await this.page.agendaDetails.fill(details);
});

Then(/^I enter the venue "([^\"]*)"$/, async function (name) {
  this.context(EventCreation);

  await this.page.venueName.fill(name);
});
