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
var template = "";
var version = "";
var observabilityEnabled = false;
var observabilityOperatorEnabled = false;
var authorizationEnabled = false;
var replicationEnabled = false;


function generateYamlFile(tmpl) {
	var yamlFile = null;
	setMap(version);
	values = setValues(csmMap, CONSTANTS)
	yaml = createYamlString(tmpl, values, driver, CONSTANTS)
	var data = new Blob([yaml], {
		type: 'text/plain'
	});
	if (yamlFile !== null) {
		window.URL.revokeObjectURL(yamlFile);
	}
	yamlFile = window.URL.createObjectURL(data);
	return yamlFile;
}

function setValues(csmMapValues, CONSTANTS_PARAM) {
	var DriverValues = new Object();
	DriverValues.csmVersion = document.getElementById("csm-version").value
	DriverValues.driverVersion = csmMapValues.get("driverVersion");
	DriverValues.imageRepository = document.getElementById("image-repository").value;
	DriverValues.monitor = $("#monitor").prop('checked') ? true : false;
	DriverValues.certSecretCount = document.getElementById("cert-secret-count").value;
	DriverValues.maxVolumesPerNode = document.getElementById("max-volumes-per-node").value;
	DriverValues.controllerCount = document.getElementById("controller-count").value;
	DriverValues.volNamePrefix = document.getElementById("vol-name-prefix").value;
	DriverValues.snapNamePrefix = document.getElementById("snapshot-prefix").value;
	DriverValues.targetClusterId = document.getElementById("replication-operator-clusterid").value;
	DriverValues.targetArrayID = document.getElementById("replication-helm-arrayid").value;
	DriverValues.targetUnisphere = document.getElementById("replication-helm-unisphere").value || '""';
	DriverValues.fsGroupPolicy = document.getElementById("fsGroup-Policy").value;
	DriverValues.driverNamespace = document.getElementById("driver-namespace").value;
	DriverValues.labelValue = document.getElementById("label-value").value;
	DriverValues.pollRate = document.getElementById("poll-rate").value;
	DriverValues.arrayThreshold = document.getElementById("array-threshold").value;
	DriverValues.driverPodLabel = document.getElementById("driver-pod-label").value;
	DriverValues.connectionValidation = $("#connection-validation").prop('checked') ? true : false;
	DriverValues.leaderElection = $("#leader-election").prop('checked') ? true : false;
	DriverValues.volumelessPods = $("#volumeless-pods").prop('checked') ? true : false;
	DriverValues.controllerPodsNodeSelector = $("#controller-pods-node-selector").prop('checked') ? true : "";
	DriverValues.nodePodsNodeSelector = $("#node-pods-node-selector").prop('checked') ? true : "";
	DriverValues.nodeSelectorLabel = document.getElementById("node-selector-label").value || '""';
	var taint = document.getElementById("taint").value || '""';
	var labels = DriverValues.nodeSelectorLabel.split(":");
	var nodeSelector
	var taints
	if (document.getElementById("installation-type").value === CONSTANTS_PARAM.OPERATOR) {
		nodeSelector = '\n'.padEnd(8, " ") + labels[0] + ': "' + labels[1] + '"';
		taints = CONSTANTS_PARAM.OPERATOR_TAINTS.replace("$KEY", taint).trimEnd();
	} else {
		nodeSelector = '\n'.padEnd(7, " ") + labels[0] + ': "' + labels[1] + '"';
		taints = CONSTANTS_PARAM.HELM_TAINTS.replace("$KEY", taint).trimEnd();
	}
	DriverValues.controllerTolerations = "";
	DriverValues.nodeTolerations= "";
	if ($("#controller-pods-node-selector").prop('checked') === true) {
		DriverValues.controllerPodsNodeSelector = nodeSelector;
		DriverValues.controllerTolerations = taints;
	}
	if ($("#node-pods-node-selector").prop('checked') === true) {
		DriverValues.nodePodsNodeSelector = nodeSelector;
		DriverValues.nodeTolerations = taints;
	}
	DriverValues.snapshot = $("#snapshot").prop('checked') ? true : false;
	DriverValues.vgsnapshot = $("#vgsnapshot").prop('checked') ? true : false;
	DriverValues.resizer = $("#resizer").prop('checked') ? true : false;
	DriverValues.iscsichap = $("#iscsichap").prop('checked') ? true : false;
	DriverValues.healthMonitor = $("#health-monitor").prop('checked') ? true : false;
	DriverValues.replication = $("#replication").prop('checked') ? true : false;
	DriverValues.migration = $("#migration").prop('checked') ? true : false;
	DriverValues.observability = $("#observability").prop('checked') ? true : false;
	DriverValues.observabilityMetrics = $("#observability-metrics").prop('checked') ? true : false;
	DriverValues.observabilityOperator = $("#observability-operator").prop('checked') ? true : false;
	DriverValues.observabilityOperatorMetrics = $("#observability-operator-metrics").prop('checked') ? true : false;
	DriverValues.observabilityOperatorTopology = $("#observability-operator-topology").prop('checked') ? true : false;
	DriverValues.observabilityOperatorOtel = $("#observability-operator-otel").prop('checked') ? true : false;
	DriverValues.authorization = $("#authorization").prop('checked') ? true : false;
	DriverValues.resiliency = $("#resiliency").prop('checked') ? true : false;
	DriverValues.operatorResiliency = $("#operator-resiliency").prop('checked') ? true : false;
	DriverValues.storageCapacity = $("#storage-capacity").prop('checked') ? true : false;
	DriverValues.authorizationSkipCertValidation = $("#authorization-skip-cert-validation").prop('checked') ? true : false;
	DriverValues.authorizationProxyHost = document.getElementById("authorization-proxy-host").value;
	DriverValues.certManagerEnabled = $("#certmanager").prop('checked') ? true : false;
	DriverValues.topologyEnabled = $("#topology").prop('checked') ? true : false;
	observabilityEnabled = DriverValues.observability;
	observabilityOperatorEnabled = DriverValues.observabilityOperator;
	authorizationEnabled = DriverValues.authorization;
	replicationEnabled = DriverValues.replication;

	DriverValues.storageArrayId = $("#storage-array-id").val() || "0000000000";
	DriverValues.storageArrayEndpointUrl = $("#storage-array-endpoint-url").val() || 'https://primary-1.unisphe.re:8443';
	DriverValues.storageArrayBackupEndpointUrl = $("#storage-array-backup-endpoint-url").val() || '""';
	DriverValues.manageArrayId = $("#manage-array-id").val() || '""';
	DriverValues.manageArrayEndpointUrl = $("#manage-array-endpoint-url").val() || '""';
	DriverValues.clusterPrefix = $("#cluster-prefix").val();
	DriverValues.portGroups = $("#port-groups").val();
	DriverValues.transportProtocol = $("#transport-protocol").val();

	DriverValues.vSphereEnabled = $("#vSphere").prop('checked') ? true : false;
	DriverValues.vSphereFCPortGroup = $("#vSphere-fc-port-group").val();
	DriverValues.vSphereFCHostName = $("#vSphere-fc-host-name").val();
	DriverValues.vSphereVCenterHost = $("#vSphere-vCenter-host").val();
	DriverValues.vSphereVCenterCredSecret = $("#vSphere-vCenter-cred-secret").val();
	DriverValues.renameSDC = $("#rename-sdc").prop('checked') ? true : false;
	DriverValues.sdcPrefix = $("#sdc-prefix").val();
	DriverValues.approveSDC = $("#approve-sdc").prop('checked') ? true : false;
	DriverValues.enableQuota = $("#enable-quota").prop('checked') ? true : false;
	return DriverValues
}

function createYamlString(yamlTpl, yamlTplValues, driverParam, CONSTANTS_PARAM) {
	yamlTpl = yamlTpl.replaceAll("$IMAGE_REPOSITORY", yamlTplValues.imageRepository);
	yamlTpl = yamlTpl.replaceAll("$MAX_VOLUMES_PER_NODE", yamlTplValues.maxVolumesPerNode);
	yamlTpl = yamlTpl.replaceAll("$CONTROLLER_COUNT", yamlTplValues.controllerCount);
	yamlTpl = yamlTpl.replaceAll("$VOLUME_NAME_PREFIX", yamlTplValues.volNamePrefix);
	yamlTpl = yamlTpl.replaceAll("$SNAP_NAME_PREFIX", yamlTplValues.snapNamePrefix);
	yamlTpl = yamlTpl.replaceAll("$TARGET_CLUSTER_ID", yamlTplValues.targetClusterId);
	yamlTpl = yamlTpl.replaceAll("$FSGROUP_POLICY", yamlTplValues.fsGroupPolicy);
	yamlTpl = yamlTpl.replaceAll("$NAMESPACE", yamlTplValues.driverNamespace);
	yamlTpl = yamlTpl.replaceAll("$CONTROLLER_POD_NODE_SELECTOR", yamlTplValues.controllerPodsNodeSelector);
	yamlTpl = yamlTpl.replaceAll("$NODE_POD_NODE_SELECTOR", yamlTplValues.nodePodsNodeSelector);
	yamlTpl = yamlTpl.replaceAll("$HEALTH_MONITOR_ENABLED", yamlTplValues.healthMonitor);
	yamlTpl = yamlTpl.replaceAll("$VG_SNAPSHOT_ENABLED", yamlTplValues.vgsnapshot);
	yamlTpl = yamlTpl.replaceAll("$SNAPSHOT_ENABLED", yamlTplValues.snapshot);
	yamlTpl = yamlTpl.replaceAll("$RESIZER_ENABLED", yamlTplValues.resizer);
	yamlTpl = yamlTpl.replaceAll("$ISCSI_CHAP_ENABLED", yamlTplValues.iscsichap);
	yamlTpl = yamlTpl.replaceAll("$TOPOLOGY_ENABLED", yamlTplValues.topologyEnabled);
	yamlTpl = yamlTpl.replaceAll("$REPLICATION_ENABLED", yamlTplValues.replication);
	yamlTpl = yamlTpl.replaceAll("$MIGRATION_ENABLED", yamlTplValues.migration);
	yamlTpl = yamlTpl.replaceAll("$AUTHORIZATION_ENABLED", yamlTplValues.authorization);
	yamlTpl = yamlTpl.replaceAll("$AUTHORIZATION_PROXY_HOST", yamlTplValues.authorizationProxyHost);
	yamlTpl = yamlTpl.replaceAll("$AUTHORIZATION_SKIP_CERTIFICATE_VALIDATION", yamlTplValues.authorizationSkipCertValidation);
	yamlTpl = yamlTpl.replaceAll("$OBSERVABILITY_ENABLED", yamlTplValues.observability);
	yamlTpl = yamlTpl.replaceAll("$OBSERVABILITY_OPERATOR_ENABLED", yamlTplValues.observabilityOperator);
	yamlTpl = yamlTpl.replaceAll("$RESILIENCY_ENABLED", yamlTplValues.resiliency);
	yamlTpl = yamlTpl.replaceAll("$OPERATOR_RESILIENCY_ENABLED", yamlTplValues.operatorResiliency);
	yamlTpl = yamlTpl.replaceAll("$LABEL_VALUE", yamlTplValues.labelValue);
	yamlTpl = yamlTpl.replaceAll("$POLL_RATE", yamlTplValues.pollRate);
	yamlTpl = yamlTpl.replaceAll("$ARRAY_THRESHOLD", yamlTplValues.arrayThreshold);
	yamlTpl = yamlTpl.replaceAll("$DRIVER_POD_LABEL_VALUE", yamlTplValues.driverPodLabel);
	yamlTpl = yamlTpl.replaceAll("$SKIP_ARRAY_CONNECTION_VALIDATION", yamlTplValues.connectionValidation);
	yamlTpl = yamlTpl.replaceAll("$LEADER_ELECTION", yamlTplValues.leaderElection);
	yamlTpl = yamlTpl.replaceAll("$IGNORE_VOLUMELESS_PODS", yamlTplValues.volumelessPods);
	yamlTpl = yamlTpl.replaceAll("$STORAGE_CAPACITY_ENABLED", yamlTplValues.storageCapacity);
	yamlTpl = yamlTpl.replaceAll("$MONITOR_ENABLED", yamlTplValues.monitor);
	yamlTpl = yamlTpl.replaceAll("$CERT_SECRET_COUNT", yamlTplValues.certSecretCount);
	yamlTpl = yamlTpl.replaceAll("$POWERMAX_STORAGE_ARRAY_ID", yamlTplValues.storageArrayId);
	yamlTpl = yamlTpl.replaceAll("$POWERMAX_STORAGE_ARRAY_ENDPOINT_URL", yamlTplValues.storageArrayEndpointUrl);
	yamlTpl = yamlTpl.replaceAll("$POWERMAX_STORAGE_ARRAY_BACKUP_ENDPOINT_URL", yamlTplValues.storageArrayBackupEndpointUrl);
	yamlTpl = yamlTpl.replaceAll("$POWERMAX_MANAGEMENT_SERVERS_ENDPOINT_URL", yamlTplValues.storageArrayEndpointUrl);
	yamlTpl = yamlTpl.replaceAll("$POWERMAX_MANAGE_ARRAY_ID", yamlTplValues.manageArrayId);
	yamlTpl = yamlTpl.replaceAll("$POWERMAX_MANAGE_ARRAY_ENDPOINT_URL", yamlTplValues.manageArrayEndpointUrl);
	yamlTpl = yamlTpl.replaceAll("$POWERMAX_CLUSTER_PREFIX", yamlTplValues.clusterPrefix);
	yamlTpl = yamlTpl.replaceAll("$POWERMAX_PORT_GROUPS", yamlTplValues.portGroups);
	yamlTpl = yamlTpl.replaceAll("$NODE_TRANSPORT_PROTOCOL", yamlTplValues.transportProtocol);
	yamlTpl = yamlTpl.replaceAll("$VSPHERE_ENABLED", yamlTplValues.vSphereEnabled);
	yamlTpl = yamlTpl.replaceAll("$VSPHERE_FC_PORT_GROUP", yamlTplValues.vSphereFCPortGroup);
	yamlTpl = yamlTpl.replaceAll("$VSPHERE_FC_HOST_NAME", yamlTplValues.vSphereFCHostName);
	yamlTpl = yamlTpl.replaceAll("$VSPHERE_VCENTER_HOST", yamlTplValues.vSphereVCenterHost);
	yamlTpl = yamlTpl.replaceAll("$VSPHERE_VCENTER_CRED_SECRET", yamlTplValues.vSphereVCenterCredSecret);
	yamlTpl = yamlTpl.replaceAll("$CONTROLLER_TOLERATIONS", yamlTplValues.controllerTolerations);
	yamlTpl = yamlTpl.replaceAll("$NODE_TOLERATIONS", yamlTplValues.nodeTolerations);
	yamlTpl = yamlTpl.replaceAll("$TARGET_ARRAY_ID", yamlTplValues.targetArrayID);
	yamlTpl = yamlTpl.replaceAll("$TARGET_UNISPHERE", yamlTplValues.targetUnisphere);
	yamlTpl = yamlTpl.replaceAll("$RENAME_SDC_ENABLED", yamlTplValues.renameSDC);
	yamlTpl = yamlTpl.replaceAll("$SDC_PREFIX", yamlTplValues.sdcPrefix);
	yamlTpl = yamlTpl.replaceAll("$APPROVE_SDC_ENABLED", yamlTplValues.approveSDC);
	yamlTpl = yamlTpl.replaceAll("$QUOTA_ENABLED", yamlTplValues.enableQuota);


	if (driverParam === CONSTANTS_PARAM.POWERSTORE) {
		yamlTpl = yamlTpl.replaceAll("$POWERSTORE_ENABLED", true);
		releaseName = CONSTANTS_PARAM.POWERSTORE;
	} else if (driverParam === CONSTANTS_PARAM.POWERFLEX) {
		yamlTpl = yamlTpl.replaceAll("$POWERFLEX_ENABLED", true);
		releaseName = CONSTANTS_PARAM.POWERFLEX;
	} else if (driverParam === CONSTANTS_PARAM.POWERMAX) {
		yamlTpl = yamlTpl.replaceAll("$POWERMAX_ENABLED", true);
		releaseName = CONSTANTS_PARAM.POWERMAX;
	} else if (driverParam === CONSTANTS_PARAM.POWERSCALE) {
		yamlTpl = yamlTpl.replaceAll("$POWERSCALE_ENABLED", true);
		releaseName = CONSTANTS_PARAM.POWERSCALE;
	} else {
		yamlTpl = yamlTpl.replaceAll("$UNITY_ENABLED", true);
		releaseName = CONSTANTS_PARAM.UNITY;
	}
	yamlTpl = yamlTpl.replaceAll("$POWERSTORE_ENABLED", false);
	yamlTpl = yamlTpl.replaceAll("$POWERFLEX_ENABLED", false);
	yamlTpl = yamlTpl.replaceAll("$POWERMAX_ENABLED", false);
	yamlTpl = yamlTpl.replaceAll("$POWERSCALE_ENABLED", false);
	yamlTpl = yamlTpl.replaceAll("$UNITY_ENABLED", false);

	if (yamlTplValues.observabilityMetrics) {
		if (driverParam === CONSTANTS_PARAM.POWERSTORE) {
			yamlTpl = yamlTpl.replaceAll("$POWERSTORE_OBSERVABILITY_METRICS_ENABLED", true);
		} else if (driverParam === CONSTANTS_PARAM.POWERMAX) {
			yamlTpl = yamlTpl.replaceAll("$POWERMAX_OBSERVABILITY_METRICS_ENABLED", true);
		} else if (driverParam === CONSTANTS_PARAM.POWERFLEX) {
			yamlTpl = yamlTpl.replaceAll("$POWERFLEX_OBSERVABILITY_METRICS_ENABLED", true);
		} else if (driverParam === CONSTANTS_PARAM.POWERSCALE) {
			yamlTpl = yamlTpl.replaceAll("$POWERSCALE_OBSERVABILITY_METRICS_ENABLED", true);
		}
	}
	yamlTpl = yamlTpl.replaceAll("$OBSERVABILITY_OPERATOR_TOPOLOGY", yamlTplValues.observabilityOperatorTopology);
	yamlTpl = yamlTpl.replaceAll("$OBSERVABILITY_OPERATOR_METRICS", yamlTplValues.observabilityOperatorMetrics);
	yamlTpl = yamlTpl.replaceAll("$OBSERVABILITY_OPERATOR_OTEL", yamlTplValues.observabilityOperatorOtel);


	yamlTpl = yamlTpl.replaceAll("$POWERSTORE_OBSERVABILITY_METRICS_ENABLED", false);
	yamlTpl = yamlTpl.replaceAll("$POWERMAX_OBSERVABILITY_METRICS_ENABLED", false);
	yamlTpl = yamlTpl.replaceAll("$POWERFLEX_OBSERVABILITY_METRICS_ENABLED", false);
	yamlTpl = yamlTpl.replaceAll("$POWERSCALE_OBSERVABILITY_METRICS_ENABLED", false);

	yamlTpl = yamlTpl.replaceAll("$CERT_MANAGER_ENABLED", yamlTplValues.certManagerEnabled);
	yamlTpl = yamlTpl.replaceAll("$OBSERVABILITY_CERT_MANAGER_ENABLED", !yamlTplValues.certManagerEnabled);
	// for powermax - replication
	yamlTpl = yamlTpl.replaceAll('      - storageArrayId: ""', '#      - storageArrayId: ""');
	yamlTpl = yamlTpl.replaceAll('        endpoint: ""', '#       endpoint: ""');	
	yamlTpl = yamlTpl.replaceAll('      - endpoint: ""', '#      - endpoint: ""');
	const regex = /\$[a-zA-Z0-9_-]*/g;
	yamlTpl = yamlTpl.replaceAll(regex, '""');

	return yamlTpl
}

function loadTemplate(array, templateType, csmVersion) {
	var tmplFile;
	switch (templateType) {
		case CONSTANTS.HELM:
			tmplFile = CONSTANTS.TEMP_DIR + CONSTANTS.SLASH + CONSTANTS.HELM + CONSTANTS.SLASH + CONSTANTS.CSM + CONSTANTS.HYPHEN + csmVersion + CONSTANTS.HYPHEN + CONSTANTS.VALUES + CONSTANTS.TEMP_EXT;
			break;
		case CONSTANTS.OPERATOR:
			tmplFile = CONSTANTS.TEMP_DIR + CONSTANTS.SLASH + CONSTANTS.OPERATOR + CONSTANTS.SLASH + CONSTANTS.CSM + CONSTANTS.HYPHEN + array + CONSTANTS.HYPHEN + csmVersion + CONSTANTS.TEMP_EXT;
			break;
	}

	$.get(tmplFile, function(data) {
		template = String(data)
	}, "text");
}

if (typeof exports !== 'undefined') {
	module.exports = {
		setValues,
		createYamlString
	};
}
