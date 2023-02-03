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
	DriverValues.nodeSelectorLabel = document.getElementById("node-selector-label").value;
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
	DriverValues.observability = $("#observability").prop('checked') ? true : false;
	DriverValues.observabilityMetrics = $("#observability-metrics").prop('checked') ? true : false;
	DriverValues.authorization = $("#authorization").prop('checked') ? true : false;
	DriverValues.authorizationSkipCertValidation = $("#authorization-skip-cert-validation").prop('checked') ? true : false;
	DriverValues.vgsnapshotImage = DriverValues.imageRepository + CONSTANTS_PARAM.SLASH + csmMapValues.get("vgsnapshotImage");
	DriverValues.replicationImage = DriverValues.imageRepository + CONSTANTS_PARAM.SLASH + csmMapValues.get("replicationImage");
	DriverValues.authorizationImage = DriverValues.imageRepository + CONSTANTS_PARAM.SLASH + csmMapValues.get("authorizationImage");
	DriverValues.applicationMobility = $("#application-mobility").prop('checked') ? true : false;
	DriverValues.certManagerEnabled = $("#cert-manager-enabled").prop('checked') ? true : false;
	DriverValues.singleNamespaceEnabled = $("#single-namespace").prop('checked') ? true : false;
	driverNamespace = document.getElementById("driver-namespace").value;
	moduleNamespace = document.getElementById("module-namespace").value;
	observabilityEnabled = DriverValues.observability;
	applicationMobilityEnabled = DriverValues.applicationMobility;
	authorizationEnabled = DriverValues.authorization;
	replicationEnabled = DriverValues.replication;

	return DriverValues
}

function createYamlString(yaml, obj, driverParam, CONSTANTS_PARAM) {
	yaml = yaml.replace("$IMAGE_REPOSITORY", obj.imageRepository);
	yaml = yaml.replace("$VERSION", obj.driverVersion);
	yaml = yaml.replace("$CONTROLLER_COUNT", obj.controllerCount);
	yaml = yaml.replace("$CONTROLLER_POD_NODE_SELECTOR", obj.controllerPodsNodeSelector);
	yaml = yaml.replace("$NODE_POD_NODE_SELECTOR", obj.nodePodsNodeSelector);
	yaml = yaml.replaceAll("$HEALTH_MONITOR_ENABLED", obj.healthMonitor);
	yaml = yaml.replace("$VG_SNAPSHOT_ENABLED", obj.vgsnapshot);
	yaml = yaml.replace("$VG_SNAPSHOT_IMAGE", obj.vgsnapshotImage);
	yaml = yaml.replace("$SNAPSHOT_ENABLED", obj.snapshot);
	yaml = yaml.replace("$RESIZER_ENABLED", obj.resizer);
	yaml = yaml.replaceAll("$REPLICATION_ENABLED", obj.replication);
	yaml = yaml.replace("$REPLICATION_IMAGE", obj.replicationImage);
	yaml = yaml.replace("$AUTHORIZATION_ENABLED", obj.authorization);
	yaml = yaml.replace("$AUTHORIZATION_IMAGE", obj.authorizationImage);
	yaml = yaml.replace("$AUTHORIZATION_SKIP_CERTIFICATE_VALIDATION", obj.authorizationSkipCertValidation);
	yaml = yaml.replace("$OBSERVABILITY_ENABLED", obj.observability);

	if (driverParam === CONSTANTS_PARAM.POWERSTORE) {
		yaml = yaml.replace("$POWERSTORE_ENABLED", true);
	} else if (driverParam === CONSTANTS_PARAM.POWERFLEX) {
		yaml = yaml.replace("$POWERFLEX_ENABLED", true);
	} else if (driverParam === CONSTANTS_PARAM.POWERMAX) {
		yaml = yaml.replace("$POWERMAX_ENABLED", true);
	} else if (driverParam === CONSTANTS_PARAM.POWERSCALE) {
		yaml = yaml.replace("$POWERSCALE_ENABLED", true);
	} else {
		yaml = yaml.replace("$UNITY_ENABLED", true);
	}
	yaml = yaml.replace("$POWERSTORE_ENABLED", false);
	yaml = yaml.replace("$POWERFLEX_ENABLED", false);
	yaml = yaml.replace("$POWERMAX_ENABLED", false);
	yaml = yaml.replace("$POWERSCALE_ENABLED", false);
	yaml = yaml.replace("$UNITY_ENABLED", false);

	if (obj.singleNamespaceEnabled) {
		yaml = yaml.replaceAll("$CSM_NAMESPACE", '""');
		yaml = yaml.replace("$POWERSTORE_DRIVER_NAMESPACE", '""');
		yaml = yaml.replace("$POWERFLEX_DRIVER_NAMESPACE", '""');
		yaml = yaml.replace("$POWERMAX_DRIVER_NAMESPACE", '""');
		yaml = yaml.replace("$POWERSCALE_DRIVER_NAMESPACE", '""');
		yaml = yaml.replace("$UNITY_DRIVER_NAMESPACE", '""');
	} else {
		yaml = yaml.replaceAll("$CSM_NAMESPACE", moduleNamespace);
		yaml = yaml.replace("$POWERSTORE_DRIVER_NAMESPACE", driverNamespace);
		yaml = yaml.replace("$POWERFLEX_DRIVER_NAMESPACE", driverNamespace);
		yaml = yaml.replace("$POWERMAX_DRIVER_NAMESPACE", driverNamespace);
		yaml = yaml.replace("$POWERSCALE_DRIVER_NAMESPACE", driverNamespace);
		yaml = yaml.replace("$UNITY_DRIVER_NAMESPACE", driverNamespace);

		if (driverParam === CONSTANTS_PARAM.POWERSTORE) {
			yaml = yaml.replace("$POWERSTORE_DRIVER_NAMESPACE", driverParam);
		} else if (driverParam === CONSTANTS_PARAM.POWERFLEX) {
			yaml = yaml.replace("$POWERFLEX_DRIVER_NAMESPACE", driverParam);
		} else if (driverParam === CONSTANTS_PARAM.POWERMAX) {
			yaml = yaml.replace("$POWERMAX_DRIVER_NAMESPACE", driverParam);
		} else if (driverParam === CONSTANTS_PARAM.POWERSCALE) {
			yaml = yaml.replace("$POWERSCALE_DRIVER_NAMESPACE", driverParam);
		} else {
			yaml = yaml.replace("$UNITY_DRIVER_NAMESPACE", driverParam);
		}
	}
	if (obj.observabilityMetrics) {
		if (driverParam === CONSTANTS_PARAM.POWERSTORE) {
			yaml = yaml.replace("$POWERSTORE_OBSERVABILITY_METRICS_ENABLED", true);
		} else if (driverParam === CONSTANTS_PARAM.POWERFLEX) {
			yaml = yaml.replace("$POWERFLEX_OBSERVABILITY_METRICS_ENABLED", true);
		} else if (driverParam === CONSTANTS_PARAM.POWERSCALE) {
			yaml = yaml.replace("$POWERSCALE_OBSERVABILITY_METRICS_ENABLED", true);
		}
	}
	yaml = yaml.replace("$POWERSTORE_OBSERVABILITY_METRICS_ENABLED", false);
	yaml = yaml.replace("$POWERFLEX_OBSERVABILITY_METRICS_ENABLED", false);
	yaml = yaml.replace("$POWERSCALE_OBSERVABILITY_METRICS_ENABLED", false);

	yaml = yaml.replace("$APP_MOBILITY_ENABLED", obj.applicationMobility);
	yaml = yaml.replace("$CERT_MANAGER_ENABLED", obj.certManagerEnabled);
	yaml = yaml.replaceAll("null", "")
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
