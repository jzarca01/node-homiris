const axios = require('axios');
const qs = require('qs');

const ENDPOINT = '/smartphone/production/1.0.0';

class Homiris {
    constructor({
        basicToken,
        username,
        password
    }) {
        this.request = axios.create({
            baseURL: 'https:/y41hsspp-mobile.eps-api.com',
            headers: {
                'User-Agent': 'Homiris/4.10.4',
                'Eps-Ctx-Source': 'MOB-ABO',
                'Eps-Ctx-Username': username,
            }
        });

        this.token = basicToken;
        this.username = username;
        this.password = password;

        this.idSession = null;

        this.setAccessToken = this.setAccessToken.bind(this);
        this.login = this.login.bind(this);
        this.getIdSession = this.getIdSession.bind(this);
        this.getTemperature = this.getTemperature.bind(this);
    }

    setAccessToken(accessToken) {
        this.request.defaults.headers.common['Authorization'] = '';
        delete this.request.defaults.headers.common['Authorization'];

        this.request.defaults.headers.common[
            'Authorization'
        ] = `Bearer ${accessToken}`;
    }

    async login() {
        try {
            const response = await this.request({
                method: 'POST',
                url: '/token',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Authorization: `Basic ${this.token}`,
                },
                data: qs.stringify({
                    grant_type: "client_credentials",
                    scope: 'PRODUCTION',
                }),
            });
            this.setAccessToken(response.data.access_token);
            return response.data;
        } catch (error) {
            console.log('error', error);
        }
    }

    async getIdSession() {
        try {
            const response = await this.request({
                method: 'POST',
                url: `${ENDPOINT}/connect`,
                headers: {
                    'Content-Type': 'application/json',
                },
                data: {
                    originSession: 'HOMIRIS',
                    system: "IOS14.3",
                    pwd: this.password,
                    timestamp: Math.floor(new Date().getTime()),
                    version: '4.10.4',
                    typeDevice: 'SMARTPHONE',
                    phoneType: 'iPhone X',
                    codeLanguage: 'fr_FR',
                    login: this.username,
                    application: 'SMARTPHONE',
                },
            });
            const {
                idSession
            } = response.data;
            this.idSession = idSession;
            return response.data;
        } catch (error) {
            console.log('error', error);
        }
    }

    async getTemperature() {
        try {
            const response = await this.request({
                method: 'GET',
                url: `${ENDPOINT}/temperature/followup/last/${this.idSession}`,
            });
            return response.data;
        } catch (error) {
            console.log('error', error);
        }
    }

    async getTemperature() {
        try {
            const response = await this.request({
                method: 'GET',
                url: `${ENDPOINT}/temperature/followup/last/${this.idSession}`,
            });
            return response.data;
        } catch (error) {
            console.log('error', error);
        }
    }

    async getSystemState() {
        try {
            const systems = await this.request({
                method: 'POST',
                url: `${ENDPOINT}/system/askstatus`,
                data: {
                    idSession: this.idSession,
                    dijeauActivated: false,
                    dormActivated: false
                }
            });
            const {
                idAction
            } = systems.data;
            const response = await this.request({
                method: 'GET',
                url: `${ENDPOINT}/system/status/${this.idSession}/0/${idAction}/0`,
            });
            return response.data;
        } catch (error) {
            console.log('error', error);
        }
    }

    async arm({
        silentMode,
        systemMode
    }) {
        try {
            const response = await this.request({
                method: 'POST',
                url: `${ENDPOINT}/system/askstart`,
                data: {
                    silentMode: silentMode || false,
                    systemMode: systemMode || 'TOTAL',
                    interventionService: true,
                    idSession: this.idSession,
                }
            });
            return response.data;
        } catch (error) {
            console.log('error', error);
        }
    }

    async disarm() {
        try {
            const response = await this.request({
                method: 'POST',
                url: `${ENDPOINT}/system/askstop`,
                data: {
                    idSession: this.idSession,
                }
            });
            return response.data;
        } catch (error) {
            console.log('error', error);
        }
    }
};

module.exports = Homiris;