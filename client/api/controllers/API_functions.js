// var express = require('express');
// var app = express();
// var bodyParser = require('body-parser');
// var http = require('http')
// var fs = require('fs');
// var Fabric_Client = require('fabric-client');
// var Fabric_CA_Client = require('fabric-ca-client');
// var path = require('path');
// var util = require('util');
// var os = require('os');

const {
  Gateway,
  Wallets
} = require('fabric-network');
const fs = require('fs');
const path = require('path');
'use strict';

module.exports.invoke = function (userid,channel_name, chaincode_name, orgConection, function_name, next_function, ...function_arguments) {

  console.log("function_arguments", function_arguments);
  return_args = {};
  async function main() {
    try {
      // load the network configuration
      const ccpPath = path.resolve(__dirname, '..', '..', '..', 'connection', orgConection);
      let ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

      // Create a new file system based wallet for managing identities.
      const walletPath = path.join(process.cwd(), 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      console.log(`Wallet path: ${walletPath}`);

      // Check to see if we've already enrolled the user.
      const identity = await wallet.get(userid);
      if (!identity) {
        console.log('An identity for the user userid does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return_args.status = 404;
        return_args.message = 'An identity for the user userid does not exist in the wallet'
        next_function(return_args);
        return;
      }

      // Create a new gateway for connecting to our peer node.
      const gateway = new Gateway();
      await gateway.connect(ccp, {
        wallet,
        identity: userid,
        discovery: {
          enabled: true,
          asLocalhost: true
        }
      });

      // Get the network (channel) our contract is deployed to.
      const network = await gateway.getNetwork(channel_name);

      // Get the contract from the network.
      const contract = network.getContract(chaincode_name);

      // Submit the specified transaction.
      // createCar transaction - requires 5 argument, ex: ('createCar', 'CAR12', 'Honda', 'Accord', 'Black', 'Tom')
      // changeCarOwner transaction - requires 2 args , ex: ('changeCarOwner', 'CAR12', 'Dave')
      await contract.submitTransaction(function_name, ...function_arguments);
      console.log('Transaction has been submitted');

      console.log('Transaction has been submitted');
      await gateway.disconnect();

      return_args.status = 200;
      return_args.message = "SUCCESS";
      next_function(return_args); // Disconnect from the gateway.

    } catch (error) {
      console.error(`Failed to submit transaction: ${error}`);
      return_args.status = 404;
      return_args.message = error
      next_function(return_args);
      process.exit(1);
    }
  }

  main();
}

module.exports.query = function (userid,channel_name, chaincode_name, orgConection, function_name, next_function, ...function_arguments) {
  return_args = {};
  /*
   * SPDX-License-Identifier: Apache-2.0
   */


  async function main() {
    try {
      // load the network configuration
      const ccpPath = path.resolve(__dirname, '..', '..', '..', 'connection', orgConection);
      const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

      // Create a new file system based wallet for managing identities.
      const walletPath = path.join(process.cwd(), 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      console.log(`Wallet path: ${walletPath}`);

      // Check to see if we've already enrolled the user.
      const identity = await wallet.get(userid);
      if (!identity) {
        console.log('An identity for the user userid does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
      }

      // Create a new gateway for connecting to our peer node.
      const gateway = new Gateway();
      await gateway.connect(ccp, {
        wallet,
        identity: userid,
        discovery: {
          enabled: true,
          asLocalhost: true
        }
      });

      // Get the network (channel) our contract is deployed to.
      const network = await gateway.getNetwork(channel_name);

      // Get the contract from the network.
      const contract = network.getContract(chaincode_name);

      // Evaluate the specified transaction.
      // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
      // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
      const result = await contract.evaluateTransaction(function_name, ...function_arguments);

      console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

      // Disconnect from the gateway.
      await gateway.disconnect();
      return_args.status = 200;
      return_args.message = "SUCCESS";
      return_args.data = result.toString();
      next_function(return_args);        // Disconnect from the gateway.

    } catch (error) {
      console.error(`Failed to evaluate transaction: ${error}`);

      return_args.status = 400;
      return_args.message = error.toString();
      next_function(return_args);
      process.exit(1);

    }
  }

  main();

}


module.exports.register = function (admin, role, userid, caName, orgConection,affiliation, MSP,next_function) {
  return_args = {};
  /*
   * SPDX-License-Identifier: Apache-2.0
   */


  'use strict';

  const {
    Wallets
  } = require('fabric-network');
  const FabricCAServices = require('fabric-ca-client');
  const fs = require('fs');
  const path = require('path');

  async function main() {
    try {
      // load the network configuration
      const ccpPath = path.resolve(process.cwd(), '..', 'connection', orgConection);
      const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

      // Create a new CA client for interacting with the CA.
      const caURL = ccp.certificateAuthorities[caName].url;
      const ca = new FabricCAServices(caURL);

      // Create a new file system based wallet for managing identities.
      const walletPath = path.join(process.cwd(), 'wallet');
      const wallet = await Wallets.newFileSystemWallet(walletPath);
      console.log(`Wallet path: ${walletPath}`);

      // Check to see if we've already enrolled the user.
      const userIdentity = await wallet.get(userid);
      if (userIdentity) {
        console.log('An identity for the user "system" already exists in the wallet');
        return_args.status = 403;
        return_args.message = 'An identity for the user "system" already exists in the wallet';
        next_function(return_args);
        return;
      }

      // Check to see if we've already enrolled the admin user.
      const adminIdentity = await wallet.get(admin);
      if (!adminIdentity) {
        console.log('An identity for the admin user "admin" does not exist in the wallet');
        console.log('Run the enrollAdmin.js application before retrying');
        return_args.status = 403;
        return_args.message = 'Run the enrollAdmin.js application before retrying';
        next_function(return_args); 
        return;
      }

      // build a user object for authenticating with the CA
      const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
      const adminUser = await provider.getUserContext(adminIdentity, admin);

      // Register the user, enroll the user, and import the new identity into the wallet.
      const secret = await ca.register({
        affiliation: affiliation,
        enrollmentID: userid,
        role: 'client',
        attrs: [{
          name: 'UserId',
          value: userid,
          ecert: true
        },{
          name: 'Role',
          value: role,
          ecert: true
        }]
      }, adminUser);
      const enrollment = await ca.enroll({
        enrollmentID: userid,
        enrollmentSecret: secret
      });

      const x509Identity = {
        credentials: {
          certificate: enrollment.certificate,
          privateKey: enrollment.key.toBytes()
        },
        mspId: MSP,
        type: 'X.509',
      };
      await wallet.put(userid, x509Identity);
      console.log('Successfully registered and enrolled admin user "system" and imported it into the wallet');
      return_args.status = 200;
      return_args.message = "SUCCESS";
      next_function(return_args);        // Disconnect from the gateway.

    } catch (error) {
      console.error(`Failed to register user "system": ${error}`);
      return_args.status = 403;
      return_args.message = error;
      next_function(return_args);        // Disconnect from the gateway.

      process.exit(1);

    }
  }

  main();

}