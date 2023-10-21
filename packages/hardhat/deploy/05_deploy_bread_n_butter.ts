import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { AxelarGatewayAddress, AxelarGatewayABI, InterchainTokenServiceABI, TokenManagerDeployerABI, InterchainTokenServiceAddress, TokenManagerDeployerAddress } from "../scripts/axelarABI";

function hhmmss() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return hours + minutes + seconds;
}

/**
 * Deploys a contract named "LongBread" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployLongBread: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
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

    await deploy("LongBread", {
        from: deployer,
        // Contract constructor arguments
        args: [],
        log: true,
        // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
        // automatically mining the contract deployment transaction. There is no effect on live networks.
        autoMine: true,
    });
    true && await deploy("LongButter", {
        from: deployer,
        // Contract constructor arguments
        args: [],
        log: true,
        // autoMine: can be passed to the deploy function to make the deployment process faster on local networks by
        // automatically mining the contract deployment transaction. There is no effect on live networks.
        autoMine: true,
    });

    // Get the deployed contract
    const LongBread = await hre.ethers.getContract("LongBread", deployer);
    // const LongButter = await hre.ethers.getContract("LongButter", deployer);

    const signer = await hre.ethers.getSigner(deployer);
    const InterchainTokenService = new hre.ethers.Contract(InterchainTokenServiceAddress, InterchainTokenServiceABI, signer);
    const tmdAddr: string = await InterchainTokenService.tokenManagerDeployer();
    console.log("tmdAddr consistency check", tmdAddr.toLowerCase() == TokenManagerDeployerAddress, tmdAddr, TokenManagerDeployerAddress);

    const TokenManagerDeployer = new hre.ethers.Contract(TokenManagerDeployerAddress, TokenManagerDeployerABI, signer);

    const manualDeploy = false;
    if (manualDeploy) {
        /**
         * @notice Deploys a new instance of the TokenManagerProxy contract
         * @param tokenId The unique identifier for the token
         * @param implementationType Token manager implementation type
         * @param params Additional parameters used in the setup of the token manager
         */
        // function deployTokenManager(bytes32 tokenId, uint256 implementationType, bytes calldata params) external payable
        // const tokenId = "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdead1337";
        // const tokenId = "0xA2174F59BB13257965AED37595A73F2DCC70983C64F29EAA41EBA98548C89FED";
        // const tokenId = "0xe89afb3fc4fa95598a5235d504c6c04e540c865f4e2ddd017efc0c61c5f28221";
        // const tokenId = "0x16a396f6b924ac6968af2462e532f8a1b426c1c3ae8a797cb0185cc1ab638299";
        // enum TokenManagerType {
        //     LOCK_UNLOCK,
        //     MINT_BURN,
        //     LIQUIDITY_POOL
        // }
        const implementationType = 0;
        // const params = "0x";
        // const params = "0x000000000000000000000000000000000000000000000000000000000000004000000000000000000000000014C961E341353639BFC6ACBCF2571866C09B1A0A0000000000000000000000000000000000000000000000000000000000000014F786E21509A9D50A9AFD033B5940A2B7D872C208000000000000000000000000";
        // const params = "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000400000000000000000000000004bcc002e7965958449ce8d555b19dd69140c5fd40000000000000000000000000000000000000000000000000000000000000014f786e21509a9d50a9afd033b5940a2b7d872c208000000000000000000000000";
        // const params = "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000400000000000000000000000009d6c0fe031dc374474a85557b2b8545067a0f9790000000000000000000000000000000000000000000000000000000000000014510e5ea32386b7c48c4deeac80e86859b5e2416c000000000000000000000000";
        // export type InterchainTokenServiceGetParamsLockUnlockArgs = {
        //     operator: `0x${string}`;
        //     tokenAddress: `0x${string}`;
        // }; 
        // await TokenManagerDeployer.deployTokenManager(tokenId, implementationType, params);


        // function deployTokenManager(bytes32 salt) external {
        //     bytes memory params = service.getParamsMintBurn(address(this).toBytes(), tokenAddress);
        //     bytes32 tokenId = service.deployCustomTokenManager(salt, TokenManagerType.MINT_BURN, params);
        //     address tokenManager = service.getTokenManagerAddress(tokenId);
        //     CustomERC20(tokenAddress).setDistributor(tokenManager);
        // }
        // const params = await InterchainTokenService.getParamsMintBurn(deployer, LongBread.address);
        const params = await InterchainTokenService.getParamsLockUnlock(deployer, LongBread.address);
        console.log("params", params);
        const salt = '0x0101010101010101010101010101010101010101010101010101010101' + hhmmss();
        const tx = await (await InterchainTokenService.deployCustomTokenManager(salt, implementationType, params)).wait();
        // eventSignature: 'TokenManagerDeployed(bytes32,uint8,bytes)',
        console.log(tx.events)
        const event = tx.events.filter((e: any) => e.event == "TokenManagerDeployed");
        if (event.length == 0) {
            console.log("no event");
            return;
        }
        const tokenId = event[0].topics[1];
        console.log("tokenId", tokenId);

        const tokenManager = await InterchainTokenService.getTokenManagerAddress(tokenId);

        // await TokenManagerDeployer.deployTokenManager(tokenId, implementationType, params);
    } else {
        // This will deploy a Lock / Release Token Manager on the source chain.
        // const tx = await (await InterchainTokenService.registerCanonicalToken(LongBread.address)).wait();
        // const tokenId = tx.events.filter((e: any) => e.event == "TokenManagerDeployed")[0].args.tokenId;
        // console.log("tokenId", tokenId ? tokenId : "no tokenId in " + tx.events);
        // // const tokenId = '0x3ef78f1388e080a8f97ec0423c3c0e184ed2266a3cbdda7d206aaa8491f7890e';
        const tokenId = '0x337bd684a3c1f77ae3ab0cd6941b7d035b988eaa50ac341658f553b392f7aa7d';
        const remoteChains = [] as string[];
        // const remoteChains =['mantle', 'polygon-zkevm', 'filecoin-2', 'scroll'];
        for (const remoteChain of remoteChains) {
            const tx = await (await InterchainTokenService.deployRemoteCanonicalToken(tokenId, remoteChain, 0)).wait();
            console.log(tx.events)
        }
        // const tx2 = await (await InterchainTokenService.deployRemoteCanonicalToken(tokenId, 'mantle', 0)).wait();
        // console.log(tx2.events)
        // debugger

        // https://mumbai.polygonscan.com/tx/0xb19b82c07f93966ecaed20121c699167339ef260bb9e287d51e696042644620a#eventlog

        // transactionHash: '0x1862a1a8ec1b2337fe1ecd61b5ffce627272e4732f0a3798aca0f6e4ddd5ffc0'
        // args: [
        //     '0x3ef78f1388e080a8f97ec0423c3c0e184ed2266a3cbdda7d206aaa8491f7890e',
        //     'Long Bread Nov 2023',
        //     'LBREAD1123',
        //     18,
        //     '0x',
        //     [Object],
        //     'mantle',
        //     [BigNumber]
        // ],
        // event: 'RemoteStandardizedTokenAndManagerDeploymentInitialized',
        // eventSignature: 'RemoteStandardizedTokenAndManagerDeploymentInitialized(bytes32,string,string,uint8,bytes,bytes,string,uint256)',

        // https://testnet.interchain.axelar.dev/polygon-mumbai/0x27aDd2fa8C426D547635778E0343fD070ca3Edf3

        // linea: https://testnet.axelarscan.io/gmp/0xb28775c8f2e6ae5bc339829a046b2e3424fb44ecd37bd055c25c02fc86db247a
        // linea butter dest gas post-paid:
        // https://testnet.axelarscan.io/gmp/0x272ce3344302de6be2a59b717bb8bd423f3a101e4ce2c053179e713e2ca948f5
        // 5 butters mumbai -> linea: https://testnet.axelarscan.io/gmp/0x1d7964bd44a3ce9588b3c7380fce58b2058145315fb026311e0ad9820143b6da:25


        const AxelarGateway = new hre.ethers.Contract(AxelarGatewayAddress, AxelarGatewayABI, signer);
        console.log("minting 10 LongBread");
        // await LongBread.mint(deployer, hre.ethers.utils.parseEther("10"));
        console.log("approving AxelarGateway to spend 1 LongBread", AxelarGatewayAddress);
        // await LongBread.approve(AxelarGatewayAddress, hre.ethers.utils.parseEther("1"));   
        console.log("sending 1 LBREAD1123 to mantle");
        // const tx = await (await AxelarGateway.sendToken('mantle', deployer, 'LBREAD1123', hre.ethers.utils.parseEther("1"))).wait();
        // await AxelarGateway.sendToken('mantle', deployer, 'LBREAD1123', hre.ethers.utils.parseEther("1"));
        // await AxelarGateway.sendToken('filecoin-2', deployer, 'LBREAD1123', hre.ethers.utils.parseEther("1"));
        await AxelarGateway.sendToken('linea', deployer, 'LBREAD1123', hre.ethers.utils.parseEther("1"));

    }
};

export default deployLongBread;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags LongBread
deployLongBread.tags = ["LongBread"];
