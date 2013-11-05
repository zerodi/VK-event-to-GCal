/**
 * Created by dpyankov on 01.11.13.
 */
document.addEventListener("DOMContentLoader", function () {

    var eventUrl = window.location.pathname;
    loadEventInfo(eventUrl);
    document.getElementById("show_parse") = loadEventInfo;
});



function loadEventInfo(eventUrl) {
    var getEventRequest = new XMLHttpRequest();
    var vkFields = "name,place,description,start_date,end_date"

    getEventRequest.onload = onGetEvent;
    getEventRequest.open("GET", "https://api.vk.com/method/groups.getById?" +
        "&v=5.2" +
        "&group_id=" + eventUrl +
        "&fields=" + vkFields
    );
    getEventRequest.send();
}

function onGetEvent(event) {
    var answer = JSON.parse(event.target.responce);
//    document.getElementById("eventName").innerHTML = answer.name;
//    document.getElementById("eventDescription").innerHTML = answer.description;
    alert("name: " + answer.name + "\n" +
    "description: " + answer.description);
}
