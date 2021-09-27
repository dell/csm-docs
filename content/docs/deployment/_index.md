---
title: "Deployment"
linkTitle: "Deployment"
description: Deployment of CSM for Replication
weight: 2
---

The recommended approach for deploying Container Storage Modules (CSM) is by using the CSM Installer.  The CSM Installer simplifies the deployment and management of Dell EMC Container Storage Modules and CSI Drivers to provide persistent storage for your containerized workloads.

The CSM Installer must first be deployed in a Kubernetes environment using Helm.  After which, the CSM Installer can be used through the following interfaces:
- [CSM CLI](./csmcli)
- [REST API](./csmapi)

Alternatively, the Container Storage Modules and the required CSI Drivers can each be deployed individually:
- [Dell EMC CSI Drivers Installation](../csidriver/installation)
- [Dell EMC Container Storage Module for Observability](../observability/deployment)
- [Dell EMC Container Storage Module for Authorization](../authorization/deployment)
- [Dell EMC Container Storage Module for Resiliency](../resiliency/deployment)
- [Dell EMC Container Storage Module for Replication](../replication/deployment)

> __Note__: The CSM Installer supports installing Dell EMC Container Storage Modules and CSI Drivers in environments that do not have any existing deployments of CSM or CSI Drivers. The CSM Installer does not support the upgrade of existing CSM or CSI Driver deployments.

## How to Deploy the Container Storage Modules Installer

1. Add the `dell` helm repository:

```
helm repo add dell https://dell.github.io/helm-charts
```

**If securing the API service and database, following steps 2 to 4 to generate the certificates, or skip to step 5 to deploy without certificates**

2. From the `helm` directory, generate self-signed certificates using the following commands:

```
mkdir api-certs

openssl req \
    -newkey rsa:4096 -nodes -sha256 -keyout api-certs/ca.key \
    -x509 -days 365 -out api-certs/ca.crt -subj '/'

openssl req \
    -newkey rsa:4096 -nodes -sha256 -keyout api-certs/cert.key \
    -out api-certs/cert.csr -subj '/'

openssl x509 -req -days 365 -in api-certs/cert.csr -CA api-certs/ca.crt \
    -CAkey api-certs/ca.key -CAcreateserial -out api-certs/cert.crt
```

3. If required, download the `cockroach` binary used to generate certificates for the cockroach-db:
```
curl https://binaries.cockroachdb.com/cockroach-v21.1.8.linux-amd64.tgz | tar -xz && sudo cp -i cockroach-v21.1.8.linux-amd64/cockroach /usr/local/bin/
```

4. From the `helm` directory, generate the certificates required for the cockroach-db service:
```
mkdir db-certs

cockroach cert create-ca --certs-dir=db-certs --ca-key=db-certs/ca.key

cockroach cert create-node cockroachdb-0.cockroachdb.csm-installer.svc.cluster.local cockroachdb-public cockroachdb-0.cockroachdb --certs-dir=db-certs/ --ca-key=db-certs/ca.key

```
  In case multiple instances of cockroachdb are required add all nodes names while creating nodes on the certificates
```
cockroach cert create-node cockroachdb-0.cockroachdb.csm-installer.svc.cluster.local cockroachdb-1.cockroachdb.csm-installer.svc.cluster.local cockroachdb-2.cockroachdb.csm-installer.svc.cluster.local cockroachdb-public cockroachdb-0.cockroachdb cockroachdb-1.cockroachdb cockroachdb-2.cockroachdb --certs-dir=db-certs/ --ca-key=db-certs/ca.key
```
 
```
cockroach cert create-client root --certs-dir=db-certs/ --ca-key=db-certs/ca.key

cockroach cert list --certs-dir=db-certs/
```

5. Create a values.yaml file that contains JWT, Cipher key, and Admin username and password of CSM Installer that are required by the installer during helm installation. See the [Configuration](#configuration) section for other values that can be set during helm installation.
```
# string of any length 
jwtKey:

# string of exactly 32 characters
cipherKey: ""

# Admin username of CSM Installer
adminUserName:

# Admin password of CSM Installer
adminPassword:
```

6. Follow step `a` if certificates are being used or step `b` if certificates are not being used:

a) From the `helm` directory, install the helm chart, specifying the certificates generated in the previous steps:
```
helm install -n csm-installer --create-namespace \
   --set-file serviceCertificate=api-certs/cert.crt \
   --set-file servicePrivateKey=api-certs/cert.key \
   --set-file databaseCertificate=db-certs/node.crt \
   --set-file databasePrivateKey=db-certs/node.key \
   --set-file dbClientCertificate=db-certs/client.root.crt \
   --set-file dbClientPrivateKey=db-certs/client.root.key \
   --set-file caCrt=db-certs/ca.crt \
   -f values.yaml \
   csm-installer dell/csm-installer 
```
b) If not deploying with certificates, execute the following command:
```
helm install -n csm-installer --create-namespace \
   --set-string scheme=http \
   --set-string dbSSLEnabled="false" \
   -f values.yaml \
   csm-installer dell/csm-installer 
```

> __Note__: In an OpenShift environment, the cockroachdb StatefulSet will run privileged pods so that it can mount the Persistent Volume used for storage. Follow the documentation for your OpenShift version to enable privileged pods.

### Configuration

| Parameter                                 | Description                                   | Default                                                 |
|----------------------------------|-----------------------------------------------|---------------------------------------------------------|
| `csmInstallerCount` | Number of replicas for the CSM Installer Deployment        | `1`|
| `dbInstanceCount`   | Number of replicas for the CSM Database StatefulSet        | `2`  |
| `imagePullPolicy`   | Image pull policy for the CSM Installer images             | `Always`  |
| `host`              | Host or IP that will be used to bind to the CSM Installer API service | `0.0.0.0` | 
| `port`              | Port that will be used to bind to the CSM Installer API service | `8080` | 
| `scheme`            | Scheme used for the CSM Installer API service. Valid values are `https` and `http` | `https` | 
| `jwtKey`            | Key used to sign the JWT token                             |  | 
| `cipherKey`         | Key used to encrypt/decrypt user and storage system credentials. Must be 32 characters in length. |  |
| `logLevel`          | Log level used for the CSM Installer. Valid values are `DEBUG`, `INFO`, `WARN`, `ERROR`, and `FATAL` | `INFO` |
| `dbHost`            | Host name of the Cockroach DB instance                     | `cockroachdb-public` |
| `dbPort`            | Port number to access the Cockroach DB instance            | `26257` |
| `dbSSLEnabled`      | Enable SSL for the Cockroach DB connectiong                | `true` |
| `installerImage`    | Location of the CSM Installer Docker Image                 | `dellemc/dell-csm-installer:v1.0.0` |
| `dataCollectorImage`| Location of the CSM Data Collector Docker Image            | `dellemc/csm-data-collector:v1.0.0` |
| `adminUserName`     | Username to authenticate with the CSM Installer            |  |
| `adminPassword`     | Password to authenticate with the CSM Installer            |  |
| `dbVolumeDirectory` | Directory on the worker node to use for the Persistent Volume | `/var/lib/cockroachdb` |
| `api_server_ip`     | If using Swagger, set to public IP or host of the CSM Installer API service | `localhost` | 

