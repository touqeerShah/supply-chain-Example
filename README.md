
# Welcome to  Supply Chain Project Assignment.
### System workflow 
Follow Sequence Diagram show the complete work follow of system how system work and interact with back-end  Blockchain.
  

### Sequence Diagram 
-  System Workflow 
```mermaid

sequenceDiagram

Client->> NodeJS(Server): Clinet send request(post,get)
NodeJS(Server)->>Blockchain :Register User with userd and role
user->>RestrationService:send request for certificate and key(userid,role)
```











#  Generate Intermediate Certificate For CA
> reference link: https://kctheservant.medium.com/two-typical-setups-of-fabric-ca-server-using-a-self-generated-root-ca-or-a-given-intermediate-ca-41b47b2e5614

### Prepare openssl configuration_**
> here we create empty folder and create two files which is used to generate random number
``` sh
cd /tmp  
mkdir gen-ica  
cd gen-icatouch index.txt serial
echo 1000 > serial  
echo 1000 > crlnumber
```	
### Create **ca.cnf** file and copy below line
```sh

# OpenSSL root CA configuration file.

# Copy to `/root/ca/openssl.cnf`.

[ ca ]

# `man ca`

default_ca = CA_default

[ CA_default ]

# Directory and file locations.

dir = .

certs = $dir

crl_dir = $dir

new_certs_dir = $dir

database = $dir/index.txt

serial = $dir/serial

RANDFILE = $dir/.rand

# The root key and root certificate.

private_key = $dir/rca.key

certificate = $dir/rca.cert

# For certificate revocation lists.

crlnumber = $dir/crlnumber

crl = $dir/rca.crl

crl_extensions = crl_ext

default_crl_days = 30

# SHA-1 is deprecated, so use SHA-2 instead.

default_md = sha512

name_opt = ca_default

cert_opt = ca_default

default_days = 375

preserve = no

policy = policy_strict

[ policy_strict ]

# The root CA should only sign intermediate certificates that match.

# See the POLICY FORMAT section of `man ca`.

countryName = match

stateOrProvinceName = match

organizationName = match

localityName = match

organizationalUnitName = optional

commonName = supplied

emailAddress = optional

[ policy_loose ]

# Allow the intermediate CA to sign a more diverse range of certificates.

# See the POLICY FORMAT section of the `ca` man page.

countryName = optional

stateOrProvinceName = optional

localityName = optional

organizationName = optional

organizationalUnitName = optional

commonName = supplied

emailAddress = optional

[ req ]

# Options for the `req` tool (`man req`).

default_bits = 4096

distinguished_name = req_distinguished_name

string_mask = utf8only

# SHA-1 is deprecated, so use SHA-2 instead.

default_md = sha512

# Extension to add when the -x509 option is used.

x509_extensions = v3_ca

[ req_distinguished_name ]

countryName = Country Name (2 letter code)

stateOrProvinceName = State or Province Name

localityName = Locality Name

0.organizationName = Organization Name

organizationalUnitName = Organizational Unit Name

commonName = Common Name

emailAddress = Email Address

# Optionally, specify some defaults.

#countryName_default = [2 letter contry code]

#stateOrProvinceName_default = [State or Province]

#localityName_default = [City or Town]

#0.organizationName_default = [Name of the organization]

#organizationalUnitName_default = [Unit]

#emailAddress_default = [your email address]

[ v3_ca ]

# Extensions for a typical CA (`man x509v3_config`).

subjectKeyIdentifier = hash

authorityKeyIdentifier = keyid:always,issuer

basicConstraints = critical, CA:true

keyUsage = critical, digitalSignature, cRLSign, keyCertSign

[ v3_intermediate_ca ]

# Extensions for a typical intermediate CA (`man x509v3_config`).

subjectKeyIdentifier = hash

authorityKeyIdentifier = keyid:always,issuer

basicConstraints = critical, CA:true, pathlen:0

keyUsage = critical, digitalSignature, cRLSign, keyCertSign

[ usr_cert ]

# Extensions for client certificates (`man x509v3_config`).

basicConstraints = CA:FALSE

nsCertType = client, email

nsComment = "OpenSSL Generated Client Certificate"

subjectKeyIdentifier = hash

authorityKeyIdentifier = keyid,issuer

keyUsage = critical, nonRepudiation, digitalSignature, keyEncipherment

extendedKeyUsage = clientAuth, emailProtection

[ server_cert ]

# Extensions for server certificates (`man x509v3_config`).

basicConstraints = CA:FALSE

nsCertType = server

nsComment = "OpenSSL Generated Server Certificate"

subjectKeyIdentifier = hash

authorityKeyIdentifier = keyid,issuer:always

keyUsage = critical, digitalSignature, keyEncipherment

extendedKeyUsage = serverAuth

[ crl_ext ]

# Extension for CRLs (`man x509v3_config`).

authorityKeyIdentifier=keyid:always

[ ocsp ]

# Extension for OCSP signing certificates (`man ocsp`).

basicConstraints = CA:FALSE

subjectKeyIdentifier = hash

authorityKeyIdentifier = keyid,issuer

keyUsage = critical, digitalSignature

extendedKeyUsage = critical, OCSPSigning
```

### Generate self-signed Root CA_

This involves two steps:

1.  generate a private key for RCA
2.  generate a self-signed certificate from the private key based on the configuration.
``` sh
openssl ecparam -name prime256v1 -genkey -noout -out 
openssl req -config ca.cnf -new -x509 -sha256 -extensions v3_ca -key rca.key -out **rca.cert** -days 3650 -subj "/C=US/ST=North Carolina/L=Durham/O=org1.example.com/CN=ca.org1.example.com"
```
### **_Generate ICA issued by Root CA_**

This involves three steps:

1.  generate a private key for ICA
2.  generate a CSR based on this ICA with proper information
3.  RCA issues certificate to ICA based on the CSR


``` sh
openssl ecparam -name prime256v1 -genkey -noout -out **ica.key**openssl req -new -sha256 -key ica.key -out ica.csr -subj "/C=US/ST=North Carolina/L=Durham/O=org1.example.com/CN=ica.org1.example.com"
openssl ca -batch -config ca.cnf -extensions v3_intermediate_ca -days 365 -notext -md sha256 -in ica.csr -out **ica.cert**

```

### **_Prepare chain of certificates_** 
> copy root and intermediate Certificate into one file
```sh
cat ica.cert rca.cert > **chain.cert**
```
The following files will be later incorporated into Fabric CA Server

-   ICA private key:  **ica.key**
-   ICA certificate:  **ica.cert**
-   Chain of certificate:  **chain.cert**
And we will not work on the Root CA any more. The CA is represented by `ica.key` and `ica.cert`, with the chain of certificates showing the parent certificate(s) up to a root certificate.


# CA (**Certificate Authority**) 

This is very important service in this system whose job is to issue the private and public key of every user in system which help them to do transaction in system.

Following are the steps to setup CA
- Start CA server
``` sh
docker-compose -f docker-compose.yaml up -d ca
```
>This docker-compose also start two other service which we are discus and setup below (Registration Service and Service Provider).

- Run below command for enroll CA server
``` sh 
docker exec ca fabric-ca-client enroll -u https://admin:adminpw@localhost:7054 --caname ca --tls.certfiles /etc/hyperledger/fabric-ca-server/tls-cert.pem
```
>This command will enroll CA service and enroll admin so we will register more users.

### Create Admin Private and public key
> Once CA service is start to interact with CA service from out side world we need Admin Private and public key, which are consume by Registration Service and Service Provider while doing transaction in system.
	 ```sh
	node enrollAdmin.js 
	```  
		>> This file will create new folder name wallet which will contain admin.id(copy this file inside the registration service wallet folder) and admin_pub.txt  (copy this file inside Service provider wallet folder)

 
# Registration Service
This service is used to register new user and issue certificate ,private and public key to the new user and also validate the user signature using public key of user, issue token which is issued which contain the user role which is fetch from CA Server  and encrypted with registration service private key.
> **admin.id** which we copy inside wallet folder is used to register user with CA and also used to issue token.
## Steps to deploy Registration Service
### Build Image
``` sh
docker build -f ./Dockerfiles/DockerfileRegistrationService.alpine -t registration-service:1.0 .
```
> This command will build docker image of registration service

### Start  Registration Service
> Create registration-service-wallet and  Copy admin.id inside it .
``` sh
docker-compose -f docker-compose.yaml up -d registration-service
```
> Service is accessible at port 4000 at localhost.
### API
1. Register User this API is used to register user and return Certificate,Private Key and Public Key you have to store them some where in your system to do transaction.
	 - parameters are
		1.user_id
		2.Role (admin or user))
``` sh
http://localhost:4000/api/registerUser 
```		
2. Get Token this API is used to generate token it will required user signature which validated from its public key and get role from CA and generate Token using admin.id (private key).
	 - parameters are
		1.user_id
		2.Signature (to create Signature follow the steps given below)
		> To generate Signature user will use their private key and message put both of these values inside the   signMessage.js and run the command given below it will return signature which you will pass to registration service to give you token
		```sh
		node signMessage.js
		```
		3.Data	
		> This data will be some as the used to create signature.	
``` sh
http://localhost:4000/api/getToken 
```

### Sequence Diagram 
-  User Registration 
```mermaid

sequenceDiagram

CA->> RestrationService: Return User Certificate and Key
RestrationService->>CA :Register User with userd and role
user->>RestrationService:send request for certificate and key(userid,role)
```
- Generate Signature
```mermaid

sequenceDiagram

user->>generate Signature:generate signature (data,private key)
user->>Registration service:getToken(sign,data,userid)
Registration service->>user: return token
note left of Registration service:register service validate user sign with his public key\n Registration service will request CA fro user Role but the\n CA will not give public key
Registration service->>CA :Request for User Role (user id)
CA->> Registration service:Return user basic information like role,type of user,
```






#  Service Provider
This service is used to verity the token issued by registration service to verify the token it will used admin public key and give access to the user based on their role which is fetch from token.


## Steps to deploy Registration Service
### Build Image
``` sh
docker build -f ./Dockerfiles/DockerfileServiceProvider.alpine -t service-provider:1.0 .
```
> This command will build docker image of registration service

### Start  Registration Service
> Create registration-service-wallet and  Copy admin_pub.txt inside it .
``` sh
docker-compose -f docker-compose.yaml up -d service-provider
```
> Service is accessible at port 3000 at localhost.

### API
1. Verify Token this API is used to verify user token and give access to the user based in the role of the user.
	 - parameters are
		1.user_id
		2.Token 
``` sh
http://localhost:3000/api/verifyToken 
```		

### Sequence Diagram 
-  Verify Token and Get Access based on Role
```mermaid

sequenceDiagram


user->> Service Provider:send request for Data(token,userid)
Service Provider->>user :get Access and data

note right of Service Provider: will validate token from registration service Key,\nget user role and based on the role give access on data
```


## step to test 
- run bash file to generate images
```sh
./build_images.sh
```
- run bash file to start network
```sh
./start_network.sh
```

- run js file to run test case
```sh
node run.js user_id,role

```
> this run.js file create new user, create signature, create token and verify token
