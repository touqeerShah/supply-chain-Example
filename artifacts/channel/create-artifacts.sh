


#Generate Crypto artifactes for organizations
cryptogen generate --config=./crypto-config.yaml --output=./crypto-config/



# System channel
SYS_CHANNEL="sys-channel"

# channel name defaults to "Interliner"
CHANNEL_NAME="interlinerchannel"

echo $CHANNEL_NAME

# Generate System Genesis block
configtxgen -profile OrdererGenesis -configPath . -channelID $SYS_CHANNEL  -outputBlock ./genesis.block


# Generate channel configuration block
configtxgen -profile BasicChannel -configPath . -outputCreateChannelTx ./interlinerchannel.tx -channelID $CHANNEL_NAME

echo "#######    Generating anchor peer update for AirlineMSP  ##########"
configtxgen -profile BasicChannel -configPath . -outputAnchorPeersUpdate ./AirlineMSPanchors.tx -channelID $CHANNEL_NAME -asOrg AirlineMSP

echo "#######    Generating anchor peer update for AirportMSP  ##########"
configtxgen -profile BasicChannel -configPath . -outputAnchorPeersUpdate ./AirportMSPanchors.tx -channelID $CHANNEL_NAME -asOrg AirportMSP
echo "#######    Generating anchor peer update for InterlinerMSP  ##########"
configtxgen -profile BasicChannel -configPath . -outputAnchorPeersUpdate ./InterlinerMSPanchors.tx -channelID $CHANNEL_NAME -asOrg InterlinerMSP