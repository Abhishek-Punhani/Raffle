import { BigNumberish } from "ethers";
import { network,ethers } from "hardhat";
import { Raffle, VRFCoordinatorV2Mock } from "../typechain-types";

async function mockKeepers() {
  const raffle: Raffle = await ethers.getContract("Raffle");
  const checkData = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(""));
  const { upkeepNeeded } = await raffle.callStatic.checkUpkeep(checkData);
  if (upkeepNeeded) {
    const tx = await raffle.performUpkeep(checkData);
    const txReceipt: ethers.providers.TransactionReceipt = await tx.wait(1);
    const event: ethers.utils.LogDescription | undefined = txReceipt.logs
      .map((log: ethers.providers.Log) => raffle.interface.parseLog(log))
      .find(
        (parsedLog: ethers.utils.LogDescription) =>
          parsedLog.name === "RequestedRandomness"
      );
    if (!event) {
      throw new Error("RequestedRandomness event not found");
    }
    const requestId = event.args.requestId;
    console.log(`Performed upkeep with RequestId: ${requestId}`);
    if (network.config.chainId == 31337) {
      await mockVrf(requestId, raffle);
    }
  } else {
    console.log("No upkeep needed!");
  }
}

async function mockVrf(requestId: BigNumberish, raffle: Raffle) {
  console.log("We on a local network? Ok let's pretend...");
  const vrfCoordinatorV2Mock: VRFCoordinatorV2Mock =
    await ethers.getContract("VRFCoordinatorV2Mock");
  await vrfCoordinatorV2Mock.fulfillRandomWords(requestId, raffle.getAddress());
  console.log("Responded!");
  const recentWinner = await raffle.getRecentWinner();
  console.log(`The winner is: ${recentWinner}`);
}

mockKeepers()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
