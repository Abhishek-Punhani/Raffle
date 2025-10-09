import { DeployFunction } from "hardhat-deploy/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { networkConfig, developmentChains } from "../helper-hardhat-config";
import verify from "../utils/verify";

const FUND_AMOUNT = BigInt("1000000000000000000") * BigInt(1000); // 1000 ETH in wei as BigInt
const VERIFICATION_BLOCK_CONFIRMATIONS = 6;
const deployRaffle: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const { deployments, getNamedAccounts, network, ethers } = hre;
  const { deploy, log } = deployments;
  const { deployer } = await getNamedAccounts();

  const chainId = network.config.chainId ?? 31337;
  const waitBlockConfirmations = developmentChains.includes(network.name)
    ? 1
    : VERIFICATION_BLOCK_CONFIRMATIONS;

  let vrfCoordinatorV2Address: string | undefined;
  let subscriptionId: bigint | string | undefined;

  if (developmentChains.includes(network.name) || chainId === 31337) {
    const vrfCoordinatorDeployment = await deployments.get(
      "VRFCoordinatorV2Mock"
    );
    const deployerSigner = await ethers.getSigner(deployer);
    const vrfCoordinatorV2Mock = await ethers.getContractAt(
      "VRFCoordinatorV2Mock",
      vrfCoordinatorDeployment.address,
      deployerSigner
    );

    vrfCoordinatorV2Address = vrfCoordinatorDeployment.address;

    const tx = await vrfCoordinatorV2Mock.createSubscription();
    const receipt = await tx.wait(1);

    // debug output to inspect shape if needed
    console.log("createSubscription receipt.events:", receipt.events);
    console.log(
      "createSubscription receipt.logs length:",
      receipt.logs?.length ?? 0
    );

    // try events first
    let subId: bigint | undefined;
    const evt =
      receipt.events?.find((e: any) => e.event === "SubscriptionCreated") ??
      receipt.events?.[0];
    if (evt && evt.args && evt.args.subId !== undefined) {
      subId = evt.args.subId as bigint;
    }

    // fallback: parse raw logs with the contract interface
    if (!subId && receipt.logs) {
      for (const log of receipt.logs) {
        try {
          const parsed = vrfCoordinatorV2Mock.interface.parseLog(log);
          if (
            parsed &&
            parsed.name === "SubscriptionCreated" &&
            parsed.args.subId !== undefined
          ) {
            subId = parsed.args.subId as bigint;
            break;
          }
        } catch (err) {
          // not all logs belong to this contract, ignore parse errors
        }
      }
    }

    if (!subId) {
      throw new Error("createSubscription event not found or subId missing");
    }
    subscriptionId = subId;

    await vrfCoordinatorV2Mock.fundSubscription(
      typeof subscriptionId === "string"
        ? BigInt(subscriptionId)
        : (subscriptionId as bigint),
      FUND_AMOUNT
    );
  } else {
    const chainIdKey = chainId as keyof typeof networkConfig;
    const configEntry = networkConfig[chainIdKey] as any;
    vrfCoordinatorV2Address = configEntry["vrfCoordinatorV2"];
    subscriptionId = configEntry["subscriptionId"];
    if (!vrfCoordinatorV2Address || subscriptionId === undefined) {
      throw new Error(
        `Missing vrfCoordinatorV2 or subscriptionId for chainId ${chainId}`
      );
    }
  }

  const chainIdKey = chainId as keyof typeof networkConfig;
  const entranceFee = networkConfig[chainIdKey]["entranceFee"];
  const gasLane = networkConfig[chainIdKey]["gasLane"];
  const callbackGasLimit = networkConfig[chainIdKey]["callbackGasLimit"];
  const interval = networkConfig[chainIdKey]["interval"];

  const subscriptionIdArg =
    typeof subscriptionId === "string"
      ? BigInt(subscriptionId)
      : (subscriptionId as bigint);

  const args: any[] = [
    vrfCoordinatorV2Address,
    entranceFee,
    gasLane,
    subscriptionIdArg,
    callbackGasLimit,
    interval,
  ];

  log("----------------------------------------------------");
  log("Deploying Raffle and waiting for confirmations...");
  const raffle = await deploy("Raffle", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: waitBlockConfirmations,
  });

  if (
    !developmentChains.includes(network.name) &&
    process.env.ETHERSCAN_API_KEY
  ) {
    log("Verifying contract on Etherscan...");
    await verify(raffle.address, args);
  }

  log(`Raffle deployed at ${raffle.address}`);
  log("Run the raffle entry script with:");
  const networkName = network.name === "hardhat" ? "localhost" : network.name;
  log(`yarn hardhat run scripts/enterRaffle.ts --network ${networkName}`);
};

export default deployRaffle;
deployRaffle.tags = ["all", "raffle"];
