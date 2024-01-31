const express = require('express');

const {body} = require('express-validator');

const router = express.Router();

const chequeController = require('../controllers/cheque');

var validationArr = [
    body('chequenumber').notEmpty().isNumeric(),
    body('chequedate').notEmpty().isISO8601(),
    body('payeename').notEmpty(),
    body('bankname').notEmpty(),
    body('bankcode').notEmpty(),
    body('amount').notEmpty().isNumeric(),
    body('amount_in_words').notEmpty(),
    body('emailAddress').notEmpty().isEmail()
];
var updateValidation = [
    body('payeename').optional(),
    body('emailaddress').optional().isEmail()
]

router.post('/uploadData',validationArr,chequeController.postCheckDetails);
router.post('/updateData',updateValidation,chequeController.updateCheckData);
router.post('/authorizeData',chequeController.authorizeRecord);
router.post('/deauthorizeData',chequeController.deauthorizeRecord);
router.post('/logprintdata',chequeController.logPrintAction);


module.exports = router;