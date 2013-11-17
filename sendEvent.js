document.addEventListener("DOMContentLoaded", function () {

    var params = window.location.hash.substring(1).split('&'),
        eventUrl = params[0],
        vkToken = params[1];

    if (params === undefined || params.length ===  undefined || params.length !== 2) {
        thereIsAnError('Parsing image url', 'params || params.length != 2', imageUrl);
        return;
    }

    loadEventInfo(eventUrl, vkToken);
}
);

function loadEventInfo(eventUrl, vkToken) {

    var eventId = null,
        getEventRequest = new XMLHttpRequest(),
        vkFields = "name,place,description,start_date,finish_date";

    if (eventUrl.search("https") != -1)
    {
        eventId = eventUrl.substring(15);
    } else {
        eventId = eventUrl.substring(14);
    }

    if (eventId.search("event") != -1)
    {
        eventId = eventId.slice(5,eventId.length);
    } else {
        eventId = eventId.slice(0,eventId.length);
    }

    getEventRequest.onload = getEventInfo;

    getEventRequest.open("GET",
        "https://api.vk.com/method/groups.getById?" +
            "v=5.3" +
            "&group_ids=" + eventId +
            "&fields=" + vkFields +
            "&access_token=" + vkToken
    );

    getEventRequest.send(null);
}

function getEventInfo(event)
{
    var vkEvent = JSON.parse(event.target.response);
    if (vkEvent.response[0].type === 'event')
    {
    var vkEventName = vkEvent.response[0].name,
        vkEventId = vkEvent.response[0].screen_name,
        description = vkEvent.response[0].description,
        endTime,
        location,
        startTime = timeConverter(vkEvent.response[0].start_date);
    if (vkEvent.response[0].place === undefined) {
        location = "";
    } else {
        location = "&location=" + getLocation(vkEvent.response[0].place.latitude,vkEvent.response[0].place.longitude)
    }

    if (vkEvent.response[0].finish_date === undefined)
    {
        endTime = timeConverter(parseInt(vkEvent.response[0].start_date) + 3600);
    }
    else
    {
        endTime = timeConverter(vkEvent.response[0].finish_date);
    }
    var gLink = "https://www.google.com/calendar/render?" +
        "action=TEMPLATE" +
        "&text=" + vkEventName +
        "&dates=" + startTime + "/" + endTime + location +
        "&details=" + description.slice(0, 200) +"...\nhttps://vk.com/" + vkEventId +
        "&output=xml";

    gLink = gLink.replaceAll("\n", "%0A").replaceAll("+", "%2B").replaceAll("+", "%20").replaceAll(".", "%2E").replaceAll("#", "%23").substring(0,1000);
    chrome.tabs.update({ "url": gLink}, function (tab) {});
    } else {
        document.getElementById('wrap').innerHTML = '<p></p><br/><br/><center><h1>Error! This is not an event!</h1></center><br/>'
    }
}
String.prototype.replaceAll = function(strTarget, strSubString){
    var strText = this,
        intIndexOfMatch = strText.indexOf( strTarget );

    while (intIndexOfMatch != -1){
        strText = strText.replace( strTarget, strSubString )
        intIndexOfMatch = strText.indexOf( strTarget );
    }
    return( strText )
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
}

function getLocation(latitude, longitude) {

    var getMapsLocation = new XMLHttpRequest();
    console.log(latitude + "," + longitude);
    getMapsLocation.open("GET",
        "http://maps.googleapis.com/maps/api/geocode/json?" +
        "latlng=" + latitude + "," + longitude +
        "&language=ru" +
        "&sensor=true",
        false
    );

    getMapsLocation.send(null);

    if (getMapsLocation.status ===200) {
    var MapsParse = JSON.parse(getMapsLocation.response),
        address;
    address = MapsParse.results[0].formatted_address;
    }
    return address;
}