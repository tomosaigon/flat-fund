import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "TableOrders" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployTableOrders: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    if (hre.network.name == 'scrollSepolia' || hre.network.name == 'mantleTestnet' || hre.network.name == 'filecoin-2') { return; }
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

    await deploy("TableOrders", {
        from: deployer,
        // Contract constructor arguments
        args: [],
        log: true,
        // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
        // automatically mining the contract deployment transaction. There is no effect on live networks.
        autoMine: true,
    });

    // Get the deployed contract
    // const TableOrders = await hre.ethers.getContract("TableOrders", deployer);
};

export default deployTableOrders;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags TableOrders
deployTableOrders.tags = ["TableOrders"];
