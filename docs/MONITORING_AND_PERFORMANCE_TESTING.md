# Diamond Monitoring and Performance Testing Guide

## Overview

This guide covers the monitoring capabilities and performance testing suite for Diamond contracts. The monitoring system provides real-time health checks, event tracking, and performance metrics for deployed Diamond proxies.

## Diamond Monitoring System

The `DiamondMonitor` class from `@diamondslab/diamonds-monitor` provides comprehensive monitoring capabilities for Diamond contracts.

### Features

- **Real-time Health Checks**: Monitor Diamond contract health and responsiveness
- **Event Tracking**: Track facet changes, upgrades, and other Diamond events
- **Performance Metrics**: Measure response times, latency, and throughput
- **Multi-Diamond Support**: Monitor multiple Diamond instances concurrently
- **Network Resilience**: Graceful handling of provider errors and recovery

### Basic Usage

```typescript
import { DiamondMonitor } from "@diamondslab/diamonds-monitor";
import { Diamond } from "@diamondslab/diamonds";

const monitor = new DiamondMonitor(diamond, provider, {
  pollingInterval: 1000,
  enableEventLogging: true,
  enableHealthChecks: true,
  alertThresholds: {
    maxResponseTime: 5000,
    maxFailedChecks: 5,
  },
});

// Get health status
const health = await monitor.getHealthStatus();
console.log(`Diamond is ${health.isHealthy ? "healthy" : "unhealthy"}`);

// Track events
const eventEmitter = monitor.trackEvents();
eventEmitter.on("facetChanged", (event) => {
  console.log("Facet changed:", event);
});

// Stop monitoring
monitor.stopMonitoring();
```

## Performance Testing Suite

The performance testing suite validates the monitoring system's behavior under various stress conditions. These tests are located in `test/integration/performance-monitoring.test.ts`.

### ⚠️ Important: Optional Performance Tests

**Performance tests are SKIPPED by default** due to their long runtime (up to 10 minutes). They must be explicitly enabled using environment variables.

### Running Performance Tests

#### Standard Performance Tests

```bash
RUN_PERFORMANCE_TESTS=true yarn hardhat test test/integration/performance-monitoring.test.ts
```

#### Extended Long-Running Tests

```bash
RUN_PERFORMANCE_TESTS=true LONG_RUNNING_TEST=true yarn hardhat test test/integration/performance-monitoring.test.ts
```

#### Running Specific Test Suites

```bash
# High-frequency event processing
RUN_PERFORMANCE_TESTS=true yarn hardhat test test/integration/performance-monitoring.test.ts --grep "High-Frequency"

# Concurrent monitoring
RUN_PERFORMANCE_TESTS=true yarn hardhat test test/integration/performance-monitoring.test.ts --grep "Concurrent"

# Response time benchmarks
RUN_PERFORMANCE_TESTS=true yarn hardhat test test/integration/performance-monitoring.test.ts --grep "Response Time"
```

### Environment Variables

| Variable                | Description                   | Default           |
| ----------------------- | ----------------------------- | ----------------- |
| `RUN_PERFORMANCE_TESTS` | Enable performance tests      | `false` (skipped) |
| `LONG_RUNNING_TEST`     | Enable 1-hour stability tests | `false` (skipped) |

### Test Coverage

The performance testing suite covers:

#### 🚀 High-Frequency Event Processing

- **100+ events per minute**: Validates system can handle sustained high-frequency event streams
- **Low latency under load**: Ensures event processing latency stays under 100ms target
- **Metrics tracked**: Event count, latency (min/avg/max), memory usage

#### 🔄 Concurrent Monitoring

- **Multiple diamonds**: Tests monitoring of 5-10 Diamond instances simultaneously
- **Independent state**: Verifies each monitor maintains separate state
- **Concurrent health checks**: Measures performance of parallel health status queries

#### ⏱️ Long-Running Monitoring

- **Extended stability**: 1-hour continuous monitoring test (requires `LONG_RUNNING_TEST=true`)
- **Memory tracking**: Monitors memory growth over time
- **Leak detection**: Validates memory growth stays under 50MB threshold

#### 🌐 Network Resilience

- **Provider error recovery**: Tests graceful handling of network failures
- **Rapid consecutive calls**: Validates stability under rapid-fire API calls
- **Error handling**: Ensures monitor recovers from transient failures

#### ⚡ Response Time Benchmarks

- **Health check performance**: Target <500ms response time
- **Event processing latency**: Target <100ms per event
- **Facet analysis**: Measures time to analyze facet configurations

### Performance Targets

The test suite validates against these benchmarks:

```typescript
const PERFORMANCE_TARGETS = {
  healthCheckResponseTime: 500, // ms
  eventProcessingLatency: 100, // ms
  eventsPerMinute: 100,
  maxMemoryGrowth: 50 * 1024 * 1024, // 50 MB
  concurrentDiamonds: 10,
};
```

### Sample Output

```
⚡ Performance and Stress Testing
  🚀 High-Frequency Event Processing
    📊 Testing high-frequency event processing (60 seconds)...
    ✅ Processed 150 events in 60000ms
    📈 Events per minute: 150.00
    ✓ should handle 100+ events per minute (60234ms)

    📊 Monitoring for 30 seconds with performance tracking...
    📋 Performance Metrics:
      Duration: 30000ms
      Total Events: 75
      Events/sec: 2.50
      Avg Latency: 45.23ms
      Min Latency: 12.50ms
      Max Latency: 89.40ms
      Heap Used: 45.23 MB
    ✓ should maintain low latency under sustained load (30456ms)

  🔄 Concurrent Monitoring
    📊 Testing concurrent monitoring of 5 diamonds...
    ✅ Diamond 1/5 deployed and monitored
    ✅ Diamond 2/5 deployed and monitored
    ✅ Diamond 3/5 deployed and monitored
    ✅ Diamond 4/5 deployed and monitored
    ✅ Diamond 5/5 deployed and monitored
    🔍 Performing concurrent health checks...
    ✅ All 5 health checks completed in 234ms
    📈 Average time per check: 46.80ms
    ✓ should handle monitoring of multiple diamonds concurrently (45789ms)

  ⚡ Response Time Benchmarks
    📊 Running 50 health checks...
    ✅ Performance Report:
      Total Checks: 50
      Successful: 50
      Failed: 0
      Avg Response Time: 123.45ms
      Min Response Time: 45.20ms
      Max Response Time: 234.50ms
      Checks Under Target (500ms): 50 (100.0%)
    ✓ should complete health checks within 500ms target (6234ms)
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Performance Tests

on:
  schedule:
    - cron: "0 2 * * 0" # Weekly on Sunday at 2 AM
  workflow_dispatch:

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: "18"

      - name: Install dependencies
        run: yarn install

      - name: Run performance tests
        run: RUN_PERFORMANCE_TESTS=true yarn hardhat test test/integration/performance-monitoring.test.ts

      - name: Run long-running tests (optional)
        if: github.event_name == 'workflow_dispatch'
        run: RUN_PERFORMANCE_TESTS=true LONG_RUNNING_TEST=true yarn hardhat test test/integration/performance-monitoring.test.ts
```

## Best Practices

### 1. Development Workflow

- **Skip by default**: Performance tests are disabled during normal development
- **Pre-release testing**: Enable performance tests before major releases
- **Baseline establishment**: Run periodically to establish performance baselines

### 2. Monitoring Configuration

```typescript
// Production monitoring
const monitor = new DiamondMonitor(diamond, provider, {
  pollingInterval: 5000, // 5 seconds in production
  enableEventLogging: true,
  enableHealthChecks: true,
  alertThresholds: {
    maxResponseTime: 10000, // 10 seconds
    maxFailedChecks: 3,
  },
});

// Development monitoring
const devMonitor = new DiamondMonitor(diamond, provider, {
  pollingInterval: 1000, // 1 second for faster feedback
  enableEventLogging: true,
  enableHealthChecks: false, // Disable to reduce noise
});
```

### 3. Memory Management

For long-running monitoring sessions:

```typescript
// Track memory usage
const initialMemory = process.memoryUsage();

// ... monitoring operations ...

const currentMemory = process.memoryUsage();
const memoryGrowth = currentMemory.heapUsed - initialMemory.heapUsed;

if (memoryGrowth > 50 * 1024 * 1024) {
  // 50MB threshold
  console.warn("High memory growth detected:", memoryGrowth);
  // Consider restarting monitor
}
```

### 4. Concurrent Monitoring

When monitoring multiple diamonds:

```typescript
const monitors = diamonds.map(
  (diamond) =>
    new DiamondMonitor(diamond, provider, {
      pollingInterval: 2000, // Increase interval to reduce load
      enableEventLogging: false,
    }),
);

// Batch health checks
const healthStatuses = await Promise.all(
  monitors.map((m) => m.getHealthStatus()),
);

// Cleanup
monitors.forEach((m) => m.stopMonitoring());
```

## Troubleshooting

### Tests Timing Out

If performance tests timeout:

1. **Increase test timeout**: Modify `this.timeout()` values in test file
2. **Reduce test duration**: Adjust duration constants for faster iterations
3. **Check network**: Ensure Hardhat node is running and responsive

### High Memory Usage

If memory usage exceeds targets:

1. **Check event listeners**: Ensure old listeners are removed
2. **Monitor cleanup**: Call `stopMonitoring()` when done
3. **Reduce polling frequency**: Increase `pollingInterval` value

### Network Errors

If seeing provider errors:

1. **Verify Hardhat node**: Ensure local node is running (`npx hardhat node`)
2. **Check provider config**: Verify correct RPC URL and network
3. **Review error handling**: Check monitor's error recovery logic

## Related Documentation

- [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) - Overall project architecture
- [BUILD_AND_DEPLOYMENT.md](BUILD_AND_DEPLOYMENT.md) - Build and deployment processes
- [packages/diamonds-monitor/README.md](../packages/diamonds-monitor/README.md) - Monitor package documentation

## Additional Resources

- **Test file**: `test/integration/performance-monitoring.test.ts`
- **Monitor package**: `packages/diamonds-monitor/`
- **Diamond deployment**: `packages/hardhat-diamonds/`
