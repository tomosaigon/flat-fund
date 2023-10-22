import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import React, { useEffect, useState } from 'react';
import { usePublicClient } from "wagmi";
import scaffoldConfig from "~~/scaffold.config";
import { Contract, ContractCodeStatus, ContractName, contracts } from "~~/utils/scaffold-eth/contract";
import { useDeployedContractInfo, useScaffoldContractWrite, useNetworkColor } from "~~/hooks/scaffold-eth";
import { useContractWrite, usePrepareContractWrite, useContractRead, useNetwork } from "wagmi";
import * as LongShortPair from "../node_modules/@uma/core/artifacts/contracts/financial-templates/long-short-pair/LongShortPair.sol/LongShortPair.json";
import { polygonMumbai } from 'viem/chains';
import { createPublicClient, createWalletClient, http, custom, ReadContractParameters } from 'viem';

const ERC20abi = [{ "inputs": [{ "internalType": "string", "name": "name", "type": "string" }, { "internalType": "string", "name": "symbol", "type": "string" }, { "internalType": "uint8", "name": "decimals", "type": "uint8" }], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "spender", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": false, "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "spender", "type": "address" }], "name": "allowance", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "approve", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "account", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "decimals", "outputs": [{ "internalType": "uint8", "name": "", "type": "uint8" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "subtractedValue", "type": "uint256" }], "name": "decreaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "spender", "type": "address" }, { "internalType": "uint256", "name": "addedValue", "type": "uint256" }], "name": "increaseAllowance", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "value", "type": "uint256" }], "name": "mint", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transfer", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "sender", "type": "address" }, { "internalType": "address", "name": "recipient", "type": "address" }, { "internalType": "uint256", "name": "amount", "type": "uint256" }], "name": "transferFrom", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "nonpayable", "type": "function" }];

interface TokenFetchingComponentProps {
  setTokenAddresses: React.Dispatch<React.SetStateAction<string[]>>;
  setTokenNames: React.Dispatch<React.SetStateAction<string[]>>;
}

function TokenFetchingComponent({
  setTokenAddresses,
  setTokenNames,
}: TokenFetchingComponentProps) {
  // const [tokenAddresses, setTokenAddresses] = useState([] as string[]);
  // const [tokenNames, setTokenNames] = useState([] as string[]);
  const publicClient = usePublicClient({ chainId: scaffoldConfig.targetNetwork.id });
  const { data: deployedContractData, isLoading: deployedContractLoading } = useDeployedContractInfo('PipRegistry');

  useEffect(() => {
    if (deployedContractLoading) return;
    if (deployedContractData === undefined) return;
    // PipRegistry
    const fetchData = async () => {
      let _addresses = [] as string[];
      let _names = [] as string[];
      const whitelistLength = await publicClient.readContract({
        address: deployedContractData.address,
        abi: deployedContractData.abi,
        functionName: 'getWhitelistLength',
        args: []
      })
      // debugger
      if (typeof whitelistLength !== 'bigint' || whitelistLength === 0n) {
        console.log('No whitelist length');
        return;
      }
      // loop through whitelist
      for (let i = 0; i < whitelistLength; i++) {
        const lastPipAddress = await publicClient.readContract({
          address: deployedContractData.address,
          abi: deployedContractData.abi,
          functionName: 'getAddress',
          // args: [-1n + whitelistLength as bigint]
          args: [i]
        })
        if (typeof lastPipAddress !== 'string' || lastPipAddress === '') {
          console.log('No address');
          return;
        }
        const pairName = await publicClient.readContract({
          address: lastPipAddress,
          abi: LongShortPair.abi,
          functionName: 'pairName',
          args: []
        })
        const longToken = await publicClient.readContract({
          address: lastPipAddress,
          abi: LongShortPair.abi,
          functionName: 'longToken',
          args: []
        })
        if (typeof longToken !== 'string' || longToken === '') {
          console.log('No longToken address');
          return;
        }
        const longName = await publicClient.readContract({
          address: longToken,
          abi: ERC20abi,
          functionName: 'name',
          args: []
        })
        if (typeof longName !== 'string' || longToken === '') {
          console.log('No longName');
          return;
        }
        const longSymbol = await publicClient.readContract({
          address: longToken,
          abi: ERC20abi,
          functionName: 'symbol',
          args: []
        })
        if (!_addresses.includes(longToken)) {
          _addresses.push(longToken);
          _names.push(longName);
        }
        // debugger
      }
      setTokenAddresses(_addresses);
      setTokenNames(_names);
    };

    fetchData();
  }, [deployedContractData, deployedContractLoading]);

  return (
    <div>
      {deployedContractLoading ? (
        <p>Loading...</p>
      ) : (
        <p>Contract Address: {deployedContractData?.address}
          {/* {JSON.stringify(deployedContractData)} */}
        </p>
        // <ul>
        //   {tokenAddresses.map((address, index) => (
        //     <li key={index}>{address}</li>
        //   ))}
        // </ul>
      )}
    </div>
  );
}



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
    name: "WETH",
    // name: "Ethereum",
    address: "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41",
  },
  {
    name: "WBTC",
    // name: "Bitcoin",
    address: "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41",
  },
  {
    name: "USDT",
    // name: "Tether",
    address: "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41",
  },
];

const DefineMawv: React.FC<{ contractMultiAssetWeightedVaultFactory: any }> = ({ contractMultiAssetWeightedVaultFactory }) => {
  const [basketName, setBasketName] = useState('Food Basket 1123');
  const [basketSymbol, setBasketSymbol] = useState('fl_tFOOD1123');

  const [tokenAddresses, setTokenAddresses] = useState([] as string[]);
  const [tokenNames, setTokenNames] = useState([] as string[]);
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [address, setAddress] = useState<string>('');
  const [tokenWeights, setTokenWeights] = useState<TokenWeight[]>([]);
  const [weight, setWeight] = useState(tokenWeights.length === 0 ? 100 : 0);

  const tokens = tokenData.concat(tokenNames
    .map((name, index) => ({ name, address: tokenAddresses[index] })));

  console.log('tokens', contractMultiAssetWeightedVaultFactory.address);
  console.log('tokens', tokenWeights.map((tokenWeight) => tokenWeight.address));

  const { chain, chains } = useNetwork();
  const publicClient = usePublicClient({ chainId: scaffoldConfig.targetNetwork.id });
  // const publicClient = createPublicClient({
  //   chain: polygonMumbai,
  //   transport: http('https://rpc-mumbai.maticvigil.com/v1'),
  // })
  // const publicClient = usePublicClient({ chainId: chain.chainId });
  useEffect(() => {
    if (tokenWeights.length == 0) return;
    (async () => {
      const { request } = await publicClient.simulateContract({
        address: contractMultiAssetWeightedVaultFactory.address,
        abi: contractMultiAssetWeightedVaultFactory.abi,
    // functionName: 'foo',
        functionName: 'createVault',
        args: [
          tokenWeights.map((tokenWeight) => tokenWeight.address) as string[],
          tokenWeights.map((tokenWeight) => tokenWeight.weight) as number[],
          basketName,
          basketSymbol,
        ],
      })
      console.log("simulateContract request", request);
    })();

  }, [tokenWeights, basketName, basketSymbol]);

  // const { config } = usePrepareContractWrite({
  //   address: contractMultiAssetWeightedVaultFactory.address,
  //   abi: contractMultiAssetWeightedVaultFactory.abi,
  //   // functionName: 'createVault',
  //   functionName: 'foo',
  //   args: [
  //     // tokenWeights.map((tokenWeight) => tokenWeight.address) as string[],
  //     // tokenWeights.map((tokenWeight) => tokenWeight.weight) as number[],
  //     basketName,
  //     basketSymbol,
  //   ],
  //   onSettled(data, error) {
  //     console.log('Settled', { data, error });
  //     if (error === null && data?.result) {
  //       if (data.mode === 'prepared') {
  //         // if (data.mode === 'prepared' && data.request.blockNumber === undefined) {
  //         console.log('Waiting for tx to be confirmed');
  //         // return;
  //       }
  //       console.log('Transaction confirmed');
  //     }
  //   },
  // })
  // console.log('config', config);
  // const { data, isLoading, isSuccess, write } = useContractWrite(config)
  // const { data, isLoading, isSuccess, write } = useContractWrite({
  //   chainId: scaffoldConfig.targetNetwork.id,
  //   address: contractMultiAssetWeightedVaultFactory.address,
  //   abi: contractMultiAssetWeightedVaultFactory.abi,
  //   functionName: 'foo',
  //   // functionName: 'createVault',
  //   args: [
  //     // tokenWeights.map((tokenWeight) => tokenWeight.address) as string[],
  //     // tokenWeights.map((tokenWeight) => tokenWeight.weight) as number[],
  //     basketName,
  //     basketSymbol,
  //   ],
  //   onSettled(data, error) {
  //     console.log('Settled', { data, error });
  //       // console.log('Transaction confirmed');
  //   },
  // })

  const { writeAsync, isLoading } = useScaffoldContractWrite({
    contractName: "MultiAssetWeightedVaultFactory",
    // functionName: 'foo',
    functionName: 'createVault',
    args: [
      tokenWeights.map((tokenWeight) => tokenWeight.address) as string[],
      tokenWeights.map((tokenWeight) => tokenWeight.weight) as number[],
      basketName,
      basketSymbol,
    ],
    onBlockConfirmation: (txnReceipt: any) => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

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
    <div className="p-4 space-y-4">
      <TokenFetchingComponent setTokenAddresses={setTokenAddresses} setTokenNames={setTokenNames} />
      <form className="space-y-2">
        <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="basketName">
            Basket Name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="basketName"
            type="text"
            placeholder="Enter Basket Name"
            value={basketName}
            onChange={(e) => setBasketName(e.target.value)}
          />
        </div>
        <div className="mb-6">
          <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="basketSymbol">
            Basket Symbol
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="basketSymbol"
            type="text"
            placeholder="Enter Basket Symbol"
            value={basketSymbol}
            onChange={(e) => setBasketSymbol(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label className="block font-semibold">Select a price token to add to basket :</label>
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
          Add to your basket
        </button>
      </form>



      <div>
        <h2 className="text-2xl text-blue-800 mb-4">
          Your basket will have these weighted prices:
        </h2>
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
        onClick={(e) => {
          // if (write === undefined) return;
          // write();
          writeAsync();
          e.preventDefault();
        }}
      >
        Deploy Multi Asset Weighted Vault
      </button>
    </div>
  );

};


const BasketMaker: NextPage = () => {
  const { data: contractMultiAssetWeightedVaultFactory, isLoading: deployedContractLoading } = useDeployedContractInfo('MultiAssetWeightedVaultFactory');
  return (
    <>
      <MetaHeader
        title="CPI Basket Maker"
        description="CPI Basket Makers."
      >
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </MetaHeader>
      <div className="grid lg:grid-cols-1 flex-grow" data-theme="exampleUi">
        <div className="flex flex-col justify-center items-center">
          <h1 className="text-6xl font-bold">CPI Basket Maker</h1>
          <p className="text-xl mt-4">
            Define a basket of prices of goods/services that represents a component of CPI.
          </p>
        </div>
      </div>
      <div className="grid lg:grid-cols-2 flex-grow" data-theme="exampleUi">
        <div className="flex flex-col justify-center items-center">
          {deployedContractLoading ? 'Loading...' : (
            <DefineMawv contractMultiAssetWeightedVaultFactory={contractMultiAssetWeightedVaultFactory} />
          )}
        </div>
      </div>
    </>
  );
};

export default BasketMaker;
