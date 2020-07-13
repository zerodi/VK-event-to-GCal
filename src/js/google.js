import browser from "webextension-polyfill";
import { Utils } from "./utils";

export class GoogleEvent {
    static createEvent(vkEvent) {
        let params = {
            text: vkEvent.name,
            dates: `${vkEvent.start_date}/${vkEvent.end_date}`,
            details: `${vkEvent.description.slice(0, 200)}...\n\nhttps://vk.com/${vkEvent.id}`
        };
        if (vkEvent.location) {
            params.location = Google.getLocation(vkEvent.location);
        }
        let paramString = Utils.toQueryString(params)
            .replace(/\n/g, "%0A")
            .replace(/\+/g, "%2B")
            .replace(/ /g, "%20")
            .replace(/\./g, "%2E")
            .replace(/#/g, "%23");
        const url = `https://calendar.google.com/calendar/r/eventedit?${paramString}`;
        browser.tabs.create({
            url: url,
            active: true
        });
    }

    static getLocation(params) {
        const mapUrl = new URL("http://maps.googleapis.com/maps/api/geocode/json");
        const queryParams = {
            latlng: [params.latitude, params.longitude].join(","),
            language: "ru",
            key: ""
        };
        Object.keys(queryParams).forEach(key => mapUrl.searchParams.append(key, queryParams[key]));
        return fetch(mapUrl).then((res) => {
            if (response.status === 200) {
                const res = response.json();
                return res.results[0].formatted_address;
            } else {
                throw response.status;
            }
        });
    }
}
