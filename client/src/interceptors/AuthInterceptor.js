import axios from 'axios/index';
import Vue from '../main'
import LoginService from '../service/LoginService'

export default function setupAuthInterceptor() {
    let triedRefresh = false;

    axios.interceptors.request.use(
        (config) => {
            let token = Vue.$session.get('token');
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    axios.interceptors.response.use(
        (config) => {
            return config;
        },
        async (error) => {
            let response = error.response;
            if (response.status === 401 && !triedRefresh) {
                triedRefresh = true;
                let token = Vue.$session.get('token');
                if (token) {
                    try {
                        let data = await LoginService.refreshToken(token);
                        Vue.$session.set('token', data.accessToken);
                        let response = await tryAgain(error);
                        return Promise.resolve(response);
                    } catch (e) {
                        triedRefresh = false;
                        Vue.$router.push('/login');
                    }
                } else {
                    triedRefresh = false;
                    Vue.$router.push('/login');
                }
            }
            triedRefresh = false;
            return Promise.reject(error);
        }
    );
}

async function tryAgain(error) {
    return await axios(error.config);
}