require('dotenv').config();

module.exports = {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.CLIENT_ID,
    adminRoleId: process.env.ADMIN_ROLE_ID,
    prefix: 'ry.',
    timezone: 'Asia/Kolkata'
};
