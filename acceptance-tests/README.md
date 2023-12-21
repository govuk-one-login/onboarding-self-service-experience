# Acceptance tests

We are using tools Gherkin and Cucumber, which allow non-technical stakeholders to understand and contribute to the testing process.

## Use business language:

The acceptance test should be written in the language of the business domain. This makes the test easy to understand for non-technical stakeholders and allows for better collaboration between technical and non-technical team members.

## Use the Gherkin Syntax:

Use `Given`, `When`, `Then`, `And`

`Given` steps are used to describe the initial context of the system - the scene of the scenario.

`When` steps are used to describe an event, or an action.

`Then` steps are used to describe an expected outcome, or result.

Use `And` if you have successive Given’s, When’s, or Then’s.

Use the `Background` and `Rule` in features to group set up steps together.

## Avoid Technical Details:

As these tests should be understandable by non-technical team members, avoid using technical language or details about how the system works. Focus on what the system should do, not how it does it.

## Use Scenarios:

Each scenario should represent a single piece of functionality or behavior. Keep scenarios as simple and independent as possible to make them easier to maintain and understand.

## Make it Measurable:

The outcome in a `Then` statement should be measurable and should not require interpretation. Avoid vague words and describe the expected outcome clearly.

## Other:

Use a directory structure if needed.

Use scenario outlines to reduce duplication in the features.

If possible test success scenarios in the error scenarios for the steps that come after.
