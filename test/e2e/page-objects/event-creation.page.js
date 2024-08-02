import { classes } from "polytype";
import { EventsGnavPage } from "./events-gnav.page";
import { ECCBasicInfoSection } from "./ecc-basic-info.section";

export class EventCreation extends classes(EventsGnavPage, ECCBasicInfoSection) {
  constructor() {
    let locContentPath = "/ecc/create/t3?devMode=true";

    // if locale is specified, add to the path
    if (global.config.profile.locale) {
      locContentPath = locContentPath.replace(/^\/*|\/*$/g, '');
      locContentPath = `/${global.config.profile.locale}/${locContentPath}`;
    }

    super({
      super: EventsGnavPage,
      arguments: [locContentPath],
    });

    this.buildProps({
      saveButton: 'a[href*="#save"]',
    });
  }
}
