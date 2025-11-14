#!/bin/bash

# Deploy ExampleDiamond for Forge Testing
# Task 2.7: Create shell script wrapper
# Task 2.8: Start Hardhat node in background if not running
# Task 2.9: Add wait/retry logic to ensure node is ready
# Task 2.10: Call TypeScript deployment script
# Task 2.11: Add cleanup function to stop Hardhat node (optional)

set -e

# Configuration
HARDHAT_PORT=8545
HARDHAT_HOST="127.0.0.1"
HARDHAT_RPC="http://${HARDHAT_HOST}:${HARDHAT_PORT}"
HARDHAT_PID_FILE=".hardhat-node.pid"
MAX_WAIT_TIME=30  # seconds
CLEANUP_ON_EXIT=false  # Set to true to auto-stop node after tests

# Color output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
DIM='\033[2m'
NC='\033[0m' # No Color

# Print functions
print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_dim() {
    echo -e "${DIM}   $1${NC}"
}

# Task 2.11: Cleanup function to stop Hardhat node
cleanup() {
    if [ "$CLEANUP_ON_EXIT" = true ] && [ -f "$HARDHAT_PID_FILE" ]; then
        print_info "Cleaning up: Stopping Hardhat node..."
        
        HARDHAT_PID=$(cat "$HARDHAT_PID_FILE")
        
        if ps -p "$HARDHAT_PID" > /dev/null 2>&1; then
            kill "$HARDHAT_PID" 2>/dev/null || true
            sleep 1
            
            # Force kill if still running
            if ps -p "$HARDHAT_PID" > /dev/null 2>&1; then
                kill -9 "$HARDHAT_PID" 2>/dev/null || true
            fi
            
            print_success "Hardhat node stopped"
        fi
        
        rm -f "$HARDHAT_PID_FILE"
    fi
}

# Set up cleanup trap
trap cleanup EXIT INT TERM

# Task 2.8: Check if Hardhat node is running
check_hardhat_node() {
    print_info "Checking if Hardhat node is running..."
    
    if curl -s -X POST \
        -H "Content-Type: application/json" \
        --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
        "$HARDHAT_RPC" > /dev/null 2>&1; then
        print_success "Hardhat node is running at $HARDHAT_RPC"
        return 0
    else
        print_warning "Hardhat node is not running at $HARDHAT_RPC"
        return 1
    fi
}

# Task 2.8: Start Hardhat node in background
start_hardhat_node() {
    print_info "Starting Hardhat node in background..."
    
    # Kill any existing process on the port
    if lsof -Pi :$HARDHAT_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $HARDHAT_PORT is in use, attempting to free it..."
        lsof -ti :$HARDHAT_PORT | xargs kill -9 2>/dev/null || true
        sleep 2
    fi
    
    # Start Hardhat node in background
    nohup npx hardhat node --port "$HARDHAT_PORT" > hardhat-node.log 2>&1 &
    HARDHAT_PID=$!
    
    echo "$HARDHAT_PID" > "$HARDHAT_PID_FILE"
    
    print_dim "Hardhat node PID: $HARDHAT_PID"
    print_dim "Logs: hardhat-node.log"
}

# Task 2.9: Wait for Hardhat node to be ready
wait_for_hardhat_node() {
    print_info "Waiting for Hardhat node to be ready..."
    
    local elapsed=0
    local interval=1
    
    while [ $elapsed -lt $MAX_WAIT_TIME ]; do
        if curl -s -X POST \
            -H "Content-Type: application/json" \
            --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}' \
            "$HARDHAT_RPC" > /dev/null 2>&1; then
            print_success "Hardhat node is ready!"
            return 0
        fi
        
        sleep $interval
        elapsed=$((elapsed + interval))
        
        if [ $((elapsed % 5)) -eq 0 ]; then
            print_dim "Still waiting... (${elapsed}s elapsed)"
        fi
    done
    
    print_error "Hardhat node failed to start within ${MAX_WAIT_TIME}s"
    
    # Show last few lines of log for debugging
    if [ -f "hardhat-node.log" ]; then
        echo ""
        print_error "Last 10 lines of hardhat-node.log:"
        tail -n 10 hardhat-node.log
    fi
    
    return 1
}

# Main execution
main() {
    echo ""
    print_info "Deploy Diamond for Forge Testing"
    echo ""
    
    # Task 2.8 & 2.9: Ensure Hardhat node is running
    if ! check_hardhat_node; then
        start_hardhat_node
        
        if ! wait_for_hardhat_node; then
            print_error "Failed to start Hardhat node"
            exit 1
        fi
    fi
    
    echo ""
    print_info "Node is ready, proceeding with deployment..."
    echo ""
    
    # Task 2.10: Call the TypeScript deployment script
    if npx hardhat run scripts/test-deploy-diamond.ts --network localhost; then
        echo ""
        print_success "Deployment completed successfully!"
        echo ""
        print_info "Next steps:"
        print_dim "Run Forge tests: forge test"
        print_dim "Check deployment info: cat .forge-diamond-address"
        echo ""
        
        if [ "$CLEANUP_ON_EXIT" = false ]; then
            print_info "Hardhat node is still running"
            print_dim "To stop: kill \$(cat .hardhat-node.pid)"
            print_dim "Or manually: pkill -f 'hardhat node'"
            echo ""
        fi
        
        exit 0
    else
        print_error "Deployment failed"
        echo ""
        print_info "Check the output above for error details"
        print_dim "Hardhat node logs: cat hardhat-node.log"
        echo ""
        exit 1
    fi
}

# Run main function
main "$@"
