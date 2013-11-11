/**
 * Добавляем пункт в контекстное меню (Временная реализация, в перспективе добавить в интерфейс).
 */
chrome.contextMenus.create({
    "title": "Добавить в Google Calendar Test",
    "type": "normal",
    "contexts": ["all"],
    "documentUrlPatterns": ["*://vk.com/*"],
    "onclick": getClickHandler
});

/**
 * Handle main functionality of 'onlick' chrome context menu item method
 */
function getClickHandler() {

    return function () {

        var vkCLientId           = '3965536',
            vkRequestedScopes    = 'groups',
            vkAuthenticationUrl  = 'https://oauth.vk.com/authorize?client_id=' + vkCLientId + '&scope=' + vkRequestedScopes + '&redirect_uri=http%3A%2F%2Foauth.vk.com%2Fblank.html&display=page&response_type=token';

        chrome.storage.local.get({'vkaccess_token': {}}, function (items) {

            if (items.vkaccess_token.length === undefined) {
                chrome.tabs.create({url: vkAuthenticationUrl, selected: true}, function (tab) {
                    chrome.tabs.onUpdated.addListener(listenerHandler(tab.id));
                });

                return;
            }

            loadEventInfo(items.vkaccess_token);

        });
    };
}

/**
 * Chrome tab update listener handler. Return a function which is used as a listener itself by chrome.tabs.obUpdated
 *
 * @param  {string} authenticationTabId Id of the tab which is waiting for grant of permissions for the application
 * @param  {string} imageSourceUrl      URL of the image which is uploaded
 *
 * @return {function}                   Listener for chrome.tabs.onUpdated
 */
function listenerHandler(authenticationTabId) {

    return function tabUpdateListener(tabId, changeInfo) {
        var vkAccessToken,
            vkAccessTokenExpiredFlag;

        if (tabId === authenticationTabId && changeInfo.url !== undefined && changeInfo.status === "loading") {

            if (changeInfo.url.indexOf('oauth.vk.com/blank.html') > -1) {
                authenticationTabId = null;
                chrome.tabs.onUpdated.removeListener(tabUpdateListener);

                vkAccessToken = getUrlParameterValue(changeInfo.url, 'access_token');

                if (vkAccessToken === undefined || vkAccessToken.length === undefined) {
                    displayeAnError('vk auth response problem', 'access_token length = 0 or vkAccessToken == undefined');
                    return;
                }

                vkAccessTokenExpiredFlag = Number(getUrlParameterValue(changeInfo.url, 'expires_in'));

                if (vkAccessTokenExpiredFlag !== 0) {
                    displayeAnError('vk auth response problem', 'vkAccessTokenExpiredFlag != 0' + vkAccessToken);
                    return;
                }

                chrome.storage.local.set({'vkaccess_token': vkAccessToken}, function () {
                    loadEventInfo(vkAccessToken);
                });
            }
        }
    };
}

/**
 * Display an alert with an error message, description
 *
 * @param  {string} textToShow  Error message text
 * @param  {string} errorToShow Error to show
 */
function displayeAnError(textToShow, errorToShow) {
    "use strict";

    alert(textToShow + '\n' + errorToShow);
}

/**
 * Retrieve a value of a parameter from the given URL string
 *
 * @param  {string} url           Url string
 * @param  {string} parameterName Name of the parameter
 *
 * @return {string}               Value of the parameter
 */
function getUrlParameterValue(url, parameterName) {
    "use strict";

    var urlParameters  = url.substr(url.indexOf("#") + 1),
        parameterValue = "",
        index,
        temp;

    urlParameters = urlParameters.split("&");

    for (index = 0; index < urlParameters.length; index += 1) {
        temp = urlParameters[index].split("=");

        if (temp[0] === parameterName) {
            return temp[1];
        }
    }

    return parameterValue;
}

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
        getEventRequest.onload = getEventInfo(event, vktab);

        getEventRequest.open("GET",
            "http://api.vk.com/method/groups.getById?" +
                "v=5.3" +
                "&group_ids=" + eventUrl +
                "&fields=" + vkFields +
                "'&access_token=" + vkToken
        );
        getEventRequest.send(null);
    });
}

function getEventInfo(event, vktab)
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
}
String.prototype.replaceAll = function(strTarget, strSubString){
    var strText = this,
        intIndexOfMatch = strText.indexOf( strTarget );

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
    var date = new Date(UNIX_timestamp*1000),
        year = date.getUTCFullYear(),
        month = date.getUTCMonth() + 1,
        day = date.getUTCDate(),
        hour = date.getUTCHours(),
        min = date.getUTCMinutes(),
        time = pad(year) + pad(month) + pad(day) + 'T' + pad(hour) + pad(min) + '00Z';
    return time;
}