---
title: "Deprecation Policy"
linkTitle: "Deprecation Policy"
weight: 13
Description: >
  Dell Technologies (Dell) Container Storage Modules (CSM) Deprecation Policy
---

Deprecation policy for Dell Container Storage Modules (CSM) is in place to help users prevent any disruptive incidents from occurring. We aim to provide appropriate notice when CLI elements, APIs, features, or behaviors are slated to be removed.

### Deprecating a CLI Element

This captures situations when a flag or command is removed from a CLI.

CLI elements must function after their announced deprecation for no less than:

**Generally Available (GA): 2 releases - major or minor release versions**

When deprecating a CLI command, a warning message must be displayed each time the command is used.  This warning message should capture the deprecation details along with the release in which the command that is being deprecated will be removed.

### Deprecating an API, Feature, or Behavior

CSM features must function after their announced deprecation for no less than:

**Generally Available (GA): 2 releases - major or minor release versions**

### Tech Previews

Features released as tech preview are not supported and therefore are not intended for production.  No deprecation notice will be required before removing any features/behaviors that are released as tech previews.

### Required Deprecation Notice

CSM documentation for the release in which the deprecation is being announced must include deprecation details along with the release in which the item(s) being deprecated will be removed.

In addition, the changelog and release notes for the release in which the deprecation is being announced must contain a section titled "Important Deprecation Information".  In this section, the deprecation details must be provided along with the release in which the item(s) being deprecated will be removed.
