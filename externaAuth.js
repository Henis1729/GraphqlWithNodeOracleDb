const oracledb = require('oracledb');

async function ShowUserInfo(conn) {
    let result = await conn.execute(`
            select
                sys_context('USERENV', 'PROXY_USER'),
                sys_context('USERENV', 'SESSION_USER')
            from dual`);
    console.log("    Proxy User:", result.rows[0][0]);
    console.log("    Session User:", result.rows[0][1]);
    console.log();
};

(async function () {
    let conn, pool, config, testdesc;
    console.log("(1) Standalone: Basic Auth");
    try {
        config = { connectString: "localhost/orclpdb", user: "mynormaluser", password: "mynormaluserpw" };
        conn = await oracledb.getConnection(config);
        await ShowUserInfo(conn);
    } catch (e) {
        console.log(e.message + "\n");
    }
    console.log("(2) Standalone: External Auth");
    try {
        config = { connectString: "localhost/orclpdb", externalAuth: true };
        conn = await oracledb.getConnection(config);
        await ShowUserInfo(conn);
    } catch (e) {
        console.log(e.message + "\n");
    }
    console.log("(3) Standalone: Basic Auth with proxy");
    try {
        config = { connectString: "localhost/orclpdb", user: "myproxyuser[mysessionuser1]", password: "myproxyuserpw" };
        conn = await oracledb.getConnection(config);
        await ShowUserInfo(conn);
    } catch (e) {
        console.log(e.message + "\n");
    }
    console.log("(4) Standalone: External Auth with proxy in brackets");
    try {
        config = { connectString: "localhost/orclpdb", user: "[mysessionuser2]", externalAuth: true };
        conn = await oracledb.getConnection(config);
        await ShowUserInfo(conn);
    } catch (e) {
        console.log(e.message + "\n");
    }
    console.log("(5) Standalone: External Auth with proxy");
    try {
        config = { connectString: "localhost/orclpdb", user: "mysessionuser2", externalAuth: true };
        conn = await oracledb.getConnection(config);
        await ShowUserInfo(conn);
    } catch (e) {
        console.log(e.message + "\n");
    }
    console.log("(6) Pooled: Basic Auth");
    try {
        config = { connectString: "localhost/orclpdb", user: "mynormaluser", password: "mynormaluserpw" };
        pool = await oracledb.createPool(config);
        conn = await pool.getConnection();
        await ShowUserInfo(conn);
    } catch (e) {
        console.log(e.message + "\n");
    }
    console.log("(7) Pooled: External Auth");
    try {
        config = { connectString: "localhost/orclpdb", externalAuth: true };
        pool = await oracledb.createPool(config);
        conn = await pool.getConnection();
        await ShowUserInfo(conn);
    } catch (e) {
        console.log(e.message + "\n");
    }
    console.log("(8) Pooled: Basic Auth with proxy in pool creation");
    try {
        config = { connectString: "localhost/orclpdb", user: "myproxyuser[mysessionuser1]", password: "myproxyuserpw" };
        pool = await oracledb.createPool(config);
        conn = await pool.getConnection();
        await ShowUserInfo(conn);
    } catch (e) {
        console.log(e.message + "\n");
    }
    console.log("(9) Pooled: Basic Auth with proxy in connection");
    try {
        config = { connectString: "localhost/orclpdb", user: "myproxyuser", password: "myproxyuserpw", homogeneous: false };
        pool = await oracledb.createPool(config);
        conn = await pool.getConnection({ "user": "mysessionuser1" });
        await ShowUserInfo(conn);
    } catch (e) {
        console.log(e.message + "\n");
    }
    console.log("(10) Pooled: Basic Auth with proxy in brackets in connection");
    try {
        config = { connectString: "localhost/orclpdb", user: "myproxyuser", password: "myproxyuserpw", homogeneous: false };
        pool = await oracledb.createPool(config);
        conn = await pool.getConnection({ "user": "[mysessionuser1]" });
        await ShowUserInfo(conn);
    } catch (e) {
        console.log(e.message + "\n");
    }
    console.log("(11) Pooled: External Auth with proxy in brackets in pool creation");
    try {
        config = { connectString: "localhost/orclpdb", user: "[mysessionuser2]", externalAuth: true };
        pool = await oracledb.createPool(config);
        conn = await pool.getConnection();
        await ShowUserInfo(conn);
    } catch (e) {
        console.log(e.message + "\n");
    }
    console.log("(12) Pooled: External Auth with proxy in pool creation");
    try {
        config = { connectString: "localhost/orclpdb", user: "mysessionuser2", externalAuth: true };
        pool = await oracledb.createPool(config);
        conn = await pool.getConnection();
        await ShowUserInfo(conn);
    } catch (e) {
        console.log(e.message + "\n");
    }
    console.log("(13) Pooled: External Auth with proxy in brackets in connection");
    try {
        config = { connectString: "localhost/orclpdb", externalAuth: true };
        pool = await oracledb.createPool(config);
        conn = await pool.getConnection({ user: "[mysessionuser2]" });
        await ShowUserInfo(conn);
    } catch (e) {
        console.log(e.message + "\n");
    }
    console.log("(14) Pooled: External Auth with proxy in connection");
    try {
        config = { connectString: "localhost/orclpdb", externalAuth: true };
        pool = await oracledb.createPool(config);
        conn = await pool.getConnection({ user: "mysessionuser2" });
        await ShowUserInfo(conn);
    } catch (e) {
        console.log(e.message + "\n");
    }
})();