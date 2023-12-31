import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "PipRegistry" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployPipRegistry: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    /*
      On localhost, the deployer account is the one that comes with Hardhat, which is already funded.
  
      When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
      should have sufficient balance to pay for the gas fees for contract creation.
  
      You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
      with a random private key in the .env file (then used on hardhat.config.ts)
      You can run the `yarn account` command to check your balance in every network.
    */
    const { deployer } = await (hre as any).getNamedAccounts();
    const { deploy } = (hre as any).deployments;

    await deploy("PipRegistry", {
        from: deployer,
        // Contract constructor arguments
        args: [],
        log: true,
        // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
        // automatically mining the contract deployment transaction. There is no effect on live networks.
        autoMine: true,
    });

    // Get the deployed contract
    const PipRegistry = await hre.ethers.getContract("PipRegistry", deployer);
    await PipRegistry.pauseInserting();
    try {
        // const MockPair = await hre.ethers.getContract("MockPair", deployer);
        const MockPair = await hre.ethers.getContract("MockPairButter", deployer);
        if (MockPair.address !== undefined) {
            console.log("Adding MockPair to PipRegistry");
            await PipRegistry.addAddress(MockPair.address);
        }
    } catch (e) {
        console.log(e);
    }
};

export default deployPipRegistry;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags PipRegistry
deployPipRegistry.tags = ["PipRegistry"];
