# Rule: Generating a Product Requirements Document (PRD)

## Goal

To guide an AI assistant in creating a detailed Product Requirements Document (PRD) in Markdown format, based on an initial user prompt. The PRD should be clear, actionable, and suitable for a junior developer to understand and implement the feature.

## Process

1.  **Receive Initial Prompt:** The user provides a brief description or request for a new feature or functionality.
2.  **Ask Clarifying Questions:** Before writing the PRD, the AI _must_ ask only the most essential clarifying questions needed to write a clear PRD. Limit questions to 3-5 critical gaps in understanding. The goal is to understand the "what" and "why" of the feature, not necessarily the "how" (which the developer will figure out). Make sure to provide options in letter/number lists so I can respond easily with my selections.
3.  **Generate PRD:** Based on the initial prompt and the user's answers to the clarifying questions, generate a PRD using the structure outlined below.
4.  **Save PRD:** Save the generated document as `prd-[feature-name].md` inside the `/tasks` directory.

## Clarifying Questions (Guidelines)

Ask only the most critical questions needed to write a clear PRD. Focus on areas where the initial prompt is ambiguous or missing essential context. Common areas that may need clarification:

- **Problem/Goal:** If unclear - "What problem does this feature solve for the user?"
- **Core Functionality:** If vague - "What are the key actions a user should be able to perform?"
- **Scope/Boundaries:** If broad - "Are there any specific things this feature _should not_ do?"
- **Success Criteria:** If unstated - "How will we know when this feature is successfully implemented?"

**Important:** Only ask questions when the answer isn't reasonably inferable from the initial prompt. Prioritize questions that would significantly impact the PRD's clarity.

### Formatting Requirements

- **Number all questions** (1, 2, 3, etc.)
- **List options for each question as A, B, C, D, etc.** for easy reference
- Make it simple for the user to respond with selections like "1A, 2C, 3B"

### Example Format

```
1. What is the primary goal of this feature?
   A. Improve user onboarding experience
   B. Increase user retention
   C. Reduce support burden
   D. Generate additional revenue

2. Who is the target user for this feature?
   A. New users only
   B. Existing users only
   C. All users
   D. Admin users only

3. What is the expected timeline for this feature?
   A. Urgent (1-2 weeks)
   B. High priority (3-4 weeks)
   C. Standard (1-2 months)
   D. Future consideration (3+ months)
```

## PRD Structure

The generated PRD should include the following sections:

1.  **Introduction/Overview:** Briefly describe the feature and the problem it solves. State the goal.
2.  **Goals:** List the specific, measurable objectives for this feature.
3.  **User Stories:** Detail the user narratives describing feature usage and benefits.
4.  **Functional Requirements:** List the specific functionalities the feature must have. Use clear, concise language (e.g., "The system must allow users to upload a profile picture."). Number these requirements.
5.  **Non-Goals (Out of Scope):** Clearly state what this feature will _not_ include to manage scope.
6.  **Design Considerations (Optional):** Link to mockups, describe UI/UX requirements, or mention relevant components/styles if applicable.
7.  **Technical Considerations (Optional):** Mention any known technical constraints, dependencies, or suggestions (e.g., "Should integrate with the existing Auth module").
8.  **Success Metrics:** How will the success of this feature be measured? (e.g., "Increase user engagement by 10%", "Reduce support tickets related to X").
9.  **Open Questions:** List any remaining questions or areas needing further clarification.

## Target Audience

Assume the primary reader of the PRD is a **junior developer**. Therefore, requirements should be explicit, unambiguous, and avoid jargon where possible. Provide enough detail for them to understand the feature's purpose and core logic.

## Output

- **Format:** Markdown (`.md`)
- **Location:** `/project/`
- **Filename:** `prd-[feature-name].md`

## Final instructions

1. Do NOT start implementing the PRD
2. Make sure to ask the user clarifying questions
3. Take the user's answers to the clarifying questions and improve the PRD

Initial Prompt
We have projects that utilize the Diamonds module, DevContainer, Hardhat-Diamonds module, and are largely based on the experimental development performed in this project which is meant for developing the aforementioned node modules and DevContainer all of which is described in #file:PROJECT_OVERVIEW.md

Recently we implemented Foundry Forge Integration that works with our Diamonds module and other modules. This is now complete. This includes Fuzz testing. The current setup is documented in #file:FOUNDRY_GUIDE.md , #file:FOUNDRY_SETUP_SUMMARY.md #file:FORGE_FUZZING_GUIDE.md , and #file:FOUNDRY_QUICK_REFERENCE.md . The integration was accomplished using 2 project requirement documents #file:prd-forge-diamond-fuzzing.md and then refactored with #file:prd-forge-diamond-fuzzing-refactor.md

The Foundry Integration now needs to be redesigned so that it can be packaged as part of a node module we will call `@diamondslab/diamonds-hardhat-foundry`. It will be developed in `packages/hardhat-foundry-diamonds` within the current root directory which houses the `diamonds-dev-env` a project built for the purpose of developing Diamonds related modules.

The Diamonds-Hardahat-Foundry integration node module should
accomplish the same basic tasks as the original project, containing the helper files and other setup that we accomplished during the previous projects to build our Prototype integration.

It will be utilizing the Diamonds modules and the DevContainer which automatically installs the Foundry, although their can be a check for this built into our new Diamonds-Hardhat-Foundry node module as install or usage requirements.

We have created the basic module already which is a fork of the `@nomicfoundation/hardhat-foundry` module located here: https://www.npmjs.com/package/@nomicfoundation/hardhat-foundry

We renamed the module to `@diamondslab/diamonds-hardhat-foundry` and have the basic module structure created in `packages/hardhat-foundry-diamonds` The README.md file in this new module currently contains the original README from the nomicfoundation module modified with the new name of `diamonds-hardhat-foundry` but otherwise unchanged.

The new Diamonds-Hardhat-Foundry module needs to be modified to include the Diamonds module functionality and other customizations we developed in the previous projects. The new module should also include the Fuzz testing functionality we developed using Foundry Forge.
