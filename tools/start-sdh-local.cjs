// Start the real API and SDH server on this development PC's LAN address.
// Keep MySQL and Redis on loopback; do not use this launcher in production.
const path = require('node:path');
const net = require('node:net');
const { createRequire } = require('node:module');
const server = path.resolve(process.argv[2] || 'D:/work/ldqp');
const load = createRequire(path.join(server, 'package.json'));
process.env.NODE_ENV = 'development';
process.chdir(server);

const config = load('./config/config.js');
const lanHost = '192.168.1.186';
const apiUrl = 'http://' + lanHost + ':8000/';
config.host = lanHost;
config.server.api.port = 8000;
config.server.api.url = apiUrl;
config.mysql.host = '127.0.0.1';
config.mysql.port = Number(process.env.SDH_MYSQL_PORT || 3307);
config.redis.host = '127.0.0.1';
config.redis.port = Number(process.env.SDH_REDIS_PORT || 6379);
if (process.env.SDH_MYSQL_USER) {
    config.mysql.username = process.env.SDH_MYSQL_USER;
    config.mysql.user = process.env.SDH_MYSQL_USER;
}
if (process.env.SDH_MYSQL_PASSWORD !== undefined) config.mysql.password = process.env.SDH_MYSQL_PASSWORD;
if (process.env.SDH_REDIS_PASSWORD !== undefined) config.redis.password = process.env.SDH_REDIS_PASSWORD || undefined;
// models/index.js uses Sequelize's default port instead of config.mysql.port.
const { sequelize } = load('./models/index.js');
sequelize.config.port = config.mysql.port;
sequelize.connectionManager.config.port = config.mysql.port;

const listen = net.Server.prototype.listen;
net.Server.prototype.listen = function (first, ...rest) {
    if (first && typeof first === 'object' && first.port != null) {
        return listen.call(this, { ...first, host: lanHost }, ...rest);
    }
    if (typeof first === 'number' || typeof first === 'string' && /^\d+$/.test(first)) {
        if (typeof rest[0] === 'string') rest.shift();
        return listen.call(this, Number(first), lanHost, ...rest);
    }
    throw new Error('Unexpected non-TCP listener in local test server');
};

// Advertise only this test route in both discovery and authenticated lobby
// responses. These overrides are in-process: server source and Redis data
// are untouched.
const routes = { servers: [apiUrl], update: [] };
Object.assign(load('./config/global.json'), routes);
load('./logic/apiHelper.js').getEntryRouteConfig = async () => routes;
load('./bin/api.js');
load('./gameServer/sdh/server.js');
