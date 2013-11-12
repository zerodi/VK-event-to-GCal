/**
 * Добавляем пункт в контекстное меню (Временная реализация, в перспективе добавить в интерфейс).
 */
chrome.contextMenus.create({
    "title": "Добавить в Google Calendar",
    "type": "normal",
    "contexts": ["page"],
    "documentUrlPatterns": ["*://vk.com/*"],
    "onclick": getOnClick()
});

function getOnClick() {
    /**
     * Функция возвращает окончательное значение getOnClick
     */
    return function (info, tab) {
        //Объявляем переменные для приложения и авторизации
        var eventUrl = info.srcUrl,
            infoTabUrl = 'showinfo.html#',
            vkAppID = '3965536',
            vkScopes = 'groups,offline',
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
                    chrome.tabs.onUpdated.addListener(authListener(tab.id, eventUrl));
                });

                return;
            }

            infoTabUrl += eventUrl + '&' + items.vkaccess_token;
            //Открываем окно с инфой
            chrome.tabs.create({url: infoTabUrl, selected: true});

        });
    };
    /**
     * Функция получает токен в случае, когда он отсутствует в хранилище
     */
    function authListener(authTabId, eventUrl) {

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
                        chrome.tabs.update(
                            tabId,
                            {
                                'url' : 'showinfo.html#' + eventUrl + '&' + vkAccessToken,
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
}