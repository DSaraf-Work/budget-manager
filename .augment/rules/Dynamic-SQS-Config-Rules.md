---
type: "manual"
description: "Spring Boot implementation guide for dynamic SQS consumer control using ConfigStore/AppConfig with dual-mode support (polling vs event-driven). Enables runtime control of SQS consumers across environments without restarts."
---
# Dynamic SQS Consumer Control Implementation Guide - Spring Boot Version

## Overview

This guide provides step-by-step instructions for implementing dynamic SQS consumer control using ConfigStore/AppConfig instead of static environment variables for **Spring Boot applications**. This pattern allows runtime control of SQS consumers across different environments without requiring application restarts or deployments.

### Key Benefits
- **Runtime Control**: Enable/disable consumers dynamically without restarts
- **Environment-Specific Configuration**: Different consumer states per environment
- **Centralized Management**: Single configuration source for all consumer states
- **Graceful State Transitions**: Safe start/stop of consumers with proper error handling
- **Spring Boot Integration**: Leverages Spring's lifecycle management and dependency injection

## Prerequisites

### Required Dependencies
```xml
<!-- Jackson for JSON processing (usually included with Spring Boot) -->
<dependency>
    <groupId>com.fasterxml.jackson.core</groupId>
    <artifactId>jackson-databind</artifactId>
</dependency>

<!-- Spring Boot Starter -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter</artifactId>
</dependency>

<!-- Lombok for logging -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
</dependency>

<!-- ConfigStore SDK (if using Curefit's ConfigStore) -->
<dependency>
    <groupId>com.curefit.configstore</groupId>
    <artifactId>configstore-sdk</artifactId>
</dependency>
```

### Required Imports
```java
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
```

## Implementation Steps

### Step 1: Create AppConfig Listener Service

Create `SQSConsumerAppConfigListener.java`:

```java
@Slf4j
@Service
@EnableScheduling
public class SQSConsumerAppConfigListener extends AppConfigRefreshListener {
    private static final String SQS_CONSUMER_TO_ENABLED_ENV_MAP_KEY = "sqs_consumer_to_enabled_env_map";

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ConfigStoreWrapperService configStoreWrapperService;

    @Value("${app.environment}")
    private String appEnvironment;

    @Value("${sqs.consumer.config.mode:POLLING}")
    private String configMode; // POLLING or EVENT_DRIVEN

    private ScheduledExecutorService scheduler = Executors.newSingleThreadScheduledExecutor();

    // Static registries for consumer management
    private static final Map<String, BaseSqsConsumer> consumerIdentifierRegistry = new ConcurrentHashMap<>();
    private static final Map<String, SQSMultiConsumerQueueConfig> consumerConfigRegistry = new ConcurrentHashMap<>();
    private volatile boolean configFound = false;

    @PostConstruct
    public void start() {
        if ("POLLING".equalsIgnoreCase(configMode)) {
            log.info("Starting SQS consumer configuration polling mode");
            scheduler.scheduleWithFixedDelay(this::pollConfiguration, 0, 5, TimeUnit.SECONDS);
        } else if ("EVENT_DRIVEN".equalsIgnoreCase(configMode)) {
            log.info("Starting SQS consumer configuration event-driven mode");
            // Register this listener with AppConfigCache for refresh events
            registerForConfigRefresh();
        } else {
            log.warn("Unknown config mode: {}, defaulting to POLLING", configMode);
            scheduler.scheduleWithFixedDelay(this::pollConfiguration, 0, 5, TimeUnit.SECONDS);
        }
    }

    @PreDestroy
    public void stop() {
        log.info("Stopping SQS consumer configuration listener");
        if ("POLLING".equalsIgnoreCase(configMode)) {
            shutdownScheduler(10);
        }
    }

    // Static method to register consumers
    public static void registerConsumerWithIdentifier(String consumerIdentifier,
                                                    BaseSqsConsumer consumer,
                                                    SQSMultiConsumerQueueConfig config) {
        consumerIdentifierRegistry.put(consumerIdentifier, consumer);
        consumerConfigRegistry.put(consumerIdentifier, config);
        log.info("Registered consumer with identifier: {} and config: {}", consumerIdentifier, config);
    }
}
```

### Step 2: Implement Configuration Handling Logic

Add these methods to the AppConfig listener:

```java
// Event-driven configuration refresh (called when config changes)
@Override
public void configsRefreshed() {
    log.info("Config refresh event received, updating SQS consumer configurations");
    try {
        handleConsumerConfigRefresh();
    } catch (Exception e) {
        log.error("Error handling config refresh: {}", e.getMessage());
    }
}

// Polling-based configuration check
private void pollConfiguration() {
    try {
        Optional<JsonNode> optionalConfigValue = configStoreGateway.getPropertyValue(
            ConfigNames.NAMESPACE_NAME, SQS_CONSUMER_TO_ENABLED_ENV_MAP_KEY);
        if (optionalConfigValue.isPresent() && !configFound) {
            log.info("Found SQS consumer configuration, stopping polling");
            configFound = true;
            handleConsumerConfig(optionalConfigValue.get());
            stopPolling();
        }
    } catch (Exception e) {
        log.error("Error polling configuration = {}", e.getMessage());
    }
}

// Common configuration handling for both modes
private void handleConsumerConfigRefresh() {
    try {
        Map<String, SQSMultiConsumerQueueConfig> configMap = configStoreWrapperService.getConfigValue(SQS_CONSUMER_TO_ENABLED_ENV_MAP_KEY);
        if (configMap == null || configMap.isEmpty()) {
            log.warn("No consumer enabled configs found in config store");
            return;
        }

        for (Map.Entry<String, SQSMultiConsumerQueueConfig> entry : configMap.entrySet()) {
            String consumerIdentifier = entry.getKey();
            SQSMultiConsumerQueueConfig config = entry.getValue();
            boolean shouldBeEnabled = config.getEnabledEnvs().contains(appEnvironment);
            processConsumerByIdentifier(consumerIdentifier, shouldBeEnabled, appEnvironment);
        }
    } catch (Exception e) {
        log.error("Unexpected error handling consumer config refresh: {}", e.getMessage());
    }
}

// Legacy polling-based config handling (for backward compatibility)
private void handleConsumerConfig(JsonNode configValue) {
    try {
        String currentEnv = System.getenv("APP_ENV");
        if (currentEnv == null) {
            log.warn("APP_ENV not set, skipping consumer configuration");
            return;
        }

        Map<String, List<String>> consumerToEnvMap = parseConfigValue(configValue);

        for (Map.Entry<String, List<String>> entry : consumerToEnvMap.entrySet()) {
            String consumerIdentifier = entry.getKey();
            List<String> enabledEnvironments = entry.getValue();
            boolean shouldBeEnabled = enabledEnvironments.contains(currentEnv);
            processConsumerByIdentifier(consumerIdentifier, shouldBeEnabled, currentEnv);
        }
    } catch (Exception e) {
        log.error("Unexpected error handling consumer config: {}", e.getMessage());
    }
}

// Register this listener for config refresh events
private void registerForConfigRefresh() {
    // Implementation depends on your ConfigStore SDK
    // This would typically register this instance as a listener
    // Example: AppConfigCache.registerRefreshListener(this);
    log.info("Registered for config refresh events");
}
```

### Step 3: Modify Existing Consumer Classes

Update your consumer classes to register with the AppConfig listener:

```java
@Slf4j
public class YourEventConsumer extends BaseSqsConsumer {
    private static final String CONSUMER_IDENTIFIER = "yourEventConsumerConfig";

    public YourEventConsumer(String consumerId, String queueUrl, int batchSize, int parallelProcessingBatchSize,
                            ObjectMapper objectMapper, RollbarService rollbarService) {
        super(queueUrl, Region.AP_SOUTH_1, 1L, batchSize);

        // Create config object for registration
        SQSMultiConsumerQueueConfig config = new SQSMultiConsumerQueueConfig();
        config.setBatchSize(batchSize);
        config.setParallelProcessingBatchSize(parallelProcessingBatchSize);

        // Register this consumer with the AppConfig listener
        SQSConsumerAppConfigListener.registerConsumerWithIdentifier(
            CONSUMER_IDENTIFIER, this, config);
    }

    @Override
    public List<Boolean> process(List<Message> messages) {
        // Your message processing logic here
        return messages.stream().map(this::processMessage).collect(Collectors.toList());
    }

    private Boolean processMessage(Message message) {
        // Process individual message
        return true;
    }
}
```

### Step 4: Configure Dependency Injection

The AppConfig listener is automatically managed by Spring Boot through the `@Service` annotation. No additional DI configuration is needed.

### Step 5: Register with Application Lifecycle

Spring Boot automatically manages the lifecycle through `@PostConstruct` and `@PreDestroy` annotations. No additional registration is needed.

## Configuration Format

### ConfigStore JSON Structure

The configuration should be stored in ConfigStore with the key `sqs_consumer_to_enabled_env_map`:

```json
{
  "YourEventConsumer": ["alpha", "prod"],
  "YourEventConsumer2": ["alpha", "stage", "prod"]
}
```

### Environment Variables Required

- `app.environment`: Current environment name (e.g., "alpha", "beta", "prod")

### Configuration Mode

The implementation supports two modes for configuration management:

#### 1. Polling Mode (Default)
```properties
sqs.consumer.config.mode=POLLING
```
- Periodically polls ConfigStore for configuration changes
- Stops polling once configuration is found
- Backward compatible with existing implementations

#### 2. Event-Driven Mode
```properties
sqs.consumer.config.mode=EVENT_DRIVEN
```
- Listens for configuration refresh events from AppConfigCache
- More efficient as it responds immediately to config changes
- Requires extending `AppConfigRefreshListener` and implementing `configsRefreshed()` method

If no mode is specified, the system defaults to `POLLING` mode.

## Troubleshooting

### Common Issues

1. **Consumer Not Starting**
   - Check if consumer identifier matches ConfigStore key
   - Verify APP_ENV is set correctly
   - Ensure consumer is registered before configuration polling

2. **Configuration Not Found**
   - Verify ConfigStore namespace and key
   - Check ConfigStore connectivity
   - Review polling logs for errors

3. **Consumer State Mismatch**
   - Check current vs desired state logging
   - Verify configuration parsing
   - Review consumer start/stop error logs

### Debug Logging
Enable debug logging to troubleshoot:
```java
log.debug("Consumer config for identifier: {} - Environment: {}, Should be enabled: {}, Currently enabled: {}",
    consumerIdentifier, currentEnv, shouldBeEnabled, currentlyEnabled);
```

## Code Templates


## Best Practices

### 1. Consumer Identifier Naming
- Use descriptive, unique identifiers that match your configuration keys
- Follow consistent naming convention: `{eventType}ConsumerConfig`
- Examples: `checkinEventConsumerConfig`, `membershipEventConsumerConfig`

---> No, use name of class for the consumer

### 2. Error Handling
- Always wrap consumer start/stop operations in try-catch blocks
- Log detailed error messages with consumer identifiers
- Continue processing other consumers even if one fails
- rollbar.log, if a start or stop operations fails

### 3. Configuration Management
- Use environment-specific arrays in ConfigStore
- Keep configuration simple and readable
- Document which environments each consumer should run in

### 4. Monitoring and Observability
- Add metrics for consumer state changes
- Monitor configuration polling frequency
- Alert on consumer start/stop failures

### 5. Graceful Shutdown
- Implement proper scheduler shutdown with timeouts
- Handle interruption gracefully
- Ensure resources are cleaned up properly

## Migration Strategy

### From Static Environment Variables

1. **Phase 1**: Add AppConfig listener alongside existing environment variable logic
2. **Phase 2**: Update consumers to register with AppConfig listener
3. **Phase 3**: Configure dynamic control in ConfigStore
4. **Phase 4**: Remove environment variable dependencies
5. **Phase 5**: Verify all environments work correctly

add configstore env variable
    configstore.url=${CONFIG_STORE_URL:http://config-store.stage.cure.fit.internal/}
    configstore.apiKey=${CONFIG_STORE_KEY:user-activity-service-stage-access}
    configstore.enabled=${CONFIG_STORE_ENABLED:true}

### Rollback Plan
- Keep environment variable fallback during migration
- Test thoroughly in non-production environments first
- Have ConfigStore rollback procedures ready

## Security Considerations

- Ensure ConfigStore access is properly authenticated
- Limit who can modify consumer configurations
- Audit configuration changes
- Use secure communication channels for ConfigStore





## Code Templates

### Consumer Registration Template
```java
private static final String CONSUMER_IDENTIFIER = "yourConsumerConfig";

public YourConsumer(QueueClient queueClient, Configuration config) {
    super(queueClient, config);
    SQSConsumerAppConfigListener.registerConsumerWithIdentifier(
        CONSUMER_IDENTIFIER, this, getConsumerQueueConfig(config));
}
```

### Configuration Namespace Template
```java
public abstract class ConfigNames {
    public static final String YOUR_NAMESPACE_NAME = "your-service";
    // ... other config constants
}
```

## Complete Implementation Details

### Consumer State Management Methods

Add these methods to complete the AppConfig listener implementation:
 -> Simplify these if possible into a smaller funcitons while maintaining all context
```java
private Map<String, List<String>> parseConfigValue(JsonNode configValue) throws IOException {
    if (configValue.isTextual()) {
        // Handle JSON string format
        String jsonString = configValue.asText();
        return objectMapper.readValue(jsonString, new TypeReference<Map<String, List<String>>>() {});
    } else {
        // Handle parsed JSON object format
        return objectMapper.convertValue(configValue, new TypeReference<Map<String, List<String>>>() {});
    }
}

private void processConsumerByIdentifier(String consumerIdentifier, boolean shouldBeEnabled, String currentEnv) {
    BaseSqsConsumer consumer = consumerIdentifierRegistry.get(consumerIdentifier);
    if (consumer == null) {
        log.warn("No consumer registered for identifier: {}", consumerIdentifier);
        return;
    }

    SQSMultiConsumerQueueConfig config = consumerConfigRegistry.get(consumerIdentifier);
    if (config == null) {
        log.warn("No configuration found for consumer identifier: {}", consumerIdentifier);
        return;
    }

    boolean currentlyEnabled = config.getEnabledEnvs().contains(appEnvironment);
    log.debug("Consumer config for identifier: {} - Environment: {}, Should be enabled: {}, Currently enabled: {}",
            consumerIdentifier, currentEnv, shouldBeEnabled, currentlyEnabled);

    if (shouldBeEnabled && !currentlyEnabled) {
        log.info("Starting consumer: {} in environment: {}", consumerIdentifier, currentEnv);
        try {
            // Update config to include current environment
            config.getEnabledEnvs().add(appEnvironment);
            // Start consumer (BaseSqsConsumer handles this automatically)
        } catch (Exception e) {
            log.error("Failed to start consumer: {} with error: {}", consumerIdentifier, e.getMessage());
        }
    } else if (!shouldBeEnabled && currentlyEnabled) {
        log.info("Stopping consumer: {} in environment: {}", consumerIdentifier, currentEnv);
        try {
            // Update config to remove current environment
            config.getEnabledEnvs().remove(appEnvironment);
            consumer.shutDown();
        } catch (Exception e) {
            log.error("Failed to stop consumer: {} with error: {}", consumerIdentifier, e.getMessage());
        }
    } else {
        log.debug("Consumer state matches desired state for identifier: {}, no action needed", consumerIdentifier);
    }
}

private void stopPolling() {
    log.info("Stopping configuration polling - config has been fetched");
    shutdownScheduler(5);
}

private void shutdownScheduler(int timeoutSeconds) {
    try {
        scheduler.shutdown();
        if (!scheduler.awaitTermination(timeoutSeconds, TimeUnit.SECONDS)) {
            scheduler.shutdownNow();
        }
    } catch (InterruptedException e) {
        scheduler.shutdownNow();
        Thread.currentThread().interrupt();
    }
}
```

This implementation provides a robust, scalable solution for dynamic SQS consumer control that can be easily adapted to different repositories and services.
