---
title: Observability
linktitle: Observability
description: >
  Installing Observability via Dell CSM Operator
---
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}

The CSM Observability module for supported Dell CSI Drivers can be installed via the Dell CSM Operator. Dell CSM Operator will deploy CSM Observability, including topology service, Otel collector, and metrics services.

## Prerequisites

- Create a namespace `karavi`

  ```bash
  kubectl create namespace karavi
  ```

- Enable Observability module and components in [sample manifests](https://github.com/dell/csm-operator/tree/main/samples). If cert-manager has already been installed, don't enable it.
- To use Observablity with CSM Authorization, the [Authorization Proxy Server](../authorizationv2-0/) should be installed and configured first. Then, enable the Authorization module along with the Observability module in the sample manifest.
- Observability will deploy with self-signed certificates by default. If you want to have custom certificates created instead, please generate certificates and private keys, encode them in base64, and insert them into the sample file as shown below for whichever components you are enabling:

```yaml
    # observability: allows to configure observability
    - name: observability
...
      components:
        - name: topology
...
          # certificate: base64-encoded certificate for cert/private-key pair -- add cert here to use custom certificates
          #  for self-signed certs, leave empty string
          # Allowed values: string
          certificate: "<INSERT BASE64-ENCODED TOPOLOGY CERTIFICATE HERE>"
          # privateKey: base64-encoded private key for cert/private-key pair -- add private key here to use custom certificates
          #  for self-signed certs, leave empty string
          # Allowed values: string
          privateKey: "<INSERT BASE64-ENCODED TOPOLOGY PRIVATE KEY HERE>"
...
        - name: otel-collector
...
          # certificate: base64-encoded certificate for cert/private-key pair -- add cert here to use custom certificates
          #  for self-signed certs, leave empty string
          # Allowed values: string
          certificate: "<INSERT BASE64-ENCODED OTEL-COLLECTOR CERTIFICATE HERE>"
          # privateKey: base64-encoded private key for cert/private-key pair -- add private key here to use custom certificates
          #  for self-signed certs, leave empty string
          # Allowed values: string
          privateKey: "<INSERT BASE64-ENCODED OTEL-COLLECTOR PRIVATE KEY HERE>"
...
```

- Notes:
  - If you enable `metrics-powerscale` or `metrics-powerflex`, you must enable `otel-collector` as well.
  - otel-collector cannot be enabled without a metrics component also enabled.
  - If you are deploying multiple drivers, only enable topology, otel-collector, and cert-manager in the first driver. For subsequent drivers, only enable the metrics component. When deleting the deployment, the driver that was created first must be deleted last.

## Install Observability

- Once you have prepared the sample file(s) (one per driver being installed), deploy by running `kubectl apply -f <SAMPLE FILE>` on the sample file.

## How to enable this module using minimal CR

Alternatively, you can use the minimal sample files provided
  [here](https://github.com/dell/csm-operator/tree/main/samples/minimal-samples).

## Upgrade Observability

The Observability module installed by the Dell CSM Operator can be updated like any Kubernetes resource.

- Modifying the existing driver and module installation directly via `kubectl edit`

  ```bash
  kubectl get <driver-object> -n <driver-namespace>
  ```

  For example - If the CSI PowerScale driver is installed then run this command to get the object name

  ```bash
  # Replace driver-namespace with the namespace where the CSI PowerScale driver is installed
  $ kubectl get csm -n <driver-namespace>
  ```

  use the object name in `kubectl edit` command.

  ```bash
  kubectl edit csm <driver-object>/<object-name> -n <driver-namespace>
  ```

  For example - If the object name is isilon then use the name as isilon

  ```bash
  # Replace object-name with the isilon
  kubectl edit csm isilon -n <driver-namespace>
  ```

- Modify the installation

  - Update the driver config version and image tag
  - Update the Observability config version, csm-topology image and the driver metrics images(e.g. for CSI PowerScale driver, the metrics driver image would be `csm-metrics-powerscale`)

>NOTE:

- In observability module upgrade, only `n-1` to `n` upgrade is supported, e.g. if the current observability version is `v1.7.x`, it can be upgraded to `1.8.x`.
- Upgrade to csm-operator and csi-driver first which support the corresponding observability module version.
