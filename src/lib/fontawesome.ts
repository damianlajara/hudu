import { config, library } from '@fortawesome/fontawesome-svg-core';
// Solid icons
import {
  faArchive,
  faBook,
  faBuilding,
  faCalendarTimes,
  faCog,
  faDesktop,
  faEdit,
  faEnvelope,
  faExternalLinkAlt,
  faFile,
  faFlag,
  faGlobe,
  faKey,
  faPlug,
  faPlus,
  faServer,
  faUser,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';

config.autoAddCss = false;

// I am not installing the regular icons since the free version sucks.
// As a workaround for now, I am simply modifying the opacity on these solid icons
// Note: These are NOT the solid icons from the figma files since the designs are using the pro version
library.add(
  faBuilding,
  faFile,
  faGlobe,
  faCalendarTimes,
  faUser,
  faUsers,
  faPlug,
  faKey,
  faCog,
  faServer,
  faDesktop,
  faArchive,
  faBook,
  faPlus,
  faEdit,
  faFlag,
  faEnvelope,
  faExternalLinkAlt
);
