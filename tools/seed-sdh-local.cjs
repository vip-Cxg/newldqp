// Only adds a dedicated SDH playtest club, three accounts and one room to the
// local development database. Only the dedicated fixture club is migrated.
const path = require('node:path');
const { createRequire } = require('node:module');
const { randomInt } = require('node:crypto');
const root = path.resolve(process.argv[2] || 'D:/work/ldqp');
const load = createRequire(path.join(root, 'package.json'));
const id = () => randomInt(100000, 1000000);
process.env.NODE_ENV = 'development';
process.chdir(root);
const config = load('./config/config.js');
config.mysql.host = '127.0.0.1';
config.mysql.port = Number(process.env.SDH_MYSQL_PORT || 3307);
config.redis.host = '127.0.0.1';
config.redis.port = Number(process.env.SDH_REDIS_PORT || 6379);
if (process.env.SDH_MYSQL_USER) config.mysql.user = process.env.SDH_MYSQL_USER;
if (process.env.SDH_MYSQL_PASSWORD !== undefined) config.mysql.password = process.env.SDH_MYSQL_PASSWORD;
const { sequelize } = load('./models/index.js');
sequelize.config.port = sequelize.connectionManager.config.port = config.mysql.port;
const { User } = load('./models/user');
const { Club } = load('./models/club');
const { ClubUser } = load('./models/clubUser');
const { ClubRoom } = load('./models/clubRoom');
const { ioredis } = load('./service/ioredis.js');

sequelize.transaction(async transaction => {
    const users = [];
    for (let seat = 1; seat <= 3; seat++) {
        const deviceID = 'sdh-local-0' + seat;
        const [player] = await User.findOrCreate({
            where: { deviceID }, defaults: { id: id(), name: 'SDH测试' + seat, phone: String(1900000 + id()).padStart(11, '0'), head: '' }, transaction
        });
        users.push(player);
    }
    const owner = users[0].id;
    const [club] = await Club.findOrCreate({
        where: { name: '新华包牌本地测试', userID: owner },
        defaults: { id: id(), isLeague: 1, managers: String(owner), owners: String(owner) },
        transaction
    });
    // The visible production-style 亲友圈 entry lists only league clubs.
    // This query is scoped to the dedicated seed club and its seed owner.
    if (Number(club.isLeague) !== 1) await club.update({ isLeague: 1 }, { transaction });
    for (const player of users) {
        const own = player.id === owner;
        await ClubUser.findOrCreate({
            where: { clubID: club.id, userID: player.id },
            defaults: { parent: owner, cluster: own ? String(owner) : owner + ',' + player.id,
                inviter: randomInt(10000000, 100000000), score: 100000, role: own ? 'owner' : 'user', level: own ? 100 : 0 },
            transaction
        });
    }
    const [room] = await ClubRoom.findOrCreate({
        where: { clubID: club.id, gameType: 'SDH', name: '新华包牌本地桌' },
        defaults: { person: 3, base: 100, fee: 0, lower: 0, rules: { person: 3, turn: 1 } },
        transaction
    });
    return { clubID: club.id, roomID: room.roomID };
}).then(result => console.log('SDH local playtest:', result))
    .catch(error => { console.error(error.name + ': ' + error.message); process.exitCode = 1; })
    .finally(async () => { ioredis.disconnect(); await sequelize.close(); });
