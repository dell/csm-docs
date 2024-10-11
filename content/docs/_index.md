
---
title: "Container Storage Modules"
linkTitle: "Container Storage Modules"
weight: 20
menu:
  main:
    weight: 20

--- 
<!-- 
<style>
@keyframes flowColors {
    0% {
        background: linear-gradient(135deg, rgba(0, 123, 255, 0.4), rgba(0, 191, 255, 0.4), rgba(0, 255, 150, 0.4));
    }
    20% {
        background: linear-gradient(135deg, rgba(0, 191, 255, 0.4), rgba(0, 255, 150, 0.4), rgba(0, 255, 0, 0.4));
    }
    40% {
        background: linear-gradient(135deg, rgba(0, 255, 150, 0.4), rgba(0, 255, 0, 0.4), rgba(255, 255, 0, 0.4));
    }
    60% {
        background: linear-gradient(135deg, rgba(255, 255, 0, 0.4), rgba(255, 165, 0, 0.4), rgba(255, 0, 150, 0.4));
    }
    80% {
        background: linear-gradient(135deg, rgba(255, 0, 150, 0.4), rgba(0, 150, 255, 0.4), rgba(0, 0, 255, 0.4));
    }
    100% {
        background: linear-gradient(135deg, rgba(0, 123, 255, 0.4), rgba(0, 191, 255, 0.4), rgba(0, 255, 150, 0.4));
    }
}

.emphasis-text {
    animation: flowColors 12s ease infinite; /* Continuous flowing color animation */
    border: 2px solid #007BFF; /* Solid border */
    color: #007BFF; /* Text color */
    padding: 0.4em 0.6em; /* Padding around text */
    border-radius: 5px; /* Rounded corners */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); /* Soft shadow */
    font-weight: bold; /* Bold text */
    transition: transform 0.3s ease, box-shadow 0.3s ease; /* Smooth transition effect */
}

.emphasis-text:hover {
    transform: scale(1.02); /* Slightly enlarge on hover */
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Increased shadow on hover */
}
</style> 

<style>
  .emphasis-text {
    font-size: 1.5em;
    font-weight: bold;
    color: #ffffff;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
    animation: fadeIn 2s ease-in-out, colorShift 5s infinite alternate, glow 1.5s infinite;
    transition: transform 0.3s ease-in-out;
    padding: 20px;
    border: 2px solid #ff6f61;
    border-radius: 10px;
    background: linear-gradient(135deg, #ff9a8b, #ff6f61);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  .emphasis-text:hover {
    transform: scale(1.1);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes colorShift {
    0% {
      background: linear-gradient(135deg, #ff9a8b, #ff6f61);
    }
    100% {
      background: linear-gradient(135deg, #ff6f61, #ff9a8b);
    }
  }

  @keyframes glow {
    0% {
      box-shadow: 0 0 5px #ff6f61;
    }
    50% {
      box-shadow: 0 0 20px #ff6f61;
    }
    100% {
      box-shadow: 0 0 5px #ff6f61;
    }
  }
 
</style>



{{% pageinfo color="primary" %}} 
The CSM Authorization RPM will be deprecated in a future release. It is highly recommended that you use CSM Authorization Helm deployment or CSM Operator going forward.
{{% /pageinfo %}}

The Dell Technologies (Dell) Container Storage Modules (CSM) enables simple and consistent integration and automation experiences, extending enterprise storage capabilities to Kubernetes for cloud-native stateful applications. It reduces management complexity so developers can independently consume enterprise storage with ease and automate daily operations such as provisioning, snapshotting, replication, observability, authorization, application mobility, encryption, and resiliency.

<img src="csm_hexagon.png" alt="CSM Hex Diagram" width="500"/>

<br> <br>
CSM is made up of multiple components including modules (enterprise capabilities), CSI drivers (storage enablement), and other related applications (deployment, feature controllers, etc).

{{% cardpane %}}
  {{< card header="[**Authorization**](authorization/)"
          footer="Supports [PowerFlex](csidriver/features/powerflex/) [PowerScale](csidriver/features/powerscale/) [PowerMax](csidriver/features/powermax/)">}}
  CSM for Authorization provides storage and Kubernetes administrators the ability to apply RBAC for Dell CSI Drivers. It does this by deploying a proxy between the CSI driver and the storage system to enforce role-based access and usage rules.<br>
[...Learn more](authorization/)

  {{< /card >}}
  {{< card header="[**Replication**](replication/)"
          footer="Supports [PowerFlex](csidriver/features/powerflex/) [PowerStore](csidriver/features/powerstore/) [PowerScale](csidriver/features/powerscale/) [PowerMax](csidriver/features/powermax/)">}}
  CSM for Replication project aims to bring Replication & Disaster Recovery capabilities of Dell Storage Arrays to Kubernetes clusters. It helps you replicate groups of volumes and can provide you a way to restart applications in case of both planned and unplanned migration.
[...Learn more](replication/)
{{< /card >}}
{{% /cardpane %}}
{{% cardpane %}}
{{< card header="[**Resiliency**](resiliency/)"
          footer="Supports [PowerFlex](csidriver/features/powerflex/) [PowerScale](csidriver/features/powerscale/) [Unity](csidriver/features/unity/) [PowerStore](csidriver/features/powerstore/) [PowerMax](csidriver/features/powermax/)">}}
  CSM for Resiliency is designed to make Kubernetes Applications, including those that utilize persistent storage, more resilient to various failures.
[...Learn more](resiliency/)
  {{< /card >}}
{{< card header="[**Observability**](observability/)"
          footer="Supports [PowerFlex](csidriver/features/powerflex/) [PowerStore](csidriver/features/powerstore/) [PowerScale](csidriver/features/powerscale/) [PowerMax](csidriver/features/powermax/)">}}
 CSM for Observability provides visibility on the capacity of the volumes/file shares that is being managed with Dell CSM CSI (Container Storage Interface) drivers along with their performance in terms of bandwidth, IOPS, and response time.
[...Learn more](observability/)
  {{< /card >}}
{{% /cardpane %}}
{{% cardpane %}}
{{< card header="[**Application Mobility**](applicationmobility/)"
          footer="Supports [PowerFlex](csidriver/features/powerflex/) via Apex Navigator for Kubernetes">}}
  Container Storage Modules for Application Mobility provide Kubernetes administrators the ability to clone their stateful application workloads and application data to other clusters in the cloud.
  [...Learn more](applicationmobility/)
  {{< /card >}}
   {{< card header="[**Encryption**](secure/encryption)"
          footer="Supports PowerScale">}}
  Encryption provides the capability to encrypt user data residing on volumes created by Dell CSI Drivers.
   [...Learn more](secure/encryption/)
  {{< /card >}}
{{% /cardpane %}}
{{% cardpane %}}
   {{< card header="[License](support/license/)"
          footer="Required for [Encryption](secure/encryption/)" >}}
  The tech-preview releases of Encryption require a license.
  Request a license using the [Container Storage Modules License Request](https://app.smartsheet.com/b/form/5e46fad643874d56b1f9cf4c9f3071fb) by providing the requested details.
   [...Learn more](support/license/)
  {{< /card >}}  
  
  <div class="card">
  <div class="card-header">
    Featured
  </div>
  <div class="card-body">
    <h5 class="card-title">Special title treatment</h5>
    <p class="card-text">With supporting text below as a natural lead-in to additional content.</p>
    <a href="#" class="btn btn-primary">Go somewhere</a>
  </div>
</div>
{{% /cardpane %}}
-->