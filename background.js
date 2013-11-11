/**
 * Добавляем пункт в контекстное меню (Временная реализация, в перспективе добавить в интерфейс).
 */
chrome.contextMenus.create({
    "title": "Добавить в Google Calendar Test",
    "type": "normal",
    "contexts": ["all"],
    "documentUrlPatterns": ["*://vk.com/*"],
    "onclick": getOnClick
});

function getOnClick(event) {
    /**
     * Функция возвращает окончательное значение getOnClick
     */
    return function () {
        //Объявляем переменные для приложения и авторизации
        var //eventUrl = info.srcUrl,
            //infoTabUrl = 'sendevent.html#',
            vkAppID = '3965536',
            vkScopes = 'groups',
            vkRedirectUri = encodeURIComponent("http://oauth.vk.com/blank.html"),
            vkAuthUrl = 'https://oauth.vk.com/authorize?client_id=' + vkAppID +
                '&scope=' + vkScopes +
                '&redirect_uri=' + vkRedirectUri +
                '&display=page&response_type=token';
        //Вызываем токен из хранилища
        chrome.storage.local.get({'vkaccess_token': {}}, function (items) {
            //Проверяем наличие токена, если его нет, то получаем.
            if (items.vkaccess_token.length === undefined) {
                chrome.tabs.create({url: vkAuthUrl, selected: true}, function (tab) {
                    chrome.tabs.onUpdated.addListener(authListener(tab.id));
                });

                return;
            }
            console.log(items.vkaccess_token);
            /**
             * Дальше нужно прописать либо выполнение кода, либо заглушку.
             * @type {*}
             */
//            loadEventInfo(items.vkaccess_token)

        });
    };
    /**
     * Функция получает токен в случае, когда он отсутствует в хранилище
     */
    function authListener(authTabId) {

        return function tabUpdateListener (tabId, changeInfo) {
            var vkAccessToken,
                vkAccessTokenExpiredFlag;

            if (tabId === authTabId && changeInfo.url !== undefined && changeInfo.status === "loading") {

                if (changeInfo.url.indexOf('oauth.vk.com/blank.html') > -1) {
                    authTabId = null;
                    chrome.tabs.onUpdated.removeListener(tabUpdateListener);

                    //Получаем значение токена
                    vkAccessToken = getUrlParameterValue(changeInfo.url, 'access_token');

                    //Выводим ошибку, если токен не получен
                    if (vkAccessToken === undefined || vkAccessToken.length === undefined) {
                        showError('vk auth response problem', 'access_token length = 0 or vkAccessToken == undefined');
                        return;
                    }
                    //Получаем отметку об истечении токена
                    vkAccessTokenExpiredFlag = Number(getUrlParameterValue(changeInfo.url, 'expires_in'));

                    //Выводим ошибку, если токен истек
                    if (vkAccessTokenExpiredFlag !== 0) {
                        showError('vk auth response problem', 'vkAccessTokenExpiredFlag != 0' + vkAccessToken);
                        return;
                    }
                    //Сохраняем токен в хранилище и обновляем вкладку
                    chrome.storage.local.set({'vkaccess_token': vkAccessToken}, function () {
                        /**
                         * Аналогично, здесь у нас выполняется нужный нам код.
                         */
                        chrome.tabs.update(
                            tabId,
                            {
                                'url' : 'showinfo.html#' + vkAccessToken,
                                'active': true
                            },
                            function (tab) {}
                        );
                    });
                }
            }
        };
    }

    /**
     * Парсим полученную ссылку и вытаскиваем из неё нужное значение
     */
    function getUrlParameterValue(url, parameterName) {

        var urlParameters = url.substr(url.indexOf("#") + 1),
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

    /**
     * Функция вывода ошибки.
     */
    function showError(textToShow, errorToShow) {
        alert(textToShow + '\n' + errorToShow);
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
    }
}
