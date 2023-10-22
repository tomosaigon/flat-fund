#!/usr/bin/env node
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const xmtp_bot_cli_1 = require("xmtp-bot-cli");
if (process.env.OBOX_XMTP_ENV !== undefined) {
    xmtp_bot_cli_1.botConfig.env = process.env.OBOX_XMTP_ENV;
}
if (process.env.OBOX_XMTP_KEY !== undefined) {
    xmtp_bot_cli_1.botConfig.key = process.env.OBOX_XMTP_KEY;
}
function handleCommand(ctx, line) {
    return __awaiter(this, void 0, void 0, function* () {
        if (line === '/exit') {
            return false;
        }
        else {
            console.log('Invalid command.');
        }
        return true;
    });
}
const subscribers = {};
const offers = [];
let ID = 0;
function handleMessage(ctx, message) {
    return __awaiter(this, void 0, void 0, function* () {
        if (ctx.client !== undefined && message.senderAddress === ctx.client.address) {
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
                const newOffer = {
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
                    yield subscriberConvo.send(`offer #${ID} ${action} ${maxBaseAmount} ${priceAmount} ${nonceAmount}`);
                }
                offers.push(newOffer);
                ID++;
            }
        }
        if (contentParts[0].toLowerCase() === 'take' && !isNaN(contentParts[1])) {
            const takeID = Number(contentParts[1]);
            const matchingOffer = offers.find(offer => offer.id === takeID);
            if (matchingOffer) {
                yield convo.send(`signature ${takeID} ${matchingOffer.signature}`);
            }
            else {
                yield convo.send(`Offer with ID ${takeID} not found.`);
            }
        }
        if (message.content.toLowerCase() === 'subscribe') {
            subscribers[senderAddress] = convo;
            console.log(`Subscribed sender ${senderAddress} to conversation ${convo}`);
        }
        return true;
    });
}
console.log('Starting bot.');
const bot = new xmtp_bot_cli_1.XmtpBot(handleCommand, handleMessage);
bot.run().then(() => {
    process.exit(0);
}).catch((err) => {
    console.error(`bot.run() error: ${err}`);
    process.exit(1);
});
