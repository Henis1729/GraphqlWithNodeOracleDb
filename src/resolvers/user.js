import oracledb from "oracledb";
import { customAlphabet } from 'nanoid'
const nanoid = customAlphabet('1234567890', 10)
export default {
    Query: {
        getUserById: (parent, { USERID }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                let connection;
                try {
                    connection = await pool.getConnection();
                    let data = await connection.execute(`SELECT * FROM users WHERE USERID=:USERID`, [USERID], { maxRows: 100 })
                    connection.close();
                    resolve(data?.rows[0]);
                } catch (error) {
                    if (connection) connection.close();
                    reject(error);
                }
            })
        },

        getAllUser: (parent, args, { pool }) => {
            return new Promise(async (resolve, reject) => {
                let connection;
                try {
                    console.log("----")
                    connection = await pool.getConnection();

                    //sample query 
                    /*  const result = await connection.execute(
                        `SELECT department_id, department_name
                         FROM departments
                         WHERE department_id = :did`,
                        [180],
                        { maxRows: 10 }  // a maximum of 10 rows will be returned
                      );

                    const result = await connection.execute(
                    `SELECT city, postal_code FROM locations`,
                        [], // no bind variables
                        {
                            resultSet: true // return a ResultSet (default is false)
                        }
                     ); */

                    let data = await connection.execute(
                        `SELECT *,rowid FROM users`,
                        [],
                        {
                            extendedMetaData: true,
                            // resultSet: true,
                            // fetchInfo:
                            // {
                            //     "HIRE_DATE": { type: oracledb.STRING },  // return the date as a string
                            //     "COMMISSION_PCT": { type: oracledb.DEFAULT }  // override oracledb.fetchAsString and fetch as native type
                            // },
                            prefetchRows: 0 + 1,
                            fetchArraySize: 10
                        }
                    )
                    console.log("data", data);
                    // Fetch a row from the ResultSet.
                    /*  const rs = data.resultSet;
                        let row, i = 1;
                        while ((row = await rs.getRow())) {
                        console.log("getRow(): row " + i++);
                        console.log(row);
                        }
                    await rs.close(); */

                    // Fetch rows from the ResultSet.
                    /* const rs = data.resultSet;
                    let rows, numRows = 10;
                    do {
                    rows = await rs.getRows(numRows); // get numRows rows at a time
                    if (rows.length > 0) {
                        console.log("getRows(): Got " + rows.length + " rows");
                        console.log(rows);
                    }
                    } while (rows.length === numRows);
                    await rs.close();
                    */

                    /* const rs = data.resultSet;
                    for await (const row of rs) {
                        console.log("*");
                        console.log(row);
                    }
                    await rs.close(); */

                    // get timestemp from db 
                    /*  
                    await connection.execute(`ALTER SESSION SET TIME_ZONE='UTC'`);
                    let result = await connection.execute(`SELECT current_date, current_timestamp FROM DUAL`);
                    console.log("result", result) */


                    // const result = await connection.execute(
                    //     `BEGIN
                    //        myproc(:id, :name, :salary);
                    //      END;`,
                    //     {
                    //         id: 159,
                    //         name: { dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 40 },
                    //         salary: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER }
                    //     }
                    // );
                    // console.log("result.outBinds", result.outBinds);

                    /* const plsql = `
                    DECLARE
                        c1 SYS_REFCURSOR;
                        c2 SYS_REFCURSOR;
                    BEGIN
                        OPEN c1 FOR SELECT USERID FROM USERS;
                        DBMS_SQL.RETURN_RESULT(c1);
                        OPEN C2 FOR SELECT USERNAME FROM USERS;
                        DBMS_SQL.RETURN_RESULT(c2);
                    END;`;
                    let result1 = await connection.execute(plsql);
                    console.log("result1", result1  )
                    console.log("result1.implicitResults",result1.implicitResults); */

                    connection.close();
                    resolve(data.rows);
                } catch (error) {
                    if (connection) connection.close();
                    reject(error);
                }
            })
        },

        getAllUserWithPaginate: (parent, args, { pool }) => {
            return new Promise(async (resolve, reject) => {
                let connection;
                try {
                    let { page, limit, search, sort } = args;
                    connection = await pool.getConnection();
                    let data = await connection.execute(`SELECT * FROM users 
                    WHERE LOWER(USERNAME) LIKE LOWER('%${search}%') 
                    ORDER BY ${sort?.key} ${sort?.order} 
                    OFFSET ${(page - 1) * limit} ROWS 
                    FETCH NEXT ${limit} ROWS ONLY`, [], {})
                    let count = await connection.execute(`SELECT COUNT(*) "Total" FROM users WHERE LOWER(USERNAME) LIKE LOWER('%${search}%')  `, [], {})
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
        createUser: (parent, { input }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                let connection;
                try {
                    connection = await pool.getConnection();
                    let userId = +new Date()
                    let data = await connection.execute(`INSERT INTO users VALUES (:userId,:NAME)`, [userId, input?.NAME], { autoCommit: true });
                    if (data) {
                        // connection.commit();
                        resolve({ USERNAME: input.NAME, USERID: userId });
                    } else reject("Please try again");
                    connection.close();
                } catch (error) {
                    if (connection) connection.close();
                    reject(error);
                }
            })
        },

        insertManyUser: (parent, { input }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                let connection;
                try {
                    connection = await pool.getConnection();
                    const sql = `INSERT INTO USERS VALUES (:a, :b)`;
                    let binds = input.map((val) => {
                        return ({
                            a: nanoid(),
                            b: val.NAME,
                        })
                    })
                    let nameArray = input.map((val) => val.NAME)
                    console.log("binds", binds, nameArray);
                    const options = {
                        // bindDefs: {
                        //     a: { type: oracledb.NUMBER },
                        //     b: { type: oracledb.STRING, maxSize: 20 }
                        // }
                    };
                    // let isMatch = await connection.execute(`SELECT USERNAME from USERS WHERE USERNAME IN :NAME`, [{ NAME: nameArray }])
                    // console.log("isMatch", isMatch);
                    // const result = await connection.executeMany(sql, binds, options);
                    // console.log("result", result); 
                    // console.log(result.rowsAffected);  // 3
                    // if (result.rowsAffected === input.length) {
                    //     resolve(true)
                    //     connection.commit();
                    // } else {
                    //     reject("Please insert again")
                    // }
                    connection.close();
                } catch (error) {
                    if (connection) connection.close();
                    reject(error);
                }
            })
        },

        updateUser: (parent, { input }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                let connection;
                try {
                    connection = await pool.getConnection();
                    let Data = await connection.execute(`UPDATE users SET USERNAME='${input?.NAME}' WHERE USERID= ${input?.USERID}`, [], { autoCommit: true })
                    if (Data) resolve({ USERNAME: input.NAME, USERID: input?.USERID });
                    else reject("Please try again");
                    connection.close();
                } catch (error) {
                    if (connection) connection.close();
                    reject(error);
                }
            })
        },

        deleteUser: (parent, { USERID }, { pool }) => {
            return new Promise(async (resolve, reject) => {
                let connection;
                try {
                    connection = await pool.getConnection();
                    let Data = await connection.execute(`DELETE FROM users WHERE USERID=:USERID`, [USERID], { autoCommit: true })
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