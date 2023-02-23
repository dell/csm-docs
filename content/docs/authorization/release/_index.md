---
title: "Release notes"
linkTitle: "Release notes"
weight: 6
Description: >
  Dell Container Storage Modules (CSM) release notes for authorization
---


## Release Notes - CSM Authorization 1.6.0

### New Features/Changes
- Restrict the version of TLS to v1.2 for all requests to CSM authorization proxy server. ([#642](https://github.com/dell/csm/issues/642))
- Option to set Nodeports for the ingress controller during CSM authorization install/upgrade.
- Restrict CSM authorization requests to use either signed or self-signed certificate generated for the proxy server.

### Bugs

- CSM Authorization installation fails due to a PATH not looking in /usr/local/bin. ([#580](https://github.com/dell/csm/issues/580))
