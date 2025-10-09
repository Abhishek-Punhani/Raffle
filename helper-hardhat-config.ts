import { ethers } from "hardhat";

const networkConfig = {
  4: {
    name: "rinkeby",
    vrfCoordinatorV2: "0x6168499c0cFfCaCD319c818142124B7A15E857ab",
    entranceFee: ethers.parseEther("0.01"),
    gasLane:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 30 gwei
    subscriptionId: "5883",
    callbackGasLimit: "500000", // 500,000 gas
    interval: "30",
  },
  31337: {
    name: "hardhat",
    entranceFee: ethers.parseEther("0.01"),
    gasLane:
      "0xd89b2bf150e3b9e13446986e571fb9cab24b13cea0a43ea20a6049a85cc807cc", // 30 gwei
    callbackGasLimit: "500000", // 500,000 gas
    interval: "30",
  },
  11155111: {
    name: "sepolia",
    vrfCoordinatorV2: "0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625",
    entranceFee: ethers.parseEther("0.01"),
    gasLane:
      "0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c", // 4 gwei
    subscriptionId: "1234", // add your subscriptionId here!
    callbackGasLimit: "500000", // 500,000 gas
    interval: "30",
  },
};

const developmentChains = ["hardhat", "localhost"];

export { networkConfig, developmentChains };
