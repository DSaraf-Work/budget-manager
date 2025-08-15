---
type: "manual"
description: "Example description"
---
# Secrets in Code Migration to External Secrets - AI Assistant Instructions

## Overview
This document provides instructions for an AI assistant to migrate hardcoded database URLs from Spring Boot application properties files to external managed secrets using environment variables.

## How to Use This Guide

**For Users**: Simply provide this README file along with the property key you want to migrate in your prompt:

```
Example Prompt:
"Using the DATABASE_URL_MIGRATION_INSTRUCTIONS.md, migrate the property key 'spring.datasource.url' to external secrets"
```

**For AI Assistant**: Follow the step-by-step instructions below to perform the migration automatically.

## AI Assistant Instructions

### Auto-proceed Policy
Once a user provides a property key to migrate (e.g., "spring.datasource.password"), the AI assistant must automatically execute the full migration workflow without asking for further confirmation on:
- Environment variable naming (follow {SERVICE_PREFIX}_{KEY_IN_SCREAMING_SNAKE})
- Fallback values (use stage as default; preserve local dev via nested fallbacks where applicable, e.g., MYSQL_USER/MYSQL_PASSWORD)
- Removal of keys from environment-specific files

### Batch Processing Multiple Secret Keys
When a user provides a list of multiple secret keys to migrate (e.g., "spring.datasource.password, external.hamlet.apiKey, external.hamlet.baseUrl"), the AI assistant should:

1. Process each secret key individually in the order provided
2. For each key, follow the existing migration workflow:
   - Centralize the property in application.properties with environment variable and fallback chain
   - Remove the key from all environment-specific properties files
   - Update dev/secrets/MIGRATED_KEYS_INDEX.md by appending the new environment variable to existing per-environment bash code blocks
3. Create an atomic git commit for each individual secret key following the established pattern:
   - Subject: the exact property key name (e.g., "external.hamlet.apiKey")
   - Body: three bullet points describing centralization, removal from env files, and MIGRATED_KEYS_INDEX updates
   - Include only files and changes relevant to that specific secret key
4. Proceed automatically to the next secret key without asking for confirmation
5. Continue this process until all provided secret keys have been migrated and committed

The AI should handle this batch processing automatically even when terminal output is not visible, creating separate commits for each key to maintain atomic, traceable changes in the git history.



### Step 1: Analyze Current Configuration

1. **Identify all properties files** containing the target key (provided by the user):
   ```bash
   KEY_TO_MIGRATE="<provided-key>"   # e.g., spring.datasource.url
   find . -name "application*.properties" -exec grep -l "^${KEY_TO_MIGRATE}[[:space:]]*=" {} \;
   ```

2. **Document existing values** for each environment for the target key:
   ```bash
   grep -n "^${KEY_TO_MIGRATE}[[:space:]]*=" */src/main/resources/application*.properties
   ```

3. **Choose a naming convention** for the environment variable:
   - Pattern: `{SERVICE_PREFIX}_{KEY_NAME_IN_SCREAMING_SNAKE_CASE}`
   - Example for `spring.datasource.url`: `UAS_DATASOURCE_URL`

### Step 2: Determine Default Fallback Value

1. **Choose which environment URL to use as default** (typically staging/stage)
2. **Extract the complete URL** including all query parameters
3. **This will be your fallback value** if the environment variable is not set

### Step 3: Update Main Application Properties

1. **Open** `src/main/resources/application.properties`

2. **Add the centralized configuration using the provided key**:
   ```properties
   ## Centralized Secret-managed Value
   <provided-key>=${<derived_env_var_name>:<fallback_value_from_stage_or_default>}
   ```

3. **Example (for spring.datasource.url)**:
   ```properties
   ## Database
   spring.datasource.url=${UAS_DATASOURCE_URL:jdbc:mysql://stage-db.example.com:3306/myservice?createDatabaseIfNotExist=true&useSSL=false&useUnicode=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=UTC}
   ```

### Step 4: Remove the key from Environment-Specific Files

For each environment-specific properties file, remove the provided key (not hardcoded to datasource):

1. **application-stage.properties**:
   ```bash
   KEY_TO_MIGRATE="<provided-key>"
   sed -i "/^${KEY_TO_MIGRATE//\./\\.}[[:space:]]*=/d" src/main/resources/application-stage.properties
   ```

2. **application-prod.properties**:
   ```bash
   sed -i "/^${KEY_TO_MIGRATE//\./\\.}[[:space:]]*=/d" src/main/resources/application-prod.properties
   ```

3. **application-alpha.properties**:
   ```bash
   sed -i "/^${KEY_TO_MIGRATE//\./\\.}[[:space:]]*=/d" src/main/resources/application-alpha.properties
   ```

4. **application-dev.properties**:
   ```bash
   sed -i "/^${KEY_TO_MIGRATE//\./\\.}[[:space:]]*=/d" src/main/resources/application-dev.properties
   ```

### Step 5: Create External Secret Key-Value Pairs

Document the required environment variable values for each environment:

#### Template:
```bash
# Environment: {ENVIRONMENT_NAME}
{DERIVED_ENV_VAR_NAME}={original_value_of_<provided-key>_from_that_environment}
```

#### Example Output (for provided key: spring.datasource.url)
```bash
# Stage Environment
UAS_DATASOURCE_URL=jdbc:mysql://stage-db.example.com:3306/myservice?createDatabaseIfNotExist=true&useSSL=false&useUnicode=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=UTC

# Production Environment
UAS_DATASOURCE_URL=jdbc:mysql://prod-db.example.com:3306/myservice?createDatabaseIfNotExist=true&useSSL=false&useUnicode=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=UTC

# Alpha Environment
UAS_DATASOURCE_URL=jdbc:mysql://alpha-db.example.com:3306/myservice?createDatabaseIfNotExist=true&useSSL=false&useUnicode=true&useJDBCCompliantTimezoneShift=true&useLegacyDatetimeCode=false&serverTimezone=UTC

# Development Environment
UAS_DATASOURCE_URL=jdbc:mysql://localhost:3306/myservice?createDatabaseIfNotExist=true
```

### Step 6: Verification Commands

1. **Verify no hardcoded values for the provided key remain**:
   ```bash
   KEY_TO_MIGRATE="<provided-key>"
   grep -r "^${KEY_TO_MIGRATE}[[:space:]]*=" src/main/resources/application-*.properties
   ```

2. **Check the centralized configuration exists**:
   ```bash
   KEY_TO_MIGRATE="<provided-key>"
   grep "^${KEY_TO_MIGRATE}[[:space:]]*=\${.*}" src/main/resources/application.properties
   ```

3. **Validate environment variable pattern**:
   ```bash
   # Confirm the derived environment variable name is used
   grep -o '\${[^}]*}' src/main/resources/application.properties
   ```

### Step 7: Create Documentation

Create a README file with the external secret key-value pairs:

```markdown
# Database URL Migration to External Secrets

## Required External Secret Key-Value Pairs

#### 🟢 **Stage Environment**
```bash
YOUR_SERVICE_DATASOURCE_URL=jdbc:mysql://stage-db.example.com:3306/...
```

#### 🔴 **Production Environment**
```bash
YOUR_SERVICE_DATASOURCE_URL=jdbc:mysql://prod-db.example.com:3306/...
```

#### 🟡 **Alpha Environment**
```bash
YOUR_SERVICE_DATASOURCE_URL=jdbc:mysql://alpha-db.example.com:3306/...
```

#### 🔵 **Development Environment**
```bash
YOUR_SERVICE_DATASOURCE_URL=jdbc:mysql://localhost:3306/...
```
```

### Step 8: Testing

1. **Local testing**:
   ```bash
   # Test with environment variable
   export YOUR_SERVICE_DATASOURCE_URL="jdbc:mysql://localhost:3306/test"
   ./mvnw spring-boot:run

   # Test fallback behavior (unset variable)
   unset YOUR_SERVICE_DATASOURCE_URL
   ./mvnw spring-boot:run
   ```

2. **Verify database connectivity** in application logs

3. **Test in each deployment environment** after setting the external secrets

## Automation Script Template

```bash
#!/bin/bash

# Configuration
SERVICE_PREFIX="YOUR_SERVICE"
ENV_VAR_NAME="${SERVICE_PREFIX}_DATASOURCE_URL"
DEFAULT_URL="jdbc:mysql://stage-db.example.com:3306/myservice?..."

# Step 1: Backup original files
cp -r src/main/resources src/main/resources.backup

# Step 2: Extract existing URLs
echo "Extracting existing database URLs..."
grep -n "spring.datasource.url" src/main/resources/application*.properties > original_urls.txt

# Step 3: Update main application.properties
echo "## Database" >> src/main/resources/application.properties
echo "spring.datasource.url=\${${ENV_VAR_NAME}:${DEFAULT_URL}}" >> src/main/resources/application.properties

# Step 4: Remove URLs from environment-specific files
for file in src/main/resources/application-*.properties; do
    if [ -f "$file" ]; then
        sed -i '/^spring\.datasource\.url/d' "$file"
        echo "Removed datasource URL from $file"
    fi
done

echo "Migration completed. Check original_urls.txt for external secret values."
```

## Common Patterns


## Complete Migration Workflow Checklist
A complete secrets migration includes the following steps:
1. Centralize the property in application.properties with an environment-variable-based value and appropriate fallback chain.
2. Remove the same key from all environment-specific properties files.
3. Update the migrated keys index: dev/secrets/MIGRATED_KEYS_INDEX.md with the key, env var name, fallback chain, and external secret values for each environment.
4. Provide external secret key-value pairs for each environment (stage, prod, alpha, dev) in the PR description or the migrated keys index.

## Documentation in MIGRATED_KEYS_INDEX.md
When a key is migrated, update dev/secrets/MIGRATED_KEYS_INDEX.md by appending the new environment variable and value to the existing per-environment bash code blocks. Do not create new "## Migrated Key:" sections.

Follow these rules:
1. Append a single line ENV_VAR=value inside each existing environment block:
   - 🟢 Stage: append to the Stage block under the "# External Secret Key-Value Pair" comment
   - 🔴 Production: append to the Production block under the same comment
   - 🟡 Alpha: append to the Alpha block under the same comment
   - 🔵 Development: append to the Development block (use a value or clear fallback instructions)
2. Maintain one consolidated set of environment sections that contains all migrated secrets.
3. Do not add separate sections per key; keep everything grouped by environment.
4. Preserve the existing header labels and the ```bash fenced code blocks.

Maintain consistency with the existing formatting, section headers, and structure already present in the migrated keys index file.



- **Naming Convention**: `{SERVICE_PREFIX}_DATASOURCE_URL`
- For username keys like `spring.datasource.username`, prefer a nested fallback to preserve local dev envs that already rely on `MYSQL_USER`:
  - Example: `spring.datasource.username=${UAS_DATASOURCE_USERNAME:${MYSQL_USER:curefit}}` where `curefit` is the stage default.

- **Default Fallback**: Use staging/stage environment URL
- **Environment Variable Format**: `${VAR_NAME:default_value}`
- **Documentation**: Always create a README with key-value pairs

## Troubleshooting

- **Missing environment variable**: Application will use the default fallback
- **Wrong URL format**: Check for special characters that need escaping
- **Connection failures**: Verify the extracted URLs match the originals exactly
- **Property not found**: Ensure the main application.properties is loaded first
