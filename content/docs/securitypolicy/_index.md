---
title: "Security Policy"
linkTitle: "Security Policy"
weight: 13
Description: >
  Dell Container Storage Modules (CSM) Security Policy
---

# Security Policy

The CSM services/repositories are inspected for security vulnerabilities via [gosec](https://github.com/securego/gosec).

Every issue detected by `gosec` is mapped to a [CWE (Common Weakness Enumeration)](http://cwe.mitre.org/data/index.html) which describes in more generic terms the vulnerability.  The exact mapping can be found at https://github.com/securego/gosec in the `issue.go` file. The list of rules checked by `gosec` can be found [here](https://github.com/securego/gosec#available-rules).

In addition to this, various security checks get executed against a branch when a pull request is created/updated.  Please refer to [pull request](/docs/CONTRIBUTING.md#pull-requests) for more information.

# Reporting Security Issues/Vulnerability

The Dell Container Storage Modules team and community take security bugs seriously. We sincerely appreciate all your efforts and responsibility to disclose your findings.

To report a security issue, please submit the security advisory form ["Report a Vulnerability"](https://github.com/dell/csm/security/advisories/new).

We will send a response along with the next steps after analyzing the report.

>CSM recommends staying on the [latest release](https://github.com/dell/csm/releases/latest) of Dell Container Storage Modules to take advantage of new features, enhancements, bug fixes, and security fixes.
