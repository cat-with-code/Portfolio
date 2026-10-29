/**
 * The English page text that gets translated, gathered in one place. These are the same objects the components
 * already import; the English exports themselves never change (the dashboard keeps using them as they are).
 */
import { browse, magazine, postPage, preview } from "@/content/blog";
import { library } from "@/content/books";
import { caseStudyCopy } from "@/content/case-studies";
import { availability, contact, faq, form, map } from "@/content/contact";
import { contactRows, profile } from "@/content/profile";
import { settingsCopy } from "@/content/settings";
import { units } from "@/content/units";
import { searchGroups, searchIndex, searchSuggestions } from "@/lib/search-index";
import { games, hub, panelCopy, sections } from "@/content/games";
import { audioCopy, clockCopy, daytimeCopy, goalCopy, intentionCopy, planCopy, recentlyRead, reminderCopy, techniques, vibes, welcome } from "@/content/study";
import { developer } from "@/content/developer";
import { directory, projectsPage } from "@/content/projects";

export const sources = { contact, form, availability, faq, map, developer, directory, projectsPage, caseStudyCopy, magazine, browse, preview, postPage, library, sections, hub, panelCopy, games, welcome, techniques, clockCopy, vibes, audioCopy, daytimeCopy, intentionCopy, planCopy, goalCopy, reminderCopy, recentlyRead, profile, contactRows, settingsCopy, searchGroups, searchIndex, searchSuggestions, units };
export type Sources = typeof sources;
