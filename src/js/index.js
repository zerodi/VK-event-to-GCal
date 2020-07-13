import browser from 'webextension-polyfill';
import { VkAuth, VkEvent } from './vk';
import { GoogleEvent } from './google';

browser.contextMenus.create({
    'title': 'Добавить в Google Calendar',
    'type': 'normal',
    'contexts': ['all'],
    'documentUrlPatterns': ['*://vk.com/*'],
    'onclick': save2GCal
});

function save2GCal() {
    browser.tabs.query({
        active: true,
        lastFocusedWindow: true
    }).then((tabs) => {
        const eventUrl = tabs[0].url;
        try {
            VkAuth
                .getToken()
                .then(token => VkEvent.getEvent(eventUrl, token))
                .then(event => GoogleEvent.createEvent(event));
        } catch (e) {
            console.log(e);
        }
    });
}

