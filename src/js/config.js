export class Config {
    static get vk() {
        return {
            client_id: process.env.VK_CLIENT_ID,
            redirect_uri: 'https://oauth.vk.com/blank.html',
            display: 'page',
            scope: ['groups', 'offline'].join(','),
            response_type: 'token',
            revoke: 0,
            v: '5.92'
        };
    }
}
