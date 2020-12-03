---
title: Unity
description: >
  Installing Unity CSI Driver via Operator
---
## Installing Unity CSI Driver via Operator

The CSI Driver for Dell EMC Unity can be installed via the Dell CSI Operator.

To deploy the Operator, follow the instructions available [here](/content/docs/installation/operator/).

There are sample manifests provided which can be edited to do an easy installation of the driver. Note that the deployment of the driver using the operator does not use any Helm charts and the installation and configuration parameters will be slightly different from the ones specified via the Helm installer.

Kubernetes Operators make it easy to deploy and manage entire lifecycle of complex Kubernetes applications. Operators use Custom Resource Definitions (CRD) which represents the application and use custom controllers to manage them.

### Install Driver

1. Create namespace run `kubectl create namespace test-unity` to create the a namespace called test-unity. It can be any user-defined name.

2. Create *unity-creds*

   Create secret mentioned in [Install csi-driver](https://github.com/dell/csi-unity#install-csi-driver-for-unity) section. The secret should be created in user-defined namespace (test-unity, in this case)

3. Create certificate secrets

   As part of the CSI driver installation, the CSI driver requires a secret with the name unity-certs-0 to unity-certs-n in the user-defined namespace (test-unity, in this case) Create certificate procedure explained in the [link](https://github.com/dell/csi-unity#certificate-validation-for-unisphere-rest-api-calls)

   **Note**: *'certSecretCount'* parameter is not required for operator. Based on secret name pattern (unity-certs-*) operator reads all the secrets. Secret name suffix should have 0 to N order to read the secrets. Secrets will not be considered, if any number missing in suffix.

   Example: If unity-certs-0, unity-certs-1, unity-certs-3 are present in the namespace, then only first two secrets are considered for SSL verification.

4. Create a CR (Custom Resource) for unity using the sample provided below

Create a new file `csiunity.yaml` by referring the following content. Replace the given sample values according to your environment. You can find may CRDs under deploy/crds folder when you install dell-csi-operator

```yaml
apiVersion: storage.dell.com/v1
kind: CSIUnity
metadata:
  name: test-unity
  namespace: test-unity
spec:
  driver:
    configVersion: v3
    replicas: 2
    common:
      image: "dellemc/csi-unity:v1.4.0.000R"
      imagePullPolicy: IfNotPresent
      envs:
      - name: X_CSI_UNITY_DEBUG
        value: "true"
    sideCars:
      - name: provisioner
        args: ["--volume-name-prefix=csiunity"]
    storageClass:
    - name: virt2016****-fc
      default: true
      reclaimPolicy: "Delete"
      allowVolumeExpansion: true
      parameters:
        storagePool: pool_1
        arrayId: "VIRT2016****"
        protocol: "FC"
    - name: virt2017****-iscsi
      reclaimPolicy: "Delete"
      allowVolumeExpansion: true
      parameters:
        storagePool: pool_1
        arrayId: "VIRT2017****"
        protocol: "iSCSI"
    - name: virt2017****-nfs
      reclaimPolicy: "Delete"
      allowVolumeExpansion: true
      parameters:
        storagePool: pool_1
        arrayId: "VIRT2017****"
        protocol: "NFS"
        hostIoSize: "8192"
        nasServer: nas_1
    - name: virt2017****-iscsi-topology
      reclaimPolicy: "Delete"
      allowVolumeExpansion: true
      volumeBindingMode: WaitForFirstConsumer
      allowedTopologies:
      - matchLabelExpressions:
          - key: csi-unity.dellemc.com/virt2017****-iscsi
            values:
              - "true"
      parameters:
        storagePool: pool_1
        arrayId: "VIRT2017****"
        protocol: "iSCSI"
    snapshotClass:
      - name: test-snap
        parameters:
          retentionDuration: ""
```

1. Execute the following command to create unity custom resource `kubectl create -f csiunity.yaml`. This command will deploy the csi-unity driver in the test-unity namespace.

2. Any deployment error can be found out by logging the operator pod which is in default namespace (example, kubectl logs dell-csi-operator-64c58559f6-cbgv7)

3. Users should configure the parameters in CR. The following table lists the primary configurable parameters of the Unity driver and their default values:

   | Parameter                                       | Description                                                  | Required | Default               |
   | ----------------------------------------------- | ------------------------------------------------------------ | -------- | --------------------- |
   | ***Common parameters for node and controller*** |                                                              |          |                       |
   | CSI_ENDPOINT                                    | Specifies the HTTP endpoint for Unity.                       | No       | /var/run/csi/csi.sock |
   | X_CSI_DEBUG                                     | To enable debug mode                                         | No       | false                 |
   | GOUNITY_DEBUG                                   | To enable debug mode for gounity library                     | No       | false                 |
   | ***Controller parameters***                     |                                                              |          |                       |
   | X_CSI_MODE                                      | Driver starting mode                                         | No       | controller            |
   | X_CSI_UNITY_AUTOPROBE                           | To enable auto probing for driver                            | No       | true                  |
   | ***Node parameters***                           |                                                              |          |                       |
   | X_CSI_MODE                                      | Driver starting mode                                         | No       | node                  |
   | X_CSI_ISCSI_CHROOT                              | Path to which the driver will chroot before running any iscsi commands. | No       | /noderoot             |
