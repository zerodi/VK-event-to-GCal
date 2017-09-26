export class Config {
    static get vk() {
        return {
            client_id: process.env.VK_CLIENT_ID,
            scope: ['groups', 'offline'].join(','),
            redirect_uri: 'https://oauth.vk.com/blank.html',
            display: 'page',
            response_type: 'token',
            v: '5.68'
        }
    }

    static get google() {
        return {
            maps: process.env.GOOGLE_APIKEY
        }
    }
}