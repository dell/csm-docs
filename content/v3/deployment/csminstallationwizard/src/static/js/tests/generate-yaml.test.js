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

const { setValues, createYamlString } = require("../generate-yaml");

const CONSTANTS = {
	POWERSTORE: "csi-powerstore",
	POWERSCALE: "csi-powerscale",
	POWERFLEX: "csi-powerflex",
	POWERMAX: "powermax",
	UNITY: "csi-unity", 
	POWERSTORE_RELEASE_NAME: "powerstore",
	MODULE: "csm-modules",
	CSM_VALUES: "csm-values",
	TEMP_DIR: "templates/",
	TEMP_EXT: ".template",
	HYPHEN: "-",
	VERSIONS_DIR: "csm-versions/",
	CSM: "csm",
	DEFAULT_VALUES: "default-values",
	PROPERTIES: ".properties"
};

describe("GIVEN setValues function", () => {
	test("SHOULD return expected DriverValues", () => {
		document.body.innerHTML = `
            <select id="csm-version">
                <option value="1.4.0">CSM 1.4</option>
            </select>
            <input type="text" id="image-repository" value="dellemc">
            <input type="number" id="controller-count" value="2">
            <input type="text" id="node-selector-label" value="node-role.kubernetes.io/control-plane:">
            <input type="checkbox" id="controller-pods-node-selector" checked>
            <input type="checkbox" id="node-pods-node-selector" checked>
            <input type="text" id="driver-namespace" value="">
            <input type="text" id="module-namespace" value="">
            <input type="text" id="authorization-proxy-host" value="">
        `;

		const testCSMMap = new Map([
			["csmVersion", "1.4.0"],
			["imageRepository", "dellemc"],
			["controllerCount", "2"],
			["nodeSelectorLabel", "node-role.kubernetes.io/control-plane:"],
			["driverVersion", "v2.4.0"],
			["vgsnapshotImage", "csi-volumegroup-snapshotter:v1.1.0"],
			["replicationImage", "dell-csi-replicator:v1.3.0"],
			["authorizationImage", "csm-authorization-sidecar:v1.4.0"]
		]);

		const expected = {
			csmVersion: "1.4.0",
			driverVersion: "v2.4.0",
			imageRepository: "dellemc",
			controllerCount: "2",
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
			vgsnapshotImage: "dellemc/csi-volumegroup-snapshotter:v1.1.0",
			replicationImage: "dellemc/dell-csi-replicator:v1.3.0",
			authorizationImage: "dellemc/csm-authorization-sidecar:v1.4.0",
			applicationMobility: false,
			certManagerEnabled: false,
			singleNamespaceEnabled: false
		};

		const received = setValues(testCSMMap, CONSTANTS);

		expect(received).toEqual(received);
	});
});

describe("GIVEN createYamlString function", () => {
	const testYAML = `
          csi-powerstore:
            enabled: $POWERSTORE_ENABLED
            namespace: $POWERSTORE_DRIVER_NAMESPACE
            version: $VERSION
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
                image: $REPLICATION_IMAGE
              vgsnapshot:
                enabled: $VG_SNAPSHOT_ENABLED
                image: $VG_SNAPSHOT_IMAGE
              snapshot:
                enabled: $SNAPSHOT_ENABLED
              resizer:
                enabled: $RESIZER_ENABLED
            ## Node ATTRIBUTES
            node:
              healthMonitor:
                enabled: $HEALTH_MONITOR_ENABLED
              nodeSelector: $NODE_POD_NODE_SELECTOR
          
          ##########################################
          csi-powermax:
            enabled: $POWERMAX_ENABLED
            namespace: $POWERMAX_DRIVER_NAMESPACE
          
          ## K8S/Replication Module ATTRIBUTES
          ##########################################
          csm-replication:
            enabled: $REPLICATION_ENABLED
            namespace: $CSM_NAMESPACE
          
          ## K8S/Observability Module ATTRIBUTES
          ##########################################
          karavi-observability:
            enabled: $OBSERVABILITY_ENABLED
            namespace: $CSM_NAMESPACE
            karaviMetricsPowerstore:
              enabled: $POWERSTORE_OBSERVABILITY_METRICS_ENABLED
			karaviMetricsPowermax:
              enabled: $POWERMAX_OBSERVABILITY_METRICS_ENABLED
            karaviMetricsPowerflex:
              enabled: $POWERFLEX_OBSERVABILITY_METRICS_ENABLED
            karaviMetricsPowerscale:
              enabled: $POWERSCALE_OBSERVABILITY_METRICS_ENABLED
          
          ## K8S/Application-mobility Module ATTRIBUTES
          ##########################################
          csm-application-mobility:
            enabled: $APP_MOBILITY_ENABLED
            namespace: $CSM_NAMESPACE
            # csm-application-mobility requires velero. If velero is already installed on the cluster, specify the namespace in which velero is deployed. Default value is "velero"
            veleroNamespace:  $CSM_NAMESPACE
            velero:
              credentials:
                secretContents:
                  cloud: |
                    [default]
                    aws_access_key_id=minioadmin
                    aws_secret_access_key=minioadmin
              configuration:
                provider: aws
                backupStorageLocation:
                  name: default
                  bucket: velero-bucket
                  config:
                    region: minio
                    s3ForcePathStyle: true
                    s3Url: http://10.225.105.43:9000
                    publicUrl: http://10.225.105.43:9000
              initContainers:
              - name: dell-custom-velero-plugin
                image: dellemc/csm-application-mobility-velero-plugin:v0.2.0
                volumeMounts:
                - mountPath: /target
                  name: plugins
              - name: velero-plugin-for-aws
                image: velero/velero-plugin-for-aws:v1.5.0
                volumeMounts:
                - mountPath: /target
                  name: plugins
          
          ## K8S/Authorization Module ATTRIBUTES
          ##########################################
          csm-authorization:
            enabled: $AUTHORIZATION_ENABLED
            namespace: $CSM_NAMESPACE
            redis:
              namespace: $CSM_NAMESPACE
              storageClass: powerstore-topology-iscsi
          
          ## K8S/Cert-manager ATTRIBUTES
          ##########################################
          cert-manager:
            enabled: $CERT_MANAGER_ENABLED
            namespace: $CSM_NAMESPACE
        `;

	const testObject = {
		csmVersion: "1.4.0",
		driverVersion: "v2.4.0",
		imageRepository: "dellemc",
		controllerCount: "2",
		controllerPodsNodeSelector: false,
		nodePodsNodeSelector: false,
		nodeSelectorLabel: "",
		snapshot: true,
		vgsnapshot: false,
		resizer: true,
		healthMonitor: false,
		replication: false,
		observability: true,
		observabilityMetrics: true,
		authorization: false,
		authorizationSkipCertValidation: true,
		vgsnapshotImage: "dellemc/csi-volumegroup-snapshotter:v1.1.0",
		replicationImage: "dellemc/dell-csi-replicator:v1.3.0",
		authorizationImage: "dellemc/csm-authorization-sidecar:v1.4.0",
		applicationMobility: false,
		certManagerEnabled: false,
		singleNamespaceEnabled: true
	};

	const testObjectSingleNamespaceDisabled = {
		...testObject,
		singleNamespaceEnabled: false
	}
	
	test("SHOULD return generated yaml file string for driver csi-powerstore", () => {
		const expected = `
          csi-powerstore:
            enabled: true
            namespace: ""
            version: v2.4.0
            images:
              driverRepository: dellemc
            ## Controller ATTRIBUTES
            controller:
              controllerCount: 2
              healthMonitor:
                enabled: false
              nodeSelector: false
              replication:
                enabled: false
                image: dellemc/dell-csi-replicator:v1.3.0
              vgsnapshot:
                enabled: false
                image: dellemc/csi-volumegroup-snapshotter:v1.1.0
              snapshot:
                enabled: true
              resizer:
                enabled: true
            ## Node ATTRIBUTES
            node:
              healthMonitor:
                enabled: false
              nodeSelector: false
          
          ##########################################
          csi-powermax:
            enabled: false
            namespace: ""
          
          ## K8S/Replication Module ATTRIBUTES
          ##########################################
          csm-replication:
            enabled: false
            namespace: ""
          
          ## K8S/Observability Module ATTRIBUTES
          ##########################################
          karavi-observability:
            enabled: true
            namespace: ""
            karaviMetricsPowerstore:
              enabled: true
			karaviMetricsPowermax:
              enabled: false
            karaviMetricsPowerflex:
              enabled: false
            karaviMetricsPowerscale:
              enabled: false
          
          ## K8S/Application-mobility Module ATTRIBUTES
          ##########################################
          csm-application-mobility:
            enabled: false
            namespace: ""
            # csm-application-mobility requires velero. If velero is already installed on the cluster, specify the namespace in which velero is deployed. Default value is "velero"
            veleroNamespace:  ""
            velero:
              credentials:
                secretContents:
                  cloud: |
                    [default]
                    aws_access_key_id=minioadmin
                    aws_secret_access_key=minioadmin
              configuration:
                provider: aws
                backupStorageLocation:
                  name: default
                  bucket: velero-bucket
                  config:
                    region: minio
                    s3ForcePathStyle: true
                    s3Url: http://10.225.105.43:9000
                    publicUrl: http://10.225.105.43:9000
              initContainers:
              - name: dell-custom-velero-plugin
                image: dellemc/csm-application-mobility-velero-plugin:v0.2.0
                volumeMounts:
                - mountPath: /target
                  name: plugins
              - name: velero-plugin-for-aws
                image: velero/velero-plugin-for-aws:v1.5.0
                volumeMounts:
                - mountPath: /target
                  name: plugins
          
          ## K8S/Authorization Module ATTRIBUTES
          ##########################################
          csm-authorization:
            enabled: false
            namespace: ""
            redis:
              namespace: ""
              storageClass: powerstore-topology-iscsi
          
          ## K8S/Cert-manager ATTRIBUTES
          ##########################################
          cert-manager:
            enabled: false
            namespace: ""
        `;

		const received = createYamlString(testYAML, testObject, "csi-powerstore", CONSTANTS);

		expect(received).toEqual(expected);
	});

	test("SHOULD return generated yaml file string for driver csi-powerstore with singleNamespaceEnabled disabled", () => {
		const expected = `
          csi-powerstore:
            enabled: true
            namespace: csi-powerstore
            version: v2.4.0
            images:
              driverRepository: dellemc
            ## Controller ATTRIBUTES
            controller:
              controllerCount: 2
              healthMonitor:
                enabled: false
              nodeSelector: false
              replication:
                enabled: false
                image: dellemc/dell-csi-replicator:v1.3.0
              vgsnapshot:
                enabled: false
                image: dellemc/csi-volumegroup-snapshotter:v1.1.0
              snapshot:
                enabled: true
              resizer:
                enabled: true
            ## Node ATTRIBUTES
            node:
              healthMonitor:
                enabled: false
              nodeSelector: false
          
          ##########################################
          csi-powermax:
            enabled: false
            namespace: ""
          
          ## K8S/Replication Module ATTRIBUTES
          ##########################################
          csm-replication:
            enabled: false
            namespace: 
          
          ## K8S/Observability Module ATTRIBUTES
          ##########################################
          karavi-observability:
            enabled: true
            namespace: 
            karaviMetricsPowerstore:
              enabled: true
			karaviMetricsPowermax:
              enabled: false
            karaviMetricsPowerflex:
              enabled: false
            karaviMetricsPowerscale:
              enabled: false
          
          ## K8S/Application-mobility Module ATTRIBUTES
          ##########################################
          csm-application-mobility:
            enabled: false
            namespace: 
            # csm-application-mobility requires velero. If velero is already installed on the cluster, specify the namespace in which velero is deployed. Default value is "velero"
            veleroNamespace:  
            velero:
              credentials:
                secretContents:
                  cloud: |
                    [default]
                    aws_access_key_id=minioadmin
                    aws_secret_access_key=minioadmin
              configuration:
                provider: aws
                backupStorageLocation:
                  name: default
                  bucket: velero-bucket
                  config:
                    region: minio
                    s3ForcePathStyle: true
                    s3Url: http://10.225.105.43:9000
                    publicUrl: http://10.225.105.43:9000
              initContainers:
              - name: dell-custom-velero-plugin
                image: dellemc/csm-application-mobility-velero-plugin:v0.2.0
                volumeMounts:
                - mountPath: /target
                  name: plugins
              - name: velero-plugin-for-aws
                image: velero/velero-plugin-for-aws:v1.5.0
                volumeMounts:
                - mountPath: /target
                  name: plugins
          
          ## K8S/Authorization Module ATTRIBUTES
          ##########################################
          csm-authorization:
            enabled: false
            namespace: 
            redis:
              namespace: 
              storageClass: powerstore-topology-iscsi
          
          ## K8S/Cert-manager ATTRIBUTES
          ##########################################
          cert-manager:
            enabled: false
            namespace: 
        `;

		const received = createYamlString(testYAML, testObjectSingleNamespaceDisabled, "csi-powerstore", CONSTANTS);

		expect(received).toEqual(expected);
	});

	test("SHOULD return generated yaml file string for driver csi-powerflex", () => {
		const expected = `
          csi-powerstore:
            enabled: false
            namespace: ""
            version: v2.4.0
            images:
              driverRepository: dellemc
            ## Controller ATTRIBUTES
            controller:
              controllerCount: 2
              healthMonitor:
                enabled: false
              nodeSelector: false
              replication:
                enabled: false
                image: dellemc/dell-csi-replicator:v1.3.0
              vgsnapshot:
                enabled: false
                image: dellemc/csi-volumegroup-snapshotter:v1.1.0
              snapshot:
                enabled: true
              resizer:
                enabled: true
            ## Node ATTRIBUTES
            node:
              healthMonitor:
                enabled: false
              nodeSelector: false
          
          ##########################################
          csi-powermax:
            enabled: false
            namespace: ""
          
          ## K8S/Replication Module ATTRIBUTES
          ##########################################
          csm-replication:
            enabled: false
            namespace: ""
          
          ## K8S/Observability Module ATTRIBUTES
          ##########################################
          karavi-observability:
            enabled: true
            namespace: ""
            karaviMetricsPowerstore:
              enabled: false
			karaviMetricsPowermax:
              enabled: false
            karaviMetricsPowerflex:
              enabled: true
            karaviMetricsPowerscale:
              enabled: false
          
          ## K8S/Application-mobility Module ATTRIBUTES
          ##########################################
          csm-application-mobility:
            enabled: false
            namespace: ""
            # csm-application-mobility requires velero. If velero is already installed on the cluster, specify the namespace in which velero is deployed. Default value is "velero"
            veleroNamespace:  ""
            velero:
              credentials:
                secretContents:
                  cloud: |
                    [default]
                    aws_access_key_id=minioadmin
                    aws_secret_access_key=minioadmin
              configuration:
                provider: aws
                backupStorageLocation:
                  name: default
                  bucket: velero-bucket
                  config:
                    region: minio
                    s3ForcePathStyle: true
                    s3Url: http://10.225.105.43:9000
                    publicUrl: http://10.225.105.43:9000
              initContainers:
              - name: dell-custom-velero-plugin
                image: dellemc/csm-application-mobility-velero-plugin:v0.2.0
                volumeMounts:
                - mountPath: /target
                  name: plugins
              - name: velero-plugin-for-aws
                image: velero/velero-plugin-for-aws:v1.5.0
                volumeMounts:
                - mountPath: /target
                  name: plugins
          
          ## K8S/Authorization Module ATTRIBUTES
          ##########################################
          csm-authorization:
            enabled: false
            namespace: ""
            redis:
              namespace: ""
              storageClass: powerstore-topology-iscsi
          
          ## K8S/Cert-manager ATTRIBUTES
          ##########################################
          cert-manager:
            enabled: false
            namespace: ""
        `;

		const received = createYamlString(testYAML, testObject, "csi-powerflex", CONSTANTS);

		expect(received).toEqual(expected);
	});

	test("SHOULD return generated yaml file string for driver csi-powerflex with singleNamespaceEnabled disabled", () => {
		const expected = `
          csi-powerstore:
            enabled: false
            namespace: ""
            version: v2.4.0
            images:
              driverRepository: dellemc
            ## Controller ATTRIBUTES
            controller:
              controllerCount: 2
              healthMonitor:
                enabled: false
              nodeSelector: false
              replication:
                enabled: false
                image: dellemc/dell-csi-replicator:v1.3.0
              vgsnapshot:
                enabled: false
                image: dellemc/csi-volumegroup-snapshotter:v1.1.0
              snapshot:
                enabled: true
              resizer:
                enabled: true
            ## Node ATTRIBUTES
            node:
              healthMonitor:
                enabled: false
              nodeSelector: false
          
          ##########################################
          csi-powermax:
            enabled: false
            namespace: ""
          
          ## K8S/Replication Module ATTRIBUTES
          ##########################################
          csm-replication:
            enabled: false
            namespace: 
          
          ## K8S/Observability Module ATTRIBUTES
          ##########################################
          karavi-observability:
            enabled: true
            namespace: 
            karaviMetricsPowerstore:
              enabled: false
			karaviMetricsPowermax:
              enabled: false
            karaviMetricsPowerflex:
              enabled: true
            karaviMetricsPowerscale:
              enabled: false
          
          ## K8S/Application-mobility Module ATTRIBUTES
          ##########################################
          csm-application-mobility:
            enabled: false
            namespace: 
            # csm-application-mobility requires velero. If velero is already installed on the cluster, specify the namespace in which velero is deployed. Default value is "velero"
            veleroNamespace:  
            velero:
              credentials:
                secretContents:
                  cloud: |
                    [default]
                    aws_access_key_id=minioadmin
                    aws_secret_access_key=minioadmin
              configuration:
                provider: aws
                backupStorageLocation:
                  name: default
                  bucket: velero-bucket
                  config:
                    region: minio
                    s3ForcePathStyle: true
                    s3Url: http://10.225.105.43:9000
                    publicUrl: http://10.225.105.43:9000
              initContainers:
              - name: dell-custom-velero-plugin
                image: dellemc/csm-application-mobility-velero-plugin:v0.2.0
                volumeMounts:
                - mountPath: /target
                  name: plugins
              - name: velero-plugin-for-aws
                image: velero/velero-plugin-for-aws:v1.5.0
                volumeMounts:
                - mountPath: /target
                  name: plugins
          
          ## K8S/Authorization Module ATTRIBUTES
          ##########################################
          csm-authorization:
            enabled: false
            namespace: 
            redis:
              namespace: 
              storageClass: powerstore-topology-iscsi
          
          ## K8S/Cert-manager ATTRIBUTES
          ##########################################
          cert-manager:
            enabled: false
            namespace: 
        `;

		const received = createYamlString(testYAML, testObjectSingleNamespaceDisabled, "csi-powerflex", CONSTANTS);

		expect(received).toEqual(expected);
	});

	test("SHOULD return generated yaml file string for driver csi-powermax", () => {
		const expected = `
          csi-powerstore:
            enabled: false
            namespace: ""
            version: v2.4.0
            images:
              driverRepository: dellemc
            ## Controller ATTRIBUTES
            controller:
              controllerCount: 2
              healthMonitor:
                enabled: false
              nodeSelector: false
              replication:
                enabled: false
                image: dellemc/dell-csi-replicator:v1.3.0
              vgsnapshot:
                enabled: false
                image: dellemc/csi-volumegroup-snapshotter:v1.1.0
              snapshot:
                enabled: true
              resizer:
                enabled: true
            ## Node ATTRIBUTES
            node:
              healthMonitor:
                enabled: false
              nodeSelector: false
          
          ##########################################
          csi-powermax:
            enabled: true
            namespace: ""
          
          ## K8S/Replication Module ATTRIBUTES
          ##########################################
          csm-replication:
            enabled: false
            namespace: ""
          
          ## K8S/Observability Module ATTRIBUTES
          ##########################################
          karavi-observability:
            enabled: true
            namespace: ""
            karaviMetricsPowerstore:
              enabled: false
			karaviMetricsPowermax:
              enabled: true
            karaviMetricsPowerflex:
              enabled: false
            karaviMetricsPowerscale:
              enabled: false
          
          ## K8S/Application-mobility Module ATTRIBUTES
          ##########################################
          csm-application-mobility:
            enabled: false
            namespace: ""
            # csm-application-mobility requires velero. If velero is already installed on the cluster, specify the namespace in which velero is deployed. Default value is "velero"
            veleroNamespace:  ""
            velero:
              credentials:
                secretContents:
                  cloud: |
                    [default]
                    aws_access_key_id=minioadmin
                    aws_secret_access_key=minioadmin
              configuration:
                provider: aws
                backupStorageLocation:
                  name: default
                  bucket: velero-bucket
                  config:
                    region: minio
                    s3ForcePathStyle: true
                    s3Url: http://10.225.105.43:9000
                    publicUrl: http://10.225.105.43:9000
              initContainers:
              - name: dell-custom-velero-plugin
                image: dellemc/csm-application-mobility-velero-plugin:v0.2.0
                volumeMounts:
                - mountPath: /target
                  name: plugins
              - name: velero-plugin-for-aws
                image: velero/velero-plugin-for-aws:v1.5.0
                volumeMounts:
                - mountPath: /target
                  name: plugins
          
          ## K8S/Authorization Module ATTRIBUTES
          ##########################################
          csm-authorization:
            enabled: false
            namespace: ""
            redis:
              namespace: ""
              storageClass: powerstore-topology-iscsi
          
          ## K8S/Cert-manager ATTRIBUTES
          ##########################################
          cert-manager:
            enabled: false
            namespace: ""
        `;

		const received = createYamlString(testYAML, testObject, "powermax", CONSTANTS);

		expect(received).toEqual(expected);
	});
	
	test("SHOULD return generated yaml file string for driver csi-powermax with singleNamespaceEnabled disabled", () => {
		const expected = `
          csi-powerstore:
            enabled: false
            namespace: ""
            version: v2.4.0
            images:
              driverRepository: dellemc
            ## Controller ATTRIBUTES
            controller:
              controllerCount: 2
              healthMonitor:
                enabled: false
              nodeSelector: false
              replication:
                enabled: false
                image: dellemc/dell-csi-replicator:v1.3.0
              vgsnapshot:
                enabled: false
                image: dellemc/csi-volumegroup-snapshotter:v1.1.0
              snapshot:
                enabled: true
              resizer:
                enabled: true
            ## Node ATTRIBUTES
            node:
              healthMonitor:
                enabled: false
              nodeSelector: false
          
          ##########################################
          csi-powermax:
            enabled: true
            namespace: csi-powerstore
          
          ## K8S/Replication Module ATTRIBUTES
          ##########################################
          csm-replication:
            enabled: false
            namespace: 
          
          ## K8S/Observability Module ATTRIBUTES
          ##########################################
          karavi-observability:
            enabled: true
            namespace: 
            karaviMetricsPowerstore:
              enabled: false
			karaviMetricsPowermax:
              enabled: true
            karaviMetricsPowerflex:
              enabled: false
            karaviMetricsPowerscale:
              enabled: false
          
          ## K8S/Application-mobility Module ATTRIBUTES
          ##########################################
          csm-application-mobility:
            enabled: false
            namespace: 
            # csm-application-mobility requires velero. If velero is already installed on the cluster, specify the namespace in which velero is deployed. Default value is "velero"
            veleroNamespace:  
            velero:
              credentials:
                secretContents:
                  cloud: |
                    [default]
                    aws_access_key_id=minioadmin
                    aws_secret_access_key=minioadmin
              configuration:
                provider: aws
                backupStorageLocation:
                  name: default
                  bucket: velero-bucket
                  config:
                    region: minio
                    s3ForcePathStyle: true
                    s3Url: http://10.225.105.43:9000
                    publicUrl: http://10.225.105.43:9000
              initContainers:
              - name: dell-custom-velero-plugin
                image: dellemc/csm-application-mobility-velero-plugin:v0.2.0
                volumeMounts:
                - mountPath: /target
                  name: plugins
              - name: velero-plugin-for-aws
                image: velero/velero-plugin-for-aws:v1.5.0
                volumeMounts:
                - mountPath: /target
                  name: plugins
          
          ## K8S/Authorization Module ATTRIBUTES
          ##########################################
          csm-authorization:
            enabled: false
            namespace: 
            redis:
              namespace: 
              storageClass: powerstore-topology-iscsi
          
          ## K8S/Cert-manager ATTRIBUTES
          ##########################################
          cert-manager:
            enabled: false
            namespace: 
        `;

		const received = createYamlString(testYAML, testObjectSingleNamespaceDisabled, "powermax", CONSTANTS);

		expect(received).toEqual(expected);
	});

	test("SHOULD return generated yaml file string for driver csi-powerscale", () => {
		const expected = `
          csi-powerstore:
            enabled: false
            namespace: ""
            version: v2.4.0
            images:
              driverRepository: dellemc
            ## Controller ATTRIBUTES
            controller:
              controllerCount: 2
              healthMonitor:
                enabled: false
              nodeSelector: false
              replication:
                enabled: false
                image: dellemc/dell-csi-replicator:v1.3.0
              vgsnapshot:
                enabled: false
                image: dellemc/csi-volumegroup-snapshotter:v1.1.0
              snapshot:
                enabled: true
              resizer:
                enabled: true
            ## Node ATTRIBUTES
            node:
              healthMonitor:
                enabled: false
              nodeSelector: false
          
          ##########################################
          csi-powermax:
            enabled: false
            namespace: ""
          
          ## K8S/Replication Module ATTRIBUTES
          ##########################################
          csm-replication:
            enabled: false
            namespace: ""
          
          ## K8S/Observability Module ATTRIBUTES
          ##########################################
          karavi-observability:
            enabled: true
            namespace: ""
            karaviMetricsPowerstore:
              enabled: false
			karaviMetricsPowermax:
              enabled: false
            karaviMetricsPowerflex:
              enabled: false
            karaviMetricsPowerscale:
              enabled: true
          
          ## K8S/Application-mobility Module ATTRIBUTES
          ##########################################
          csm-application-mobility:
            enabled: false
            namespace: ""
            # csm-application-mobility requires velero. If velero is already installed on the cluster, specify the namespace in which velero is deployed. Default value is "velero"
            veleroNamespace:  ""
            velero:
              credentials:
                secretContents:
                  cloud: |
                    [default]
                    aws_access_key_id=minioadmin
                    aws_secret_access_key=minioadmin
              configuration:
                provider: aws
                backupStorageLocation:
                  name: default
                  bucket: velero-bucket
                  config:
                    region: minio
                    s3ForcePathStyle: true
                    s3Url: http://10.225.105.43:9000
                    publicUrl: http://10.225.105.43:9000
              initContainers:
              - name: dell-custom-velero-plugin
                image: dellemc/csm-application-mobility-velero-plugin:v0.2.0
                volumeMounts:
                - mountPath: /target
                  name: plugins
              - name: velero-plugin-for-aws
                image: velero/velero-plugin-for-aws:v1.5.0
                volumeMounts:
                - mountPath: /target
                  name: plugins
          
          ## K8S/Authorization Module ATTRIBUTES
          ##########################################
          csm-authorization:
            enabled: false
            namespace: ""
            redis:
              namespace: ""
              storageClass: powerstore-topology-iscsi
          
          ## K8S/Cert-manager ATTRIBUTES
          ##########################################
          cert-manager:
            enabled: false
            namespace: ""
        `;

		const received = createYamlString(testYAML, testObject, "csi-powerscale", CONSTANTS);

		expect(received).toEqual(expected);
	});

	test("SHOULD return generated yaml file string for driver csi-powerscale with singleNamespaceEnabled disabled", () => {
		const expected = `
          csi-powerstore:
            enabled: false
            namespace: ""
            version: v2.4.0
            images:
              driverRepository: dellemc
            ## Controller ATTRIBUTES
            controller:
              controllerCount: 2
              healthMonitor:
                enabled: false
              nodeSelector: false
              replication:
                enabled: false
                image: dellemc/dell-csi-replicator:v1.3.0
              vgsnapshot:
                enabled: false
                image: dellemc/csi-volumegroup-snapshotter:v1.1.0
              snapshot:
                enabled: true
              resizer:
                enabled: true
            ## Node ATTRIBUTES
            node:
              healthMonitor:
                enabled: false
              nodeSelector: false
          
          ##########################################
          csi-powermax:
            enabled: false
            namespace: ""
          
          ## K8S/Replication Module ATTRIBUTES
          ##########################################
          csm-replication:
            enabled: false
            namespace: 
          
          ## K8S/Observability Module ATTRIBUTES
          ##########################################
          karavi-observability:
            enabled: true
            namespace: 
            karaviMetricsPowerstore:
              enabled: false
			karaviMetricsPowermax:
              enabled: false
            karaviMetricsPowerflex:
              enabled: false
            karaviMetricsPowerscale:
              enabled: true
          
          ## K8S/Application-mobility Module ATTRIBUTES
          ##########################################
          csm-application-mobility:
            enabled: false
            namespace: 
            # csm-application-mobility requires velero. If velero is already installed on the cluster, specify the namespace in which velero is deployed. Default value is "velero"
            veleroNamespace:  
            velero:
              credentials:
                secretContents:
                  cloud: |
                    [default]
                    aws_access_key_id=minioadmin
                    aws_secret_access_key=minioadmin
              configuration:
                provider: aws
                backupStorageLocation:
                  name: default
                  bucket: velero-bucket
                  config:
                    region: minio
                    s3ForcePathStyle: true
                    s3Url: http://10.225.105.43:9000
                    publicUrl: http://10.225.105.43:9000
              initContainers:
              - name: dell-custom-velero-plugin
                image: dellemc/csm-application-mobility-velero-plugin:v0.2.0
                volumeMounts:
                - mountPath: /target
                  name: plugins
              - name: velero-plugin-for-aws
                image: velero/velero-plugin-for-aws:v1.5.0
                volumeMounts:
                - mountPath: /target
                  name: plugins
          
          ## K8S/Authorization Module ATTRIBUTES
          ##########################################
          csm-authorization:
            enabled: false
            namespace: 
            redis:
              namespace: 
              storageClass: powerstore-topology-iscsi
          
          ## K8S/Cert-manager ATTRIBUTES
          ##########################################
          cert-manager:
            enabled: false
            namespace: 
        `;

		const received = createYamlString(testYAML, testObjectSingleNamespaceDisabled, "csi-powerscale", CONSTANTS);

		expect(received).toEqual(expected);
	});

	test("SHOULD return generated yaml file string for driver csi-unity", () => {
		const expected = `
          csi-powerstore:
            enabled: false
            namespace: ""
            version: v2.4.0
            images:
              driverRepository: dellemc
            ## Controller ATTRIBUTES
            controller:
              controllerCount: 2
              healthMonitor:
                enabled: false
              nodeSelector: false
              replication:
                enabled: false
                image: dellemc/dell-csi-replicator:v1.3.0
              vgsnapshot:
                enabled: false
                image: dellemc/csi-volumegroup-snapshotter:v1.1.0
              snapshot:
                enabled: true
              resizer:
                enabled: true
            ## Node ATTRIBUTES
            node:
              healthMonitor:
                enabled: false
              nodeSelector: false
          
          ##########################################
          csi-powermax:
            enabled: false
            namespace: ""
          
          ## K8S/Replication Module ATTRIBUTES
          ##########################################
          csm-replication:
            enabled: false
            namespace: ""
          
          ## K8S/Observability Module ATTRIBUTES
          ##########################################
          karavi-observability:
            enabled: true
            namespace: ""
            karaviMetricsPowerstore:
              enabled: false
			karaviMetricsPowermax:
              enabled: false
            karaviMetricsPowerflex:
              enabled: false
            karaviMetricsPowerscale:
              enabled: false
          
          ## K8S/Application-mobility Module ATTRIBUTES
          ##########################################
          csm-application-mobility:
            enabled: false
            namespace: ""
            # csm-application-mobility requires velero. If velero is already installed on the cluster, specify the namespace in which velero is deployed. Default value is "velero"
            veleroNamespace:  ""
            velero:
              credentials:
                secretContents:
                  cloud: |
                    [default]
                    aws_access_key_id=minioadmin
                    aws_secret_access_key=minioadmin
              configuration:
                provider: aws
                backupStorageLocation:
                  name: default
                  bucket: velero-bucket
                  config:
                    region: minio
                    s3ForcePathStyle: true
                    s3Url: http://10.225.105.43:9000
                    publicUrl: http://10.225.105.43:9000
              initContainers:
              - name: dell-custom-velero-plugin
                image: dellemc/csm-application-mobility-velero-plugin:v0.2.0
                volumeMounts:
                - mountPath: /target
                  name: plugins
              - name: velero-plugin-for-aws
                image: velero/velero-plugin-for-aws:v1.5.0
                volumeMounts:
                - mountPath: /target
                  name: plugins
          
          ## K8S/Authorization Module ATTRIBUTES
          ##########################################
          csm-authorization:
            enabled: false
            namespace: ""
            redis:
              namespace: ""
              storageClass: powerstore-topology-iscsi
          
          ## K8S/Cert-manager ATTRIBUTES
          ##########################################
          cert-manager:
            enabled: false
            namespace: ""
        `;

		const received = createYamlString(testYAML, testObject, "csi-unity", CONSTANTS);

		expect(received).toEqual(expected);
	});

	test("SHOULD return generated yaml file string for driver csi-unity with singleNamespaceEnabled disabled", () => {
		const expected = `
          csi-powerstore:
            enabled: false
            namespace: ""
            version: v2.4.0
            images:
              driverRepository: dellemc
            ## Controller ATTRIBUTES
            controller:
              controllerCount: 2
              healthMonitor:
                enabled: false
              nodeSelector: false
              replication:
                enabled: false
                image: dellemc/dell-csi-replicator:v1.3.0
              vgsnapshot:
                enabled: false
                image: dellemc/csi-volumegroup-snapshotter:v1.1.0
              snapshot:
                enabled: true
              resizer:
                enabled: true
            ## Node ATTRIBUTES
            node:
              healthMonitor:
                enabled: false
              nodeSelector: false
          
          ##########################################
          csi-powermax:
            enabled: false
            namespace: ""
          
          ## K8S/Replication Module ATTRIBUTES
          ##########################################
          csm-replication:
            enabled: false
            namespace: 
          
          ## K8S/Observability Module ATTRIBUTES
          ##########################################
          karavi-observability:
            enabled: true
            namespace: 
            karaviMetricsPowerstore:
              enabled: false
			karaviMetricsPowermax:
              enabled: false
            karaviMetricsPowerflex:
              enabled: false
            karaviMetricsPowerscale:
              enabled: false
          
          ## K8S/Application-mobility Module ATTRIBUTES
          ##########################################
          csm-application-mobility:
            enabled: false
            namespace: 
            # csm-application-mobility requires velero. If velero is already installed on the cluster, specify the namespace in which velero is deployed. Default value is "velero"
            veleroNamespace:  
            velero:
              credentials:
                secretContents:
                  cloud: |
                    [default]
                    aws_access_key_id=minioadmin
                    aws_secret_access_key=minioadmin
              configuration:
                provider: aws
                backupStorageLocation:
                  name: default
                  bucket: velero-bucket
                  config:
                    region: minio
                    s3ForcePathStyle: true
                    s3Url: http://10.225.105.43:9000
                    publicUrl: http://10.225.105.43:9000
              initContainers:
              - name: dell-custom-velero-plugin
                image: dellemc/csm-application-mobility-velero-plugin:v0.2.0
                volumeMounts:
                - mountPath: /target
                  name: plugins
              - name: velero-plugin-for-aws
                image: velero/velero-plugin-for-aws:v1.5.0
                volumeMounts:
                - mountPath: /target
                  name: plugins
          
          ## K8S/Authorization Module ATTRIBUTES
          ##########################################
          csm-authorization:
            enabled: false
            namespace: 
            redis:
              namespace: 
              storageClass: powerstore-topology-iscsi
          
          ## K8S/Cert-manager ATTRIBUTES
          ##########################################
          cert-manager:
            enabled: false
            namespace: 
        `;

		const received = createYamlString(testYAML, testObjectSingleNamespaceDisabled, "csi-unity", CONSTANTS);

		expect(received).toEqual(expected);
	});
});
