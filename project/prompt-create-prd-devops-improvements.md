# Rule: Generating a Product Requirements Document (PRD)

## Goal

To guide an AI assistant in creating a detailed Product Requirements Document (PRD) in Markdown format, based on an initial user prompt. The PRD should be clear, actionable, and suitable for a senior software engineer to understand and implement the feature.

## Process

1.  **Receive Initial Prompt:** The user provides a brief description or request for a new feature or functionality.
2.  **Ask Clarifying Questions:** Before writing the PRD, the AI _must_ ask only the most essential clarifying questions needed to write a clear PRD. Limit questions to 3-5 critical gaps in understanding. The goal is to understand the "what" and "why" of the feature, not necessarily the "how" (which the developer will figure out). Make sure to provide options in letter/number lists so I can respond easily with my selections.
3.  **Generate PRD:** Based on the initial prompt and the user's answers to the clarifying questions, generate a PRD using the structure outlined below.
4.  **Save PRD:** Save the generated document as `prd-[feature-name].md`.

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

Assume the primary reader of the PRD is a **senior software engineer**. Requirements should be explicit, unambiguous, and avoid jargon where possible. Provide enough detail for them to understand the feature's purpose and core logic.

## Output

- **Format:** Markdown (`.md`)
- **Filename:** `prd-[feature-name].md`

## Final instructions

1. Do NOT start implementing the PRD
2. Make sure to ask the user clarifying questions
3. Take the user's answers to the clarifying questions and improve the PRD

## Begin Prompt:

Create an end-to-end project management system for small Security First Development Team without a designated project manager.

## Overview

Small Security First Development Teams need to be able to handle project management tasks in a collaborative fashion with minimal managerial oversight. To accomplish this there must be a set of rules and templates that are followed to prioritize security, eliminate conflict and maximize velocity.

## GitHub Tools

GitHub tools should be adequate for a startup with a small team. Some workarounds will be required that may not be required on other systems.

## Templates

[Awesome Issue and PR Templates](https://github.com/devspace/awesome-github-templates)
[GitHub Issue Templates](https://github.com/stevemao/github-issue-templates?tab=readme-ov-file)

"Issues" are often reported by individuals outside the Dev Team. Template driven "issue" we are referring to is for "tickets" once a bug, feature or task is ready to be formalized.

Templates should now be focused on AI rather than simply conveying info to humans.

Templates should take into account project wide goals like Test Driven Development and Security focus so that the AI can translate this into a first draft PRD and Developer Task List with these clearly expected.

Templates include the prompts for creating tickets, PR's, PRD's and Task Lists

## Tickets

Every code modification should have an associated ticket.

Tickets should use naming conventions that will translate to branching

Tickets should be created before making changes but this isn't completely necessary. It is possible to make changes, then create a ticket and a branch and cherry pick the commits from local branch

Every ticket should use a template.

Use of AI in ticket creation may be a significant increase in productivity as this can act as a more robust Project Requirement Document which can then be utilized by followup steps, particularly automated Code Review.

## Pull Requests

PR's should be created using a template.

Each PR branch MUST be able to:

- Install (download libraries and other dependencies)
- Build (Compile)
- Pass all tests
  This includes being reinstalled and built from existing projects

If special instructions are included (e.g. add an environmental value) these must be included in the PR description, preferably at the top (template should favor this).

The PR should pass through a CI/CD build, test and validation process so that any failures can be resolved before a Human or AI Code Review is performed.

## Git repo management

Branches should be made using the ticketing system
Branches should follow GitFlow standard (bugfix/, feature/, etc)

## CI/CD

Most import task:

- Automated Security Testing
- Manage Tests for PR's and Builds
- Build Process: This is more important for software that requires multiple builds for cross platform use.

Environment variables such as API Keys (Secrets) MUST be kept in a secure vault and applied during the build process.

AI Code Review in the CI/CD pipeline should be a goal.

Human Code Review should not be requested until the CI/CD pipeline is completed successfully.

## Code Review

CI/CD should be used to perform an initial Code Review, particularly if tickets incorporate carefully constructed PRD's and instructions that will flag issues important to the overall project.

Elimination of all Human Code Review is not currently possible at this time but the process should minimize the time spent on Code Review by the final human reviewer.

Code Review time is minimized by having Tickets (issues) that lead to atomic code changes.

Large PR's have a detrimental effect on velocity and quality.
