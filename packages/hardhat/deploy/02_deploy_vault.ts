import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";

/**
 * Deploys a contract named "PipRegistry" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployMultiAssetWeightedVault: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
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

    await deploy("MultiAssetWeightedVault", {
        from: deployer,
        // Contract constructor arguments
        args: [
            ['0x2058a9d7613eee744279e3856ef0eada5fcbaa7e', '0x4519097D038c47BEea6bbe3103262bF37e42c8D8'],
            [100, 200],
            'Food Vault',
            'FOOD',
        ],
        log: true,
        // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
        // automatically mining the contract deployment transaction. There is no effect on live networks.
        autoMine: true,
    });

    // Get the deployed contract
    // const MultiAssetWeightedVault = await hre.ethers.getContract("MultiAssetWeightedVault", deployer);
};

export default deployMultiAssetWeightedVault;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags MultiAssetWeightedVault
deployMultiAssetWeightedVault.tags = ["MultiAssetWeightedVault"];
