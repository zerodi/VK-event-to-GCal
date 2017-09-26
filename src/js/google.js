import {Utils} from "./utils";

export class Google {

    static createEventInCal(vkEvent) {
        let params = {
            'action': 'TEMPLATE',
            'text': vkEvent.name,
            'dates': `${vkEvent.start_date}/${vkEvent.end_date}`,
            'location': vkEvent.location,
            'details': `${vkEvent.description.slice(0, 200)}...\n\nhttps://vk.com/${vkEvent.id}`
        };
        let paramString = Utils.toQueryString(params)
            .replace(/\n/g, "%0A")
            .replace(/\+/g, "%2B")
            .replace(/ /g, "%20")
            .replace(/\./g, "%2E")
            .replace(/#/g, "%23");

        chrome.tabs.create({
            'url': `https://www.google.com/calendar/render?${paramString}`,
            selected: true
        }, function (tab) {});
    }

    static getLocation(params) {
        let res = '';
        let request = new XMLHttpRequest();
        request.open('GET', `http://maps.googleapis.com/maps/api/geocode/json?${
            Utils.toQueryString({
                latlng: [params.latitude, params.longitude].join(','),
                language: 'ru',
                key: ''
            })
            }`, false);
        request.send(null);

        if (request.status === 200) {
            let response = request.response;
            if (response && response.results && response.results.length > 0) {
                res = response.results[0].formatted_address;
            }
        }
        return res;
    }

    static createEvent(event) {
        Google.createEventInCal(event);
    }

}