import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
// import ethers from "ethers";
import { ERC20abi, mockContracts } from "../scripts/mockContracts";

/**
 * Deploys a contract named "Consignment" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployConsignment: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.
 
    When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.
 
    You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
    with a random private key in the .env file (then used on hardhat.config.ts)
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await (hre as any).getNamedAccounts();
  const signers = await hre.ethers.getSigners()
  const { deploy } = (hre as any).deployments;

  const addresses = [mockContracts.MintableERC20Clone.address, mockContracts.MintableERC20Clone2.address];
  if (addresses[0] === "" || addresses[1] === "") {
    console.log("Please deploy the MintableERC20Clone contract first");
    return;
  }

  await deploy("Consignment", {
    from: deployer,
    // Contract constructor arguments
    args: addresses,
    log: true,
    // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
    // automatically mining the contract deployment transaction. There is no effect on live networks.
    autoMine: true,
  });

  const offerer = await hre.ethers.getSigner(deployer);
  const taker = signers[1];
  const offererAddress = await offerer.getAddress();
  const takerAddress = await taker.getAddress();

  // Get the deployed contract
  const offerConsignment = await hre.ethers.getContract("Consignment", deployer);
  const consignmentAddress = offerConsignment.address;
  const takerConsignment = await hre.ethers.getContract("Consignment", taker);
  const baseToken = new hre.ethers.Contract(addresses[0], ERC20abi, taker);
  const quoteToken = new hre.ethers.Contract(addresses[1], ERC20abi, offerer);

  await baseToken.mint(hre.ethers.utils.parseEther("20"));
  await baseToken.approve(consignmentAddress, hre.ethers.utils.parseEther("20"));
  await takerConsignment.depositBase(hre.ethers.utils.parseEther("3"));
  await quoteToken.mint(hre.ethers.utils.parseEther("20"));
  await quoteToken.approve(consignmentAddress, hre.ethers.utils.parseEther("20"));
  await offerConsignment.depositQuote(hre.ethers.utils.parseEther("4"));
  await takerConsignment.withdrawBase(hre.ethers.utils.parseEther("1"));
  const baseTokenBalance = await takerConsignment.baseBalances(takerAddress);
  let quoteTokenBalance = await offerConsignment.quoteBalances(offererAddress);
  console.log(`taker's Base Token Balance: ${hre.ethers.utils.formatEther(baseTokenBalance) }`);
  console.log(`offerer's Quote Token Balance: ${hre.ethers.utils.formatEther(quoteTokenBalance) }`);
  await offerConsignment.withdrawQuote(hre.ethers.utils.parseEther("1"));
  quoteTokenBalance = await offerConsignment.quoteBalances(offererAddress);
  console.log(`offerer's Quote Token Balance: ${hre.ethers.utils.formatEther(quoteTokenBalance)}`);

  const buyOrSell = true; // 'true' for buy
  const maxAmount = hre.ethers.utils.parseEther("2");
  const price = hre.ethers.utils.parseEther("1");
  const nonce = 1;
  const amount = hre.ethers.utils.parseEther("1");

  // Construct the message
  const messageHash = hre.ethers.utils.solidityKeccak256(
    ["address", "bool", "uint256", "uint256", "uint256"],
    [consignmentAddress, buyOrSell, maxAmount, price, nonce]
  );
  let messageHashBinary = hre.ethers.utils.arrayify(messageHash);
  const signature = await offerer.signMessage(messageHashBinary);

  const tx = await takerConsignment.takeOffer(buyOrSell, maxAmount, price, nonce, signature, amount);
  await tx.wait();

  const events = await takerConsignment.queryFilter(takerConsignment.filters.TradeExecuted(), tx.blockHash);
  events.forEach((event: any) => {
    console.log("TradeExecuted Event:");
    console.log("taker:", event.args.taker);
    console.log("offerer:", event.args.offerer);
    console.log("Buy? or Sell:", event.args.buyOrSell);
    console.log("baseAmount:", hre.ethers.utils.formatEther(event.args.baseAmount));
    console.log("quoteAmount:", hre.ethers.utils.formatEther(event.args.quoteAmount));
    console.log("price:", hre.ethers.utils.formatEther(event.args.price));
  });

};

export default deployConsignment;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags Consignment
deployConsignment.tags = ["Consignment"];
