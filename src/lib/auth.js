require('dotenv').config();
const config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH_CLIENT_SECRET,
    baseURL: process.env.CYCLIC_URL || 'http://localhost:3000',
    clientID: process.env.AUTH_CLIENT_ID,
    issuerBaseURL: `https://${process.env.AUTH_ISSUER_BASE_URL}`,
}

module.exports = {
    config
}