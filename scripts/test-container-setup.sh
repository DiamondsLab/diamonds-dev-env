#!/bin/bash

# Test script for validating container setup in CI
# This script validates that the DevContainer has all required tools and dependencies

set -e

echo "🔍 Validating DevContainer setup..."
echo "=================================="

# Check Node.js version
echo "📦 Node.js version: $(node --version)"
NODE_VERSION=$(node --version | sed 's/v//')
if [[ "$NODE_VERSION" =~ ^(18|22) ]]; then
    echo "✅ Node.js ${NODE_VERSION%%.*}.x detected"
else
    echo "❌ Expected Node.js 18.x or 22.x, got $NODE_VERSION"
    exit 1
fi

# Check Yarn version
echo "🧶 Yarn version: $(yarn --version)"
YARN_VERSION=$(yarn --version)
if [[ "$YARN_VERSION" =~ ^(1\.22|[4-9]\.|[1-9][0-9]+\.) ]]; then
    echo "✅ Yarn ${YARN_VERSION%%.*}.x detected"
else
    echo "❌ Expected Yarn 1.22+ or 4+, got $YARN_VERSION"
    exit 1
fi

# Check core tools
echo "🔧 Checking core development tools..."

TOOLS=("hardhat" "forge" "solc" "git" "curl" "wget")
for tool in "${TOOLS[@]}"; do
    if command -v "$tool" &> /dev/null; then
        echo "✅ $tool: $(which $tool)"
    else
        echo "❌ $tool: not found"
        exit 1
    fi
done

# Check security tools (placeholders for now)
echo "🔒 Checking security tools..."
SECURITY_TOOLS=("slither" "solc-select")
for tool in "${SECURITY_TOOLS[@]}"; do
    if command -v "$tool" &> /dev/null; then
        echo "✅ $tool: $(which $tool)"
    else
        echo "⚠️  $tool: not found (will be added in future epic)"
    fi
done

# Check environment variables (without logging values)
echo "🌍 Checking environment variables..."
REQUIRED_VARS=("SNYK_TOKEN" "ETHERSCAN_API_KEY" "MAINNET_RPC_URL" "SEPOLIA_RPC_URL")
for var in "${REQUIRED_VARS[@]}"; do
    if [[ -n "${!var}" ]]; then
        echo "✅ $var: set"
    else
        echo "❌ $var: not set"
        exit 1
    fi
done

# Test basic functionality
echo "🧪 Testing basic functionality..."

# Test Hardhat compilation
echo "Testing Hardhat compilation..."
if npx hardhat compile --quiet; then
    echo "✅ Hardhat compilation successful"
else
    echo "❌ Hardhat compilation failed"
    exit 1
fi

# Test Yarn install (measure time)
echo "Testing Yarn dependency installation..."
START_TIME=$(date +%s)
if yarn install --immutable --silent; then
    END_TIME=$(date +%s)
    INSTALL_TIME=$((END_TIME - START_TIME))
    echo "✅ Yarn install successful in ${INSTALL_TIME}s"
    if [ "$INSTALL_TIME" -lt 300 ]; then
        echo "✅ Install time under 5 minutes"
    else
        echo "⚠️  Install time over 5 minutes: ${INSTALL_TIME}s"
    fi
else
    echo "❌ Yarn install failed"
    exit 1
fi

echo "=================================="
echo "🎉 Container validation complete!"
echo "All required tools and dependencies are available."