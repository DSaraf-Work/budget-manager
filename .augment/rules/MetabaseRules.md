---
type: "agent_requested"
description: "Proactively Use it when user wants to reference data from mongo db but mongo mcp server is not available or when user needs to reference/read data from metabase or want to do some analysis around db data"
---
## Related Files and Folders
- metabase-queries/ - folder at root of repo
- metabase-queries/MetabaseQueryLink.md
- metabase-queries/*.sql
- metabase-queries/MetabaseAlertsDoc.md

## Do(s):
- When checking data availability, follow this priority order:
    1. Check if the data is available in MongoDB.
    2. If not, check if the data is available in Metabase.
    3. If neither has the data, consider combining data from both sources or exploring alternative options.

- Always use the context and knowledge of the codebase and interconnected workflows in the codebase in addition to relevant data from metabase to enhance understanding. If needed fetch relevant data from metabase whenever you feel it will help improve understanding of the data

## Pointers:
- Metabase data has a 4hours delay compared to prod mongo data
- User might ask you to create queries. Follow "Instructions for creating metabase queries"

## Mongo DB to Metabase DB index
- [mongo] mongodb+srv://${MONGO_USER}:${MONGO_PASS}@${MONGO_CLUSTER:stage-shard-0}/user-activity-service  - [metabase]pk_prod_digital_user_activity_service 
    - example: "pk_prod_digital_user_activity_service"."broken_streaks"
    - **all mongo database of user-activity-service is stored in  "pk_prod_digital_user_activity_service" db in metabase**
- Field inside a collection is converted to all small case in metabase. For example, if mongo's streak entity has streakConfigId, corresponding value in metabase will be "streakconfigid"
table name for broken_streaks in metabase
- rashi attributes flowing into sqs/sns from rashi client gets saved to metabase's "pk_cfprodplatforms_rashi"."User_Attribute"
- Membership Pauses Metabase - https://metabase.curefit.co/question#eyJkYXRhc2V0X3F1ZXJ5Ijp7ImRhdGFiYXNlIjozOSwidHlwZSI6InF1ZXJ5IiwicXVlcnkiOnsic291cmNlLXRhYmxlIjo1MjAxN319LCJkaXNwbGF5IjoidGFibGUiLCJ2aXN1YWxpemF0aW9uX3NldHRpbmdzIjp7fX0=
- User Activity ServiceCollections in Metabase - https://metabase.curefit.co/browse/databases/39/schema/pk_prod_digital_user_activity_service
- Membership Service Collections in Metabase - https://metabase.curefit.co/browse/databases/39/schema/pk_curefitplatforms_membershipdb

## Instructions for creating metabase queries
- metabase queries should not end in a ";". Remove it always
- metabase tables has a pk_hard_deleted column. This means data has been deleted from prod db. So filter out all rows where pk_hard_deleted != null
- always run this query on metabase and check if there are any issues and fix it before giving it to user
- Metabase Queries should be created in Datalake database
- do not create a card until user asks you to explicitly

## Instructions to create metabase card or save metabase queries [Only if user asks you to save card or query]
- Save created queries in metabase-queries folder at root in local repo with
    [] a snake case name giving short context to the query. should be under 30 characters
    [] description of the query as a comment inside the file
    [] query itself
- If user asks to save as metabase card, 
    [] then **ALWAYS** save the card in https://metabase.curefit.co/collection/5847-agentic-ide folder
    [] Add the metabase link in MetabaseQueryLink.md file in metabase-queries folder at root


 **ALWAYS** save the card in https://metabase.curefit.co/collection/5847-agentic-ide folder whenver the user asks toi create or save card

## Instructions to create an alerts
- **Reference Documentation**: See `metabase-queries/MetabaseAlertsDoc.md` for complete alert conditions, API format requirements and usage examples when you need to create an alert
