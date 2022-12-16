const oracledb = require("oracledb");
oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.stmtCacheSize = 40;
const { USER, PASSWORD, CONNECTION_STRING } = process.env;

export const getConnectionDB = async () => {
    try {
        return await oracledb.getConnection({ user: USER, password: PASSWORD, connectionString: CONNECTION_STRING });
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
};

export const getPool = async () => {
    try {
        return await oracledb.createPool({ user: USER, password: PASSWORD, connectionString: CONNECTION_STRING });
    } catch (err) {
        console.error(err);
        throw new Error(err);
    }
};

