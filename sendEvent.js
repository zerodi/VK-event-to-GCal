document.addEventListener("DOMContentLoaded", function () {

    var params   = window.location.hash.substring(1).split('&'),
        imageUrl = null,
        filename,
        imageName;

    if (params === undefined || params.length ===  undefined || params.length !== 2) {
        thereIsAnError('Parsing image url', 'params || params.length != 2', imageUrl);
        return;
    }

    filename = params[0].split('/');

    if (filename.length === undefined || filename.length === 0) {
        thereIsAnError('Getting image filename', 'filename.length <= 0', imageUrl);
        return;
    }

    imageUrl = params[0];

    imageName = filename[filename.length - 1];

    if (imageName.indexOf('?') > -1) {
        imageName = imageName.slice(0, imageName.indexOf('?'));
    }

    if (imageName.indexOf('#') > -1) {
        imageName = imageName.slice(0, imageName.indexOf('#'));
    }

    if (imageName.indexOf('&') > -1) {
        imageName = imageName.slice(0, imageName.indexOf('&'));
    }

    upload(imageUrl, imageName, params[1]);
});

function loadEventInfo(vkToken) {
    chrome.tabs.query({
        active: true,
        lastFocusedWindow: true
    }, function(Tabs) {
        var vktab = Tabs[0].url,
            eventUrl = vktab.substring(14),
            getEventRequest = new XMLHttpRequest(),
            vkFields = "name,place,description,start_date,finish_date";

        if (eventUrl.search("event") != -1)
        {
            eventUrl = eventUrl.slice(5,eventUrl.length);
        } else {
            eventUrl = eventUrl.slice(0,eventUrl.length);
        }
        console.log(eventUrl);
        getEventRequest.onload = getEventInfo();

        getEventRequest.open("GET",
            "http://api.vk.com/method/groups.getById?" +
                "v=5.3" +
                "&group_ids=" + eventUrl +
                "&fields=" + vkFields +
                "&access_token=" + vkToken
        );
        getEventRequest.send(null);
    })
};

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
        "&details=" + description.slice(0, 160) +"...\n\n" + vktab +
        "&output=xml";
    gLink = gLink.replaceAll("  ", "\n\n").replaceAll("+", "%2B").replaceAll("+", "%20").replaceAll(".", "%2E").substring(0,1000);
    chrome.tabs.create({ "url": gLink}, function (tab) {});
};

String.prototype.replaceAll = function(strTarget, strSubString){
    var strText = this,
        intIndexOfMatch = strText.indexOf( strTarget );

    while (intIndexOfMatch != -1){
        strText = strText.replace( strTarget, strSubString )
        intIndexOfMatch = strText.indexOf( strTarget );
    }
    return( strText );
};

function timeConverter(UNIX_timestamp)
{
    function pad(str) {
        str = str.toString();
        return (str.length == 1) ? '0' + str : str;
    }
    var date = new Date(UNIX_timestamp*1000),
        year = date.getUTCFullYear(),
        month = date.getUTCMonth() + 1,
        day = date.getUTCDate(),
        hour = date.getUTCHours(),
        min = date.getUTCMinutes(),
        time = pad(year) + pad(month) + pad(day) + 'T' + pad(hour) + pad(min) + '00Z';
    return time;