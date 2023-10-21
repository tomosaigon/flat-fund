import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
// import { ContractData } from "~~/components/example-ui/ContractData";
// import { ContractInteraction } from "~~/components/example-ui/ContractInteraction";

import React, { useState, useEffect } from 'react';
import { formatEther } from 'viem'

import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { getAbi, getStoreAbi, getBytecode, getAddress, } from "@uma/contracts-node";
// core/artifacts/contracts/data-verification-mechanism/implementation/Store.sol/Store.json
import * as Store from "../node_modules/@uma/core/artifacts/contracts/data-verification-mechanism/implementation/Store.sol/Store.json";
import * as LongShortPairCreator from "../node_modules/@uma/core/artifacts/contracts/financial-templates/long-short-pair/LongShortPairCreator.sol/LongShortPairCreator.json";
import * as LongShortPair from "../node_modules/@uma/core/artifacts/contracts/financial-templates/long-short-pair/LongShortPair.sol/LongShortPair.json";
import * as RangeBondLongShortPairFinancialProductLibrary from "../node_modules/@uma/core/artifacts/contracts/financial-templates/common/financial-product-libraries/long-short-pair-libraries/RangeBondLongShortPairFinancialProductLibrary.sol/RangeBondLongShortPairFinancialProductLibrary.json";

import { createPublicClient, createWalletClient, http, custom, ReadContractParameters } from 'viem';
import { polygonMumbai } from 'viem/chains';
import { useContractWrite, usePrepareContractWrite, useContractRead, useNetwork } from "wagmi";


const params = {
  pairName: 'Flat Bread Range Token Pair November 2023',
  expirationTimestamp: '1698685200',
  collateralPerPair: '250000000000000000',
  priceIdentifier: '0x554d415553440000000000000000000000000000000000000000000000000000',
  enableEarlyExpiration: false,
  longSynthName: 'Flat Bread Range Token Pair November 2023',
  longSynthSymbol: 'flatBREAD-1123',
  shortSynthName: 'Flat Bread Range Token Pair November 2023',
  shortSynthSymbol: 'flatBREAD-1123',
  collateralToken: '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889',
  financialProductLibrary: '0xbe96050668dECb6FA0ef5Af919f37221658cfbEf',
  customAncillaryData: '0x747761704c656e6774683a33363030',
  proposerReward: '20000000000000000000',
  optimisticOracleLivenessTime: 7200,
  optimisticOracleProposerBond: '1000000000000000000000',
}

const publicClient = createPublicClient({
  chain: polygonMumbai,
  transport: http('https://rpc-mumbai.maticvigil.com/v1'),
})

interface DatePickerProps {
  selectedDate: Date;
  handleDateChange: (date: Date) => void;
}

const CustomDatePicker: React.FC<DatePickerProps> = ({ selectedDate, handleDateChange }) => {
  return (
    <DatePicker
      className="bg-red-500 text-white p-2 border rounded"
      selected={selectedDate}
      onChange={handleDateChange}
      showTimeSelect
      timeFormat="HH:mm"
      timeIntervals={15}
      timeCaption="Time"
      dateFormat="MMMM d, yyyy h:mm aa"
    />
  );
};

// 0xC2b8AAB1ca989156a1A723E18f46e5A202a72B57,0xE3329619ABAA7923E0F5cF4A214F7aF98cE0ac0a,0xE3329619ABAA7923E0F5cF4A214F7aF98cE0ac0a,0xE3329619ABAA7923E0F5cF4A214F7aF98cE0ac0a,0xE3329619ABAA7923E0F5cF4A214F7aF98cE0ac0a,0xE3329619ABAA7923E0F5cF4A214F7aF98cE0ac0a,0xE3329619ABAA7923E0F5cF4A214F7aF98cE0ac0a,0xE3329619ABAA7923E0F5cF4A214F7aF98cE0ac0a,0xE3329619ABAA7923E0F5cF4A214F7aF98cE0ac0a,0xE3329619ABAA7923E0F5cF4A214F7aF98cE0ac0a,0xE3329619ABAA7923E0F5cF4A214F7aF98cE0ac0a,0xE3329619ABAA7923E0F5cF4A214F7aF98cE0ac0a,0xE3329619ABAA7923E0F5cF4A214F7aF98cE0ac0a,0xE3329619ABAA7923E0F5cF4A214F7aF98cE0ac0a,0xE3329619ABAA7923E0F5cF4A214F7aF98cE0ac0a,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d,0x981B6DD43dD771342F354Dd1625101C78E72d56d
function getCreatedLSPAddresses(): string[] {
  const addressesString = localStorage.getItem('createdLSPAddresses') || '';
  return addressesString.split(',').filter(Boolean);
}

function addCreatedLSPAddress(newAddress: string): void {
  const existingAddresses = getCreatedLSPAddresses();
  if (!existingAddresses.includes(newAddress)) {
    existingAddresses.push(newAddress);
    localStorage.setItem('createdLSPAddresses', existingAddresses.join(','));
  }
}

interface SetLongShortPairParametersProps {
  lspAddress: string;
  fplAddress: string;
  upperBound: string;
  lowerBound: string;
  onWriteSuccess: () => void;
}
const SetLongShortPairParameters: React.FC<SetLongShortPairParametersProps> = ({
  lspAddress,
  fplAddress,
  upperBound,
  lowerBound,
  onWriteSuccess,
}) => {
  const { data: pairName } = useContractRead({
    address: lspAddress,
    abi: LongShortPair.abi,
    functionName: 'pairName',
  });
  let _upperBound = 100;
  let _lowerBound = 20;
  const fplName = 'RangeBondLongShortPairFinancialProductLibrary';
  // const { config } = usePrepareContractWrite({
  //   address: fplAddress,
  //   // abi: getAbi(fplName), // XXX
  //   abi: RangeBondLongShortPairFinancialProductLibrary.abi,
  //   functionName: 'setLongShortPairParameters',
  //   args: [lspAddress, _upperBound, _lowerBound],
  //   // args: [lspAddress, upperBound, lowerBound],
  //   // args: [lspAddress, 100, 20],
  //   onSettled(data, error) {
  //     debugger
  //     console.log('Settled', { data, error });
  //     if (error === null && data?.result) {
  //       if (onWriteSuccess) {
  //         onWriteSuccess(data.result.toString());
  //       }Flat Bread Range Token Pair November 2023
  //     }
  //   },
  // });
  // console.log(config);

  // const { data, isLoading, isSuccess, write } = useContractWrite(config);
  const { data, isLoading, isSuccess, write } = useContractWrite({
    address: fplAddress,
    // abi: getAbi(fplName), // XXX
    abi: RangeBondLongShortPairFinancialProductLibrary.abi,
    functionName: 'setLongShortPairParameters',
    args: [lspAddress, _upperBound, _lowerBound],
    // args: [lspAddress, upperBound, lowerBound],
    // args: [lspAddress, 100, 20],
    onSettled(data, error) {
      // debugger
      console.log('Settled', { data });
      onWriteSuccess();
    },
  });

  return (
    <div>
      <button
        onClick={(e) => {
          if (write === undefined) return;
          write();
          e.preventDefault();
        }}
        disabled={isLoading}
        className="bg-blue-500 text-white py-2 px-4 rounded"
      >
        {isLoading ? 'Writing...' : 'SetLongShortPairParameters on ' + pairName}
      </button>
    </div>
  );
};

const LongShortPairForm = () => {
  const [pairName, setPairName] = useState('Flat Bread Range Token Pair November 2023');
  // const [expirationTimestamp, setExpirationTimestamp] = useState('1698685200');
  const [expirationTimestamp, setExpirationTimestamp] = useState(new Date());
  const [collateralPerPair, setCollateralPerPair] = useState('250000000000000000');
  const [priceIdentifier, setPriceIdentifier] = useState('0x554d415553440000000000000000000000000000000000000000000000000000');
  const [longSynthName, setLongSynthName] = useState('Flat Bread Range Token Pair November 2023');
  const [longSynthSymbol, setLongSynthSymbol] = useState('flatBREAD-1123');
  const [shortSynthName, setShortSynthName] = useState('Flat Bread Range Token Pair November 2023');
  const [shortSynthSymbol, setShortSynthSymbol] = useState('flatBREAD-1123');
  const [collateralToken, setCollateralToken] = useState('0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889');

  const [upperBound, setUpperBound] = useState('100'); // New upper bound state
  const [lowerBound, setLowerBound] = useState('20'); // New lower bound state

  const [showAdvanced, setShowAdvanced] = useState(false);
  // networkId
  const [financialProductLibrary, setFinancialProductLibrary] = useState(
    '0xbe96050668dECb6FA0ef5Af919f37221658cfbEf'
  );
  const [customAncillaryData, setCustomAncillaryData] = useState('0x747761704C656E6774683A33363030');
  const [proposerReward, setProposerReward] = useState('20000000000000000000');
  const [optimisticOracleLivenessTime, setOptimisticOracleLivenessTime] = useState(7200);
  const [optimisticOracleProposerBond, setOptimisticOracleProposerBond] = useState(
    '1000000000000000000000'
  );
  // const finalFee = (await store.methods.computeFinalFee(argv.collateralToken).call()).toString();
  // const proposerBond = argv.optimisticOracleProposerBond ? argv.optimisticOracleProposerBond : finalFee;

  const fpl = 'RangeBond';
  const [fplAddress, setFplAddress] = useState('');

  const [storeAddress, setStoreAddress] = useState('');
  const [lspCreatorAddress, setLspCreatorAddress] = useState('');
  const [lspAddress, setLspAddress] = useState('');
  const { chain, chains } = useNetwork();
  // const networkId = chain?.id;

  const { config } = usePrepareContractWrite({
    address: lspCreatorAddress,
    abi: LongShortPairCreator.abi,
    functionName: 'createLongShortPair',
    args: [{...params, pairName}],
    onSettled(data, error) {
      console.log('Settled', { data, error });
      if (error === null && data?.result) {
        if (data.mode === 'prepared') {
          // if (data.mode === 'prepared' && data.request.blockNumber === undefined) {
          console.log('Waiting for tx to be confirmed');
          // return;
        }
        setLspAddress(data.result.toString());
        // addCreatedLSPAddress(data.result.toString());
      }
    },
  })
  const { data, isLoading, isSuccess, write } = useContractWrite(config)


  const handleCreatePair = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Example: const params = { pairName, expirationTimestamp, ... };
    // console.log(params);
    if (write === undefined) return;
    write();
    e.preventDefault();
  };

  useEffect(() => {
    if (!chain) return;
    (async () => {
      try {
        const address = await getAddress("Store", chain.id);
        setStoreAddress(address);
        const addresslsp = await getAddress("LongShortPairCreator", chain.id);
        setLspCreatorAddress(addresslsp);
        const addressfpl = await getAddress("RangeBondLongShortPairFinancialProductLibrary", chain.id);
        setFplAddress(addressfpl);

        const { request } = await publicClient.simulateContract({
          abi: LongShortPairCreator.abi,
          address: addresslsp,
          functionName: 'createLongShortPair',
          // args: Object.keys(params).map((key: string) => params[key as keyof typeof params])
          args: [params]
        })
        console.log("simulateContract request", request);
      } catch (error) {
        console.error(error);
      }
    })();

  }, [chain]);


  return (
    <div className="container mx-auto p-4">
      <form>
        <div className="mb-4">
          <label className="block mb-2" htmlFor="pairName">
            Pair Name
          </label>
          <input
            type="text"
            id="pairName"
            value={pairName}
            onChange={(e) => setPairName(e.target.value)}
            className="w-full p-2 border rounded bg-blue-800"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2" htmlFor="expirationTimestamp">
            Expiration Timestamp
          </label>
          <input
            type="text"
            id="expirationTimestamp"
            value={expirationTimestamp.getTime() / 1000}
            // onChange={(e) => setExpirationTimestamp(e.target.value)}
            className="w-full p-2 border rounded bg-blue-800"
          />
          <CustomDatePicker
            selectedDate={expirationTimestamp}
            handleDateChange={(date) => setExpirationTimestamp(date)}
          />
        </div>

        {/* Add a date picker component here for expirationTimestamp */}

        <div className="mb-4">
          <label className="block mb-2" htmlFor="collateralPerPair">
            Collateral Per Pair
            <span> (from wei: {formatEther(BigInt(parseInt(collateralPerPair)))})</span>
          </label>
          <input
            type="text"
            id="collateralPerPair"
            value={collateralPerPair}
            onChange={(e) => setCollateralPerPair(e.target.value)}
            className="w-full p-2 border rounded bg-blue-800"
          />
        </div>

        {/* Add a select input for priceIdentifier with 'Numerical' as the first option */}

        <div className="mb-4">
          <label className="block mb-2" htmlFor="longSynthName">
            Long Synth Name
          </label>
          <input
            type="text"
            id="longSynthName"
            value={longSynthName}
            onChange={(e) => setLongSynthName(e.target.value)}
            className="w-full p-2 border rounded bg-blue-800"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2" htmlFor="longSynthSymbol">
            Long Synth Symbol
          </label>
          <input
            type="text"
            id="longSynthSymbol"
            value={longSynthSymbol}
            onChange={(e) => setLongSynthSymbol(e.target.value)}
            className="w-full p-2 border rounded bg-blue-800"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2" htmlFor="shortSynthName">
            Short Synth Name
          </label>
          <input
            type="text"
            id="shortSynthName"
            value={shortSynthName}
            onChange={(e) => setShortSynthName(e.target.value)}
            className="w-full p-2 border rounded bg-blue-800"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2" htmlFor="shortSynthSymbol">
            Short Synth Symbol
          </label>
          <input
            type="text"
            id="shortSynthSymbol"
            value={shortSynthSymbol}
            onChange={(e) => setShortSynthSymbol(e.target.value)}
            className="w-full p-2 border rounded bg-blue-800"
          />
        </div>

        {/* Add a select input for collateralToken */}

        <div className="mb-4">
          <label className="block mb-2" htmlFor="upperBound">
            Upper Bound
          </label>
          <input
            type="text"
            id="upperBound"
            value={upperBound}
            onChange={(e) => setUpperBound(e.target.value)}
            className="w-full p-2 border rounded bg-blue-800"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-2" htmlFor="lowerBound">
            Lower Bound
          </label>
          <input
            type="text"
            id="lowerBound"
            value={lowerBound}
            onChange={(e) => setLowerBound(e.target.value)}
            className="w-full p-2 border rounded bg-blue-800"
          />
        </div>

        <div className="mb-4">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-blue-500 underline cursor-pointer"
          >
            {showAdvanced ? 'Hide Advanced Parameters' : 'Show Advanced Parameters'}
          </button>
        </div>

        {showAdvanced && (
          <div className="bg-blue-800 text-white p-4 rounded mb-4">
            <div className="mb-4">
              <label className="block mb-2" htmlFor="financialProductLibrary">
                Financial Product Library
              </label>
              <input
                type="text"
                id="financialProductLibrary"
                value={financialProductLibrary}
                onChange={(e) => setFinancialProductLibrary(e.target.value)}
                className="w-full p-2 border rounded bg-blue-800"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2" htmlFor="customAncillaryData">
                Custom Ancillary Data: <span className="text-sm">(hex decoded: {'twapLength:3600'})</span>
              </label>
              <input
                type="text"
                id="customAncillaryData"
                value={customAncillaryData}
                onChange={(e) => setCustomAncillaryData(e.target.value)}
                className="w-full p-2 border rounded bg-blue-800"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2" htmlFor="proposerReward">
                Proposer Reward
                <span> (from wei: {formatEther(BigInt(parseInt(proposerReward)))})</span>
              </label>
              <input
                type="text"
                id="proposerReward"
                value={proposerReward}
                onChange={(e) => setProposerReward(e.target.value)}
                className="w-full p-2 border rounded bg-blue-800"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2" htmlFor="optimisticOracleLivenessTime">
                Optimistic Oracle Liveness Time
              </label>
              <input
                type="number"
                id="optimisticOracleLivenessTime"
                value={optimisticOracleLivenessTime}
                onChange={(e) => setOptimisticOracleLivenessTime(parseInt(e.target.value))}
                className="w-full p-2 border rounded bg-blue-800"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-2" htmlFor="optimisticOracleProposerBond">
                Optimistic Oracle Proposer Bond
                <span> (from wei: {formatEther(BigInt(parseInt(optimisticOracleProposerBond)))})</span>
              </label>
              <input
                type="text"
                id="optimisticOracleProposerBond"
                value={optimisticOracleProposerBond}
                onChange={(e) => setOptimisticOracleProposerBond(e.target.value)}
                className="w-full p-2 border rounded bg-blue-800"
              />
            </div>
          </div>
        )}

        <div className="mb-4">
          <button
            type="button"
            onClick={handleCreatePair}
            className="bg-blue-500 text-white py-2 px-4 rounded"
          >
            Create Long/Short Pair
          </button>
        </div>

      </form>
      {isSuccess && <SetLongShortPairParameters
        lspAddress={lspAddress} fplAddress={fplAddress} upperBound={upperBound} lowerBound={lowerBound}
        onWriteSuccess={() => addCreatedLSPAddress(lspAddress)} />}
    </div>
  );
};






const AddressListTable = () => {
  const [addresses, setAddresses] = useState<string[]>([]);

  useEffect(() => {
    const _addresses = getCreatedLSPAddresses();
    setAddresses(_addresses);
  }, []);

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead>
        <tr>
          <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
            Address
          </th>
          <th className="px-6 py-3 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
            Pair Name
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {addresses.map((address, index) => (
          <TableRow key={index} address={address} />
        ))}
      </tbody>
    </table>
  );
};

interface TableRowProps {
  address: string;
}

const TableRow: React.FC<TableRowProps> = ({ address }) => {
  const { data, isError, isLoading } = useContractRead({
    address,
    abi: LongShortPair.abi,
    functionName: 'pairName',
  });

  return (
    <tr>
      <td className="px-6 py-4 whitespace-no-wrap text-black">
        {address}
      </td>
      <td className="px-6 py-4 whitespace-no-wrap text-black">
        {isLoading ? 'Loading...' : (isError ? 'Error' : (data ? data as string : 'bad data'))}
      </td>
    </tr>
  );
};







// contract RangeBondLongShortPairFinancialProductLibrary is LongShortPairFinancialProductLibrary, Lockable {
//   mapping(address => RangeBondLongShortPairParameters) public longShortPairParameters;
//   function setLongShortPairParameters( address longShortPair, uint256 highPriceRange, uint256 lowPriceRange) public nonReentrant() {


const LSPUI: NextPage = () => {
  return (
    <>
      <MetaHeader
        title="LSP UI"
        description="LSP UI"
      >
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </MetaHeader>
      <div className="grid lg:grid-cols-2 flex-grow" data-theme="lspUi">
        <LongShortPairForm />
        <AddressListTable />
      </div>
    </>
  );
};

export default LSPUI;
