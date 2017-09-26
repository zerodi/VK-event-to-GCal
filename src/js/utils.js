export class Utils {
    static toQueryString(paramsObject) {
        return Object
            .keys(paramsObject)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(paramsObject[key])}`)
            .join('&')
            ;
    }

    static getUrlParameterValue(url, parameterName) {

        let urlParameters = url.substr(url.indexOf("#") + 1),
            temp;

        urlParameters = urlParameters.split("&");

        for (let i = 0; i < urlParameters.length; i += 1) {
            temp = urlParameters[i].split("=");

            if (temp[0] === parameterName) {
                return temp[1];
            }
        }
        return "";
    }

    static convertTime(timestamp) {
        let date;
        if (timestamp === undefined) {
            date = Date.now();
        } else {
            date = new Date(timestamp*1000);
        }
        return date.toISOString();
    }

    static convertTimeOld(timestamp)
    {
        function pad(str) {
            str = str.toString();
            return (str.length === 1) ? '0' + str : str;
        }
        let date = new Date(timestamp*1000),
            year = date.getUTCFullYear(),
            month = date.getUTCMonth() + 1,
            day = date.getUTCDate(),
            hour = date.getUTCHours(),
            min = date.getUTCMinutes();
        return pad(year) + pad(month) + pad(day) + 'T' + pad(hour) + pad(min) + '00Z';
    }
}