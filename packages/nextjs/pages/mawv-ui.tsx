import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import React, { useState } from 'react';

interface Token {
  name: string;
  address: string;
}

interface TokenWeight {
  token: Token;
  address: string;
  weight: number;
}

const tokenData = [
  {
    token: "ETH",
    name: "Ethereum",
    address: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
  },
  {
    token: "BTC",
    name: "Bitcoin",
    address: "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41",
  },
  {
    token: "USDT",
    name: "Tether",
    address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  },
];

const SampleComponent: React.FC<{ tokens: Token[] }> = ({ tokens }) => {
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [address, setAddress] = useState<string>('');
  const [tokenWeights, setTokenWeights] = useState<TokenWeight[]>([]);
  const [weight, setWeight] = useState(tokenWeights.length === 0 ? 100 : 0);

  const addTokenWeight = () => {
    if (weight >= 1 && weight <= 10000) {
     let selectedAddress = '';

      if (selectedToken && selectedToken.name !== 'ManualEntry') {
        selectedAddress = selectedToken.address;
      } else {
        selectedAddress = address;
      }

      setTokenWeights([...tokenWeights, { token: selectedToken ? selectedToken : { name: address, address }, weight, address: selectedAddress }]);
      setSelectedToken(null);
      setWeight(100);

      // Only clear the address if the "Enter Address Manually" option is selected
      if (selectedToken?.name === 'ManualEntry') {
        setAddress('');
      }
    }
  };



  const calculateTotalWeight = () => {
    return tokenWeights.reduce((total, tokenWeight) => total + tokenWeight.weight, 0);
  };

  return (
    <div className="p-4 space-y-4"> {/* Add padding and vertical spacing */}
      <form className="space-y-2">
        <div className="space-y-2">
          <label className="block font-semibold">Select Token:</label>
          <select
            className="w-full border p-2"
            value={selectedToken?.name || ''}
            onChange={(e) => {
              const selected = tokens.find((token) => token.name === e.target.value);
              setSelectedToken(selected || null);
            }}
          >
            <option value="">Select a token</option>
            {tokens.map((token) => (
              <option key={token.name} value={token.name}>
                {token.name}
              </option>
            ))}
            <option value="ManualEntry">Enter Address Manually</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="block font-semibold">Address:</label>
          {selectedToken && selectedToken.name !== 'ManualEntry' ? (
            <input
              type="text"
              className="w-full border p-2"
              value={selectedToken.address}
              readOnly
            />
          ) : (
            <input
              type="text"
              className="w-full border p-2"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          )}
        </div>
        <div className="space-y-2">
          <label className="block font-semibold">Weight (1-10000%):</label>
          <input
            type="number"
            className="w-full border p-2"
            value={weight}
            onChange={(e) => {
              const newWeight = Number(e.target.value);
              if (!isNaN(newWeight) && newWeight >= 1 && newWeight <= 10000) {
                if (e.target === document.activeElement && weight !== 100) {
                  setWeight(newWeight);
                } else {
                  // If it's not focused or the default, keep the default weight
                  setWeight(100);
                }
              }
            }}
          />
        </div>
        <button
          type="button"
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-700"
          onClick={addTokenWeight}
        >
          Store Token & Weight
        </button>
      </form>



      <div>
        <table className="w-full border">
          <thead>
            <tr>
              <th className="border p-2">Token</th>
              <th className="border p-2">Weight</th>
              <th className="border p-2">Weight Percentage</th>
            </tr>
          </thead>
          <tbody>
            {tokenWeights.map((tokenWeight, index) => (
              <tr key={index}>
                <td className="border p-2">{tokenWeight.token.name}</td>
                <td className="border p-2">{tokenWeight.weight}</td>
                <td className="border p-2">
                  {((tokenWeight.weight / calculateTotalWeight()) * 100).toFixed(2)}%
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        className="bg-green-500 text-white p-2 rounded hover:bg-green-700"
      >
        Deploy Multi Asset Weighted Vault
      </button>
    </div>
  );

};


const ExampleUI: NextPage = () => {
  return (
    <>
      <MetaHeader
        title="Example UI | Scaffold-ETH 2"
        description="Example UI created with 🏗 Scaffold-ETH 2, showcasing some of its features."
      >
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </MetaHeader>
      <div className="grid lg:grid-cols-2 flex-grow" data-theme="exampleUi">

        <div className="flex flex-col justify-center items-center">
          <SampleComponent tokens={tokenData} />
        </div>
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-6xl font-bold">Example UI</h1>
          <p className="text-xl mt-4">
            This is an example UI created with 🏗 Scaffold-ETH 2, showcasing some of its features.
          </p>
        </div>
      </div>
    </>
  );
};

export default ExampleUI;
