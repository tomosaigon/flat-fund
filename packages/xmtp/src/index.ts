#!/usr/bin/env node

import { botConfig, XmtpBot, IContext } from "xmtp-bot-cli";
import { Client, DecodedMessage } from "@xmtp/xmtp-js";

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

async function handleMessage(ctx: IContext, message: DecodedMessage) {
    if (ctx.client !== undefined && message.senderAddress === (ctx.client as Client).address) {
        return true;
    }

    console.log(`Incoming message`, message.content, 'from', message.senderAddress);
    const senderAddress = message.senderAddress;

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
