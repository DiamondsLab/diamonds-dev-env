#!/usr/bin/env npx ts-node

import hre from 'hardhat';

async function testExampleUpgradeFacet(): Promise<void> {
	try {
		interface AbiFunction {
			type: string;
			name: string;
			inputs: Array<{ type: string }>;
		}

		const artifact = await hre.artifacts.readArtifact('ExampleUpgradeFacet');
		console.log('✅ ExampleUpgradeFacet artifact found:');
		console.log(`   Contract Name: ${artifact.contractName}`);

		const functions = artifact.abi.filter(
			(f: AbiFunction) => f.type === 'function',
		) as AbiFunction[];
		console.log(`   Functions: ${functions.length}`);

		functions.forEach((func: AbiFunction) => {
			const signature = `${func.name}(${func.inputs.map((i) => i.type).join(',')})`;
			const selector = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(signature)).slice(0, 10);
			console.log(`     - ${signature}: ${selector}`);
		});
	} catch (error: unknown) {
		console.log(
			'❌ Error loading ExampleUpgradeFacet artifact:',
			error instanceof Error ? error.message : String(error),
		);
	}
}

testExampleUpgradeFacet().catch(console.error);
