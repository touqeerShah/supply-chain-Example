set -ex

. ./createChannel.sh


# Bring the test network down
pushd ./artifacts
docker-compose up -d   ca-airline ca-airport ca-interliner
sleep 5
docker-compose up -d    orderer.example.com   orderer2.example.com   orderer3.example.com
sleep 5
docker-compose up -d couchdb0 couchdb1 couchdb2 couchdb3 couchdb4 couchdb5
sleep 3
docker-compose up -d  peer0.airline.example.com peer0.airport.example.com peer0.interliner.example.com
sleep 2
docker-compose up -d peer1.airline.example.com peer1.airport.example.com peer1.interliner.example.com

popd

#
setup_channel
