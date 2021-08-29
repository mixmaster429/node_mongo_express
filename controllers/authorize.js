var ApiContracts = require('authorizenet').APIContracts;
var ApiControllers = require('authorizenet').APIControllers;
var SDKConstants = require('authorizenet').Constants;

var AccountModel = require('../models/account');
var TransactionModel = require('../models/transaction');
const { saveActivity } = require('./activityUtil');
class AuthorizePayment {
    async chargeCreditCard(req, res) {
        let { user_id, user_name,owner_id } = req.headers
        let data = req.body

        let account = await AccountModel.findOne({user_id: user_id})
        if(!account) {
            console.log('no account')
            res.json({status: false, error: 'no account'})
            return
        }

        var merchantAuthenticationType = new ApiContracts.MerchantAuthenticationType();
        merchantAuthenticationType.setName(account.app_log_id);
        merchantAuthenticationType.setTransactionKey(account.transaction_key);
    
        var creditCard = new ApiContracts.CreditCardType();
        creditCard.setCardNumber(data.card_number);
        creditCard.setExpirationDate(data.expire_date);
        creditCard.setCardCode(data.cvc);
    
        var paymentType = new ApiContracts.PaymentType();
        paymentType.setCreditCard(creditCard);
    
        // var orderDetails = new ApiContracts.OrderType();
        // orderDetails.setInvoiceNumber('INV-12345');
        // orderDetails.setDescription('Book Payment');
    
        // var tax = new ApiContracts.ExtendedAmountType();
        // tax.setAmount('4.26');
        // tax.setName('level2 tax name');
        // tax.setDescription('level2 tax');
    
        // var duty = new ApiContracts.ExtendedAmountType();
        // duty.setAmount('8.55');
        // duty.setName('duty name');
        // duty.setDescription('duty description');
    
        // var shipping = new ApiContracts.ExtendedAmountType();
        // shipping.setAmount('8.55');
        // shipping.setName('shipping name');
        // shipping.setDescription('shipping description');
    
        var billTo = new ApiContracts.CustomerAddressType();
        billTo.setFirstName(data.bill_first_name);
        billTo.setLastName(data.bill_last_name);
        billTo.setCompany(data.bill_company);
        billTo.setAddress(data.bill_address);
        billTo.setCity(data.bill_city);
        billTo.setState(data.bill_state);
        billTo.setZip(data.bill_zip_code);
        billTo.setCountry(data.bill_country);
        billTo.setCountry(data.bill_phone);
        billTo.setCountry(data.bill_fax);
    
        // var shipTo = new ApiContracts.CustomerAddressType();
        // shipTo.setFirstName('China');
        // shipTo.setLastName('Bayles');
        // shipTo.setCompany('Thyme for Tea');
        // shipTo.setAddress('12 Main Street');
        // shipTo.setCity('Pecan Springs');
        // shipTo.setState('TX');
        // shipTo.setZip('44628');
        // shipTo.setCountry('USA');
        
        let lineItemList = [];
        let totalAmount = 0;
        for(let i = 0;i < data.items.length;i++) {
            let lineItem = new ApiContracts.LineItemType();
            lineItem.setItemId(data.items[i]._id);
            lineItem.setName(data.items[i].title);
            lineItem.setDescription(data.items[i].description);
            lineItem.setQuantity(1);
            lineItem.setUnitPrice(data.items[i].price);
            totalAmount += data.items[i].price
            lineItemList.push(lineItem);
        }
    
        let lineItems = new ApiContracts.ArrayOfLineItem();
        lineItems.setLineItem(lineItemList);
    
    
        // let transactionSetting1 = new ApiContracts.SettingType();
        // transactionSetting1.setSettingName('duplicateWindow');
        // transactionSetting1.setSettingValue('120');
    
        // let transactionSetting2 = new ApiContracts.SettingType();
        // transactionSetting2.setSettingName('recurringBilling');
        // transactionSetting2.setSettingValue('false');
    
        // let transactionSettingList = [];
        // transactionSettingList.push(transactionSetting1);
        // transactionSettingList.push(transactionSetting2);
    
        // let transactionSettings = new ApiContracts.ArrayOfSetting();
        // transactionSettings.setSetting(transactionSettingList);
    
        let transactionRequestType = new ApiContracts.TransactionRequestType();
        transactionRequestType.setTransactionType(ApiContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
        transactionRequestType.setPayment(paymentType);
        transactionRequestType.setAmount(totalAmount);
        transactionRequestType.setLineItems(lineItems);
        // transactionRequestType.setOrder(orderDetails);
        // transactionRequestType.setTax(tax);
        // transactionRequestType.setDuty(duty);
        // transactionRequestType.setShipping(shipping);
        transactionRequestType.setBillTo(billTo);
        // transactionRequestType.setShipTo(shipTo);
        // transactionRequestType.setTransactionSettings(transactionSettings);
    
        let createRequest = new ApiContracts.CreateTransactionRequest();
        createRequest.setMerchantAuthentication(merchantAuthenticationType);
        createRequest.setTransactionRequest(transactionRequestType);
    
        //pretty print request
        console.log(JSON.stringify(createRequest.getJSON(), null, 2));
            
        let ctrl = new ApiControllers.CreateTransactionController(createRequest.getJSON());
        //Defaults to sandbox
        //ctrl.setEnvironment(SDKConstants.endpoint.production);
    
        ctrl.execute(()=>{
    
            let apiResponse = ctrl.getResponse();
    
            let response = new ApiContracts.CreateTransactionResponse(apiResponse);
    
            //pretty print response
            console.log(JSON.stringify(response, null, 2));
    
            if(response != null){
                if(response.getMessages().getResultCode() == ApiContracts.MessageTypeEnum.OK){
                    if(response.getTransactionResponse().getMessages() != null){
                        console.log('Successfully created transaction with Transaction ID: ' + response.getTransactionResponse().getTransId());
                        console.log('Response Code: ' + response.getTransactionResponse().getResponseCode());
                        console.log('Message Code: ' + response.getTransactionResponse().getMessages().getMessage()[0].getCode());
                        console.log('Description: ' + response.getTransactionResponse().getMessages().getMessage()[0].getDescription());
                        

                        let saveData = []
                        for(let i = 0; i < data.items.length;i++) {
                            saveData.push({
                                buyer: {
                                    user_id: user_id,
                                    user_name: user_name
                                },
                                seller: data.items[i].created_by.user_id,
                                item_id: data.items[i]._id,
                                title: data.items[i].title,
                                price: data.items[i].price,
                                created_at: Date.now()
                            })
                        }
                        TransactionModel.insertMany(saveData)
                        saveActivity(user_id, user_name, "Transaction", "New Transaction has been created.", "Created");
                        res.json({status:true ,result: response});
                    }
                    else {
                        console.log('Failed Transaction.');
                        if(response.getTransactionResponse().getErrors() != null){
                            console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
                            console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
                        }
                        res.json({status:false ,error: 'Failed Transaction.'});
                    }
                }
                else {
                    console.log('Failed Transaction. ');
                    if(response.getTransactionResponse() != null && response.getTransactionResponse().getErrors() != null){
                    
                        console.log('Error Code: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorCode());
                        console.log('Error message: ' + response.getTransactionResponse().getErrors().getError()[0].getErrorText());
                    }
                    else {
                        console.log('Error Code: ' + response.getMessages().getMessage()[0].getCode());
                        console.log('Error message: ' + response.getMessages().getMessage()[0].getText());
                    }
                    res.json({status:false ,error: 'Failed Transaction.'});
                }
            }
            else {
                console.log('Null Response.');
                res.json({status:false ,error: 'Null Response.'});
            }
    
        });
    }
}


module.exports = AuthorizePayment;