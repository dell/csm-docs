---
title: ObjectScale
linktitle: ObjectScale
weight: 1
Description: Code features for ObjectScale COSI Driver
---

<!--
TODO: what are the defaults with which bucket is provisioned? E.g. encryption, block size, and other? This needs to be described
-->

> **Notational Conventions**
>
> The keywords "MUST", "MUST NOT", "REQUIRED", "SHALL", "SHALL NOT", "SHOULD", "SHOULD NOT", "RECOMMENDED", "NOT RECOMMENDED", "MAY", and "OPTIONAL" are to be interpreted as described in [RFC 2119](http://tools.ietf.org/html/rfc2119) (Bradner, S., "Key words for use in RFCs to Indicate Requirement Levels", BCP 14, RFC 2119, March 1997).

Fields are specified by theirs path. Consider the following examples:

1. Field specified by the following path `spec.authenticationType=IAM` is reflected in their resources YAML as the following:

```yaml
spec:
  authenticationType: IAM
```

2. field specified by path `spec.protocols=[Azure,GCS]` is reflected in their resources YAML as the following:

```yaml
spec:
  protocols:
    - Azure
    - GCS
```

## Prerequisites

In order to use COSI Driver on ObjectScale platform, the following components MUST be deployed to your cluster:

- Kubernetes Container Object Storage Interface CRDs
- Container Object Storage Interface Controller

> ℹ️ **NOTE:** use [the official COSI guide](https://container-object-storage-interface.github.io/docs/deployment-guide#quick-start) to deploy the required components.

## Kubernetes Objects

### Bucket

`Bucket` represents a Bucket or its equivalent in the storage backend. Generally, it should be created only in the brownfield provisioning scenario. The following is a sample manifest of `Bucket` resource:

```yaml
apiVersion: objectstorage.k8s.io/v1alpha1
kind: Bucket
metadata:
  name: my-bucket
spec:
  driverName: cosi.dellemc.com
  bucketClassName: my-bucket-class
  bucketClaim: my-bucket-claim
  deletionPolicy: Delete
  protocols:
    - S3
  parameters:
    id: "my.objectscale"
```

#### `spec.existingBucketID`

`existingBucketID` is optional field that contains the unique id of the bucket in the ObjectScale. This field should be used to specify a bucket that has been created outside of COSI. Due to the fact, that the driver supports multiple arrays and multiple ObjectStores from one instance, the `existingBucketID` needs to have a format of: `<Configuration ID>-<Existing Bucket ID>`, e.g. `my.objectscale-existing-bucket`.

### Bucket Claim

`BucketClaim` represents a claim to provision a `Bucket`. The following is a sample manifest for creating a `BucketClaim` resource:

```yaml
apiVersion: objectstorage.k8s.io/v1alpha1
kind: BucketClaim
metadata:
  name: my-bucketclaim
  namespace: my-namespace
spec:
  bucketClassName: my-bucketclass
  protocols: [ 'S3' ]
```

#### Unsupported options

- `spec.protocols=[Azure,GCS]` - Protocols are the set of data API this bucket is required to support. From protocols specified by COSI (`v1alpha1`), Dell ObjectScale platform only supports the S3 protocol. Protocols `Azure` and `GCS` MUST NOT be used.

### Bucket Class

Installation of ObjectScale COSI driver does not create `BucketClass` resource. `BucketClass` represents a class of `Bucket` resources with similar characteristics.
Dell COSI Driver is a multi-backend driver, meaning that for every platform the specific `BucketClass` should be created. The `BucketClass` resource should contain the name of multi-backend driver and `parameters.id` for specific Object Storage Platform. 
The default sample is shown below:

```yaml
apiVersion: objectstorage.k8s.io/v1alpha1
kind: BucketClass
metadata:
  name: my-bucketclass
driverName: cosi.dellemc.com
deletionPolicy: Delete
parameters:
  id: "my.objectscale"
```

#### `deletionPolicy`

> ⚠ **WARNING:** this field is case sensitive, and the bucket deletion will fail if policy is not set exactly to *Delete* or *Retain*.

`deletionPolicy` in `BucketClass` resource is used to specify how COSI should handle deletion of the bucket. There are two possible values:
- **Retain**: Indicates that the bucket should not be deleted from the Object Storage Platform (OSP), it means that the underlying bucket is not cleaned up when the `Bucket` object is deleted. It makes the bucket unreachable from k8s level. 
- **Delete**: Indicates that the bucket should be permanently deleted from the Object Storage Platform (OSP) once all the workloads accessing this bucket are done, it means that the underlying bucket is cleaned up when the Bucket object is deleted.

#### `emptyBucket`

`emptyBucket` field is set in config YAML file passed to the chart during COSI driver installation. If it is set to `true`, then the bucket will be emptied before deletion. If it is set to `false`, then ObjectScale will not be able to delete not empty bucket and return error.

`emptyBucket` has no effect when Deletion Policy is set to `Retain`.

### Bucket Access Class

Installation of ObjectScale COSI driver does not create `BucketAccessClass` resource. `BucketAccessClass` represents a class of `BucketAccess` resources with similar characteristics.
Dell COSI Driver is a multi-backend driver, meaning that for every platform the specific `BucketAccessClass` should be created. The `BucketClass` resource should contain the name of multi-backend driver and `parameters.id` for specific Object Storage Platform. 
The default sample is shown below:

```yaml
apiVersion: objectstorage.k8s.io/v1alpha1
kind: BucketAccessClass
metadata:
  name: my-bucketaccessclass
driverName: cosi.dellemc.com
authenticationType: Key
parameters:
  id: "my.objectscale"
```

#### `authenticationType`

> ⚠ **WARNING:** this field is case sensitive, and the granting access will fail if it is not set exactly to *Key* or *IAM*.

`authenticationType` denotes the style of authentication. The only supported option for COSI Driver is `Key`.

#### Unsupported options

- `authenticationType=IAM` - denotes the style of authentication. The `IAM` value MUST NOT be used, because IAM style authentication is not supported.

### Bucket Access

`BucketAccess` resource represents a access request to generate a `Secret`, that will allow you to access ObjectStorage . The following is a sample manifest for creating a BucketClaim resource:

```yaml
apiVersion: objectstorage.k8s.io/v1alpha1
kind: BucketAccess
metadata:
  name: my-bucketaccess
  namespace: my-namespace
spec:
  bucketClaimName: my-bucketclaim
  protocol: S3
  bucketAccessClassName: my-bucketaccessclass
  credentialsSecretName: my-s3-secret
```

#### `spec.protocol`

> ⚠ **WARNING:** this field is case sensitive, and the provisioning will fail if protocol is not set exactly to *S3*.

`spec.protocol` is the name of the Protocol that this access credential is supposed to support.

#### Unsupported options

- `spec.serviceAccountName=...` - is the name of the serviceAccount that COSI will map to the object storage provider service account when IAM styled authentication is specified. As the IAM style authentication is not supported, this field is also unsupported.
- `spec.protocol=...` - Protocols are the set of data API this bucket is required to support. From protocols specified by COSI (`v1alpha1`), Dell ObjectScale platform only supports the `S3` protocol. Protocols `Azure` and `GCS` MUST NOT be used.

## Provisioning Buckets

### Kubernetes Administrator Steps

The first and foremost step to do before you can start provisioning object storage, is to create a `BucketClass`. The `BucketClass` is an object that defines the provisioning and management characteristics of `Bucket` resources. It acts as an abstraction layer between users (such as applications or pods) and the underlying object storage infrastructure. `BucketClass` allows you to dynamically provision and manage `Buckets` in a consistent and automated manner.

The provided code snippet demonstrates how to create a `BucketClass`.

```sh
cat <<EOF | kubectl create --filename -
apiVersion: objectstorage.k8s.io/v1alpha1
kind: BucketClass
metadata:
  name: my-bucketclass
driverName: cosi.dellemc.com
deletionPolicy: Delete
parameters:
  id: "my.objectscale"
EOF
```

### End-user Steps

#### Greenfield Provisioning

_Greenfield Provisioning_ means creating a new bucket from scratch, without any existing data.

The provided code snippet demonstrates how to create a `BucketClaim` for greenfield provisioning.

```sh
cat <<EOF | kubectl create --namespace=my-namespace --filename -
apiVersion: objectstorage.k8s.io/v1alpha1
kind: BucketClaim
metadata:
  name: my-bucketclaim
spec:
  bucketClassName: my-bucketclass
  protocols: [ 'S3' ]
EOF
```

> ℹ️ **NOTE:** remember to replace _my-namespace_, _my-bucketclass_ and _my-bucketclaim_ with actual values.

#### Brownfield Provisioning

_Brownfield Provisioning_ means using an existing bucket, that can already contain the data. This differs slightly from _Greenfield Provisioning_, as we need to create both `Bucket` and `BucketClaim` manually.

The provided code snippet demonstrates how to create `Bucket` and `BucketClaim` for brownfield provisioning.

```sh
cat <<EOF | kubectl create --namespace=my-namespace --filename -
apiVersion: objectstorage.k8s.io/v1alpha1
kind: Bucket
metadata:
  name: my-brownfield-bucket
spec:
  bucketClaim: {}
  bucketClassName: my-bucketclass
  deletionPolicy: Retain
  driverName: cosi.dellemc.com
  existingBucketID: my.objectscale-my-existing-bucket
  parameters:
    id: my.objectscale
  protocols: [ 'S3' ]
---
apiVersion: objectstorage.k8s.io/v1alpha1
kind: BucketClaim
metadata:
  name: my-brownfield-bucketclaim
spec:
  existingBucketName: my-brownfield-bucket
  protocols: [ 'S3' ]
EOF
```

> ℹ️ **NOTE:** remember to replace _my-namespace_, _existing-bucket-name_ and _my-bucketclaim_ with actual values.

## Deleting Buckets

There are a few crucial details regarding bucket deletion. The first one is `deletionPolicy` which is used to specify how COSI should handle deletion of a bucket. It is found in `BucketClass` resource and can be set to `Delete` and `Retain`. The second crucial detail is `emptyBucket` field in the [Helm Chart configuration](../../installation/configuration_file).

The provided code snippet demonstrates how to delete a `BucketClaim`.

```sh
kubectl --namespace=my-namespace delete bucketclaim my-bucketclaim
```

> ℹ️ **NOTE:** remember to replace _my-namespace_ and _my-bucketclaim_ with actual values.

## Granting Access

### Kubernetes Administrator Steps

The first and foremost step to do before you can start granting access to the object storage for your application, is to create a `BucketAccessClass`. The `BucketAccessClass` is an object that defines the access management characteristics of `Bucket` resources. It acts as an abstraction layer between users (such as applications or pods) and the underlying object storage infrastructure. `BucketAccessClass` allows you to dynamically grant access to `Buckets` in a consistent and automated manner.

The provided code snippet demonstrates how to create a `BucketAccessClass`:

```sh
cat <<EOF | kubectl create --filename -
apiVersion: objectstorage.k8s.io/v1alpha1
kind: BucketAccessClass
metadata:
  name: my-bucketaccessclass
driverName: cosi.dellemc.com
authenticationType: Key
parameters:
  id: "my.objectscale"
EOF
```

### End-user Steps

> ⚠ **WARNING:** only full access granting is supported.

The underlying workflow for granting access to the object storage primitive is:

- user is added to particular account in the ObjectScale;
- bucket policy is modified to reflect that user has gained permissions for a bucket;
- access key for the user is added to ObjectScale.

The provided code snippet demonstrates how to grant an access using `BucketAccess` resource:

```sh
cat <<EOF | kubectl create --namespace=my-namespace --filename -
apiVersion: objectstorage.k8s.io/v1alpha1
kind: BucketAccess
metadata:
  name: my-bucketaccess
spec:
  bucketAccessClassName: my-bucketaccessclass
  bucketClaimName: my-bucketclaim
  credentialsSecretName: my-s3-secret
  protocol: S3
EOF
```

> ℹ️ **NOTE:** remember to replace _my-namespace_, _my-bucketaccessclass_, _my-bucketclaim_, _my-s3-secret_ and _my-bucketaccess_ with actual values.

## Revoking Access

This feature revokes a user's previously granted access to a particular bucket.
When resource of `BucketAccess` kind is removed from Kubernetes it triggers the process:

- access key is removed from ObjectScale;
- bucket policy is modified to reflect that user has lost permissions for a bucket;
- user is removed from ObjectScale.

The provided code snippet demonstrates how to revoke a `BucketAccess`:

```sh
kubectl --namespace=my-namespace delete bucketaccess my-bucketaccess
```

> ℹ️ **NOTE:** remember to replace _my-namespace_ and _my-bucketaccess_ with actual values.
