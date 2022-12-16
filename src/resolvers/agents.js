import oracledb from "oracledb";
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890', 4)
export default {
    Query: {
        getAllAgent: (parent, args, { pool }) => {
            return new Promise(async (resolve, reject) => {
                let connection;
                try {
                    console.log("----")
                    let dataArray = [];
                    connection = await pool.getConnection();
                    const stream = connection.queryStream(`SELECT * FROM AGENTS`);
                    stream.on('error', (error) => {reject(error)});
                    stream.on('data', (data) => {dataArray = [data, ...dataArray]});
                    stream.on('end', () => {
                        resolve(dataArray);
                        stream.destroy();
                        if (connection) connection.close();
                    });
                } catch (error) {
                    if (connection) connection.close();
                    reject(error);
                }
            })
        },

        getAllAgentWithPaginate: (parent, args, { pool }) => {
            return new Promise(async (resolve, reject) => {
                let connection;
                try {
                    let { page, limit, search, sort } = args;
                    connection = await pool.getConnection();
                    let data = await connection.execute(`SELECT * FROM AGENTS 
                    WHERE LOWER(AGENT_NAME) LIKE LOWER('%${search}%') 
                    ORDER BY ${sort?.key} ${sort?.order} 
                    OFFSET ${(page - 1) * limit} ROWS 
                    FETCH NEXT ${limit} ROWS ONLY`, [], {})
                    let count = await connection.execute(`SELECT COUNT(*) "Total" FROM AGENTS WHERE LOWER(AGENT_NAME) LIKE LOWER('%${search}%')  `, [], {})
                    resolve({ count: count?.rows[0]?.Total, data: data.rows });
                    connection.close();
                } catch (error) {
                    if (connection) connection.close();
                    reject(error);
                }
            })
        },
    },

    Mutation: {
        createAgent: (parent, { input }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                let connection;
                try {
                    let { AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY } = input;
                    connection = await pool.getConnection();
                    connection.execute(`INSERT INTO AGENTS VALUES (:0,:1,:2,:3,:4,:5)`, [nanoid(), AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY], {}, (error, data) => {
                        if (error) reject(error);
                        else if (data) {
                            connection.execute(`SELECT * from AGENTS where rowid=:0`, [data?.lastRowid], {}, (error, data1) => {
                                if (error) reject(error);
                                if (data1) {
                                    connection.commit();
                                    resolve(data1?.rows[0]);
                                } else reject("Please try again");
                                connection.close();
                            });
                        }
                    });
                } catch (error) {
                    console.log("error", error)
                    if (connection) connection.close();
                    reject(error);
                }
            })
        },


    },
};