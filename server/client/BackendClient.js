const backendUrl = require('../env/BackendUrl')
const axios = require('axios')
const tokenStorage = require('../TokenStorage')
const errorBuilder = require('../routes/ErrorBuilder')
const sessionService = require('../service/SessionService')
const authService = require('../service/AuthService')

const sendRequest = async function (req, res) {
    try {
        if (authService.needAuthorization(req)) {
            authService.authorizeRequest(req)
        }
        await sendRequestInternal(req, res)
    } catch (e) {
        await handleBackendError(req, res, e, true)
    }
}

async function sendRequestInternal(req, res) {
    const proxyResp = await axios.request({
        url: `${backendUrl}${req.url}`,
        data: req.body,
        method: req.method,
        params: req.query,
        headers: req.headers
    });
    res.status(proxyResp.status).send(proxyResp.data)
}

async function handleBackendError(req, res, e, needRetry) {
    console.debug(e);
    if (e === authService.UNAUTHORIZED) {
        errorBuilder.unauthorized(res)
    } else if (e.response && e.response.status === 401) {
        if (needRetry) {
            await retry(req, res)
            return
        }
        errorBuilder.unauthorized(res)
    } else if (e.response && e.response.status === 403) {
        errorBuilder.forbidden(res)
    } else {
        console.error(e)
        errorBuilder.internalServerError(res)
    }
}

async function retry(req, res) {
    try {
        let sessionId = sessionService.extractSessionId(req)
        await tokenStorage.refresh(sessionId)
        authService.authorizeRequest(req)
        await sendRequestInternal(req, res)
    } catch (ex) {
        await handleBackendError(req, res, ex, false)
    }
}

module.exports.sendRequest = sendRequest