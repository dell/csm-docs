
## Installing CSI Driver via Operator
CSI Drivers can be installed by creating a `CustomResource` object in your cluster.

Sample manifest files for each driver `CustomResourceDefintion` have been provided in the `samples` folder to help with the installation of the drivers.
These files follow the naming convention

    {driver name}_{driver version}_k8s_{k8 version}.yaml
Or

    {driver name}_{driver version}_ops_{OpenShift version}.yaml
For e.g.
* sample/powermax_v140_k8s_117.yaml* <- To install CSI PowerMax driver v1.4.0 on a Kubernetes 1.17 cluster  
* sample/powermax_v140_ops_46.yaml* <- To install CSI PowerMax driver v1.4.0 on an OpenShift 4.6 cluster

Copy the correct sample file and edit the mandatory & any optional parameters specific to your driver installation by following the instructions [here](#modify-the-driver-specification)  
>NOTE: A detailed explanation of the various mandatory and optional fields in the CustomResource is available [here](#custom-resource-specification). Please make sure to read through and understand the various fields.

Run the following command to install the CSI driver.
```
kubectl create -f <driver-manifest.yaml>
```

**Note**: If you are using an OLM based installation, the example manifests are available in the `OperatorHub` UI.
You can edit these manifests and install the driver using the `OperatorHub` UI.

### Verifying the installation
Once the driver Custom Resource has been created, you can verify the installation

*  Check if Driver CR got created successfully

    For e.g. – If you installed the PowerMax driver
    ```
    $ kubectl get csipowermax -n <driver-namespace>
    ```
* Check the status of the Custom Resource to verify if the driver installation was successful

If the driver-namespace was set to _test-powermax_, and the name of the driver is _powermax_, then run the command `kubectl get csipowermax/powermax -n test-powermax -o yaml` to get the details of the Custom Resource.

Note: If the _state_ of the `CustomResource` is _Running_ then all the driver pods have been successfully installed. If the _state_ is _SuccessFul_, then it means the driver deployment was successful but some driver pods may not be in a _Running_ state.
Please refer to the _Troubleshooting_ section [here](../../../troubleshooting/operator) if you encounter any issues during installation.

### Changes in installation for latest CSI drivers
If you are installing the latest versions of the CSI drivers, the driver controller will be installed as a Kubernetes `Deployment` instead of a `Statefulset`. These installations can also run multiple replicas for the driver controller pods(not supported for StatefulSets) to support High Availability for the Controller.

## Update CSI Drivers
The CSI Drivers installed by the Dell CSI Operator can be updated like any Kubernetes resource. This can be achieved in various ways which include –

* Modifying the installation directly via `kubectl edit`
    For e.g. - If the name of the installed unity driver is unity, then run
    ```
    # Replace driver-namespace with the namespace where the Unity driver is installed
    $ kubectl edit csiunity/unity -n <driver-namespace>
    ```
    and modify the installation
* Modify the API object in-place via `kubectl patch`

**NOTE**: If you are trying to upgrade the CSI driver from an older version, make sure to modify the _configVersion_ field if required.

**NOTE**: Do not try to update the operator by modifying the original `CustomResource` manifest file and running the `kubectl apply -f` command. As part of the driver installation, the Operator sets some annotations on the `CustomResource` object which are further utilized in some workflows (like detecting upgrade of drivers). If you run the `kubectl apply -f` command to update the driver, these annotations are overwritten and this may lead to failures.

### Supported modifications
* Changing environment variable values for driver
* Adding (supported) environment variables
* Updating the image of the driver

### Unsupported modifications
Kubernetes doesn’t allow to update a storage class once it has been created. Any attempt to update a storage class will result in a failure.

>Note – Any attempt to rename a storage class or snapshot class will result in the deletion of older class and creation of a new class.

## Limitations
* The Dell CSI Operator can't manage any existing driver installed using Helm charts. If you already have installed one of the DellEMC CSI driver in your cluster and  want to use the operator based deployment, uninstall the driver and then redeploy the driver following the installation procedure described above
* The Dell CSI Operator can't update storage classes as it is prohibited by Kubernetes. Any attempt to do so will cause an error and the driver Custom Resource will be left in a `Failed` state. Refer the Troubleshooting section to fix the driver CR.
* The Dell CSI Operator is not fully compliant with the OperatorHub React UI elements and some of the Custom Resource fields may show up as invalid or unsupported in the OperatorHub GUI. To get around this problem, use kubectl/oc commands to get details about the Custom Resource(CR). This issue will be fixed in the upcoming releases of the Dell CSI Operator


## Custom Resource Specification
Each CSI Driver installation is represented by a Custom Resource.  

The specification for the Custom Resource is the same for all the drivers.   
Below is a list of all the mandatory and optional fields in the Custom Resource specification

### Mandatory fields
**configVersion** - Configuration version  - Refer full list of supported driver for finding out the appropriate config version [here](http://localhost:1313/docs/installation/operator/#full-list-of-csi-drivers-and-versions-supported-by-the-dell-csi-operator)                  
**replicas**  - Number of replicas for controller plugin - Must be set to 1 for all drivers  
**common**  
This field is mandatory and is used to specify common properties for both controller and the node plugin
* image - driver container image
* imagePullPolicy - Image Pull Policy of the driver image
* envs - List of environment variables and their values
### Optional fields
**controller** - List of environment variables and values which are applicable only for controller  
**node** - List of environment variables and values which are applicable only for node  
**sideCars** - Specification for CSI sidecar containers.  
**authSecret** - Name of the secret holding credentials for use by the driver. If not specified, the default secret *-creds must exist in the same namespace as driver  
**tlsCertSecret** - Name of the TLS cert secret for use by the driver. If not specified, a secret *-certs must exist in the namespace as driver

**storageclass**  
List of Storage Class fields

   1. name - name of the Storage Class
   2. default - Used to specify if the storage class will be marked as default (only set one storage class as default in a cluster)
   3. reclaimPolicy - Sets the PersistentVolumeReclaim Policy for the PVCs. Defaults to Delete if not specified
   4. parameters - driver specific parameters. Refer individual driver section for more details
   5. allowVolumeExpansion - Set to true for allowing volume expansion for PVC
   6. volumeBindingMode - Sets the VolumeBindingMode in the Storage Class. If left blank, it will be set to the default value for the driver version you are installing
   7. allowedTopologies - Sets the topology keys and values which allows the pods/and volumes to be scheduled on nodes that have access to the storage. 

**snapshotclass**  
List of Snapshot Class specifications  

   1. name - name of the snapshot class
   2. parameters - driver specific parameters. Refer individual driver section for more details

**forceUpdate**  
Boolean value which can be set to `true` in order to force update the status of the CSI Driver 

**tolerations**
List of tolerations which should be applied to the driver StatefulSet/Deployment and DaemonSet  
It should be set separately in the controller and node sections if you want separate set of tolerations for them

**nodeSelector**
Used to specify node selectors for the driver StatefulSet/Deployment and DaemonSet  

Here is a sample specification annotated with comments to explain each field
```
apiVersion: storage.dell.com/v1
kind: CSIPowerMax <- Type of the driver
metadata:
  name: test-powermax <- Name of the driver
  namespace: test-powermax <- Namespace where driver is installed
spec:
  driver:
    # Used to specify configuration version
    configVersion: v3 <- Refer the table containing the full list of supported drivers to find the appropriate config version 
    replicas: 1
    forceUpdate: false <- Set to true in case you want to force an update of driver status
    common: <- All common specification
      image: "dellemc/csi-powermax:v1.4.0.000R" <- driver image for a particular release
      imagePullPolicy: IfNotPresent
      envs:
        - name: X_CSI_POWERMAX_ENDPOINT
          value: "https://0.0.0.0:8443/"
        - name: X_CSI_K8S_CLUSTER_PREFIX
          value: "XYZ"
    storageClass:
      - name: bronze
        default: true
        reclaimPolicy: Delete
        parameters:
          SYMID: "000000000001"
          SRP: DEFAULT_SRP
          ServiceLevel: Bronze
```
You can set the field ***replicas*** to a higher number than `1` for the latest driver versions.

Note - The `image` field should point to the correct image tag for version of the driver you are installing.  
For e.g. - If you wish to install v1.4 of the CSI PowerMax driver, use the image tag `dellemc/csi-powermax:v1.4.0.000R`

Note - The name of the Storage Class or the Volume Snapshot Class (which are created in the Kubernetes/OpenShift cluster) is created using the name of the driver and the name provided for these classes in the manifest. This is done in order to ensure that these names are unique if there are multiple drivers installed in the same cluster.  
For e.g. - With the above sample manifest, the name of the storage class which is created in the cluster will be `test-powermax-bronze`.  
You can get the name of the StorageClass and SnapshotClass created by the operator by running the commands - `kubectl get storageclass` and `kubectl get volumesnapshotclass`

### SideCars
Although the sidecars field in the driver specification is optional, it is **strongly** recommended to not modify any details related to sidecars provided (if present) in the sample manifests. Any modifications to this should be only done after consulting with Dell EMC support.

### Modify the driver specification
* Choose the correct configVersion. Refer the table containing the full list of supported drivers and versions.
* Provide the namespace (in metadata section) where you want to install the driver.
* Provide a name (in metadata section) for the driver. This will be the name of the Custom Resource.
* Edit the values for mandatory configuration parameters specific to your installation.
* Edit/Add any values for optional configuration parameters to customize your installation.
* If you are installing the latest versions of the CSI drivers, the default number of replicas is set to 2. You can increase/decrease this value.