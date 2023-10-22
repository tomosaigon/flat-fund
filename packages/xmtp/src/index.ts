#!/usr/bin/env node

import { botConfig, XmtpBot, IContext } from "xmtp-bot-cli";
import { Client, DecodedMessage, Conversation } from "@xmtp/xmtp-js";

if (process.env.OBOX_XMTP_ENV !== undefined) {
    botConfig.env = process.env.OBOX_XMTP_ENV as typeof botConfig.env;
}
if (process.env.OBOX_XMTP_KEY !== undefined) {
    botConfig.key = process.env.OBOX_XMTP_KEY as typeof botConfig.key;
}

async function handleCommand(ctx: IContext, line: string) {
    if (line === '/exit') {
        return false;
    } else {
        console.log('Invalid command.');
    }
    return true;
}


const subscribers: { [key: string]: Conversation } = {};
const offers: Offer[] = [];
let ID = 0;

interface Offer {
    id: number;
    buyOrSell: boolean; // true for wanting to buy, false for wanting to sell
    maxBaseAmount: number; // uint256
    price: number; // uint256 (in 1e18)
    nonce: number; // uint256
    signature: string; // bytes calldata
}

async function handleMessage(ctx: IContext, message: DecodedMessage) {
    if (ctx.client !== undefined && message.senderAddress === (ctx.client as Client).address) {
        return true;
    }

    console.log(`Incoming message`, message.content, 'from', message.senderAddress);
    const senderAddress = message.senderAddress;
    const convo = message.conversation;
    const contentParts = message.content.split(' ');

    if (contentParts[0].toLowerCase() === 'offer' && contentParts.length >= 5) {
        subscribers[senderAddress] = convo;

        const [action, max, price, nonce, signature] = contentParts.slice(1);

        if (action === 'buy' || action === 'sell') {
            const maxBaseAmount = Number(max);
            const priceAmount = Number(price);
            const nonceAmount = Number(nonce);
            const signatureString = signature;

            const newOffer: Offer = {
                id: ID,
                buyOrSell: action === 'buy',
                maxBaseAmount,
                price: priceAmount,
                nonce: nonceAmount,
                signature: signatureString
            };

            for (const senderAddress of Object.keys(subscribers)) {
                const subscriberConvo = subscribers[senderAddress];
                console.log(`Received an offer - ID: ${ID}, Action: ${action}, Max: ${maxBaseAmount}, Price: ${priceAmount}, Nonce: ${nonceAmount}`);
                await subscriberConvo.send(`offer #${ID} ${action} ${maxBaseAmount} ${priceAmount} ${nonceAmount}`);
            }
            offers.push(newOffer);
            ID++;

        }
    }

    if (contentParts[0].toLowerCase() === 'take' && !isNaN(contentParts[1])) {
        const takeID = Number(contentParts[1]);
        const matchingOffer = offers.find(offer => offer.id === takeID);

        if (matchingOffer) {
            await convo.send(`signature ${takeID} ${matchingOffer.signature}`);
        } else {
            await convo.send(`Offer with ID ${takeID} not found.`);
        }
    }

    if (message.content.toLowerCase() === 'subscribe') {
        subscribers[senderAddress] = convo;
        console.log(`Subscribed sender ${senderAddress} to conversation ${convo}`);
    }

    return true;
}





console.log('Starting bot.');
const bot = new XmtpBot(
    handleCommand,
    handleMessage,
);

bot.run().then(() => {
    process.exit(0);
}).catch((err) => {
    console.error(`bot.run() error: ${err}`);
    process.exit(1);
});
