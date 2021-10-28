/*
 * Copyright IBM Corp. All Rights Reserved.
 *
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
        const ccpPath = path.resolve(__dirname, '..', 'connection', 'connection-org3.json');
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // Create a new CA client for interacting with the CA.
        const caURL = ccp.certificateAuthorities['ca.interliner.example.com'].url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = await Wallets.newFileSystemWallet(walletPath);
        console.log(`Wallet path: ${walletPath}`);

        // Check to see if we've already enrolled the user.
        const userIdentity = await wallet.get('interliner');
        if (userIdentity) {
            console.log('An identity for the user "interliner" already exists in the wallet');
            return;
        }

        // Check to see if we've already enrolled the admin user.
        const adminIdentity = await wallet.get('adminInterliner');
        if (!adminIdentity) {
            console.log('An identity for the adminInterliner user "adminInterliner" does not exist in the wallet');
            console.log('Run the enrollAdmin.js application before retrying');
            return;
        }

        // build a user object for authenticating with the CA
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'adminInterliner');

        // Register the user, enroll the user, and import the new identity into the wallet.
        const secret = await ca.register({
            affiliation: 'interliner.department1',
            enrollmentID: 'interliner',
            role: 'client',
            attrs: [
                {
                    name: 'UserId',
                    value: 'interliner',
                    ecert: true
                },{
                name: 'Role',
                value: 'Interlining Agent',
                ecert: true
            }]
        }, adminUser);
        const enrollment = await ca.enroll({
            enrollmentID: 'interliner',
            enrollmentSecret: secret
        });

        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
                privateKey: enrollment.key.toBytes(),

            },
            mspId: 'InterlinerMSP',
            type: 'X.509',
        };
        await wallet.put('interliner', x509Identity);
        console.log('Successfully registered and enrolled admin user "interliner" and imported it into the wallet');

    } catch (error) {
        console.error(`Failed to register user "interliner": ${error}`);
        process.exit(1);
    }
}

main();
