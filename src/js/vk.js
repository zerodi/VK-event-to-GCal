import browser from 'webextension-polyfill';
import { Config } from './config';
import { Utils } from './utils';

export class VkAuth {

    static get authUrl() {
        return `https://oauth.vk.com/authorize?${Utils.toQueryString(Config.vk)}`;
    }

    static getToken() {
        return new Promise((resolve, reject) => {
                browser.storage.local
                    .get({ 'vkaccess_token': {} })
                    .then((items) => {
                        if (items.vkaccess_token.length !== undefined) {
                            resolve(items.vkaccess_token);
                        } else {
                            browser.tabs.create({
                                url: VkAuth.authUrl,
                                selected: true
                            }).then((tab) => {
                                browser.tabs.onUpdated.addListener(VkAuth.authListener(tab, resolve, reject));
                            });
                        }
                    });
            },
        );
    }

    static authListener(tab, resolve, reject) {
        return function tabUpdateListener(tabId, changeInfo) {
            let token, expired;
            if (tabId === tab.id && changeInfo.url !== undefined && changeInfo.status === 'loading') {
                if (changeInfo.url.indexOf('blank.html') > -1) {
                    browser.windows.onCreated.removeListener(tabUpdateListener);
                }

                token = Utils.getUrlParameterValue(changeInfo.url, 'access_token');
                if (token === undefined || token.length === undefined) {
                    showError('vk auth response problem', 'access_token length = 0 or vkAccessToken == undefined');
                    reject();
                }

                expired = Number(Utils.getUrlParameterValue(changeInfo.url, 'expires_in'));
                if (expired !== 0) {
                    showError('vk auth response problem', 'vkAccessTokenExpiredFlag != 0');
                    reject();
                }
                browser.storage.local.set({ 'vkaccess_token': token })
                    .then(() => browser.tabs.remove(tab.id))
                    .then(() => resolve(token));

            }
        };
    }

}


export class VkEvent {
    static get fields() {
        return [
            'name', 'place', 'description', 'start_date', 'finish_date',
        ].join(',');
    }

    constructor(eventUrl, token) {
        const regex = /com\/(event)?(<event>\d+|.+)/g;
        this.id = '';
        this.token = '';
        let event = regex.exec(eventUrl);
        if (event.length > 0) {
            this.id = event[2];
        }
        this.token = token;
    }

    static getEvent(eventUrl, token) {
        return new Promise(resolve => {
            let event = new VkEvent(eventUrl, token);
            fetch(`https://api.vk.com/method/groups.getById?${
                Utils.toQueryString({
                    group_id: event.id,
                    v: Config.vk.v,
                    fields: VkEvent.fields,
                    access_token: event.token,
                })}`)
                .then(res => res.json())
                .then(VkEvent.getInfo)
                .then(resolve)
                .catch(e => console.error(e));
        });


    }

    static getInfo(res) {
        return new Promise(resolve => {
            const result = Array.isArray(res.response)
                ? res.response[0]
                : res.response;
            if (result.type === 'event') {
                let event = {
                    id: result.screen_name,
                    name: result.name,
                    description: result.description,
                    start_date: Utils.convertTime(result.start_date),
                    end_date: (result.finish_date)
                        ? Utils.convertTime(result.finish_date)
                        : Utils.convertTime(result.start_date + 3600),
                    location: result.place,
                };
                resolve(event);
            } else {
                alert('This is not an event!');
            }
        });


    }
}


/**
 * Функция вывода ошибки.
 */
function showError(textToShow, errorToShow) {
    alert(textToShow + '\n' + errorToShow);
}
