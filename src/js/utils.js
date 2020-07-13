export class Utils {
    static toQueryString(paramsObject) {
        return Object
            .keys(paramsObject)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(paramsObject[key])}`)
            .join('&')
            ;
    }

    static getUrlParameterValue(url, parameterName) {
        const urlParameters = url.substr(url.indexOf('#') + 1).split('&');
        for (const param of urlParameters) {
            const temp = param.split('=');
            if (temp[0] === parameterName) {
                return temp[1];
            }
        }
        return '';
    }

    static convertTime(timestamp) {
        // Current date format: 20190920T160000
        function pad(num) {
            const z = new Array(2).join('0');
            return (z + num).slice(-2);
        }

        const d = timestamp === undefined
            ? Date.now()
            : new Date(timestamp * 1000);
        const date = `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`;
        const time = `${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getMinutes())}`;
        return `${date}T${time}`;
    }
}
