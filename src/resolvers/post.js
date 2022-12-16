import oracledb from "oracledb";
export default {
    Query: {
        getPostById: (parent, { PID }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                let connection;
                try {
                    connection = await pool.getConnection();
                    let data = await connection.execute(`SELECT * FROM USERS NATURAL JOIN POSTS WHERE PID=:PID`, [PID], { maxRows: 0 })
                    connection.close();
                    resolve(data?.rows[0]);
                } catch (error) {
                    if (connection) connection.close();
                    reject(error);
                }
            })
        },

        getAllPost: (parent, args, { pool }) => {
            return new Promise(async (resolve, reject) => {
                let connection;
                try {
                    connection = await pool.getConnection();
                    let data = await connection.execute(`SELECT * FROM USERS NATURAL JOIN POSTS`, [], { maxRows: 0 })
                    /* const result = await connection.execute(
                        `BEGIN
                           :ret := myfunc();
                         END;`,
                        { ret: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 40 } }
                    );
                    console.log(result.outBinds); */

                    /* let result;
                    do {
                        result = await connection.execute(
                            `BEGIN
                                DBMS_OUTPUT.GET_LINE(:ln, :st);
                            END;`,
                            {
                                ln: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 32767 },
                                st: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
                            }
                        );
                        if (result.outBinds.st === 0)
                            console.log(result.outBinds.ln);
                    } while (result.outBinds.st === 0); */
                    const result = await connection.execute(
                        `INSERT INTO mylobs (id, myclobcol) VALUES (:idbv, :cbv)`,
                        { idbv: 1, cbv: "kjgligl" },
                        { autoCommit: true }
                    );
                    console.log('CLOB inserted from example.txt');
                    connection.close();
                    resolve(data.rows);
                } catch (error) {
                    if (connection) connection.close();
                    reject(error);
                }
            })
        },

        getAllPostByUser: (parent, args, { pool }) => {
            return new Promise(async (resolve, reject) => {
                let connection;
                try {
                    connection = await pool.getConnection();
                    let data = await connection.execute(`SELECT * FROM USERS NATURAL JOIN POSTS WHERE USERID=:ID`, [2], { maxRows: 0 })
                    connection.close();
                    resolve(data.rows);
                } catch (error) {
                    if (connection) connection.close();
                    reject(error);
                }
            })
        },

        getAllPostWithPaginate: (parent, args, { pool }) => {
            return new Promise(async (resolve, reject) => {
                let connection;
                try {
                    let { page, limit, search, sort } = args;
                    connection = await pool.getConnection();
                    let data = await connection.execute(`SELECT * FROM USERS NATURAL JOIN POSTS 
                    WHERE LOWER(TITLE) LIKE LOWER('%${search}%') 
                    ORDER BY ${sort?.key} ${sort?.order} 
                    OFFSET ${(page - 1) * limit} ROWS 
                    FETCH NEXT ${limit} ROWS ONLY`, [], {})
                    let count = await connection.execute(`SELECT COUNT(*) "Total" FROM USERS NATURAL JOIN POSTS WHERE LOWER(TITLE) LIKE LOWER('%${search}%')`, [], {})
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
        createPost: (parent, { input }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                let connection;
                try {
                    console.log("input", input)
                    connection = await pool.getConnection();
                    let PID = +new Date();
                    await connection.execute(`INSERT INTO POSTS (PID, TITLE, USERID) VALUES('${PID}','${input?.TITLE}',${2})`, [], { autoCommit: true });
                    let data = await connection.execute(`SELECT * FROM POSTS WHERE PID='${PID}'`, [], { maxRows: 100 });
                    if (data) resolve(data?.rows[0]);
                    else reject("Please try again");
                    connection.close();
                } catch (error) {
                    console.log("error", error);
                    if (connection) connection.close();
                    reject(error);
                }
            })
        },

        updatePost: (parent, { input }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                let connection;
                try {
                    connection = await pool.getConnection();
                    await connection.execute(`UPDATE POSTS SET TITLE='${input?.TITLE}' WHERE PID=${input?.PID}`, [], { autoCommit: true });
                    let data = await connection.execute(`SELECT * FROM POSTS WHERE PID='${input?.PID}'`, [], { maxRows: 100 });
                    if (data) resolve(data?.rows[0]);
                    else reject("Please try again");
                    connection.close();
                } catch (error) {
                    if (connection) connection.close();
                    reject(error);
                }
            })
        },

        deletePost: (parent, { PID }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                let connection;
                try {
                    connection = await pool.getConnection();
                    let Data = await connection.execute(`DELETE FROM POSTS WHERE PID=:PID`, [PID], { autoCommit: true });
                    if (Data) resolve(true);
                    else reject("Please try again");
                    connection.close();
                } catch (error) {
                    if (connection) connection.close();
                    reject(error);
                }
            })
        },
    },
};