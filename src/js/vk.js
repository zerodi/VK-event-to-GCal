import { Config } from "./config";
import { Utils } from "./utils";
import { Google } from "./google";

export class Auth
{

    static get authUrl() {
        return `https://oauth.vk.com/authorize?${Utils.toQueryString(Config.vk)}`
    }

    static getToken() {
        return new Promise(
            (resolve, reject) => {
                chrome.storage.local.get({'vkaccess_token': {}}, (items) => {
                    if (items.vkaccess_token.length !== undefined) {
                        resolve(items.vkaccess_token);
                    } else {
                        chrome.tabs.create({
                            url: Auth.authUrl,
                            selected: true
                        }, (tab) => {
                            chrome.tabs.onUpdated.addListener(Auth.authListener(tab, resolve, reject))
                        });
                    }
                });
            }
        )
    }

    static authListener(tab, resolve, reject) {
        return function tabUpdateListener(tabId, changeInfo) {
            let token, expired;
            if (tabId === tab.id && changeInfo.url !== undefined && changeInfo.status === 'loading') {
                if (changeInfo.url.indexOf('blank.html') > -1) {
                    chrome.windows.onCreated.removeListener(tabUpdateListener);
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

                chrome.storage.local.set({'vkaccess_token': token}, () => {
                    chrome.tabs.remove(tab.id);
                    resolve(token);
                });

            }
        };
    }

}

export class Event
{
    static get fields() {
        return [
            'name', 'place', 'description', 'start_date', 'finish_date'
        ].join(',')
    }
    constructor(eventUrl, token)
    {
        const regex = /com\/(event)?(<event>\d+|.+)/g;
        this.id = '';
        this.token = '';
        let event = regex.exec(eventUrl);
        console.log(event);
        if (event !== null) {
            this.id = event[2];
        }
        this.token = token;
    }

    static getEvent(eventUrl, token) {
        let event = new Event(eventUrl, token);
        let getEventRequest = new XMLHttpRequest();
        getEventRequest.onload = Event.getInfo;

        getEventRequest.open('GET',
            `https://api.vk.com/method/groups.getById?${
                Utils.toQueryString({
                    group_id: event.id,
                    v: Config.vk.v,
                    fields: Event.fields,
                    access_token: event.token
                })}`, false
        );
        getEventRequest.send(null);
    }

    static getInfo(res) {
        let struct = JSON.parse(res.target.response);
        if (struct.response[0]) {
            struct = struct.response[0];
        }

        if (struct.type === 'event') {
            let event = {
                id: struct.screen_name,
                name: struct.name,
                description: struct.description,
                start_date: Utils.convertTimeOld(struct.start_date),
                end_date: Utils.convertTimeOld(struct.finish_date || struct.start_date + 3600),
                location: (struct.place) ? Google.getLocation(struct.place) : '',
            };

            Google.createEvent(event);
        } else {
            alert('This is not an event!')
        }

    }
}

/**
 * Функция вывода ошибки.
 */
function showError(textToShow, errorToShow) {
    alert(textToShow + '\n' + errorToShow);
}