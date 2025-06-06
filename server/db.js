const { Pool } = require('pg');

const pool = new Pool({
    connectionString: 'postgresql://protokol_db_user:cHHaJl1IUJFjFrpuPWko41lsjjkEaukW@dpg-d0nki98dl3ps73acg24g-a/protokol_db',
    ssl: {
        rejectUnauthorized: false
    }
});

module.exports = pool;
