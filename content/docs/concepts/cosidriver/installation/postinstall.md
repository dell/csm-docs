---
title: Post Install
linktitle: Post Install
weight: 1
Description: Common steps to be done after installing the driver
---
### Bucket Classes, Bucket Access Classes

The COSI driver installation does not create any _Bucket Classes_ nor _Bucket Access Classes_ as part of the driver installation. The following samples can be used to create those objects. Remember to uncomment/update the manifest as per the requirements.

#### Bucketclass

   ```yaml
   kind: BucketClass
   apiVersion: objectstorage.k8s.io/v1alpha1
   metadata:
     name: my-bucket-class
   deletionPolicy: Delete
   driverName: cosi.dellemc.com
   parameters:
     id: driverID
   ```
#### BucketAccessClass
   ```yaml
   kind: BucketAccessClass
   apiVersion: objectstorage.k8s.io/v1alpha1
   metadata:
     name: my-bucket-access-class
   driverName: cosi.dellemc.com
   parameters:
     id: driverID
   authenticationType: KEY
   ```
