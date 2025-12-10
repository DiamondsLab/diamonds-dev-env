import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

/**
 * Prepare Echidna test environment
 * This script:
 * 1. Cleans old corpus and coverage artifacts (optional)
 * 2. Ensures contracts are compiled
 * 3. Generates diamond-abi files
 * 4. Creates necessary directories
 */
async function prepareEchidna(): Promise<void> {
	console.log('🚀 Preparing Echidna test environment...\n');

	const rootDir = process.cwd();
	const echidnaDir = path.join(rootDir, 'echidna');
	const corpusDir = path.join(echidnaDir, 'corpus');
	const coverageDir = path.join(echidnaDir, 'coverage');

	try {
		// Step 1: Create directories if they don't exist
		console.log('📁 Ensuring directories exist...');
		await fs.mkdir(corpusDir, { recursive: true });
		await fs.mkdir(coverageDir, { recursive: true });
		console.log('✅ Directories ready\n');

		// Step 2: Clean old artifacts (optional - controlled by flag)
		const shouldClean = process.argv.includes('--clean');
		if (shouldClean) {
			console.log('🧹 Cleaning old corpus and coverage artifacts...');
			try {
				const corpusFiles = await fs.readdir(corpusDir);
				for (const file of corpusFiles) {
					await fs.unlink(path.join(corpusDir, file));
				}
				console.log(`   Removed ${corpusFiles.length} corpus files`);

				const coverageFiles = await fs.readdir(coverageDir);
				for (const file of coverageFiles) {
					await fs.unlink(path.join(coverageDir, file));
				}
				console.log(`   Removed ${coverageFiles.length} coverage files`);
			} catch (error) {
				console.log('   No artifacts to clean');
			}
			console.log('✅ Cleanup complete\n');
		}

		// Step 3: Compile contracts
		console.log('🔨 Compiling contracts...');
		try {
			const { stdout, stderr } = await execAsync('npx hardhat compile');
			if (stderr && !stderr.includes('Nothing to compile')) {
				console.log(stderr);
			}
			console.log('✅ Contracts compiled\n');
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error('❌ Compilation failed:', (error as { stderr?: string }).stderr);
			}
			throw error;
		}

		// Step 4: Generate diamond-abi
		console.log('💎 Generating Diamond ABI...');
		try {
			const { stdout } = await execAsync(
				'npx hardhat diamond:generate-abi --diamond-name ExampleDiamond',
			);
			console.log('✅ Diamond ABI generated\n');
		} catch (error: unknown) {
			if (error instanceof Error) {
				console.error('❌ ABI generation failed:', (error as { stderr?: string }).stderr);
			}
			throw error;
		}

		// Step 5: Verify Echidna is installed
		console.log('🔍 Checking Echidna installation...');
		try {
			const { stdout } = await execAsync('echidna --version');
			console.log(`✅ Echidna found: ${stdout.trim()}\n`);
		} catch (error) {
			console.error('❌ Echidna not found! Please install Echidna first.');
			console.error('   Installation: https://github.com/crytic/echidna#installation');
			process.exit(1);
		}

		console.log('🎉 Echidna environment prepared successfully!\n');
		console.log('💡 Next steps:');
		console.log('   - Run fuzzing tests: yarn echidna:test');
		console.log('   - View coverage: check echidna/coverage/');
		console.log('   - Check corpus: check echidna/corpus/\n');
	} catch (error) {
		console.error('❌ Error preparing Echidna environment:', error);
		process.exit(1);
	}
}

// Run the preparation
prepareEchidna();
