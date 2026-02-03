#!/bin/bash
# SPDX Consolidation Verification Script
# This script verifies that the flattened Diamond contract has only one SPDX identifier

FLATTENED_FILE="flat/ExampleDiamond-flat.sol"

echo "🔍 Verifying SPDX consolidation in ${FLATTENED_FILE}..."
echo ""

# Check if file exists
if [ ! -f "$FLATTENED_FILE" ]; then
    echo "❌ Error: ${FLATTENED_FILE} not found!"
    echo "   Run: npx hardhat diamond:flatten --diamond-name ExampleDiamond --output flat/ExampleDiamond-flat.sol"
    exit 1
fi

# Count SPDX identifiers
SPDX_COUNT=$(grep -c "SPDX-License-Identifier" "$FLATTENED_FILE")

echo "📊 SPDX-License-Identifier count: ${SPDX_COUNT}"
echo ""

# Verify exactly one SPDX
if [ "$SPDX_COUNT" -eq 1 ]; then
    echo "✅ SUCCESS: Exactly ONE SPDX identifier found"
else
    echo "❌ FAIL: Expected 1 SPDX identifier, found ${SPDX_COUNT}"
    echo ""
    echo "   Locations of SPDX identifiers:"
    grep -n "SPDX-License-Identifier" "$FLATTENED_FILE"
    exit 1
fi

# Verify SPDX is on first line
FIRST_LINE=$(head -1 "$FLATTENED_FILE")
if echo "$FIRST_LINE" | grep -q "SPDX-License-Identifier"; then
    echo "✅ SPDX is on the first line"
else
    echo "❌ FAIL: SPDX is not on the first line"
    echo "   First line: $FIRST_LINE"
    exit 1
fi

# Verify pragma is on second line
SECOND_LINE=$(sed -n '2p' "$FLATTENED_FILE")
if echo "$SECOND_LINE" | grep -q "pragma solidity"; then
    echo "✅ Pragma is on the second line"
else
    echo "❌ FAIL: Pragma is not on the second line"
    echo "   Second line: $SECOND_LINE"
    exit 1
fi

echo ""
echo "🎉 All SPDX consolidation checks passed!"
echo ""
echo "First 5 lines of flattened file:"
echo "---"
head -5 "$FLATTENED_FILE"
echo "---"
