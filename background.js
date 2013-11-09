/**
 * Добавляем пункт в контекстное меню (Временная реализация, в перспективе добавить в интерфейс).
 */
chrome.contextMenus.create({
    "title": "Добавить в Google Calendar",
    "type": "normal",
    "contexts": ["all"],
    "documentUrlPatterns": ["*://vk.com/*"],
    "onclick": loadEventInfo
});

function loadEventInfo() {

    // Do NOT forget that the method is ASYNCHRONOUS
    chrome.tabs.query({
        active: true,               // Select active tabs
        lastFocusedWindow: true     // In the current window
    }, function(Tabs) {
        // Since there can only be one active tab in one active window,
        //  the array has only one element
        var tab = Tabs[0];
        var eventUrl = tab.url;
        var getEventRequest = new XMLHttpRequest(),
            vkFields = "name,place,description,start_date,finish_date";
        /*
         if (eventUrl.search("event") != -1)
         {*/
        eventUrl = eventUrl.slice(6,eventUrl.length);
        /*    } else {
         eventUrl = eventUrl.slice(1,eventUrl.length);
         }*/

        getEventRequest.onload = getEventInfo;

        getEventRequest.open("GET",
            "http://api.vk.com/method/groups.getById?" +
                "v=5.3" +
                "&group_ids=" + eventUrl +
                "&fields=" + vkFields
        );
        getEventRequest.send(null);
    });
}

function getEventInfo(event)
{
    var vkEvent = JSON.parse(event.target.response);

    var vkEventName = vkEvent.response[0].name,
        description = vkEvent.response[0].description,
        startTime = timeConverter(vkEvent.response[0].start_date),
//        location = vkEvent.response[0].place.address,
        endTime;
        if (vkEvent.response[0].finish_date === undefined)
        {
            endTime = timeConverter(parseInt(vkEvent.response[0].start_date) + 3600);
        }
        else
        {
            endTime = timeConverter(vkEvent.response[0].finish_date);
        };
    var gLink = "https://www.google.com/calendar/render?" +
                "action=TEMPLATE" +
                "&text=" + vkEventName +
                "&dates=" + startTime + "/" + endTime +
//                "&location=" + location +
                "&details=" + description +
                "&output=xml";

    gLink = encodeURI(gLink.replaceAll("  ", "\n\n")).replaceAll("%20", "+").replaceAll("%2B", "+").substring(0,2000);
    chrome.tabs.create({ "url": gLink}, function (tab) {});
}

String.prototype.replaceAll = function(strTarget, strSubString){
    var strText = this;
    var intIndexOfMatch = strText.indexOf( strTarget );

    while (intIndexOfMatch != -1){
        strText = strText.replace( strTarget, strSubString )
        intIndexOfMatch = strText.indexOf( strTarget );
    }

    return( strText );

}

function timeConverter(UNIX_timestamp)
{

    function pad(str) {
        str = str.toString();
        return (str.length == 1) ? '0' + str : str;
    }

    var date = new Date(UNIX_timestamp*1000);
    var year = date.getUTCFullYear(),
        month = date.getUTCMonth() + 1,
        day = date.getUTCDate(),
        hour = date.getUTCHours(),
        min = date.getUTCMinutes();
    var time = pad(year) + pad(month) + pad(day) + 'T' + pad(hour) + pad(min) + '00Z';
    return time;
}