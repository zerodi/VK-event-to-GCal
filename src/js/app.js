import { Auth, Event } from "./vk";

export class Event2Cal
{
    constructor(callback) {
        Auth.getToken().then((token) => {
            callback(token);
        });
    }

    static GoogleCal() {
        return () => {
            chrome.tabs.query({
                active: true,
                lastFocusedWindow: true
            }, (Tabs) => {
                let eventUrl = Tabs[0].url;
                new Event2Cal((token) => {
                    Event.getEvent(eventUrl, token)
                });
            });
        }
    }
}