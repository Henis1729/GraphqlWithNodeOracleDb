const oracledb = require('oracledb');
const {USER, PASSWORD , CONNECTION_STRING} = process.env
const connection = oracledb.getConnection({ user: USER, password: PASSWORD, connectionString: CONNECTION_STRING });
console.log("Successfully connected to Oracle Database", connection);
module.export = connection;