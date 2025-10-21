import { frontEndAbiFile, frontEndContractsFile } from "../helper-hardhat-config";
import fs from "fs";
import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import  ethers from "hardhat";
const updateUI: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { network } = hre;
  const chainId = "31337";

  if (process.env.UPDATE_FRONT_END) {
    console.log("Writing to front end...");
    const fundMe = await (ethers as any).getContract("Raffle");
    const contractAddresses = JSON.parse(
      fs.readFileSync(frontEndContractsFile, "utf8")
    );
    if (chainId in contractAddresses) {
      if (
        !contractAddresses[network.config.chainId!].includes(fundMe.address)
      ) {
        contractAddresses[network.config.chainId!].push(fundMe.address);
      }
    } else {
      contractAddresses[network.config.chainId!] = [fundMe.address];
    }
    fs.writeFileSync(frontEndContractsFile, JSON.stringify(contractAddresses));
    fs.writeFileSync(
      frontEndAbiFile,
      fundMe.interface.format(((ethers as any)).utils.FormatTypes.json)
    );
    console.log("Front end written!");
  }
};
export default updateUI;
updateUI.tags = ["all", "frontend"];
