---
type: "always_apply"
---

## MUST FOLLOW FOR JAVA SPRING REPOS:
1. use @Slf4j logger always instead of LoggerFactory
2. Keep changes to minimum, stick to what user has asked for
3. Do not refactor code that is not directly related to the ask or not required
4. Try to achieve user's goal with the minimum code changes
5. Avoid using reflections until user explicitly asks you to. Assume lombok generated functions would be present if a class is annotated with @Data, @Getter, @Setter etc.
6. SQS/Event consumers should be kept clean and focused on message routing, while the relevant service should handle all the business logic including logging.
   - For dynamic SQS consumer control, refer to Dynamic-SQS-Config-Rules.md for Spring Boot implementation patterns
7. Do not add very detailed comments for each step. Rather just add high level natural language comments for complex logic. 
8. Reuse code as much as possible and avoid duplicacy

## Tools Dictionary
### Check if user prompt requires this tool's assistance. If yes, then leverage this tool in addition to your response to provide users with a better response
1. If user asks to interact with metabase, use metabase-mcp-server tool
