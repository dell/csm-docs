---
title: Observability
linktitle: Observability
description: >
  Installing Observability via Container Storage Module Operator
---
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}

The Container Storage Module Observability module for supported Dell CSI Drivers can be installed via the Container Storage Module Operator. Container Storage Module Operator will deploy Observability, including topology service, Otel collector, and metrics services.

## Prerequisites

- Create a namespace `karavi`

  ```bash
  kubectl create namespace karavi
  ```
- Enable Observability module using the below configuration 

  a. **Default Configuration:** 

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
        - name: metrics-powerflex
          enabled: true
  ```
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
        - name: metrics-powermax
          enabled: true
  ```
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
        - name: metrics-powerscale
          enabled: true
  ```
  Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/minimal-samples/{{Var}}_v2130.yaml) for default settings.  If cert-manager has already been installed, don’t enable it.

    [OR]                                                

  b. **Detailed Configuration:** Use the [sample file](https://github.com/dell/csm-operator/blob/main/samples/storage_csm_{{Var}}_v2130.yaml) for detailed settings. If cert-manager has already been installed, don’t enable it.
  
- To use Observablity with Container Storage Module Authorization, the [Authorization Proxy Server](docs/getting-started/installation/operator/modules/authorizationv2.0) should be installed and configured first. Then, enable the Authorization module along with the Observability module in the sample manifest.
- Observability will deploy with self-signed certificates by default. If you want to have custom certificates created instead, please generate certificates and private keys, encode them in base64, and insert them into the sample file as shown below for whichever components you are enabling:

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

- Notes:
  - If you enable `metrics-<csi-driver>`, you must enable `otel-collector` as well.
  - otel-collector cannot be enabled without a metrics component also enabled.
  - If you are deploying multiple drivers, only enable topology, otel-collector, and cert-manager in the first driver. For subsequent drivers, only enable the metrics component. When deleting the deployment, the driver that was created first must be deleted last.

## Install Observability

- Once you have prepared the sample file(s) (one per driver being installed), deploy by running `kubectl apply -f <SAMPLE FILE>` on the sample file.

## How to enable this module using minimal CR

Alternatively, you can use the minimal sample files provided
  [here](https://github.com/dell/csm-operator/tree/main/samples/minimal-samples).
