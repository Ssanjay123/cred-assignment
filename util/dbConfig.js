const oracledb = require('oracledb');
async function connectDB(){
    let connection;
    try {
        connection = await oracledb.getConnection({
           user:"mfx_training",
           password:"mfx_training",
           connectionString:"mercuryfx.chwkrfaqj9m1.ap-south-1.rds.amazonaws.com:1521/orcl"
        })
        console.log("connected to oracle");
        return connection;
    } catch (error) {
        console.log(error);
    }

}

module.exports = connectDB;