const dbConn = require('../util/dbConfig');

const {validationResult} = require('express-validator')
exports.postCheckDetails = async (req, res) => {
    const connection = await dbConn();
    const body = req.body;
    if (!body.chequenumber || !body.chequedate || !body.payeename || !body.bankname || !body.bankcode || !body.amount || !body.amount_in_words || !body.emailAddress) {
        return res.status(400).json({ error: "All fields are required." });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
            msg: error.msg,
            value: error.value
        }));
        return res.status(400).json({ errors: errors.array() });
    }
    const sql = `
        INSERT INTO cheque_book_balaji 
        (cheque_number, cheque_date, payee_name, bank_name, bank_code, amount, amount_in_words, email_address) 
        VALUES (:1, TO_DATE(:2, 'YYYY-MM-DD'), :3, :4, :5, :6, :7, :8)
    `;

    const values = [
        body.chequenumber,
        body.chequedate,
        body.payeename,
        body.bankname,
        body.bankcode,
        body.amount,
        body.amount_in_words,
        body.emailAddress
    ];

    try {
        const result = await connection.execute(sql, values);
        console.log(result.rowsAffected, "Row(s) Inserted");
        connection.commit();
        res.json("Data inserted successfully");
    } catch (error) {
        console.error("Error inserting data:", error.message);
        connection.rollback();
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        connection.release();
    }
};

exports.updateCheckData = async (req, res) => {
    const connection = await dbConn();
    const body = req.body;
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const formattedErrors = errors.array().map(error => ({
            msg: error.msg,
            value: error.value
        }));
        return res.status(400).json({ errors: formattedErrors });
    }

    const updateFields = [];
    const values = [];

    if (body.payeename) {
        updateFields.push('payee_name = :payeename');
        values.push(body.payeename);
    }

    if (body.emailaddress) {
        updateFields.push('email_address = :emailaddress');
        values.push(body.emailaddress);
    }

    if (updateFields.length === 0) {
        return res.status(400).json({ error: "No valid fields to update." });
    }

    const sql = `
        UPDATE cheque_book_balaji
        SET ${updateFields.join(', ')}
        WHERE cheque_number = :cheque_number
    `;

    values.push(body.cheque_number);

    try {
        const result = await connection.execute(sql, values);
        console.log(result.rowsAffected, "Row(s) Updated");
        connection.commit();
        res.json("Data updated successfully");
    } catch (error) {
        console.error("Error updating data:", error.message);
        connection.rollback();
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        connection.release();
    }
};

exports.authorizeRecord = async (req, res) => {
    const connection = await dbConn();
    const checkNumber = req.body.cheque_number;

    const sql = `
        UPDATE cheque_book_balaji
        SET authorized = 'Y'
        WHERE cheque_number = :checkNum
    `;

    try {
        const result = await connection.execute(sql, [checkNumber]);
        console.log(result.rowsAffected, "Record(s) Authorized");
        connection.commit();
        res.json("Record authorized successfully");
    } catch (error) {
        console.error("Error authorizing record:", error);
        connection.rollback();
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        connection.release();
    }
};

exports.deauthorizeRecord = async (req, res) => {
    const connection = await dbConn();
    const checkNumber = req.body.cheque_number;

    const sql = `
        UPDATE cheque_book_balaji
        SET authorized = 'N'
        WHERE cheque_number = :checkNum
    `;

    try {
        const result = await connection.execute(sql, [checkNumber]);
        console.log(result.rowsAffected, "Record(s) Deauthorized");
        connection.commit();
        res.json("Record deauthorized successfully");
    } catch (error) {
        console.error("Error deauthorizing record:", error);
        connection.rollback();
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        connection.release();
    }
};

exports.logPrintAction = async(req,res)=>{
    const connection = await dbConn();
    const {cheque_number,printedby} = req.body
    let checkDuplicate = 'select count(*) as count from chequelog_balaji where cheque_number=:1';

    let updateDuplicate = `update chequelog_balaji set duplicate='Y' where cheque_number=:1`;

    let insertQuery = `insert into chequelog_balaji (cheque_number,printedon,printedby,duplicate) values (:1,SYSDATE,:2,'N')`

    try {
        const result = await connection.execute(checkDuplicate, [cheque_number]);
        let isDuplicate = result.rows[0] > 0;
        console.log(isDuplicate);
        console.log(result.rows[0]);
        if(isDuplicate){
            await connection.execute(updateDuplicate, [cheque_number]);
            console.log('duplicate status updated to Y');
        }
        else{
           let response =  await connection.execute(insertQuery, [cheque_number,printedby]);
            console.log("new entry inserted");
            console.log('rows affected', response.rowsAffected );
        }
        connection.commit();
        res.json("print log successful");
    } catch (error) {
        console.error("", error);
        connection.rollback();
        res.status(500).json({ error: "Internal Server Error" });
    } finally {
        connection.release();
    }
};
