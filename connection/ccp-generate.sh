#!/bin/bash

function one_line_pem {
    echo "`awk 'NF {sub(/\\n/, ""); printf "%s\\\\\\\n",$0;}' $1`"
}

function json_ccp {
    local PP=$(one_line_pem $5)
    local CP=$(one_line_pem $6)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${P1PORT}/$3/" \
        -e "s/\${CAPORT}/$4/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        ccp-template.json
}

function json_ccp1 {
    local PP=$(one_line_pem $5)
    local CP=$(one_line_pem $6)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${P1PORT}/$3/" \
        -e "s/\${CAPORT}/$4/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        ccp-template1.json
}

function json_ccp2 {
    local PP=$(one_line_pem $5)
    local CP=$(one_line_pem $6)
    sed -e "s/\${ORG}/$1/" \
        -e "s/\${P0PORT}/$2/" \
        -e "s/\${P1PORT}/$3/" \
        -e "s/\${CAPORT}/$4/" \
        -e "s#\${PEERPEM}#$PP#" \
        -e "s#\${CAPEM}#$CP#" \
        ccp-template2.json
}


ORG=1
P0PORT=7051
P1PORT=8051
CAPORT=7054
PEERPEM=../artifacts/channel/crypto-config/peerOrganizations/airline.example.com/tlsca/tlsca.airline.example.com-cert.pem
CAPEM=../artifacts/channel/crypto-config/peerOrganizations/airline.example.com/ca/ca.airline.example.com-cert.pem

echo "$(json_ccp1 $ORG $P0PORT $P1PORT $CAPORT $PEERPEM $CAPEM)" > connection-org1.json

ORG=2
P0PORT=9051
P1PORT=10051
CAPORT=8054
PEERPEM=../artifacts/channel/crypto-config/peerOrganizations/airport.example.com/tlsca/tlsca.airport.example.com-cert.pem
CAPEM=../artifacts/channel/crypto-config/peerOrganizations/airport.example.com/ca/ca.airport.example.com-cert.pem

echo "$(json_ccp2 $ORG $P0PORT $P1PORT $CAPORT $PEERPEM $CAPEM)" > connection-org2.json



ORG=2
P0PORT=11051
P1PORT=12051
CAPORT=9054
PEERPEM=../artifacts/channel/crypto-config/peerOrganizations/interliner.example.com/tlsca/tlsca.interliner.example.com-cert.pem
CAPEM=../artifacts/channel/crypto-config/peerOrganizations/interliner.example.com/ca/ca.interliner.example.com-cert.pem

echo "$(json_ccp $ORG $P0PORT $P1PORT $CAPORT $PEERPEM $CAPEM)" > connection-org3.json
