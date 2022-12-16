import { getConnectionDB, getPool } from "./getConnection";

const connectDB = async () => {
    getPool().then(pool => {
        return pool;
    }).catch((err)=>{
        console.log("err", err);
    })
};
export { connectDB };
