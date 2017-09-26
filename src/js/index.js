import { Event2Cal } from "./app";

chrome.contextMenus.create({
    "title": "Добавить в Google Calendar",
    "type": "normal",
    "contexts": ["all"],
    "documentUrlPatterns": ["*://vk.com/*"],
    "onclick": Event2Cal.GoogleCal()
});