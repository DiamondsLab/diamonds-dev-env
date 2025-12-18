## Project Overview: Diamonds Dev Env

The Diamonds Dev Env or Diamonds Development environment is built as a monorepo to develop the Ethereum Solidity Smart Contract based ERC-2535 Diamond Proxy management system called Diamonds. This is made up of a set of node modules built using typescript and hardhat. The main module, @diamondslab/diamonds node module aka diamonds, is located in the workspace git submodule (`packages/diamonds`).

The over all Diamonds Dev Env project is used to work on the Diamonds module and to create resuable functionality associated with the Diamonds module and provide new features that smart contract projects employing the Diamonds node module can use.

The Diamonds Dev Env uses a devcontainer for the development environment and this devcontainer is a separate git submodule to help facilitate poratability. This is in `.devcontainer` directory that uses Docker Compose with docker-compose.dev.yml as the local development environment build. There are scripts associated in `.devcontainer/scripts` directory that include `post-create.sh` and `post-start.sh` which can be used to add functionality that can not be added docker compose build by adding a docker container.

The Diamonds Dev Env has a helper hardhat extension node module which is also a git submodule called @diamondslab/hardhat-diamonds located in `packages/hardhat-diamonds`. The Hardhat-Diamonds node submodule provides helper functionality for Diamonds configuration settings like file paths and other settings used as part of the deployment and diamond-abi creation. The configuration settings can then be set in `hardhat.config.ts` and these are available from the Hardhat Runtime Environment along with some Diamonds related tasks.

## Diamond Contracts

Our local project includes an example diamond contract called ExampleDiamond located in `contracts/examplediamond` directory in `ExampleDiamond.sol`. This diamond contract is used to demonstrate the Diamonds module functionality and to provide a base for testing and development of the Diamonds module. The ExampleDiamond contract includes several facets that provide different functionality.

## Diamonds module and local deployment

The Diamonds module is accessed by the project scripts and tests by use of a project level class created. This can take different shapes based on the types of deployments to interact with the Diamonds module. In this way it allows for customization based on deplyoment scenarios specific to the project. The Diamond module itself uses a Strategy Design Pattern for deployments which can be extended. It comes with a basic deplyoment and it currently includes two such extended deployment strategies (RPC and OpenZeppelin Defender).

## Diamond-ABI and Typechain Types

The Diamonds Lab projects includes ABI generation that matches the deployment configuration for the diamond, diamond-abi, via hardhat tasks and hardhat-diamond module. This is done by creating a single ABI file for the Diamond contract that includes all the function selectors included in the deployment. The diamond-abi file is written in a configurable directory that can be set in the Hardhat configuration and defaults to `./diamond-abi`.

The diamond-abi file can then be used to create Typechain types for the Diamond contract that includes all the function selectors and event signatures. This is done by adding the diamond-abi file path to the typechain configuration in `hardhat.config.ts` so that when typechain runs it will create the types for the Diamond contract.

In our local project we have the diamond-abi file generated as part of the compile process `yarn compile` and the deployment scripts. The typechain types are created in `diamond-typechain-types` directory as part of the compile and build process as well.

## Deployment Configuration, Records and Callbacks

The directory that contains the deployment configuration file, records and callbacks is configurable for each diamond as part of the configuration of the Diamond Deployer. This the path can also be provided via the Hardhat configuration file `hardhat.config.ts` using the hardhat-diamonds module configuration settings which then can be more consistently referenced from the Hardhat Runtime Environment (HRE).

```typescript
	diamonds: {
		paths: {
			ExampleDiamond: {
				deploymentsPath: 'diamonds',
				contractsPath: 'contracts/examplediamond',
			},
		},
	},
```

### Configuration File

The configuration file for the diamond deployment is the diamonds configuration file is named by default <diamondcontactname>.config.json, so in our project is name `examplediamond.config.json`.

### Deployment Records

The deployment record files are under the `deploymentsPath/<DiamondContractName>/deployments` directory. It contain files for each deployment per chain by using the `<diamondcontractname>-<chainname>-<chainId>.json` naming convention. These files include deployment data such as the Diamond Address, Facet Addresses, Contract Owner Addresses, External Libraries. They also contain other important data such as the transaction IDs and function selectors registered with the Diamond contract for each of the Facets that were deployed.

All of this data is used to manage the Diamond contract and its Facets for future upgrades and interactions. It is available to be used by the deployment scripts and tests to interact with the deployed Diamond contract and its Facets by loading the deployed diamond data. In our local project this is usually done with the `getDeployedDiamondData` function.

### Callbacks

The deployment callbacks are typescript files that contain functions that are run after the diamond deployment is complete. These can be used to perform additional setup or configuration of the diamond contract after it has been deployed.

## LocalDiamondDeployer Class

> **Note**: As of the migration to `@diamondslab/hardhat-diamonds`, the `LocalDiamondDeployer` class is now part of the hardhat-diamonds module and should be imported from `@diamondslab/hardhat-diamonds/dist/utils`.

The `LocalDiamondDeployer` class is used for deploying Diamond contracts on Hardhat nodes and forks. A singleton instance of the LocalDiamondDeployer object is created or retrieved in unit tests. The object creation requires a configuration and the Hardhat Runtime Environment (hre). This object then runs through the Strategy, deploying (or upgrading) the Diamond contract and all the facets with any additional initialization transaction, performs the DiamondCut with a single initialization function call and then any callbacks that need to be run after deployment.

### Example Usage

```typescript
import { Diamond } from "@diamondslab/diamonds";
import {
  LocalDiamondDeployer,
  LocalDiamondDeployerConfig,
} from "@diamondslab/hardhat-diamonds/dist/utils";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { debug } from "debug";
import { JsonRpcProvider } from "ethers";
import hre from "hardhat";
import { ExampleDiamond } from "../../diamond-typechain-types";
import { loadDiamondContract } from "../../scripts/utils/loadDiamondArtifact";

let diamond: Diamond;
let owner: string;
let ownerSigner: SignerWithAddress;
let exampleDiamond: ExampleDiamond;

const config = {
  diamondName: diamondName,
  networkName: networkName,
  provider: provider,
  chainId: (await provider.getNetwork()).chainId,
  writeDeployedDiamondData: false,
  configFilePath: `diamonds/ExampleDiamond/examplediamond.config.json`,
} as LocalDiamondDeployerConfig;
// Pass hre as first parameter to getInstance
const diamondDeployer = await LocalDiamondDeployer.getInstance(hre, config);
await diamondDeployer.setVerbose(true);
diamond = await diamondDeployer.getDiamondDeployed();
const deployedDiamondData = diamond.getDeployedDiamondData();

let exampleDiamondPlain: ExampleDiamond;

// Load the Diamond contract using the utility function
const exampleDiamondContract = await loadDiamondContract<ExampleDiamond>(
  diamond,
  deployedDiamondData.DiamondAddress ?? "",
);
exampleDiamond = exampleDiamondContract;

// Retrieve the signers for the chain
signers = await hre.ethers.getSigners();
signer0 = signers[0].address;

// get the signer for the owner
owner = diamond.getDeployedDiamondData().DeployerAddress ?? "";
if (!owner) {
  diamond.setSigner(signers[0]);
  owner = signer0;
}

ownerSigner = await hre.ethers.getSigner(owner);

ownerDiamond = exampleDiamond.connect(ownerSigner);
```

### Loading the Diamond Artifact

In the example above we use the `loadDiamondContract` utility function to load the Diamond contract artifact using the Diamond address from the deployed diamond data. This allows us to interact with the Diamond contract and its facets using the Typechain types generated for the Diamond contract. This is a helper function that is not currently part of the Diamonds module but is provided as a utility in the Diamonds Dev Env project.

## Hardhat-Multichain Extension

The Diamonds Dev Env project also includes a Hardhat extension module called hardhat-multichain located in `packages/hardhat-multichain`. This module provides functionality to manage multiple chain deployments and configurations. It allows for easy switching between different chain configurations and provides utilities to interact with multiple chains from within the Hardhat environment.

## Diamonds-Monitor Module

The Diamonds Dev Env project also includes a Diamonds monitoring module called diamonds-monitor located in `packages/diamonds-monitor`. This module provides tools to monitor and analyze deployed Diamond contracts. It includes functionality to list facets, analyze facet usage, validate function selectors, analytics and performance metrics, and monitor diamond cut events.

- 💎 **Diamond Contract Monitoring**: Real-time monitoring of diamond proxy contracts
- 📊 **Health Checks**: Automated health monitoring and diagnostics
- 🚨 **Event Monitoring**: Track diamond cut events and contract changes
- 🛠️ **Developer Tools**: Utilities for diamond development and debugging
- 📈 **Analytics**: Performance metrics and usage analytics
- 🔧 **Dual Usage**: Works as a Hardhat plugin or standalone library

## Diamonds-Hardhat-Foundry Module

The Diamonds Dev Env project also includes a Diamonds Hardhat Foundry module called diamonds-hardhat-foundry located in `packages/diamonds-hardhat-foundry`. This module provides integration between Hardhat and Foundry for testing and deploying Diamond contracts. It includes tasks to initialize the Foundry environment, deploy diamond contracts using Foundry, generate helper files for Foundry, and run tests using Foundry's Forge framework.

There are tests in the for this module located in `packages/diamonds-hardhat-foundry/test` directory that cover the functionality of the module including framework classes and tasks. There are also tests in the root `test` directory that cover the overall Diamonds Dev Env project functionality including integration tests for the Diamonds-Hardhat-Foundry module and other modules in the project.
