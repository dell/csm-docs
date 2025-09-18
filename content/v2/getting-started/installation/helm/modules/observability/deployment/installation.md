---

---
{{% pageinfo color="primary" %}}
{{< message text="1" >}}
{{% /pageinfo %}}

The Container Storage Modules (CSM) for Observability Helm chart bootstraps an Observability deployment on a Kubernetes cluster using the Helm package manager.

## Prerequisites

- Helm 3.x
- The deployment of one or more supported Dell CSI drivers

## Install the CSM for Observability Helm Chart
**Steps**
1. Create a namespace where you want to install the module
   ```bash
   kubectl create namespace karavi
   ```

2. Install cert-manager CRDs
   ```bash
   kubectl apply --validate=false -f https://github.com/jetstack/cert-manager/releases/download/v1.10.0/cert-manager.crds.yaml
   ```

3. Add the Dell Helm Charts repo
   ```bash
     helm repo add dell https://dell.github.io/helm-charts
   ```
