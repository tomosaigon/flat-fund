import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import ethers from "ethers";
import { ERC20abi, mockContracts } from "../scripts/mockContracts";

/**
 * Deploys a contract named "DeployBytecode" using the deployer account and
 * constructor arguments set to the deployer address
 *
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployDeployBytecode: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
    /*
      On localhost, the deployer account is the one that comes with Hardhat, which is already funded.
  
      When deploying to live networks (e.g `yarn deploy --network goerli`), the deployer account
      should have sufficient balance to pay for the gas fees for contract creation.
  
      You can generate a random account with `yarn generate` which will fill DEPLOYER_PRIVATE_KEY
      with a random private key in the .env file (then used on hardhat.config.ts)
      You can run the `yarn account` command to check your balance in every network.
    */
    const { deployer } = await (hre as any).getNamedAccounts();

    const IERC20abi = new hre.ethers.utils.Interface(ERC20abi)
    const signer = await hre.ethers.getSigner(deployer);

    const addresses = [mockContracts.MintableERC20Clone.address, mockContracts.MintableERC20Clone2.address];
    let prevDeployedAddress = addresses[0];

    for (let i = 0; i < addresses.length; i++) {
        prevDeployedAddress = addresses[i];
        const prevUsdc = new hre.ethers.Contract(prevDeployedAddress, ERC20abi, signer);
        await prevUsdc.mint(hre.ethers.utils.parseEther('100'));
        await prevUsdc.transfer('0x95654e2B8A7B57E9DcF744f9Ccc6b79De2087e55', hre.ethers.utils.parseEther('50'));
    }
    // console.log('Contract deployed at address:', prevUsdc);
    const code = await hre.ethers.provider.getCode(prevDeployedAddress);
    // If there is code at the address, it's a contract; otherwise, it's not.
    if (code !== '0x') {
        console.log('Skipping. Contract already deployed at address:', prevDeployedAddress);
        return;
    }

    // https://mumbai.polygonscan.com/address/0x2058a9d7613eee744279e3856ef0eada5fcbaa7e#code
    const ccc = '60806040523480156200001157600080fd5b5060405162000dde38038062000dde833981810160405260608110156200003757600080fd5b81019080805160405193929190846401000000008211156200005857600080fd5b9083019060208201858111156200006e57600080fd5b82516401000000008111828201881017156200008957600080fd5b82525081516020918201929091019080838360005b83811015620000b85781810151838201526020016200009e565b50505050905090810190601f168015620000e65780820380516001836020036101000a031916815260200191505b50604052602001805160405193929190846401000000008211156200010a57600080fd5b9083019060208201858111156200012057600080fd5b82516401000000008111828201881017156200013b57600080fd5b82525081516020918201929091019080838360005b838110156200016a57818101518382015260200162000150565b50505050905090810190601f168015620001985780820380516001836020036101000a031916815260200191505b5060405260209081015185519093508592508491620001bd916003918501906200020d565b508051620001d39060049060208401906200020d565b50506005805460ff1916601217905550620001ee81620001f7565b505050620002a9565b6005805460ff191660ff92909216919091179055565b828054600181600116156101000203166002900490600052602060002090601f016020900481019282601f106200025057805160ff191683800117855562000280565b8280016001018555821562000280579182015b828111156200028057825182559160200191906001019062000263565b506200028e92915062000292565b5090565b5b808211156200028e576000815560010162000293565b610b2580620002b96000396000f3fe608060405234801561001057600080fd5b50600436106100b45760003560e01c806370a082311161007157806370a082311461021057806395d89b4114610236578063a0712d681461023e578063a457c2d71461025b578063a9059cbb14610287578063dd62ed3e146102b3576100b4565b806306fdde03146100b9578063095ea7b31461013657806318160ddd1461017657806323b872dd14610190578063313ce567146101c657806339509351146101e4575b600080fd5b6100c16102e1565b6040805160208082528351818301528351919283929083019185019080838360005b838110156100fb5781810151838201526020016100e3565b50505050905090810190601f1680156101285780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b6101626004803603604081101561014c57600080fd5b506001600160a01b038135169060200135610377565b604080519115158252519081900360200190f35b61017e610394565b60408051918252519081900360200190f35b610162600480360360608110156101a657600080fd5b506001600160a01b0381358116916020810135909116906040013561039a565b6101ce610421565b6040805160ff9092168252519081900360200190f35b610162600480360360408110156101fa57600080fd5b506001600160a01b03813516906020013561042a565b61017e6004803603602081101561022657600080fd5b50356001600160a01b0316610478565b6100c1610493565b6101626004803603602081101561025457600080fd5b50356104f4565b6101626004803603604081101561027157600080fd5b506001600160a01b03813516906020013561050f565b6101626004803603604081101561029d57600080fd5b506001600160a01b038135169060200135610577565b61017e600480360360408110156102c957600080fd5b506001600160a01b038135811691602001351661058b565b60038054604080516020601f600260001961010060018816150201909516949094049384018190048102820181019092528281526060939092909183018282801561036d5780601f106103425761010080835404028352916020019161036d565b820191906000526020600020905b81548152906001019060200180831161035057829003601f168201915b5050505050905090565b600061038b6103846105b6565b84846105ba565b50600192915050565b60025490565b60006103a78484846106a6565b610417846103b36105b6565b61041285604051806060016040528060288152602001610a5a602891396001600160a01b038a166000908152600160205260408120906103f16105b6565b6001600160a01b031681526020810191909152604001600020549190610801565b6105ba565b5060019392505050565b60055460ff1690565b600061038b6104376105b6565b8461041285600160006104486105b6565b6001600160a01b03908116825260208083019390935260409182016000908120918c168152925290205490610898565b6001600160a01b031660009081526020819052604090205490565b60048054604080516020601f600260001961010060018816150201909516949094049384018190048102820181019092528281526060939092909183018282801561036d5780601f106103425761010080835404028352916020019161036d565b60006105076105016105b6565b836108f9565b506001919050565b600061038b61051c6105b6565b8461041285604051806060016040528060258152602001610acb60259139600160006105466105b6565b6001600160a01b03908116825260208083019390935260409182016000908120918d16815292529020549190610801565b600061038b6105846105b6565b84846106a6565b6001600160a01b03918216600090815260016020908152604080832093909416825291909152205490565b3390565b6001600160a01b0383166105ff5760405162461bcd60e51b8152600401808060200182810382526024815260200180610aa76024913960400191505060405180910390fd5b6001600160a01b0382166106445760405162461bcd60e51b8152600401808060200182810382526022815260200180610a126022913960400191505060405180910390fd5b6001600160a01b03808416600081815260016020908152604080832094871680845294825291829020859055815185815291517f8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b9259281900390910190a3505050565b6001600160a01b0383166106eb5760405162461bcd60e51b8152600401808060200182810382526025815260200180610a826025913960400191505060405180910390fd5b6001600160a01b0382166107305760405162461bcd60e51b81526004018080602001828103825260238152602001806109ef6023913960400191505060405180910390fd5b61073b8383836109e9565b61077881604051806060016040528060268152602001610a34602691396001600160a01b0386166000908152602081905260409020549190610801565b6001600160a01b0380851660009081526020819052604080822093909355908416815220546107a79082610898565b6001600160a01b038084166000818152602081815260409182902094909455805185815290519193928716927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef92918290030190a3505050565b600081848411156108905760405162461bcd60e51b81526004018080602001828103825283818151815260200191508051906020019080838360005b8381101561085557818101518382015260200161083d565b50505050905090810190601f1680156108825780820380516001836020036101000a031916815260200191505b509250505060405180910390fd5b505050900390565b6000828201838110156108f2576040805162461bcd60e51b815260206004820152601b60248201527f536166654d6174683a206164646974696f6e206f766572666c6f770000000000604482015290519081900360640190fd5b9392505050565b6001600160a01b038216610954576040805162461bcd60e51b815260206004820152601f60248201527f45524332303a206d696e7420746f20746865207a65726f206164647265737300604482015290519081900360640190fd5b610960600083836109e9565b60025461096d9082610898565b6002556001600160a01b0382166000908152602081905260409020546109939082610898565b6001600160a01b0383166000818152602081815260408083209490945583518581529351929391927fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef9281900390910190a35050565b50505056fe45524332303a207472616e7366657220746f20746865207a65726f206164647265737345524332303a20617070726f766520746f20746865207a65726f206164647265737345524332303a207472616e7366657220616d6f756e7420657863656564732062616c616e636545524332303a207472616e7366657220616d6f756e74206578636565647320616c6c6f77616e636545524332303a207472616e736665722066726f6d20746865207a65726f206164647265737345524332303a20617070726f76652066726f6d20746865207a65726f206164647265737345524332303a2064656372656173656420616c6c6f77616e63652062656c6f77207a65726fa2646970667358221220e5664852459c92e02fd75c2f1affb39fdca48732351c788ba07cd0778be0a0e664736f6c634300060c0033000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000120000000000000000000000000000000000000000000000000000000000000003444149000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000034441490000000000000000000000000000000000000000000000000000000000';

    const contractFactory = new (hre as any).ethers.ContractFactory(IERC20abi, '0x' + ccc, signer);
    const name = "unDAI";
    const symbol = "UND";
    const decimals = 18;
    const contract = await contractFactory.deploy(name, symbol, decimals);
    await contract.deployed();

    console.log('Contract deployed at address:', contract.address);

};

export default deployDeployBytecode;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags DeployBytecode
deployDeployBytecode.tags = ["DeployBytecode"];
