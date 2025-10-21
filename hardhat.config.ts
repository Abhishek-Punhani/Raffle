import "@typechain/hardhat"
import "@nomiclabs/hardhat-waffle"
import "@nomiclabs/hardhat-etherscan"
import "@nomiclabs/hardhat-ethers"
import "hardhat-gas-reporter"
import "dotenv/config"
import "solidity-coverage"
import "hardhat-deploy"
import "@nomicfoundation/hardhat-ethers";

const BASE_SEPOLIA_RPC_URL = process.env.BASE_SEPOLIA_RPC_URL 
const PRIVATE_KEY = process.env.PRIVATE_KEY
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  networks: {
    hardhat: {
      chainId: 31337,
      blockConfirmations:1
    },
    localhost: {
      chainId: 31337,
      blockConfirmations:1
    },
    sepolia:{
      url: BASE_SEPOLIA_RPC_URL ,
      accounts:[PRIVATE_KEY] ,
      chainId:11155111,
      blockConfirmations:6
    }
  },
  solidity: "0.8.28",
  namedAccounts:{
    deployer:{
      default:0
    },
    player:{
      default:1
    }
  }
};
