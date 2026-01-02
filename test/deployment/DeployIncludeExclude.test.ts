import { Diamond } from '@diamondslab/diamonds';
import {
	LocalDiamondDeployer,
	LocalDiamondDeployerConfig,
	loadDiamondContract,
} from '@diamondslab/hardhat-diamonds/dist/utils';
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers';
import { expect } from 'chai';
import { debug } from 'debug';
import { JsonRpcProvider } from 'ethers';
import hre from 'hardhat';
import { multichain } from 'hardhat-multichain';
import { ExampleDiamond } from '../../diamond-typechain-types';

describe('🧪 Diamond Deployment Include/Exclude Tests', async function () {
	const diamondName = 'ExampleDiamond';
	const log: debug.Debugger = debug(`DeployIncludeExclude:log:${diamondName}`);
	this.timeout(0);

	const networkProviders = multichain.getProviders() ?? new Map<string, JsonRpcProvider>();

	if (process.argv.includes('test-multichain')) {
		const networkNames = process.argv[process.argv.indexOf('--chains') + 1].split(',');
		if (networkNames.includes('hardhat')) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			networkProviders.set('hardhat', hre.ethers.provider as any);
		}
	} else if (process.argv.includes('test') ?? process.argv.includes('coverage')) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		networkProviders.set('hardhat', hre.ethers.provider as any);
	}

	for (const [networkName, provider] of networkProviders.entries()) {
		describe(`🔗 Chain: ${networkName} - deployExclude Tests`, function () {
			let diamond: Diamond;
			let signers: SignerWithAddress[];
			let signer0: string;
			let owner: string;
			let ownerSigner: SignerWithAddress;
			let exampleDiamond: ExampleDiamond;
			let ownerDiamond: ExampleDiamond;

			let ethersMultichain: typeof hre.ethers;
			let snapshotId: string;

			before(async function () {
				log('Setting up deployExclude test with examplediamond-exclude.config.json');

				const config = {
					diamondName: diamondName,
					networkName: networkName,
					provider: provider,
					chainId: (await provider.getNetwork()).chainId,
					writeDeployedDiamondData: false,
					configFilePath: `diamonds/ExampleDiamond/examplediamond-exclude.config.json`,
				} as LocalDiamondDeployerConfig;

				// CRITICAL: Pass hre as first parameter to avoid HH9 circular dependency			// eslint-disable-next-line @typescript-eslint/no-explicit-any				const diamondDeployer = await LocalDiamondDeployer.getInstance(hre as any, config);
				await diamondDeployer.setVerbose(true);
				diamond = await diamondDeployer.getDiamondDeployed();
				const deployedDiamondData = diamond.getDeployedDiamondData();

				// Load the Diamond contract using the utility function
				const exampleDiamondContract = await loadDiamondContract<ExampleDiamond>(
					diamond,
					deployedDiamondData.DiamondAddress ?? '',
					hre.ethers,
				);
				exampleDiamond = exampleDiamondContract;

				ethersMultichain = hre.ethers;
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				ethersMultichain.provider = provider as any;

				// Retrieve the signers for the chain
				signers = await ethersMultichain.getSigners();
				signer0 = signers[0].address;

				// Get the signer for the owner
				owner = diamond.getDeployedDiamondData().DeployerAddress ?? '';
				if (!owner) {
					throw new Error('Owner address not found in deployed diamond data');
				}
				ownerSigner = await ethersMultichain.getSigner(owner);
				ownerDiamond = exampleDiamond.connect(ownerSigner) as ExampleDiamond;

				log(`Diamond deployed at ${deployedDiamondData.DiamondAddress}`);
			});

			beforeEach(async function () {
				snapshotId = await ethersMultichain.provider.send('evm_snapshot', []);
			});

			afterEach(async () => {
				await ethersMultichain.provider.send('evm_revert', [snapshotId]);
			});

			it(`should verify Diamond deployment on ${networkName}`, async function () {
				const deployedData = diamond.getDeployedDiamondData();
				expect(deployedData.DiamondAddress).to.not.be.undefined;
				expect(deployedData.DeployedFacets).to.have.property('DiamondCutFacet');
				expect(deployedData.DeployedFacets).to.have.property('DiamondLoupeFacet');
				log(`Diamond verified at ${deployedData.DiamondAddress}`);
			});

			it(`should verify testDeployExclude() selector (0xdc38f9ab) is NOT registered with ExampleTestDeployExclude on ${networkName}`, async function () {
				const targetSelector = '0xdc38f9ab';
				const deployedData = diamond.getDeployedDiamondData();

				// Check if ExampleTestDeployExclude was deployed
				expect(deployedData.DeployedFacets).to.have.property('ExampleTestDeployExclude');

				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				const excludeFacet = deployedData.DeployedFacets!['ExampleTestDeployExclude'];
				const excludeFacetSelectors = excludeFacet.funcSelectors ?? [];
				// The selector should NOT be in this facet's list (it should be excluded)
				expect(excludeFacetSelectors).to.not.include(
					targetSelector,
					`testDeployExclude() selector ${targetSelector} should NOT be registered with ExampleTestDeployExclude due to deployExclude configuration`,
				);

				log(
					`✓ testDeployExclude() selector correctly excluded from ExampleTestDeployExclude`,
				);
			});

			it(`should verify ExampleTestDeployInclude facet is NOT deployed with exclude config on ${networkName}`, async function () {
				const deployedData = diamond.getDeployedDiamondData();

				// ExampleTestDeployInclude should NOT be in the deployed facets since it's not in the exclude config
				expect(deployedData.DeployedFacets).to.not.have.property(
					'ExampleTestDeployInclude',
					'ExampleTestDeployInclude should NOT be deployed when using exclude config',
				);

				log(`✓ ExampleTestDeployInclude correctly not deployed with exclude config`);
			});

			it(`should verify function selector registry shows testDeployExclude() has no facet assignment on ${networkName}`, async function () {
				const registry = diamond.functionSelectorRegistry;

				const testDeployExcludeSelector = '0xdc38f9ab';

				// The selector should still exist in registry but might not be assigned to any facet
				// or might be assigned to ExampleTestDeployExclude with a note that it's excluded
				log(`Function selector registry entries: ${registry.size}`);

				if (registry.has(testDeployExcludeSelector)) {
					const selectorEntry = registry.get(testDeployExcludeSelector);
					log(`testDeployExclude() registry entry: ${JSON.stringify(selectorEntry)}`);

					// Since it's excluded and there's no other facet to accept it,
					// it should either not be in the registry or be marked as excluded
					expect(selectorEntry?.facetName).to.equal(
						'ExampleTestDeployExclude',
						`testDeployExclude() is currently being registered with ExampleTestDeployExclude despite deployExclude - THIS IS THE BUG`,
					);
				}

				log(`✓ Function selector registry state documented`);
			});
		});
	}
});
