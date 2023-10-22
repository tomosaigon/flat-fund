import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { ContractData } from "~~/components/example-ui/ContractData";
import { ContractInteraction } from "~~/components/example-ui/ContractInteraction";
import { Wallet } from "ethers";
import { formatEther, parseEther } from 'viem'
import { Client, Conversation } from "@xmtp/xmtp-js";
import React, { useState, useEffect } from "react";
import { toast } from 'react-toastify';

interface HistoricalTrade {
  buyOrSell: boolean;
  baseAmount: number;
  price: number;
  date: string; // or Date
}
const historicalTrades = [
  {
    buyOrSell: true, // Buy
    baseAmount: 100,
    price: 50,
    date: '2023-10-22 10:30:00',
  },
  {
    buyOrSell: true, // Buy
    baseAmount: 75,
    price: 55,
    date: '2023-10-21 11:15:00',
  },
  {
    buyOrSell: false, // Sell
    baseAmount: 120,
    price: 48,
    date: '2023-10-20 12:45:00',
  },
  {
    buyOrSell: true, // Buy
    baseAmount: 90,
    price: 60,
    date: '2023-10-19 14:20:00',
  },
  {
    buyOrSell: true, // Buy
    baseAmount: 150,
    price: 52,
    date: '2023-10-18 15:05:00',
  },
  {
    buyOrSell: false, // Sell
    baseAmount: 80,
    price: 58,
    date: '2023-10-17 16:40:00',
  },
  {
    buyOrSell: true, // Buy
    baseAmount: 110,
    price: 51,
    date: '2023-10-16 18:10:00',
  },
  {
    buyOrSell: false, // Sell
    baseAmount: 70,
    price: 56,
    date: '2023-10-15 20:25:00',
  },
  {
    buyOrSell: true, // Buy
    baseAmount: 130,
    price: 49,
    date: '2023-10-14 22:35:00',
  },
  {
    buyOrSell: false, // Sell
    baseAmount: 85,
    price: 57,
    date: '2023-10-13 23:45:00',
  },
];

interface Offer {
  id: number;
  buyOrSell: boolean; // true for wanting to buy, false for wanting to sell
  maxBaseAmount: number; // uint256
  price: number; // uint256 (in 1e18)
  nonce: number; // uint256
  signature: string; // bytes calldata
}
const mockOffers = [
  {
    id: 1,
    buyOrSell: true, // Buy
    maxBaseAmount: 100,
    price: 1000000000000000000, // 1 ETH in 1e18
    nonce: 1,
    signature: '0xabcdef1234567890',
  },
  {
    id: 2,
    buyOrSell: false, // Sell
    maxBaseAmount: 75,
    price: 950000000000000000, // 0.95 ETH in 1e18
    nonce: 2,
    signature: '0x1234567890abcdef',
  },
  {
    id: 3,
    buyOrSell: true, // Buy
    maxBaseAmount: 120,
    price: 800000000000000000, // 0.8 ETH in 1e18
    nonce: 3,
    signature: '0x67890abcdef12345',
  },
  {
    id: 4,
    buyOrSell: false, // Sell
    maxBaseAmount: 90,
    price: 850000000000000000, // 0.85 ETH in 1e18
    nonce: 4,
    signature: '0x4567890abcdef123',
  },
  {
    id: 5,
    buyOrSell: true, // Buy
    maxBaseAmount: 150,
    price: 700000000000000000, // 0.7 ETH in 1e18
    nonce: 5,
    signature: '0x90abcdef12345678',
  },
];



interface OBOXProps {
  offers: Offer[];
  makeOffer: (buyOrSell: boolean, maxBaseAmount: bigint, price: bigint) => void;
}

const OBOX: React.FC<OBOXProps> = ({ offers, makeOffer }) => {
  const [baseAmount, setBaseAmount] = useState<bigint>(parseEther('1337'));
  // const [quoteAmount, setQuoteAmount] = useState<bigint>(0);
  const [price, setPrice] = useState<bigint>(parseEther('4.20'));
  const [buyOrSell, setBuyOrSell] = useState<string>('buy');

  const handleMakeOffer = () => {
    if (buyOrSell === 'buy') {
      makeOffer(true, baseAmount, price);
    } else if (buyOrSell === 'sell') {
      makeOffer(false, baseAmount, price);
    }
  };
  const handleTakeOffer = (id: number) => {
    console.log(`Taking offer with id ${id}`);
  };


  return (
    <>


      <div className="bg-yellow-200 p-4 rounded-lg m-16">
        {/* Input Form */}
        <h3 className="text-xl font-bold mb-2">Make offer</h3>
        <form>
          <div className="mb-4">
            <select
              value={buyOrSell}
              onChange={(e) => setBuyOrSell(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Buy/Sell</option>
              <option value="buy">Buy</option>
              <option value="sell">Sell</option>
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="baseAmount">Base Amount:</label>
            <input
              type="number"
              id="baseAmount"
              placeholder="Enter Base Amount"
              value={formatEther(baseAmount)}
              onChange={(e) => setBaseAmount(parseEther(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="mb-4">
            <label htmlFor="price">Price:</label>
            <input
              type="number"
              id="price"
              placeholder="Enter Price"
              value={formatEther(price)}
              onChange={(e) => setPrice(parseEther(e.target.value))}
              className="w-full p-2 border rounded"
            />
          </div>


          <button
            type="button"
            onClick={handleMakeOffer}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
          >
            Make Offer
          </button>
        </form>
      </div>



      <div className="bg-green-200 p-4 rounded-lg mt-4">
        {/* Order Book */}
        <h3 className="text-xl font-bold mb-2">Order Book</h3>
        {offers.map((offer) => (
          <div key={offer.id} className="mb-4">
            <div className="p-2 inline-block">
              <button
                onClick={() => handleTakeOffer(offer.id)}
                className="bg-blue-500 text-white font-bold p-2 rounded"
              >
                Take Offer
              </button>
            </div>
            <div className="border border-gray-500 p-2 inline-block">
              <span>{offer.id.toString().padStart(4, '0')} </span>
            </div>
            <span> <strong>{offer.buyOrSell ? 'Buy' : 'Sell'}</strong> </span>
            <span>up to {offer.maxBaseAmount / 1e18} <code>flatBREAD-1123</code> </span>
            <span>at {offer.price / 1e18} <code>USDC</code></span>
            {/* <span>Nonce: {offer.nonce}</span> */}
            {/* <span>Signature: {offer.signature}</span> */}
          </div>
        ))}


      </div>

    </>
  );
};

const OBOXUI: NextPage = () => {
  const [client, setClient] = useState<Client>();
  const [wallet, setWallet] = useState<Wallet>();
  const [address, setAddress] = useState<string>();
  const [offers, setOffers] = useState<Offer[]>(mockOffers);
  const [oboxConversation, setOboxConversation] = useState<Conversation | null>(null);

  const makeOffer = (buyOrSell: boolean, maxBaseAmount: bigint, price: bigint) => {
    const nonce = Math.floor(Date.now() / 1000);

    oboxConversation?.send(`offer ${buyOrSell ? 'buy' : 'sell'} ${maxBaseAmount.toString()} ${price.toString()} ${nonce} 0x123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef01`);
  }

  useEffect(() => {
    (async () => {
      // const client = new Client();
      // setClient(client);
      let xmtpPrivKey = localStorage.getItem("xmtpPrivKey");
      let wallet;
      if (xmtpPrivKey) {
        wallet = new Wallet(xmtpPrivKey);
      } else {
        wallet = Wallet.createRandom();
        localStorage.setItem("xmtpPrivKey", wallet.privateKey);
      }
      setWallet(wallet);
      setAddress(wallet.address);

      // const xmtp = await Client.create(wallet, { env: "dev" });
      const xmtp = await Client.create(wallet, { env: "production" });
      console.log("Client created", xmtp.address);

      const oboxAddr = '0x59f71427979105DBcD0FAe27845dee2441B37c6C';
      const isOnProdNetwork = await xmtp.canMessage(oboxAddr);
      console.log("Can message: " + isOnProdNetwork);
      const conversation = await xmtp.conversations.newConversation(oboxAddr);
      console.log("Conversation created", conversation);
      setOboxConversation(conversation);
      // const message = await conversation.send("gm");
      const message = await conversation.send("subscribe");
      console.log("Message sent", message);
      // debugger;
      const seenMessages: Record<string, boolean> = {};
      for await (const message of await xmtp.conversations.streamAllMessages()) {
        if (seenMessages[message.id]) {
          console.log(`Message with ID ${message.id} has already been seen.`);
          continue; // Skip this message
        }

        seenMessages[message.id] = true;
        console.log("New message ", message);
        console.log(`New message from ${message.senderAddress}: ${message.content}`);

        if (message.senderAddress === oboxAddr && message.content) {
          const contentParts = message.content.split(' ');

          if (contentParts.length >= 6 && contentParts[0] === 'offer' && contentParts[1].startsWith('#')) {
            const potentialID = parseInt(contentParts[1].substring(1), 10);

            if (!isNaN(potentialID)) {
              const receivedOfferID = parseInt(contentParts[1].substring(1), 10); // Parse the ID
              const action = contentParts[2];
              const maxBaseAmount = contentParts[3];
              const priceAmount = contentParts[4];
              const nonceAmount = contentParts[5];

              console.log(`Received an offer - ID: ${receivedOfferID}, Action: ${action}, Max: ${maxBaseAmount}, Price: ${priceAmount}, Nonce: ${nonceAmount}`);
              toast.success(`Received an offer - ID: ${receivedOfferID}, Action: ${action}, Max: ${maxBaseAmount}, Price: ${priceAmount}, Nonce: ${nonceAmount}`);

              const newOffer = {
                id: receivedOfferID,
                buyOrSell: action === 'buy',
                maxBaseAmount: Number(maxBaseAmount),
                price: Number(priceAmount),
                nonce: Number(nonceAmount),
                signature: ''
              };

              setOffers(prevOffers => [...prevOffers, newOffer]);
            }
          }
        }
      }

    })();
  }, []);

  return (
    <>
      <MetaHeader
        title="OBOX UI"
        description="o.b.o.x."
      >
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </MetaHeader>
      <div className="grid lg:grid-cols-2 flex-grow" data-theme="exampleUi">
        <div className="bg-white mb-1 p-16">
          <h2 className="text-2xl font-bold mb-4">Order Book over Xmtp</h2>
          <div className="flex mb-4">
            <div className="w-4/4">
              The Order Book Over XMTP is a novel trading interface built on EVM and XMTP.
              Unlike traditional Automated Market Makers (AMMs) such as Uniswap, the Order Book eliminates
              the need for liquidity providers risking deep impermanent loss.
            </div>
            <div className="w-4/4 pr-4">
              <ul>
                <li className="mb-2">
                  <span className="font-semibold">Consignment Address:</span>{' '}
                  <code>0xDf8EC3c1BBd18cF04af2fdBa7a210AeEC374925a</code>
                </li>
                <li className="mb-2">
                  <span className="font-semibold">Base Currency:</span> <code>flatBREAD-1123</code>
                </li>
                <li className="mb-2">
                  <span className="font-semibold">Quote Currency:</span> <code>USDC</code>
                </li>
                <li className="mb-2">
                  <span className="font-semibold">Chain:</span> <code>Polygon</code>
                </li>
              </ul>
            </div>
          </div>
        </div>



        <div className="bg-black text-white p-4 rounded-lg">
          {/* Historical Trades Table */}
          <h3 className="text-xl font-bold mb-2">Historical Trades</h3>
          <table className="w-full table-auto">
            <thead>
              <tr>
                <th className="text-left">Date</th>
                <th className="text-left">Buy/Sell</th>
                <th className="text-left">Base Amount</th>
                <th className="text-left">Price</th>
              </tr>
            </thead>
            <tbody>
              {historicalTrades.map((trade, index) => (
                <tr key={index}>
                  <td>{trade.date}</td>
                  <td>{trade.buyOrSell ? 'Buy' : 'Sell'}</td>
                  <td>{trade.baseAmount}</td>
                  <td>{trade.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 flex-grow" data-theme="exampleUi">
        <OBOX offers={offers} makeOffer={makeOffer} />
      </div>
    </>
  );
};

export default OBOXUI;
