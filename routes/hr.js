var express = require('express');
var router = express.Router();
var estimateController = require('../controllers/estimateController');
var estimate = new estimateController();

var invoiceController = require('../controllers/invoiceController');
var invoice = new invoiceController();

var providentController = require('../controllers/providentController');
var provident = new providentController();

var expenseController = require('../controllers/expenseController');
var expense = new expenseController();

var taxController = require('../controllers/taxController');
var tax = new taxController();

var payrollSalaryController = require('../controllers/payrollSalaryController');
var payrollSalary = new payrollSalaryController();

var payrollItemController = require('../controllers/payrollItemController');
var payrollItem = new payrollItemController();

var policyController = require('../controllers/policyController');
var policy = new policyController();

router.get('/estimate', estimate.getEstimates);
router.get('/estimate/base', estimate.getBaseData);
router.get('/estimate/:id', estimate.getEstimate);
router.post('/estimate', estimate.createEstimate);
router.put('/estimate/:id', estimate.updateEstimate);
router.delete('/estimate/:id', estimate.deleteEstimate);

router.get('/invoice', invoice.getInvoices);
router.get('/invoice/base', invoice.getBaseData);
router.get('/invoice/:id', invoice.getInvoice);
router.post('/invoice', invoice.createInvoice);
router.put('/invoice/:id', invoice.updateInvoice);
router.delete('/invoice/:id', invoice.deleteInvoice);

router.get('/provident', provident.getProvidents);
router.get('/provident/:id', provident.getProvident);
router.post('/provident', provident.createProvident);
router.put('/provident/:id', provident.updateProvident);
router.delete('/provident/:id', provident.deleteProvident);

router.get('/expense', expense.getExpenses);
router.get('/expense/:id', expense.getExpense);
router.post('/expense', expense.createExpense);
router.put('/expense/:id', expense.updateExpense);
router.delete('/expense/:id', expense.deleteExpense);

router.get('/tax', tax.getTaxes);
router.get('/tax/:id', tax.getTax);
router.post('/tax', tax.createTax);
router.put('/tax/:id', tax.updateTax);
router.delete('/tax/:id', tax.deleteTax);

router.get('/payroll-salary', payrollSalary.getPayrollSalaries);
router.get('/payroll-salary/:id', payrollSalary.getPayrollSalary);
router.post('/payroll-salary', payrollSalary.createPayrollSalary);
router.put('/payroll-salary/:id', payrollSalary.updatePayrollSalary);
router.delete('/payroll-salary/:id', payrollSalary.deletePayrollSalary);

router.get('/payroll-item', payrollItem.getPayrollItems);
router.get('/payroll-item/:id', payrollItem.getPayrollItem);
router.post('/payroll-item/:type', payrollItem.createPayrollItem);
router.put('/payroll-item/:id', payrollItem.updatePayrollItem);
router.delete('/payroll-item/:id', payrollItem.deletePayrollItem);

router.get('/policy', policy.getPolicies);
router.get('/policy/:id', policy.getPolicy);
router.post('/policy', policy.createPolicy);
router.put('/policy/:id', policy.updatePolicy);
router.delete('/policy/:id', policy.deletePolicy);

module.exports = router;