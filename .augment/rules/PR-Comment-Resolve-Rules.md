---
type: "manual"
---

## Do(s):
    [] Check for any open PR on the current branch
    [] Fetch open/unresolved comments on the PR
    [] Review the PR yourself too and generate comments on the PR
    [] Update title and description properly with bullets of changes and bullet pointers for monitoring and testing
    [] Analyse all the comments
    [] Ask the user any clarifying questions needed
    [] Create a plan for changes to address the comments and document it in a readme in dev/pr-review/{pr-number} folder at root
        [] Readme Should ONLY have the following sections:
            [] PR Details
            [] Issues Identified
            [] Plan to Resolve
            [] User Confirmation Required
    [] Confirm with the user if plan looks good. DO NOT EDIT UNTIL USER EXPLICIT APPROVAL IS RECEIVED
    [] Once Approved by user, create separate commits for each resolution(or if multiple comments can be addressed together, create a single commit)
    [] DO NOT COMMIT THE README CREATED
    [] Mark conversations addressed in pr in these commits as RESOLVED and add comment in the relevant conversation itself. Do not add comment on the PR main thread
    [] Mark Conversations addressed in PR by you as "Resolve Conversation"
    [] Make sure while makng the changes there are no breaking changes introduced or ny existing edge cases missed
