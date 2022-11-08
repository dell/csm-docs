---
title: PowerScale
linktitle: PowerScale
description: >
  Enabling CSM Authorization for PowerScale CSI Driver
---

## Configuring PowerScale CSI Driver with CSM for Authorization

Given a setup where Kubernetes, a storage system, and the CSM for Authorization Proxy Server are deployed, follow these steps to configure the CSI Drivers to work with the Authorization sidecar:

1. Apply the secret containing the token data into the driver namespace. It's assumed that the Kubernetes administrator has the token secret manifest saved in `/tmp/token.yaml`.

    ```console
    # It is assumed that array type powerscale has the namespace "isilon".
    kubectl apply -f /tmp/token.yaml -n isilon
   ```

2. Edit these parameters in `samples/secret/karavi-authorization-config.json` file in [CSI PowerScale](https://github.com/dell/csi-powerscale/tree/main/samples/secret) driver and update/add connection information for one or more backend storage arrays. In an instance where multiple CSI drivers are configured on the same Kubernetes cluster, the port range in the *endpoint* parameter must be different for each driver.

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

`kubectl -n isilon create secret generic karavi-authorization-config --from-file=config=samples/secret/karavi-authorization-config.json -o yaml --dry-run=client | kubectl apply -f -`

>__Note__:  
> - Create the driver secret as you would normally except update/add the connection information for communicating with the sidecar instead of the backend storage array and scrub the username and password
> - The *systemID* will be the *clusterName* of the array. 
> - The *isilon-creds* secret has a *mountEndpoint* parameter which must be set to the hostname or IP address of the PowerScale OneFS API server, for example, 10.0.0.1.

3. Create the proxy-server-root-certificate secret.

    If running in *insecure* mode, create the secret with empty data:

      `kubectl -n isilon create secret generic proxy-server-root-certificate --from-literal=rootCertificate.pem= -o yaml --dry-run=client | kubectl apply -f -`

    Otherwise, create the proxy-server-root-certificate secret with the appropriate file:

      `kubectl -n isilon create secret generic proxy-server-root-certificate --from-file=rootCertificate.pem=/path/to/rootCA -o yaml --dry-run=client | kubectl apply -f -`

4. Please refer to step 5 in the [installation steps for PowerScale](../../../csidriver/installation/helm/isilon/#install-the-driver) to edit the parameters in *my-isilon-settings.yaml* to communicate with the sidecar.
    
    Update *endpointPort* to match the endpoint port number in `samples/secret/karavi-authorization-config.json`

*Notes:*
> - In *my-isilon-settings.yaml*, endpointPort acts as a default value. If endpointPort is not specified in *my-isilon-settings.yaml*, then it should be specified in the *endpoint* parameter of `samples/secret/secret.yaml`.

5. Enable CSM for Authorization and provide the *proxyHost* address 

6. Please refer to step 6 in the [installation steps for PowerScale](../../../csidriver/installation/helm/isilon/#install-the-driver) to edit the parameters in `samples/secret/secret.yaml` file to communicate with the sidecar.

    Update *endpoint* to match the endpoint in `samples/secret/karavi-authorization-config.json`

*Notes:*
> - Only add the endpoint port if it has not been set in *my-isilon-settings.yaml*.
> - The *isilon-creds* secret has a *mountEndpoint* parameter which must be set to the hostname or IP address of the PowerScale OneFS API server, for example, 10.0.0.1.

7. Create the isilon-creds secret using this command:

    `kubectl create secret generic isilon-creds -n isilon --from-file=config=secret.yaml -o yaml --dry-run=client | kubectl apply -f -`
   
8. Install the CSI PowerScale driver