---
type: "agent_requested"
description: "Rules for accessing logs via Coralogix MCP Server"
---
- Everytime user asks you to check for logs, ask for a time frame(in IST) and try to find relevant logs within (or nearby if no logs found in that time frame) that given time frame.
- Use your knowledge of the current codebase and the fetched logs to establish workflow and analyse and understand the change in data at various steps
- Store it in memory for that chat and answer any user queries related to that, if any

## Logging Level
- log.info - Enabled on all env. Use this level judiciously so that these can be used to debug issues but at the same time should not be a lot of logs of this type
- log.error - Enabled on all env. For errors that causes data issue
- log.warn - Enabled on all env. For silent failures or potential issues to track
- log.debug - Enabled on alpha and stage. Comprehensive step logging for detailed debugging.