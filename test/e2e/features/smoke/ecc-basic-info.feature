Feature: ECC Basic Info Blocks

  Background:
    Given I have a new browser context

  @MWPW-127201x @smoke @basic-info
  Scenario Outline: Create a new event with all the minimum required fields
    Given I am on the event creation page

     When I fill out the Event Format card with <Business Unit> and <Series Type> data
     Then I scroll to the "Event information" header
      And I fill out the Event Information card with <Event Title> and <Event Description>
     Then I select a future date for the event
     Then I select the event <Start> and <End> time in <Timezone>

     Then I scroll to the "Agenda" header
      And I add the agenda "<Agenda Time>" and "<Agenda Details>"

     Then I scroll to the "Venue Information" header
      And I enter the venue "<Venue Name>"
     Then I wait for 5 seconds

    #  Then I click the "Save" button
    #   And I click "Next step" to reach RSVP subtab
    #   And I set the attendee limit to "100"
    #   And I click the "Publish event" button

    #  Then the event should be created successfully

  Examples:
      | Business Unit  | Series Type | Event Title                | Event Description                              | Start   | End     | Timezone                     | Agenda Time | Agenda Details                                   | Venue Name |
      | Creative Cloud | Create Now  | Adobe Create Now Cleveland | Dive into an evening of creativity with Adobe! | 7:30 AM | 2:00 PM | UTC-10:00 - Pacific/Honolulu | 8:00 AM     | Presentation by Adobe and Local Creator Showcase | Adobe Way  |
