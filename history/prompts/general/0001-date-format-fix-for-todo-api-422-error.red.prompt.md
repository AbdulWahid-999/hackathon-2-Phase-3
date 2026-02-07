---
id: 0001
title: "Date Format Fix for Todo API 422 Error"
stage: red
date: "2026-01-25"
surface: agent
model: claude-sonnet-4-5-20250929
feature: none
branch: main
user: unknown
command: /sp.phr
labels: ["api", "debugging", "date-format", "422-error", "todo-app"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - "date_format_simple.py"
  - "date_format_test.py"
  - "date_format_test_fixed.py"
tests: []
---

# Date Format Fix for Todo API 422 Error

## Prompt Text
--title "Date-Format-Todo-422-Fix" --stage "red" --json

## Response Text
Diagnosed and fixed the 422 Unprocessable Content error when creating todos with dates by identifying that the issue was with date formatting. The API expects dates in ISO 8601 format or compatible formats, and provided multiple valid date formats that work.

## Outcome Impact
Resolved the 422 error when creating todos with dates by demonstrating proper date formatting for the API. Created test scripts to validate different date formats and confirmed which ones work with the Todo API.

## Tests Summary
Created and ran date format tests showing that ISO formats work while invalid formats return 422 errors.

## Files Summary
- date_format_simple.py: Simple test script to validate date formats
- date_format_test.py: Original test script for date formats
- date_format_test_fixed.py: Fixed version of date format test

## Next Prompts
None needed - issue is resolved.

## Reflection Note
The 422 error was caused by sending dates in an unsupported format to the API. Using ISO 8601 format resolves the issue.

## Failure Modes Observed
None - solution was successful.

## Next Experiment to Improve Prompt Quality
N/A