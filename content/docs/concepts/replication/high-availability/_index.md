---
title: "High Availability"
linkTitle: "High Availability"
weight: 6 
no_list: true
Description: >
  Support for High Availability of Volumes
---
One of the goals of high availability is to eliminate single points of failure in a storage system. In Kubernetes, this can mean that a single PV represents multiple read/write enabled volumes on different arrays, located at reasonable distances with both the volumes in sync with each other. If one of the volumes goes down, there will still be another volume available for read and write. This kind of high availability can be achieved by using Metro replication mode, supported by PowerMax and PowerStore arrays. 



{{< cardcontainer >}}

    {{< customcard  link="./powermax-metro" title="PowerMax Metro" imageNumber="3">}}

    {{< customcard  link="./powerstore-metro"  title="PowerStore Metro" imageNumber="3">}}


{{< /cardcontainer >}}