/*
 *
 * Copyright © 2023 Dell Inc. or its subsidiaries. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
const {
	setValues,
	createYamlString
} = require("../generate-yaml");

const CONSTANTS = {
	POWERSTORE: "powerstore",
	POWERSCALE: "powerscale",
	POWERFLEX: "powerflex",
	POWERMAX: "powermax",
	UNITY: "unity",
	POWERSTORE_NAMESPACE: "csi-powerstore",
	POWERFLEX_NAMESPACE: "vxflexos",
	POWERMAX_NAMESPACE: "powermax",
	POWERSCALE_NAMESPACE: "isilon",
	UNITY_NAMESPACE: "unity",
	VALUES: "values",
	TEMP_DIR: "templates",
	TEMP_EXT: ".template",
	HYPHEN: "-",
	NODE_SELECTOR_TAB: '\n'.padEnd(7, " "),
	SLASH: "/",
	VERSIONS_DIR: "csm-versions",
	CSM: "csm",
	DEFAULT_VALUES: "default-values",
	PROPERTIES: ".properties",
	HELM: "helm",
	OPERATOR: "operator",
	CSM_HELM_V170: "1.0.0",
	TAINTS: `
    - key: "$KEY"
      operator: "Exists"
      effect: "NoSchedule"
	`,
	COMMENTED_TAINTS: `
    #- key: "node-role.kubernetes.io/control-plane"
    #  operator: "Exists"
    #  effect: "NoSchedule"
	`
};

const testCSMMap = new Map([
	["csmVersion", "1.6.0"],
	["imageRepository", "dellemc"],
	["controllerCount", "1"],
	["volNamePrefix", "csivol"],
	["snapNamePrefix", "csi-snap"],
	["nodeSelectorLabel", "node-role.kubernetes.io/control-plane:"],
	["driverVersion", "v2.6.0"],
]);

describe("GIVEN setValues function", () => {
	test("SHOULD return expected DriverValues", () => {
		document.body.innerHTML = `
            <select id="csm-version">
                <option value="1.6.0">CSM 1.6</option>
            </select>
            <select id="fsGroup-Policy">
                <option value="ReadWriteOnceWithFSType">Select the FSGroupPolicy type</option>
            </select>
            <input type="text" id="image-repository" value="dellemc">
            <input type="number" id="cert-secret-count" value="0">
            <input type="number" id="controller-count" value="2">
            <input type="text" id="vol-name-prefix" value="csivol">
            <input type="text" id="snapshot-prefix" value="csi-snap">
            <input type="text" id="node-selector-label" value="node-role.kubernetes.io/control-plane:">
            <input type="checkbox" id="controller-pods-node-selector" checked>
            <input type="checkbox" id="node-pods-node-selector" checked>
            <input type="text" id="driver-namespace" value="">
            <input type="text" id="authorization-proxy-host" value="">
            <input type="text" id="taint" value="node-role.kubernetes.io/control-plane">
        `;

		const expected = {
			csmVersion: "1.6.0",
			driverVersion: "v2.6.0",
			imageRepository: "dellemc",
			certSecretCount: "0",
			controllerCount: "1",
			volNamePrefix: "csivol",
			snapNamePrefix: "csi-snap",
			controllerPodsNodeSelector: '\n      node-role.kubernetes.io/control-plane: ""',
			nodePodsNodeSelector: '\n      node-role.kubernetes.io/control-plane: ""',
			nodeSelectorLabel: "node-role.kubernetes.io/control-plane:",
			snapshot: true,
			vgsnapshot: false,
			resizer: true,
			healthMonitor: false,
			replication: false,
			observability: false,
			observabilityMetrics: false,
			authorization: false,
			authorizationSkipCertValidation: true,
			certManagerEnabled: false,
			taint: "node-role.kubernetes.io/control-plane"
		};

		const received = setValues(testCSMMap, CONSTANTS);

		expect(received).toEqual(received);
	});

	test("SHOULD return expected DriverValues for csm version 1.6.0", () => {
		document.body.innerHTML = `
            <select id="csm-version">
                <option value="1.6.0">CSM 1.6</option>
            </select>
            <select id="fsGroup-Policy">
                <option value="ReadWriteOnceWithFSType">Select the FSGroupPolicy type</option>
            </select>
            <input type="text" id="image-repository" value="dellemc">
            <input type="number" id="cert-secret-count" value="0">
            <input type="number" id="controller-count" value="2">
            <input type="text" id="vol-name-prefix" value="csivol">
            <input type="text" id="snapshot-prefix" value="csi-snap">
            <input type="text" id="node-selector-label" value="node-role.kubernetes.io/control-plane:">
            <input type="checkbox" id="controller-pods-node-selector" checked>
            <input type="checkbox" id="node-pods-node-selector" checked>
            <input type="text" id="driver-namespace" value="">
            <input type="text" id="authorization-proxy-host" value="">
            <input type="text" id="taint" value="node-role.kubernetes.io/control-plane">
        `;

		const expected = {
			csmVersion: "1.6.0",
			driverVersion: "v2.6.0",
			imageRepository: "dellemc",
			certSecretCount: "0",
			controllerCount: "1",
			VolnamePrefix: "csivol",
			SnapnamePrefix: "csi-snap",
			controllerPodsNodeSelector: '\n      node-role.kubernetes.io/control-plane: ""',
			nodePodsNodeSelector: '\n      node-role.kubernetes.io/control-plane: ""',
			nodeSelectorLabel: "node-role.kubernetes.io/control-plane:",
			snapshot: true,
			vgsnapshot: false,
			resizer: true,
			healthMonitor: false,
			replication: false,
			observability: false,
			observabilityMetrics: false,
			authorization: false,
			authorizationSkipCertValidation: true,
			certManagerEnabled: false,
			taint: "node-role.kubernetes.io/control-plane"
		};

		const received = setValues(testCSMMap, CONSTANTS);

		expect(received).toEqual(received);
	});
});

describe("GIVEN createYamlString function", () => {
	const testYAML = `
    ## K8S/DRIVER ATTRIBUTES
    ########################
    csi-powerstore:
      enabled: $POWERSTORE_ENABLED
      version: v2.6.0
      images:
        driverRepository: $IMAGE_REPOSITORY
      ## Controller ATTRIBUTES
      controller:
        controllerCount: $CONTROLLER_COUNT
        healthMonitor:
          enabled: $HEALTH_MONITOR_ENABLED
        nodeSelector: $CONTROLLER_POD_NODE_SELECTOR
        replication:
          enabled: $REPLICATION_ENABLED
          image: dellemc/dell-csi-replicator:v1.4.0
        vgsnapshot:
          enabled: $VG_SNAPSHOT_ENABLED
          image: dellemc/csi-volumegroup-snapshotter:v1.2.0
        snapshot:
          enabled: $SNAPSHOT_ENABLED
        resizer:
          enabled: $RESIZER_ENABLED
      ## Node ATTRIBUTES
      node:
        healthMonitor:
          enabled: $HEALTH_MONITOR_ENABLED
        nodeSelector: $NODE_POD_NODE_SELECTOR
          # Uncomment if CSM for Resiliency and CSI Driver pods monitor are enabled
        # tolerations:
        # - key: "offline.vxflexos.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "vxflexos.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.unity.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "unity.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.isilon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "isilon.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.powerstore.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "powerstore.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
      storageCapacity:
        enabled: $STORAGE_CAPACITY_ENABLED
      podmon:
        enabled: $RESILIENCY_ENABLED
        image: dellemc/podmon:v1.5.0
    
    ## K8S/PowerMax ATTRIBUTES
    ##########################################
    csi-powermax:
      enabled: $POWERMAX_ENABLED
      global:
        storageArrays:
          - storageArrayId: "$POWERMAX_STORAGE_ARRAY_ID"
            endpoint: $POWERMAX_STORAGE_ARRAY_ENDPOINT_URL
            backupEndpoint: $POWERMAX_STORAGE_ARRAY_BACKUP_ENDPOINT_URL
        managementServers:
          - endpoint: $POWERMAX_MANAGEMENT_SERVERS_ENDPOINT_URL
      version: v2.6.0
      images:
        driverRepository: $IMAGE_REPOSITORY
      clusterPrefix: $POWERMAX_CLUSTER_PREFIX
      portGroups: "$POWERMAX_PORT_GROUPS"
      controller:
        controllerCount: $CONTROLLER_COUNT
        snapshot:
          enabled: $SNAPSHOT_ENABLED
        resizer:
          enabled: $RESIZER_ENABLED
        healthMonitor:
          enabled: $HEALTH_MONITOR_ENABLED
        nodeSelector: $CONTROLLER_POD_NODE_SELECTOR
      node:
        healthMonitor:
          enabled: $HEALTH_MONITOR_ENABLED
        nodeSelector: $NODE_POD_NODE_SELECTOR
      csireverseproxy:
        image: dellemc/csipowermax-reverseproxy:v2.5.0
        deployAsSidecar: true
      replication:
        enabled: $REPLICATION_ENABLED
        image: dellemc/dell-csi-replicator:v1.4.0
      migration:
        enabled: $MIGRATION_ENABLED
        image: dellemc/dell-csi-migrator:v1.1.0
        nodeRescanSidecarImage: dellemc/dell-csi-node-rescanner:v1.0.0
      authorization:
        enabled: $AUTHORIZATION_ENABLED
        sidecarProxyImage: dellemc/csm-authorization-sidecar:v1.6.0
        proxyHost: $AUTHORIZATION_PROXY_HOST
        skipCertificateValidation:  $AUTHORIZATION_SKIP_CERTIFICATE_VALIDATION
      vSphere:
        enabled: $VSPHERE_ENABLED
        fcPortGroup: "$VSPHERE_FC_PORT_GROUP"
        fcHostName: "$VSPHERE_FC_HOST_NAME"
        vCenterHost: "$VSPHERE_VCENTER_HOST"
        vCenterCredSecret: $VSPHERE_VCENTER_CRED_SECRET
    
    ## CSI PowerFlex
    ########################
    csi-vxflexos:
      enabled: $POWERFLEX_ENABLED
      version: v2.6.0
      images:
        driverRepository: $IMAGE_REPOSITORY
        powerflexSdc: dellemc/sdc:3.6.0.6
      certSecretCount: $CERT_SECRET_COUNT
      controller:
        replication:
          enabled: $REPLICATION_ENABLED
          image: dellemc/dell-csi-replicator:v1.4.0
        healthMonitor:
          enabled: $HEALTH_MONITOR_ENABLED
        controllerCount: $CONTROLLER_COUNT
        snapshot:
          enabled: $SNAPSHOT_ENABLED
        resizer:
          enabled: $RESIZER_ENABLED
        nodeSelector: $CONTROLLER_POD_NODE_SELECTOR
      node:
        healthMonitor:
          enabled: $HEALTH_MONITOR_ENABLED
        nodeSelector: $NODE_POD_NODE_SELECTOR
        tolerations:
        # Uncomment if CSM for Resiliency and CSI Driver pods monitor is enabled 
        # - key: "offline.vxflexos.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "vxflexos.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.unity.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "unity.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.isilon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "isilon.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
      monitor:
        enabled: $MONITOR_ENABLED
      vgsnapshotter:
        enabled: $VG_SNAPSHOT_ENABLED
        image: dellemc/csi-volumegroup-snapshotter:v1.2.0
      podmon:
        enabled: $RESILIENCY_ENABLED
        image: dellemc/podmon:v1.5.0
      authorization:
        enabled: $AUTHORIZATION_ENABLED
        sidecarProxyImage: dellemc/csm-authorization-sidecar:v1.6.0
        proxyHost: $AUTHORIZATION_PROXY_HOST

    ## CSI Unity
    ########################
    csi-unity:
      enabled: $UNITY_ENABLED
      version: v2.6.0
      images:
        driverRepository: $IMAGE_REPOSITORY
      certSecretCount: 1
      fsGroupPolicy: $FSGROUP_POLICY
      controller:
        controllerCount: $CONTROLLER_COUNT
        volumeNamePrefix: $VOLUME_NAME_PREFIX
        snapshot:
          enabled: $SNAPSHOT_ENABLED
          snapNamePrefix: $SNAP_NAME_PREFIX
        resizer:
          enabled: $RESIZER_ENABLED
        nodeSelector:
        healthMonitor:
          enabled: $HEALTH_MONITOR_ENABLED
      node:
        healthMonitor:
          enabled: $HEALTH_MONITOR_ENABLED
        nodeSelector:
        tolerations:
        # Uncomment if nodes you wish to use have the node-role.kubernetes.io/master taint
        #  - key: "node-role.kubernetes.io/master"
        #    operator: "Exists"
        #    effect: "NoExecute"
        # Uncomment if nodes you wish to use have the node-role.kubernetes.io/control-plane taint
        #  - key: "node-role.kubernetes.io/control-plane"
        #    operator: "Exists"
        #    effect: "NoExecute"
        #  - key: "node.kubernetes.io/memory-pressure"
        #    operator: "Exists"
        #    effect: "NoExecute"
        #  - key: "node.kubernetes.io/disk-pressure"
        #    operator: "Exists"
        #    effect: "NoExecute"
        #  - key: "node.kubernetes.io/network-unavailable"
        #    operator: "Exists"
        #    effect: "NoExecute"
        # Uncomment if CSM for Resiliency and CSI Driver pods monitor are enabled 
        #  - key: "offline.vxflexos.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "vxflexos.podmon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "offline.unity.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "unity.podmon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "offline.isilon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "isilon.podmon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
      podmon:
        enabled: $RESILIENCY_ENABLED
        image: dellemc/podmon:v1.5.0

    ## K8S/Replication Module ATTRIBUTES
    ##########################################
    csm-replication:
      enabled: $REPLICATION_ENABLED
    
    ## K8S/Observability Module ATTRIBUTES
    ##########################################
    karavi-observability:
      enabled: $OBSERVABILITY_ENABLED
      karaviMetricsPowerstore:
        enabled: $POWERSTORE_OBSERVABILITY_METRICS_ENABLED
      karaviMetricsPowerMax:
        enabled: $POWERMAX_OBSERVABILITY_METRICS_ENABLED
      karaviMetricsPowerflex:
        enabled: $POWERFLEX_OBSERVABILITY_METRICS_ENABLED
      karaviMetricsPowerscale:
        enabled: $POWERSCALE_OBSERVABILITY_METRICS_ENABLED
      cert-manager:
        enabled: false
    
    ## K8S/Cert-manager ATTRIBUTES
    ##########################################
    cert-manager:
      enabled: $CERT_MANAGER_ENABLED
  `;

	const testObject = {
		csmVersion: "1.6.0",
		driverVersion: "v2.6.0",
		imageRepository: "dellemc",
		controllerCount: "1",
		fsGroupPolicy: "ReadWriteOnceWithFSType",
		volNamePrefix: "csivol",
		snapNamePrefix: "csi-snap",
		controllerPodsNodeSelector: false,
		nodePodsNodeSelector: false,
		resiliency: false,
		storageCapacity: false,
		snapshot: true,
		vgsnapshot: false,
		resizer: true,
		healthMonitor: false,
		replication: false,
		observability: true,
		observabilityMetrics: true,
		authorization: false,
		authorizationSkipCertValidation: true,
		vgsnapshotImage: "dellemc/csi-volumegroup-snapshotter:v1.2.0",
		replicationImage: "dellemc/dell-csi-replicator:v1.4.0",
		authorizationImage: "dellemc/csm-authorization-sidecar:v1.6.0",
		certManagerEnabled: false,
		authorizationProxyHost: '""',
		monitor: false,
		certSecretCount: 0,
		storageArrayId: "",
		storageArrayEndpointUrl: '""',
		storageArrayBackupEndpointUrl: '""',
		clusterPrefix: "",
		portGroups: "",
		vSphereEnabled: false,
		vSphereFCPortGroup: "csi-vsphere-VC-PG",
		vSphereFCHostName: "csi-vsphere-VC-HN",
		vSphereVCenterHost: "00.000.000.00",
		vSphereVCenterCredSecret: "vcenter-creds",
		migration: false
	};

	test("SHOULD return generated yaml file string for driver csi-powerstore", () => {
		const expected = `
    ## K8S/DRIVER ATTRIBUTES
    ########################
    csi-powerstore:
      enabled: true
      version: v2.6.0
      images:
        driverRepository: dellemc
      ## Controller ATTRIBUTES
      controller:
        controllerCount: 1
        healthMonitor:
          enabled: false
        nodeSelector: false
        replication:
          enabled: false
          image: dellemc/dell-csi-replicator:v1.4.0
        vgsnapshot:
          enabled: false
          image: dellemc/csi-volumegroup-snapshotter:v1.2.0
        snapshot:
          enabled: true
        resizer:
          enabled: true
      ## Node ATTRIBUTES
      node:
        healthMonitor:
          enabled: false
        nodeSelector: false
          # Uncomment if CSM for Resiliency and CSI Driver pods monitor are enabled
        # tolerations:
        # - key: "offline.vxflexos.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "vxflexos.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.unity.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "unity.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.isilon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "isilon.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.powerstore.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "powerstore.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
      storageCapacity:
        enabled: false
      podmon:
        enabled: false
        image: dellemc/podmon:v1.5.0
    
    ## K8S/PowerMax ATTRIBUTES
    ##########################################
    csi-powermax:
      enabled: false
      global:
        storageArrays:
          - storageArrayId: ""
            endpoint: ""
            backupEndpoint: ""
        managementServers:
          - endpoint: ""
      version: v2.6.0
      images:
        driverRepository: dellemc
      clusterPrefix: 
      portGroups: ""
      controller:
        controllerCount: 1
        snapshot:
          enabled: true
        resizer:
          enabled: true
        healthMonitor:
          enabled: false
        nodeSelector: false
      node:
        healthMonitor:
          enabled: false
        nodeSelector: false
      csireverseproxy:
        image: dellemc/csipowermax-reverseproxy:v2.5.0
        deployAsSidecar: true
      replication:
        enabled: false
        image: dellemc/dell-csi-replicator:v1.4.0
      migration:
        enabled: false
        image: dellemc/dell-csi-migrator:v1.1.0
        nodeRescanSidecarImage: dellemc/dell-csi-node-rescanner:v1.0.0
      authorization:
        enabled: false
        sidecarProxyImage: dellemc/csm-authorization-sidecar:v1.6.0
        proxyHost: ""
        skipCertificateValidation:  true
      vSphere:
        enabled: false
        fcPortGroup: "csi-vsphere-VC-PG"
        fcHostName: "csi-vsphere-VC-HN"
        vCenterHost: "00.000.000.00"
        vCenterCredSecret: vcenter-creds
    
    ## CSI PowerFlex
    ########################
    csi-vxflexos:
      enabled: false
      version: v2.6.0
      images:
        driverRepository: dellemc
        powerflexSdc: dellemc/sdc:3.6.0.6
      certSecretCount: 0
      controller:
        replication:
          enabled: false
          image: dellemc/dell-csi-replicator:v1.4.0
        healthMonitor:
          enabled: false
        controllerCount: 1
        snapshot:
          enabled: true
        resizer:
          enabled: true
        nodeSelector: false
      node:
        healthMonitor:
          enabled: false
        nodeSelector: false
        tolerations:
        # Uncomment if CSM for Resiliency and CSI Driver pods monitor is enabled 
        # - key: "offline.vxflexos.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "vxflexos.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.unity.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "unity.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.isilon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "isilon.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
      monitor:
        enabled: false
      vgsnapshotter:
        enabled: false
        image: dellemc/csi-volumegroup-snapshotter:v1.2.0
      podmon:
        enabled: false
        image: dellemc/podmon:v1.5.0
      authorization:
        enabled: false
        sidecarProxyImage: dellemc/csm-authorization-sidecar:v1.6.0
        proxyHost: ""

    ## CSI Unity
    ########################
    csi-unity:
      enabled: false
      version: v2.6.0
      images:
        driverRepository: dellemc
      certSecretCount: 1
      fsGroupPolicy: ReadWriteOnceWithFSType
      controller:
        controllerCount: 1
        volumeNamePrefix: csivol
        snapshot:
          enabled: true
          snapNamePrefix: csi-snap
        resizer:
          enabled: true
        nodeSelector:
        healthMonitor:
          enabled: false
      node:
        healthMonitor:
          enabled: false
        nodeSelector:
        tolerations:
        # Uncomment if nodes you wish to use have the node-role.kubernetes.io/master taint
        #  - key: "node-role.kubernetes.io/master"
        #    operator: "Exists"
        #    effect: "NoExecute"
        # Uncomment if nodes you wish to use have the node-role.kubernetes.io/control-plane taint
        #  - key: "node-role.kubernetes.io/control-plane"
        #    operator: "Exists"
        #    effect: "NoExecute"
        #  - key: "node.kubernetes.io/memory-pressure"
        #    operator: "Exists"
        #    effect: "NoExecute"
        #  - key: "node.kubernetes.io/disk-pressure"
        #    operator: "Exists"
        #    effect: "NoExecute"
        #  - key: "node.kubernetes.io/network-unavailable"
        #    operator: "Exists"
        #    effect: "NoExecute"
        # Uncomment if CSM for Resiliency and CSI Driver pods monitor are enabled 
        #  - key: "offline.vxflexos.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "vxflexos.podmon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "offline.unity.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "unity.podmon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "offline.isilon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "isilon.podmon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
      podmon:
        enabled: false
        image: dellemc/podmon:v1.5.0

    ## K8S/Replication Module ATTRIBUTES
    ##########################################
    csm-replication:
      enabled: false
    
    ## K8S/Observability Module ATTRIBUTES
    ##########################################
    karavi-observability:
      enabled: true
      karaviMetricsPowerstore:
        enabled: true
      karaviMetricsPowerMax:
        enabled: false
      karaviMetricsPowerflex:
        enabled: false
      karaviMetricsPowerscale:
        enabled: false
      cert-manager:
        enabled: false
    
    ## K8S/Cert-manager ATTRIBUTES
    ##########################################
    cert-manager:
      enabled: false
  `;
		const received = createYamlString(testYAML, testObject, "powerstore", CONSTANTS);
		expect(received).toEqual(expected);
	});

	test("SHOULD return generated yaml file string for driver csi-powerflex", () => {
		const expected = `
    ## K8S/DRIVER ATTRIBUTES
    ########################
    csi-powerstore:
      enabled: false
      version: v2.6.0
      images:
        driverRepository: dellemc
      ## Controller ATTRIBUTES
      controller:
        controllerCount: 1
        healthMonitor:
          enabled: false
        nodeSelector: false
        replication:
          enabled: false
          image: dellemc/dell-csi-replicator:v1.4.0
        vgsnapshot:
          enabled: false
          image: dellemc/csi-volumegroup-snapshotter:v1.2.0
        snapshot:
          enabled: true
        resizer:
          enabled: true
      ## Node ATTRIBUTES
      node:
        healthMonitor:
          enabled: false
        nodeSelector: false
          # Uncomment if CSM for Resiliency and CSI Driver pods monitor are enabled
        # tolerations:
        # - key: "offline.vxflexos.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "vxflexos.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.unity.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "unity.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.isilon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "isilon.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.powerstore.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "powerstore.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
      storageCapacity:
        enabled: false
      podmon:
        enabled: false
        image: dellemc/podmon:v1.5.0
    
    ## K8S/PowerMax ATTRIBUTES
    ##########################################
    csi-powermax:
      enabled: false
      global:
        storageArrays:
          - storageArrayId: ""
            endpoint: ""
            backupEndpoint: ""
        managementServers:
          - endpoint: ""
      version: v2.6.0
      images:
        driverRepository: dellemc
      clusterPrefix: 
      portGroups: ""
      controller:
        controllerCount: 1
        snapshot:
          enabled: true
        resizer:
          enabled: true
        healthMonitor:
          enabled: false
        nodeSelector: false
      node:
        healthMonitor:
          enabled: false
        nodeSelector: false
      csireverseproxy:
        image: dellemc/csipowermax-reverseproxy:v2.5.0
        deployAsSidecar: true
      replication:
        enabled: false
        image: dellemc/dell-csi-replicator:v1.4.0
      migration:
        enabled: false
        image: dellemc/dell-csi-migrator:v1.1.0
        nodeRescanSidecarImage: dellemc/dell-csi-node-rescanner:v1.0.0
      authorization:
        enabled: false
        sidecarProxyImage: dellemc/csm-authorization-sidecar:v1.6.0
        proxyHost: ""
        skipCertificateValidation:  true
      vSphere:
        enabled: false
        fcPortGroup: "csi-vsphere-VC-PG"
        fcHostName: "csi-vsphere-VC-HN"
        vCenterHost: "00.000.000.00"
        vCenterCredSecret: vcenter-creds
    
    ## CSI PowerFlex
    ########################
    csi-vxflexos:
      enabled: true
      version: v2.6.0
      images:
        driverRepository: dellemc
        powerflexSdc: dellemc/sdc:3.6.0.6
      certSecretCount: 0
      controller:
        replication:
          enabled: false
          image: dellemc/dell-csi-replicator:v1.4.0
        healthMonitor:
          enabled: false
        controllerCount: 1
        snapshot:
          enabled: true
        resizer:
          enabled: true
        nodeSelector: false
      node:
        healthMonitor:
          enabled: false
        nodeSelector: false
        tolerations:
        # Uncomment if CSM for Resiliency and CSI Driver pods monitor is enabled 
        # - key: "offline.vxflexos.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "vxflexos.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.unity.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "unity.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.isilon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "isilon.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
      monitor:
        enabled: false
      vgsnapshotter:
        enabled: false
        image: dellemc/csi-volumegroup-snapshotter:v1.2.0
      podmon:
        enabled: false
        image: dellemc/podmon:v1.5.0
      authorization:
        enabled: false
        sidecarProxyImage: dellemc/csm-authorization-sidecar:v1.6.0
        proxyHost: ""

    ## CSI Unity
    ########################
    csi-unity:
      enabled: false
      version: v2.6.0
      images:
        driverRepository: dellemc
      certSecretCount: 1
      fsGroupPolicy: ReadWriteOnceWithFSType
      controller:
        controllerCount: 1
        volumeNamePrefix: csivol
        snapshot:
          enabled: true
          snapNamePrefix: csi-snap
        resizer:
          enabled: true
        nodeSelector:
        healthMonitor:
          enabled: false
      node:
        healthMonitor:
          enabled: false
        nodeSelector:
        tolerations:
        # Uncomment if nodes you wish to use have the node-role.kubernetes.io/master taint
        #  - key: "node-role.kubernetes.io/master"
        #    operator: "Exists"
        #    effect: "NoExecute"
        # Uncomment if nodes you wish to use have the node-role.kubernetes.io/control-plane taint
        #  - key: "node-role.kubernetes.io/control-plane"
        #    operator: "Exists"
        #    effect: "NoExecute"
        #  - key: "node.kubernetes.io/memory-pressure"
        #    operator: "Exists"
        #    effect: "NoExecute"
        #  - key: "node.kubernetes.io/disk-pressure"
        #    operator: "Exists"
        #    effect: "NoExecute"
        #  - key: "node.kubernetes.io/network-unavailable"
        #    operator: "Exists"
        #    effect: "NoExecute"
        # Uncomment if CSM for Resiliency and CSI Driver pods monitor are enabled 
        #  - key: "offline.vxflexos.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "vxflexos.podmon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "offline.unity.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "unity.podmon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "offline.isilon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "isilon.podmon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
      podmon:
        enabled: false
        image: dellemc/podmon:v1.5.0

    ## K8S/Replication Module ATTRIBUTES
    ##########################################
    csm-replication:
      enabled: false
    
    ## K8S/Observability Module ATTRIBUTES
    ##########################################
    karavi-observability:
      enabled: true
      karaviMetricsPowerstore:
        enabled: false
      karaviMetricsPowerMax:
        enabled: false
      karaviMetricsPowerflex:
        enabled: true
      karaviMetricsPowerscale:
        enabled: false
      cert-manager:
        enabled: false
    
    ## K8S/Cert-manager ATTRIBUTES
    ##########################################
    cert-manager:
      enabled: false
  `;

		const received = createYamlString(testYAML, testObject, "powerflex", CONSTANTS);
		expect(received).toEqual(expected);
	});

	test("SHOULD return generated yaml file string for driver csi-powermax", () => {
		const expected = `
    ## K8S/DRIVER ATTRIBUTES
    ########################
    csi-powerstore:
      enabled: false
      version: v2.6.0
      images:
        driverRepository: dellemc
      ## Controller ATTRIBUTES
      controller:
        controllerCount: 1
        healthMonitor:
          enabled: false
        nodeSelector: false
        replication:
          enabled: false
          image: dellemc/dell-csi-replicator:v1.4.0
        vgsnapshot:
          enabled: false
          image: dellemc/csi-volumegroup-snapshotter:v1.2.0
        snapshot:
          enabled: true
        resizer:
          enabled: true
      ## Node ATTRIBUTES
      node:
        healthMonitor:
          enabled: false
        nodeSelector: false
          # Uncomment if CSM for Resiliency and CSI Driver pods monitor are enabled
        # tolerations:
        # - key: "offline.vxflexos.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "vxflexos.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.unity.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "unity.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.isilon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "isilon.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.powerstore.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "powerstore.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
      storageCapacity:
        enabled: false
      podmon:
        enabled: false
        image: dellemc/podmon:v1.5.0
    
    ## K8S/PowerMax ATTRIBUTES
    ##########################################
    csi-powermax:
      enabled: true
      global:
        storageArrays:
          - storageArrayId: ""
            endpoint: ""
            backupEndpoint: ""
        managementServers:
          - endpoint: ""
      version: v2.6.0
      images:
        driverRepository: dellemc
      clusterPrefix: 
      portGroups: ""
      controller:
        controllerCount: 1
        snapshot:
          enabled: true
        resizer:
          enabled: true
        healthMonitor:
          enabled: false
        nodeSelector: false
      node:
        healthMonitor:
          enabled: false
        nodeSelector: false
      csireverseproxy:
        image: dellemc/csipowermax-reverseproxy:v2.5.0
        deployAsSidecar: true
      replication:
        enabled: false
        image: dellemc/dell-csi-replicator:v1.4.0
      migration:
        enabled: false
        image: dellemc/dell-csi-migrator:v1.1.0
        nodeRescanSidecarImage: dellemc/dell-csi-node-rescanner:v1.0.0
      authorization:
        enabled: false
        sidecarProxyImage: dellemc/csm-authorization-sidecar:v1.6.0
        proxyHost: ""
        skipCertificateValidation:  true
      vSphere:
        enabled: false
        fcPortGroup: "csi-vsphere-VC-PG"
        fcHostName: "csi-vsphere-VC-HN"
        vCenterHost: "00.000.000.00"
        vCenterCredSecret: vcenter-creds
    
    ## CSI PowerFlex
    ########################
    csi-vxflexos:
      enabled: false
      version: v2.6.0
      images:
        driverRepository: dellemc
        powerflexSdc: dellemc/sdc:3.6.0.6
      certSecretCount: 0
      controller:
        replication:
          enabled: false
          image: dellemc/dell-csi-replicator:v1.4.0
        healthMonitor:
          enabled: false
        controllerCount: 1
        snapshot:
          enabled: true
        resizer:
          enabled: true
        nodeSelector: false
      node:
        healthMonitor:
          enabled: false
        nodeSelector: false
        tolerations:
        # Uncomment if CSM for Resiliency and CSI Driver pods monitor is enabled 
        # - key: "offline.vxflexos.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "vxflexos.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.unity.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "unity.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.isilon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "isilon.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
      monitor:
        enabled: false
      vgsnapshotter:
        enabled: false
        image: dellemc/csi-volumegroup-snapshotter:v1.2.0
      podmon:
        enabled: false
        image: dellemc/podmon:v1.5.0
      authorization:
        enabled: false
        sidecarProxyImage: dellemc/csm-authorization-sidecar:v1.6.0
        proxyHost: ""

    ## CSI Unity
    ########################
    csi-unity:
      enabled: false
      version: v2.6.0
      images:
        driverRepository: dellemc
      certSecretCount: 1
      fsGroupPolicy: ReadWriteOnceWithFSType
      controller:
        controllerCount: 1
        volumeNamePrefix: csivol
        snapshot:
          enabled: true
          snapNamePrefix: csi-snap
        resizer:
          enabled: true
        nodeSelector:
        healthMonitor:
          enabled: false
      node:
        healthMonitor:
          enabled: false
        nodeSelector:
        tolerations:
        # Uncomment if nodes you wish to use have the node-role.kubernetes.io/master taint
        #  - key: "node-role.kubernetes.io/master"
        #    operator: "Exists"
        #    effect: "NoExecute"
        # Uncomment if nodes you wish to use have the node-role.kubernetes.io/control-plane taint
        #  - key: "node-role.kubernetes.io/control-plane"
        #    operator: "Exists"
        #    effect: "NoExecute"
        #  - key: "node.kubernetes.io/memory-pressure"
        #    operator: "Exists"
        #    effect: "NoExecute"
        #  - key: "node.kubernetes.io/disk-pressure"
        #    operator: "Exists"
        #    effect: "NoExecute"
        #  - key: "node.kubernetes.io/network-unavailable"
        #    operator: "Exists"
        #    effect: "NoExecute"
        # Uncomment if CSM for Resiliency and CSI Driver pods monitor are enabled 
        #  - key: "offline.vxflexos.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "vxflexos.podmon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "offline.unity.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "unity.podmon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "offline.isilon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "isilon.podmon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
      podmon:
        enabled: false
        image: dellemc/podmon:v1.5.0

    ## K8S/Replication Module ATTRIBUTES
    ##########################################
    csm-replication:
      enabled: false
    
    ## K8S/Observability Module ATTRIBUTES
    ##########################################
    karavi-observability:
      enabled: true
      karaviMetricsPowerstore:
        enabled: false
      karaviMetricsPowerMax:
        enabled: true
      karaviMetricsPowerflex:
        enabled: false
      karaviMetricsPowerscale:
        enabled: false
      cert-manager:
        enabled: false
    
    ## K8S/Cert-manager ATTRIBUTES
    ##########################################
    cert-manager:
      enabled: false
  `;

		const received = createYamlString(testYAML, testObject, "powermax", CONSTANTS);

		expect(received).toEqual(expected);
	});


	test("SHOULD return generated yaml file string for driver csi-powerscale", () => {
		const expected = `
    ## K8S/DRIVER ATTRIBUTES
    ########################
    csi-powerstore:
      enabled: false
      version: v2.6.0
      images:
        driverRepository: dellemc
      ## Controller ATTRIBUTES
      controller:
        controllerCount: 1
        healthMonitor:
          enabled: false
        nodeSelector: false
        replication:
          enabled: false
          image: dellemc/dell-csi-replicator:v1.4.0
        vgsnapshot:
          enabled: false
          image: dellemc/csi-volumegroup-snapshotter:v1.2.0
        snapshot:
          enabled: true
        resizer:
          enabled: true
      ## Node ATTRIBUTES
      node:
        healthMonitor:
          enabled: false
        nodeSelector: false
          # Uncomment if CSM for Resiliency and CSI Driver pods monitor are enabled
        # tolerations:
        # - key: "offline.vxflexos.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "vxflexos.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.unity.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "unity.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.isilon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "isilon.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.powerstore.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "powerstore.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
      storageCapacity:
        enabled: false
      podmon:
        enabled: false
        image: dellemc/podmon:v1.5.0
    
    ## K8S/PowerMax ATTRIBUTES
    ##########################################
    csi-powermax:
      enabled: false
      global:
        storageArrays:
          - storageArrayId: ""
            endpoint: ""
            backupEndpoint: ""
        managementServers:
          - endpoint: ""
      version: v2.6.0
      images:
        driverRepository: dellemc
      clusterPrefix: 
      portGroups: ""
      controller:
        controllerCount: 1
        snapshot:
          enabled: true
        resizer:
          enabled: true
        healthMonitor:
          enabled: false
        nodeSelector: false
      node:
        healthMonitor:
          enabled: false
        nodeSelector: false
      csireverseproxy:
        image: dellemc/csipowermax-reverseproxy:v2.5.0
        deployAsSidecar: true
      replication:
        enabled: false
        image: dellemc/dell-csi-replicator:v1.4.0
      migration:
        enabled: false
        image: dellemc/dell-csi-migrator:v1.1.0
        nodeRescanSidecarImage: dellemc/dell-csi-node-rescanner:v1.0.0
      authorization:
        enabled: false
        sidecarProxyImage: dellemc/csm-authorization-sidecar:v1.6.0
        proxyHost: ""
        skipCertificateValidation:  true
      vSphere:
        enabled: false
        fcPortGroup: "csi-vsphere-VC-PG"
        fcHostName: "csi-vsphere-VC-HN"
        vCenterHost: "00.000.000.00"
        vCenterCredSecret: vcenter-creds
    
    ## CSI PowerFlex
    ########################
    csi-vxflexos:
      enabled: false
      version: v2.6.0
      images:
        driverRepository: dellemc
        powerflexSdc: dellemc/sdc:3.6.0.6
      certSecretCount: 0
      controller:
        replication:
          enabled: false
          image: dellemc/dell-csi-replicator:v1.4.0
        healthMonitor:
          enabled: false
        controllerCount: 1
        snapshot:
          enabled: true
        resizer:
          enabled: true
        nodeSelector: false
      node:
        healthMonitor:
          enabled: false
        nodeSelector: false
        tolerations:
        # Uncomment if CSM for Resiliency and CSI Driver pods monitor is enabled 
        # - key: "offline.vxflexos.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "vxflexos.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.unity.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "unity.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.isilon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "isilon.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
      monitor:
        enabled: false
      vgsnapshotter:
        enabled: false
        image: dellemc/csi-volumegroup-snapshotter:v1.2.0
      podmon:
        enabled: false
        image: dellemc/podmon:v1.5.0
      authorization:
        enabled: false
        sidecarProxyImage: dellemc/csm-authorization-sidecar:v1.6.0
        proxyHost: ""

    ## CSI Unity
    ########################
    csi-unity:
      enabled: false
      version: v2.6.0
      images:
        driverRepository: dellemc
      certSecretCount: 1
      fsGroupPolicy: ReadWriteOnceWithFSType
      controller:
        controllerCount: 1
        volumeNamePrefix: csivol
        snapshot:
          enabled: true
          snapNamePrefix: csi-snap
        resizer:
          enabled: true
        nodeSelector:
        healthMonitor:
          enabled: false
      node:
        healthMonitor:
          enabled: false
        nodeSelector:
        tolerations:
        # Uncomment if nodes you wish to use have the node-role.kubernetes.io/master taint
        #  - key: "node-role.kubernetes.io/master"
        #    operator: "Exists"
        #    effect: "NoExecute"
        # Uncomment if nodes you wish to use have the node-role.kubernetes.io/control-plane taint
        #  - key: "node-role.kubernetes.io/control-plane"
        #    operator: "Exists"
        #    effect: "NoExecute"
        #  - key: "node.kubernetes.io/memory-pressure"
        #    operator: "Exists"
        #    effect: "NoExecute"
        #  - key: "node.kubernetes.io/disk-pressure"
        #    operator: "Exists"
        #    effect: "NoExecute"
        #  - key: "node.kubernetes.io/network-unavailable"
        #    operator: "Exists"
        #    effect: "NoExecute"
        # Uncomment if CSM for Resiliency and CSI Driver pods monitor are enabled 
        #  - key: "offline.vxflexos.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "vxflexos.podmon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "offline.unity.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "unity.podmon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "offline.isilon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "isilon.podmon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
      podmon:
        enabled: false
        image: dellemc/podmon:v1.5.0

    ## K8S/Replication Module ATTRIBUTES
    ##########################################
    csm-replication:
      enabled: false
    
    ## K8S/Observability Module ATTRIBUTES
    ##########################################
    karavi-observability:
      enabled: true
      karaviMetricsPowerstore:
        enabled: false
      karaviMetricsPowerMax:
        enabled: false
      karaviMetricsPowerflex:
        enabled: false
      karaviMetricsPowerscale:
        enabled: true
      cert-manager:
        enabled: false
    
    ## K8S/Cert-manager ATTRIBUTES
    ##########################################
    cert-manager:
      enabled: false
  `;

		const received = createYamlString(testYAML, testObject, "powerscale", CONSTANTS);

		expect(received).toEqual(expected);
	});

	test("SHOULD return generated yaml file string for driver csi-unity", () => {
		const expected = `
    ## K8S/DRIVER ATTRIBUTES
    ########################
    csi-powerstore:
      enabled: false
      version: v2.6.0
      images:
        driverRepository: dellemc
      ## Controller ATTRIBUTES
      controller:
        controllerCount: 1
        healthMonitor:
          enabled: false
        nodeSelector: false
        replication:
          enabled: false
          image: dellemc/dell-csi-replicator:v1.4.0
        vgsnapshot:
          enabled: false
          image: dellemc/csi-volumegroup-snapshotter:v1.2.0
        snapshot:
          enabled: true
        resizer:
          enabled: true
      ## Node ATTRIBUTES
      node:
        healthMonitor:
          enabled: false
        nodeSelector: false
          # Uncomment if CSM for Resiliency and CSI Driver pods monitor are enabled
        # tolerations:
        # - key: "offline.vxflexos.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "vxflexos.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.unity.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "unity.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.isilon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "isilon.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.powerstore.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "powerstore.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
      storageCapacity:
        enabled: false
      podmon:
        enabled: false
        image: dellemc/podmon:v1.5.0
    
    ## K8S/PowerMax ATTRIBUTES
    ##########################################
    csi-powermax:
      enabled: false
      global:
        storageArrays:
          - storageArrayId: ""
            endpoint: ""
            backupEndpoint: ""
        managementServers:
          - endpoint: ""
      version: v2.6.0
      images:
        driverRepository: dellemc
      clusterPrefix: 
      portGroups: ""
      controller:
        controllerCount: 1
        snapshot:
          enabled: true
        resizer:
          enabled: true
        healthMonitor:
          enabled: false
        nodeSelector: false
      node:
        healthMonitor:
          enabled: false
        nodeSelector: false
      csireverseproxy:
        image: dellemc/csipowermax-reverseproxy:v2.5.0
        deployAsSidecar: true
      replication:
        enabled: false
        image: dellemc/dell-csi-replicator:v1.4.0
      migration:
        enabled: false
        image: dellemc/dell-csi-migrator:v1.1.0
        nodeRescanSidecarImage: dellemc/dell-csi-node-rescanner:v1.0.0
      authorization:
        enabled: false
        sidecarProxyImage: dellemc/csm-authorization-sidecar:v1.6.0
        proxyHost: ""
        skipCertificateValidation:  true
      vSphere:
        enabled: false
        fcPortGroup: "csi-vsphere-VC-PG"
        fcHostName: "csi-vsphere-VC-HN"
        vCenterHost: "00.000.000.00"
        vCenterCredSecret: vcenter-creds
    
    ## CSI PowerFlex
    ########################
    csi-vxflexos:
      enabled: false
      version: v2.6.0
      images:
        driverRepository: dellemc
        powerflexSdc: dellemc/sdc:3.6.0.6
      certSecretCount: 0
      controller:
        replication:
          enabled: false
          image: dellemc/dell-csi-replicator:v1.4.0
        healthMonitor:
          enabled: false
        controllerCount: 1
        snapshot:
          enabled: true
        resizer:
          enabled: true
        nodeSelector: false
      node:
        healthMonitor:
          enabled: false
        nodeSelector: false
        tolerations:
        # Uncomment if CSM for Resiliency and CSI Driver pods monitor is enabled 
        # - key: "offline.vxflexos.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "vxflexos.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.unity.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "unity.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "offline.isilon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
        # - key: "isilon.podmon.storage.dell.com"
        #   operator: "Exists"
        #   effect: "NoSchedule"
      monitor:
        enabled: false
      vgsnapshotter:
        enabled: false
        image: dellemc/csi-volumegroup-snapshotter:v1.2.0
      podmon:
        enabled: false
        image: dellemc/podmon:v1.5.0
      authorization:
        enabled: false
        sidecarProxyImage: dellemc/csm-authorization-sidecar:v1.6.0
        proxyHost: ""

    ## CSI Unity
    ########################
    csi-unity:
      enabled: true
      version: v2.6.0
      images:
        driverRepository: dellemc
      certSecretCount: 1
      fsGroupPolicy: ReadWriteOnceWithFSType
      controller:
        controllerCount: 1
        volumeNamePrefix: csivol
        snapshot:
          enabled: true
          snapNamePrefix: csi-snap
        resizer:
          enabled: true
        nodeSelector:
        healthMonitor:
          enabled: false
      node:
        healthMonitor:
          enabled: false
        nodeSelector:
        tolerations:
        # Uncomment if nodes you wish to use have the node-role.kubernetes.io/master taint
        #  - key: "node-role.kubernetes.io/master"
        #    operator: "Exists"
        #    effect: "NoExecute"
        # Uncomment if nodes you wish to use have the node-role.kubernetes.io/control-plane taint
        #  - key: "node-role.kubernetes.io/control-plane"
        #    operator: "Exists"
        #    effect: "NoExecute"
        #  - key: "node.kubernetes.io/memory-pressure"
        #    operator: "Exists"
        #    effect: "NoExecute"
        #  - key: "node.kubernetes.io/disk-pressure"
        #    operator: "Exists"
        #    effect: "NoExecute"
        #  - key: "node.kubernetes.io/network-unavailable"
        #    operator: "Exists"
        #    effect: "NoExecute"
        # Uncomment if CSM for Resiliency and CSI Driver pods monitor are enabled 
        #  - key: "offline.vxflexos.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "vxflexos.podmon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "offline.unity.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "unity.podmon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "offline.isilon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
        #  - key: "isilon.podmon.storage.dell.com"
        #    operator: "Exists"
        #    effect: "NoSchedule"
      podmon:
        enabled: false
        image: dellemc/podmon:v1.5.0

    ## K8S/Replication Module ATTRIBUTES
    ##########################################
    csm-replication:
      enabled: false
    
    ## K8S/Observability Module ATTRIBUTES
    ##########################################
    karavi-observability:
      enabled: true
      karaviMetricsPowerstore:
        enabled: false
      karaviMetricsPowerMax:
        enabled: false
      karaviMetricsPowerflex:
        enabled: false
      karaviMetricsPowerscale:
        enabled: false
      cert-manager:
        enabled: false
    
    ## K8S/Cert-manager ATTRIBUTES
    ##########################################
    cert-manager:
      enabled: false
  `;
		const received = createYamlString(testYAML, testObject, "unity", CONSTANTS);

		expect(received).toEqual(expected);
	});

});
