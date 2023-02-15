---
title: PowerFlex
linktitle: PowerFlex
description: >
  Enabling CSM Authorization for PowerFlex CSI Driver
---

## Configuring PowerFlex CSI Driver with CSM for Authorization

Given a setup where Kubernetes, a storage system, and the CSM for Authorization Proxy Server are deployed, follow these steps to configure the CSI Drivers to work with the Authorization sidecar:

1. Apply the secret containing the token data into the driver namespace. It's assumed that the Kubernetes administrator has the token secret manifest saved in `/tmp/token.yaml`.

    ```console
    # It is assumed that array type powerflex has the namepace "vxflexos".
    kubectl apply -f /tmp/token.yaml -n vxflexos
   ```

2. Edit these parameters in `samples/secret/karavi-authorization-config.json` file in the [CSI PowerFlex](https://github.com/dell/csi-powerflex/tree/main/samples) driver and update/add connection information for one or more backend storage arrays. In an instance where multiple CSI drivers are configured on the same Kubernetes cluster, the port range in the *endpoint* parameter must be different for each driver.

  | Parameter | Description | Required | Default |
   | --------- | ----------- | -------- |-------- |
   | username | Username for connecting to the backend storage array. This parameter is ignored. | No | - |
   | password | Password for connecting to to the backend storage array. This parameter is ignored. | No | - |
   | intendedEndpoint | HTTPS REST API endpoint of the backend storage array. | Yes | - |
   | endpoint | HTTPS localhost endpoint that the authorization sidecar will listen on. | Yes | https://localhost:9400 |
   | systemID | System ID of the backend storage array. | Yes | " " |
   | skipCertificateValidation  | A boolean that enables/disables certificate validation of the backend storage array. This parameter is not used. | No | true |
   | isDefault | A boolean that indicates if the array is the default array. This parameter is not used. | No | default value from values.yaml |


Create the karavi-authorization-config secret using this command:

`kubectl -n vxflexos create secret generic karavi-authorization-config --from-file=config=samples/secret/karavi-authorization-config.json -o yaml --dry-run=client | kubectl apply -f -`

>__Note__:  
> - Create the driver secret as you would normally except update/add the connection information for communicating with the sidecar instead of the backend storage array and scrub the username and password.

3. Create the proxy-server-root-certificate secret.

    If running in *insecure* mode, create the secret with empty data:

      `kubectl -n vxflexos create secret generic proxy-server-root-certificate --from-literal=rootCertificate.pem= -o yaml --dry-run=client | kubectl apply -f -`

    Otherwise, create the proxy-server-root-certificate secret with the appropriate file:

      `kubectl -n vxflexos create secret generic proxy-server-root-certificate --from-file=rootCertificate.pem=/path/to/rootCA -o yaml --dry-run=client | kubectl apply -f -`

4. Please refer to step 4 in the [installation steps for PowerFlex](../../../csidriver/installation/helm/powerflex/#install-the-driver) to edit the parameters in `samples/config.yaml` file to communicate with the sidecar.

    Update *endpoint* to match the endpoint in `samples/secret/karavi-authorization-config.json`

5. Create the vxflexos-config secret using this command:

    `kubectl create secret generic vxflexos-config -n vxflexos --from-file=config=config.yaml -o yaml --dry-run=client | kubectl apply -f -`

6. Please refer to step 9 in the [installation steps for PowerFlex](../../../csidriver/installation/helm/powerflex/#install-the-driver) to edit the parameters in *myvalues.yaml* file to communicate with the sidecar.

    Enable CSM for Authorization and provide the *proxyHost* address

7. Install the CSI PowerFlex driver

8. (Optional) Install [dellctl](../../../references/cli) to perform Kubernetes administrator commands for additional capabilities (e.g., list volumes). Please refer to the [dellctl documentation page](../../../references/cli) for the installation steps and command list.