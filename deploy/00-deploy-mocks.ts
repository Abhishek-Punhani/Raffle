import { network } from "hardhat";
import { ethers } from "ethers";
import { developmentChains } from "../helper-hardhat-config";

const BASE_FEE=ethers.parseEther("0.25") //0.25 is the premium. It costs 0.25 LINK per request
const GAS_PRICE_LINK=1e9 //calculated value based on the gas price of the chain. 0.000000001 LINK per gas

export default async function({ getNamedAccounts, deployments }: any) {
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();
    if (developmentChains.includes(network.name)) {
    log("Local network detected! Deploying mocks...");
    log("----------------------------------------------------");

    await deploy("VRFCoordinatorV2Mock", {
      from: deployer,
      args: [BASE_FEE, GAS_PRICE_LINK],
      log: true,
    });
    log("Mocks Deployed!");
    log("----------------------------------------------------");
    }
}
module.exports.tags = ["all", "mocks"];