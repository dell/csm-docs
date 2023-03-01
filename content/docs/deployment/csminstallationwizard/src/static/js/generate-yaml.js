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

var driverTemplate = "";
var moduleTemplate = "";
var version = "";
var powerstoreEnabled = false;
var powermaxEnabled = false;
var powerscaleEnabled = false;
var powerflexEnabled = false;
var unityEnabled = false;
var observabilityEnabled = false;
var applicationMobilityEnabled = false;
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
	DriverValues.controllerCount = document.getElementById("controller-count").value;
	DriverValues.controllerPodsNodeSelector = $("#controller-pods-node-selector").prop('checked') ? true : false;
	DriverValues.nodePodsNodeSelector = $("#node-pods-node-selector").prop('checked') ? true : false;
	DriverValues.nodeSelectorLabel = document.getElementById("node-selector-label").value || '""';
	var labels = DriverValues.nodeSelectorLabel.split(":");
	var nodeSelector = CONSTANTS_PARAM.NODE_SELECTOR_TAB + labels[0] + ': "' + labels[1] + '"';
	if ($("#controller-pods-node-selector").prop('checked') === true) {
		DriverValues.controllerPodsNodeSelector = nodeSelector;
	}
	if ($("#node-pods-node-selector").prop('checked') === true) {
		DriverValues.nodePodsNodeSelector = nodeSelector;
	}
	DriverValues.snapshot = $("#snapshot").prop('checked') ? true : false;
	DriverValues.vgsnapshot = $("#vgsnapshot").prop('checked') ? true : false;
	DriverValues.resizer = $("#resizer").prop('checked') ? true : false;
	DriverValues.healthMonitor = $("#health-monitor").prop('checked') ? true : false;
	DriverValues.replication = $("#replication").prop('checked') ? true : false;
	DriverValues.migration = $("#migration").prop('checked') ? true : false;
	DriverValues.observability = $("#observability").prop('checked') ? true : false;
	DriverValues.observabilityMetrics = $("#observability-metrics").prop('checked') ? true : false;
	DriverValues.authorization = $("#authorization").prop('checked') ? true : false;
	DriverValues.resiliency = $("#resiliency").prop('checked') ? true : false;
	DriverValues.storageCapacity = $("#storage-capacity").prop('checked') ? true : false;
	DriverValues.authorizationSkipCertValidation = $("#authorization-skip-cert-validation").prop('checked') ? true : false;
	DriverValues.authorizationProxyHost = document.getElementById("authorization-proxy-host").value;
	DriverValues.vgsnapshotImage = DriverValues.imageRepository + CONSTANTS_PARAM.SLASH + csmMapValues.get("vgsnapshotImage");
	DriverValues.replicationImage = DriverValues.imageRepository + CONSTANTS_PARAM.SLASH + csmMapValues.get("replicationImage");
	DriverValues.migrationImage = DriverValues.imageRepository + CONSTANTS_PARAM.SLASH + csmMapValues.get("migrationImage");
	DriverValues.migrationNodeRescanSidecarImage = DriverValues.imageRepository + CONSTANTS_PARAM.SLASH + csmMapValues.get("migrationNodeRescanSidecarImage");
	DriverValues.authorizationImage = DriverValues.imageRepository + CONSTANTS_PARAM.SLASH + csmMapValues.get("authorizationImage");
	DriverValues.powermaxCSIReverseProxyImage = DriverValues.imageRepository + CONSTANTS_PARAM.SLASH + csmMapValues.get("powermaxCSIReverseProxyImage");
	DriverValues.podmonImage = DriverValues.imageRepository + CONSTANTS_PARAM.SLASH + csmMapValues.get("podmonImage");
	DriverValues.appMobilityVeleroPluginImage = DriverValues.imageRepository + CONSTANTS_PARAM.SLASH + csmMapValues.get("appMobilityVeleroPluginImage");
	
	if (DriverValues.csmVersion === "1.4.0" || DriverValues.csmVersion === "1.5.0") {
		DriverValues.powermaxCSIReverseProxyImageEnabled = $("#powermax-csi-reverse-proxy").prop('checked') ? true : false;
	} else {
		DriverValues.powermaxCSIReverseProxyImageEnabled = true;
	}

	DriverValues.applicationMobility = $("#application-mobility").prop('checked') ? true : false;
	DriverValues.velero = $("#velero").prop('checked') ? true : false;
	DriverValues.certManagerEnabled = $("#cert-manager-enabled").prop('checked') ? true : false;
	DriverValues.singleNamespaceEnabled = $("#single-namespace").prop('checked') ? true : false;
	driverNamespace = document.getElementById("driver-namespace").value;
	moduleNamespace = document.getElementById("module-namespace").value;
	observabilityEnabled = DriverValues.observability;
	applicationMobilityEnabled = DriverValues.applicationMobility;
	authorizationEnabled = DriverValues.authorization;
	replicationEnabled = DriverValues.replication;

	DriverValues.storageArrayId = $("#storage-array-id").val();
	DriverValues.storageArrayEndpointUrl = $("#storage-array-endpoint-url").val() || '""';
	DriverValues.storageArrayBackupEndpointUrl = $("#storage-array-backup-endpoint-url").val() || '""';
	DriverValues.clusterPrefix = $("#cluster-prefix").val();
	DriverValues.portGroups = $("#port-groups").val();

	DriverValues.vSphereEnabled = $("#vSphere").prop('checked') ? true : false;
	DriverValues.vSphereFCPortGroup = $("#vSphere-fc-port-group").val();
	DriverValues.vSphereFCHostName = $("#vSphere-fc-host-name").val();
	DriverValues.vSphereVCenterHost = $("#vSphere-vCenter-host").val();
	DriverValues.vSphereVCenterCredSecret = $("#vSphere-vCenter-cred-secret").val();
	return DriverValues
}

function createYamlString(yaml, obj, driverParam, CONSTANTS_PARAM) {
	yaml = yaml.replaceAll("$IMAGE_REPOSITORY", obj.imageRepository);
	yaml = yaml.replaceAll("$VERSION", obj.driverVersion);
	yaml = yaml.replaceAll("$CONTROLLER_COUNT", obj.controllerCount);
	yaml = yaml.replaceAll("$CONTROLLER_POD_NODE_SELECTOR", obj.controllerPodsNodeSelector);
	yaml = yaml.replaceAll("$NODE_POD_NODE_SELECTOR", obj.nodePodsNodeSelector);
	yaml = yaml.replaceAll("$HEALTH_MONITOR_ENABLED", obj.healthMonitor);
	yaml = yaml.replaceAll("$VG_SNAPSHOT_ENABLED", obj.vgsnapshot);
	yaml = yaml.replaceAll("$VG_SNAPSHOT_IMAGE", obj.vgsnapshotImage);
	yaml = yaml.replaceAll("$SNAPSHOT_ENABLED", obj.snapshot);
	yaml = yaml.replaceAll("$RESIZER_ENABLED", obj.resizer);
	yaml = yaml.replaceAll("$REPLICATION_ENABLED", obj.replication);
	yaml = yaml.replaceAll("$REPLICATION_IMAGE", obj.replicationImage);
	yaml = yaml.replaceAll("$MIGRATION_ENABLED", obj.migration);
	yaml = yaml.replaceAll("$MIGRATION_IMAGE", obj.migrationImage);
	yaml = yaml.replaceAll("$MIGRATION_NODE_RESCAN_SIDECAR_IMAGE", obj.migrationNodeRescanSidecarImage);
	yaml = yaml.replaceAll("$AUTHORIZATION_ENABLED", obj.authorization);
	yaml = yaml.replaceAll("$AUTHORIZATION_IMAGE", obj.authorizationImage);
	yaml = yaml.replaceAll("$AUTHORIZATION_PROXY_HOST", obj.authorizationProxyHost);
	yaml = yaml.replaceAll("$AUTHORIZATION_SKIP_CERTIFICATE_VALIDATION", obj.authorizationSkipCertValidation);
	yaml = yaml.replaceAll("$OBSERVABILITY_ENABLED", obj.observability);
	yaml = yaml.replaceAll("$RESILIENCY_ENABLED", obj.resiliency);
	yaml = yaml.replaceAll("$PODMAN_IMAGE", obj.podmonImage);
	yaml = yaml.replaceAll("$STORAGE_CAPACITY_ENABLED", obj.storageCapacity);
	yaml = yaml.replaceAll("$POWERMAX_CSI_REVERSE_PROXY_IMAGE_ENABLED", obj.powermaxCSIReverseProxyImageEnabled);

	yaml = yaml.replaceAll("$POWERMAX_STORAGE_ARRAY_ID", obj.storageArrayId);
	yaml = yaml.replaceAll("$POWERMAX_STORAGE_ARRAY_ENDPOINT_URL", obj.storageArrayEndpointUrl);
	yaml = yaml.replaceAll("$POWERMAX_STORAGE_ARRAY_BACKUP_ENDPOINT_URL", obj.storageArrayBackupEndpointUrl);
	yaml = yaml.replaceAll("$POWERMAX_MANAGEMENT_SERVERS_ENDPOINT_URL", obj.storageArrayEndpointUrl);
	yaml = yaml.replaceAll("$POWERMAX_CSI_REVERSE_PROXY_IMAGE", obj.powermaxCSIReverseProxyImage);
	yaml = yaml.replaceAll("$POWERMAX_CLUSTER_PREFIX", obj.clusterPrefix);
	yaml = yaml.replaceAll("$POWERMAX_PORT_GROUPS", obj.portGroups);
	
	yaml = yaml.replaceAll("$VSPHERE_ENABLED", obj.vSphereEnabled);
	yaml = yaml.replaceAll("$VSPHERE_FC_PORT_GROUP", obj.vSphereFCPortGroup);
	yaml = yaml.replaceAll("$VSPHERE_FC_HOST_NAME", obj.vSphereFCHostName);
	yaml = yaml.replaceAll("$VSPHERE_VCENTER_HOST", obj.vSphereVCenterHost);
	yaml = yaml.replaceAll("$VSPHERE_VCENTER_CRED_SECRET", obj.vSphereVCenterCredSecret);

	if (driverParam === CONSTANTS_PARAM.POWERSTORE) {
		yaml = yaml.replaceAll("$POWERSTORE_ENABLED", true);
		releaseName = CONSTANTS_PARAM.POWERSTORE_RELEASE_NAME;
	} else if (driverParam === CONSTANTS_PARAM.POWERFLEX) {
		yaml = yaml.replaceAll("$POWERFLEX_ENABLED", true);
	} else if (driverParam === CONSTANTS_PARAM.POWERMAX) {
		yaml = yaml.replaceAll("$POWERMAX_ENABLED", true);
		releaseName = CONSTANTS_PARAM.POWERMAX;
	} else if (driverParam === CONSTANTS_PARAM.POWERSCALE) {
		yaml = yaml.replaceAll("$POWERSCALE_ENABLED", true);
	} else {
		yaml = yaml.replaceAll("$UNITY_ENABLED", true);
	}
	yaml = yaml.replaceAll("$POWERSTORE_ENABLED", false);
	yaml = yaml.replaceAll("$POWERFLEX_ENABLED", false);
	yaml = yaml.replaceAll("$POWERMAX_ENABLED", false);
	yaml = yaml.replaceAll("$POWERSCALE_ENABLED", false);
	yaml = yaml.replaceAll("$UNITY_ENABLED", false);

	if (obj.singleNamespaceEnabled) {
		yaml = yaml.replaceAll("$CSM_NAMESPACE", '""');
		yaml = yaml.replaceAll("$POWERSTORE_DRIVER_NAMESPACE", '""');
		yaml = yaml.replaceAll("$POWERFLEX_DRIVER_NAMESPACE", '""');
		yaml = yaml.replaceAll("$POWERMAX_DRIVER_NAMESPACE", '""');
		yaml = yaml.replaceAll("$POWERSCALE_DRIVER_NAMESPACE", '""');
		yaml = yaml.replaceAll("$UNITY_DRIVER_NAMESPACE", '""');
	} else {
		yaml = yaml.replaceAll("$CSM_NAMESPACE", moduleNamespace);

		if (driverNamespace === "") {
			driverNamespace = driverParam
		}

		if (driverParam === CONSTANTS_PARAM.POWERSTORE) {
			yaml = yaml.replaceAll("$POWERSTORE_DRIVER_NAMESPACE", driverNamespace);
		} else if (driverParam === CONSTANTS_PARAM.POWERFLEX) {
			yaml = yaml.replaceAll("$POWERFLEX_DRIVER_NAMESPACE", driverNamespace);
		} else if (driverParam === CONSTANTS_PARAM.POWERMAX) {
			yaml = yaml.replaceAll("$POWERMAX_DRIVER_NAMESPACE", driverNamespace);
		} else if (driverParam === CONSTANTS_PARAM.POWERSCALE) {
			yaml = yaml.replaceAll("$POWERSCALE_DRIVER_NAMESPACE", driverNamespace);
		} else {
			yaml = yaml.replaceAll("$UNITY_DRIVER_NAMESPACE", driverNamespace);
		}
	}
	if (obj.observabilityMetrics) {
		if (driverParam === CONSTANTS_PARAM.POWERSTORE) {
			yaml = yaml.replaceAll("$POWERSTORE_OBSERVABILITY_METRICS_ENABLED", true);
		} else if (driverParam === CONSTANTS_PARAM.POWERMAX) {
			yaml = yaml.replaceAll("$POWERMAX_OBSERVABILITY_METRICS_ENABLED", true);
		} else if (driverParam === CONSTANTS_PARAM.POWERFLEX) {
			yaml = yaml.replaceAll("$POWERFLEX_OBSERVABILITY_METRICS_ENABLED", true);
		} else if (driverParam === CONSTANTS_PARAM.POWERSCALE) {
			yaml = yaml.replaceAll("$POWERSCALE_OBSERVABILITY_METRICS_ENABLED", true);
		}
	}
	yaml = yaml.replaceAll("$POWERSTORE_OBSERVABILITY_METRICS_ENABLED", false);
	yaml = yaml.replaceAll("$POWERMAX_OBSERVABILITY_METRICS_ENABLED", false);
	yaml = yaml.replaceAll("$POWERFLEX_OBSERVABILITY_METRICS_ENABLED", false);
	yaml = yaml.replaceAll("$POWERSCALE_OBSERVABILITY_METRICS_ENABLED", false);

	yaml = yaml.replaceAll("$APP_MOBILITY_ENABLED", obj.applicationMobility);
	yaml = yaml.replaceAll("$VELERO_ENABLED", obj.velero);
	yaml = yaml.replaceAll("$APP_MOBILITY_VELERO_PLUGIN_IMAGE", obj.appMobilityVeleroPluginImage);
	yaml = yaml.replaceAll("$CERT_MANAGER_ENABLED", obj.certManagerEnabled);

	const regex = /\$[a-zA-Z0-9_-]*/g;
	yaml = yaml.replaceAll(regex, '""');

	return yaml
}

function loadTemplate() {
	var tmplFile = CONSTANTS.TEMP_DIR + CONSTANTS.CSM_VALUES + CONSTANTS.TEMP_EXT;
	$.get(tmplFile, function(data) { driverTemplate = String(data) }, "text");
}

if (typeof exports !== 'undefined') {
	module.exports = {
		setValues,
		createYamlString
	};
}
