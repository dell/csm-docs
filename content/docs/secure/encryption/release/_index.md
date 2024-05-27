---
title: "Release Notes"
linkTitle: "Release Notes"
weight: 5
Description: >
  Release Notes
---

### Known Issues

Whenever we try to install the encryption module, one sidecar fails to reach the running state. This issue occurs because the csi-metadata-retriever has already bound to the Unix domain socket at /var/run/csi/csi_retriever.sock. Consequently, the csi-metadata-retriever-sec also attempts to bind to the same socket, causing a conflict and preventing the csi-metadata-retriever-sec from entering the bind state. Please find the [github issue](https://github.com/dell/csm/issues/1309).