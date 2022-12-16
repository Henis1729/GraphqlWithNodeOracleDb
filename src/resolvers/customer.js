import oracledb from "oracledb";
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890', 4)
export default {
    Query: {
        getAllCustomer: (parent, args, { pool }) => {
            return new Promise(async (resolve, reject) => {
                let connection;
                try {
                    let dataArray = [];
                    connection = await pool.getConnection();
                    const stream = connection.queryStream(`SELECT * FROM CUSTOMER c JOIN AGENTS a ON c.AGENT_CODE=a.AGENT_CODE`);
                    stream.on('error', (error) => { reject(error) });
                    stream.on('data', (data) => { dataArray = [data, ...dataArray] });
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

        getAllCustomerWithPaginate: (parent, args, { pool }) => {
            return new Promise(async (resolve, reject) => {
                let connection;
                try {
                    let { page, limit, search, sort } = args;
                    connection = await pool.getConnection();
                    let data = await connection.execute(`SELECT * FROM CUSTOMER c JOIN AGENTS a ON c.AGENT_CODE=a.AGENT_CODE 
                    WHERE LOWER(AGENT_NAME) LIKE LOWER('%${search}%') OR LOWER(AGENT_NAME) LIKE LOWER('%${search}%')
                    ORDER BY ${sort?.key} ${sort?.order} 
                    OFFSET ${(page - 1) * limit} ROWS 
                    FETCH NEXT ${limit} ROWS ONLY`, [], {})
                    let count = await connection.execute(`SELECT COUNT(*) "Total" FROM CUSTOMER c JOIN AGENTS a ON c.AGENT_CODE=a.AGENT_CODE WHERE LOWER(AGENT_NAME) LIKE LOWER('%${search}%') OR LOWER(AGENT_NAME) LIKE LOWER('%${search}%')`, [], {})
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
        createCustomer: (parent, { input }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                let connection;
                try {
                    let { CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY, GRADE, OPENING_AMT, RECEIVE_AMT, PAYMENT_AMT, OUTSTANDING_AMT, PHONE_NO, AGENT_CODE } = input;
                    connection = await pool.getConnection();
                    connection.execute(`INSERT INTO CUSTOMER VALUES (:0, :1, :2, :3, :4,:5, :6, :7, :8, :9, :10, :11)`,
                        [nanoid(), CUST_NAME, CUST_CITY, WORKING_AREA, CUST_COUNTRY, GRADE, OPENING_AMT, RECEIVE_AMT, PAYMENT_AMT, OUTSTANDING_AMT, PHONE_NO, AGENT_CODE], {}, (error, data) => {
                            if (error) reject(error);
                            else if (data) {
                                connection.execute(`SELECT * from CUSTOMER where rowid=:0`, [data?.lastRowid], {}, (error, data1) => {
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