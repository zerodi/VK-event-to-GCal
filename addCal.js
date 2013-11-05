/**
 * Добавляем пункт в контекстное меню (Временная реализация, в перспективе добавить в интерфейс).
 */
chrome.contextMenus.create({
    "title": "Добавить в Google Calendar",
    "type": "normal",
    "contexts": ["page"],
    "documentUrlPatterns": ["*://vk.com/*"],
    "onclick": loadEventInfo
});

function loadEventInfo(date, tab) {
    var eventUrl = tab.location.pathname,
        getEventRequest = new XMLHttpRequest(),
        vkFields = "name,place,description,start_date,end_date"

//    getEventRequest.onload = onGetEvent;
    getEventRequest.open("GET", "https://api.vk.com/method/groups.getById?" +
        "&v=5.2" +
        "&group_id=" + eventUrl +
        "&fields=" + vkFields
    );
    getEventRequest.send();

    var answer = JSON.parse(getEventRequest.responce);

    alert("name: " + answer.name);
}
/*
function onGetEvent(event) {
    var answer = JSON.parse(event.target.responce);
//    document.getElementById("eventName").innerHTML = answer.name;
//    document.getElementById("eventDescription").innerHTML = answer.description;
    alert("name: " + answer.name + "\n" +
        "description: " + answer.description);
}
*/

/*

//do all the things
function SendToCalendar(data, tab) {

    var location = "";
    var selection = "";

    if (data.selectionText) {
        //get the selected text and uri encode it
        selection = data.selectionText;

        //check if the selected text contains a US formatted address
        var address = data.selectionText.match(/(\d+\s+[':.,\s\w]*,\s*[A-Za-z]+\s*\d{5}(-\d{4})?)/m);
        if (address)
            location = "&location=" + address[0];
    }

    //build the url: selection goes to ctext (google calendar quick add), page title to event title, and include url in description
    var url = "http://www.google.com/calendar/event?action=TEMPLATE&text=" + tab.title + location +
        "&details=" + tab.url + "  " + selection + "&ctext=" + selection;

    //url encode (with special attention to spaces & paragraph breaks)
    //and trim at 1,000 chars to account for 2,000 character limit with buffer for google login/redirect urls
    url = encodeURI(url.replaceAll("  ", "\n\n")).replaceAll("%20", "+").replaceAll("%2B", "+").substring(0,1000);

    //the substring might cut the url in the middle of a url encoded value, so we need to strip any trailing % or %X chars to avoid an error 400
    if (url.substr(url.length-1) === "%") {url = url.substring(0,url.length-1)}
    else if(url.substr(url.length-2,1) === "%" ) {url = url.substring(0,url.length-2)}

    //open the created url in a new tab
    chrome.tabs.create({ "url": url}, function (tab) {});

}
*/