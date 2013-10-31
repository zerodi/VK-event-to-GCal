/**
 * Добавляем пункт в контекстное меню (Временная реализация, в перспективе добавить в интерфейс).
 */
chrome.contextMenus.create({
    "title": "Добавить в Google Calendar",
    "type": "normal",
    "contexts": ["image"],
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

        function authListener(authTabId, eventUrl) {

            return function tabUpdateListener (tabId, changeInfo) {
                var vkAccessToken,
                    vkAccessTokenExpiredFlag;

                if (tabId === authTabId && changeInfo.url !== undefined && changeInfo.status === "loading") {

                }

            }

        }

    };

}
