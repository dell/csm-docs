---
title: Observability
linktitle: Observability
description: >
  Installing Observability via Container Storage Modules Operator
---
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}

Install the Observability module for Dell CSI Drivers using the Container Storage Modules Operator. This will deploy Observability with topology service, Otel collector, and metrics services.

## Prerequisites

Create a namespace `karavi`

  ```bash
  kubectl create namespace karavi
  ```
  Enable the Observability module with the following configuration:
  
  ```yaml
   - name: observability
      enabled: false
      components:
        - name: topology
          enabled: true
        - name: otel-collector
          enabled: true
        - name: cert-manager
          enabled: false
        - name: metrics-{{labels}}
          enabled: true
  ```                                       
  If cert-manager has already been installed, don’t enable it.
  
  **Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_{{Var}}_{{< version-v1 key="sample_sc_pmax" >}}.yaml) for detailed settings. If cert-manager has already been installed, don’t enable it.
  
- Install and configure the [Authorization Proxy Server](v1/getting-started/installation/operator/modules/authorizationv2-0) Server before using Observability with Container Storage Modules Authorization. Then, enable both the Authorization and Observability modules in the sample manifest.
- Observability uses self-signed certificates by default. To use custom certificates, generate them, encode in base64, and insert into the sample file for the components you are enabling:

```yaml
    - name: observability
...
      components:
        - name: topology
...
          certificate: "<INSERT BASE64-ENCODED TOPOLOGY CERTIFICATE HERE>"
          privateKey: "<INSERT BASE64-ENCODED TOPOLOGY PRIVATE KEY HERE>"
...
        - name: otel-collector...
          certificate: "<INSERT BASE64-ENCODED OTEL-COLLECTOR CERTIFICATE HERE>"
          privateKey: "<INSERT BASE64-ENCODED OTEL-COLLECTOR PRIVATE KEY HERE>"
...
```

- If you enable `metrics-{{labels}}`, you must enable `otel-collector` as well.  
- Enable the otel-collector only if the metrics component is also enabled.
- For multiple drivers, enable topology, otel-collector, and cert-manager only in the first driver. For others, enable only the metrics component. Delete the first driver last.

## Install Observability

- Once you have prepared the sample file(s) (one per driver being installed)

Use this command to deploy

  ```bash
  kubectl apply -f <SAMPLE FILE>
  ```
