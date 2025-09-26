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
var defaultValues = "";
var csmMap = new Map();

function validateForm(CONSTANTS_PARAM) {
	if (document.getElementById('array').value.trim() === "") {
		return false;
	}
	if (document.getElementById('installation-type').value.trim() === "") {
		return false
	}
	if (document.getElementById('image-repository').value.trim() === "") {
		return false
	}
	if (document.getElementById('csm-version').value.trim() === "") {
		return false;
	}
	if (document.getElementById('driver-namespace').value.trim() === "") {
		return false;
	}
	if (document.getElementById('controller-count').value.trim() < 1) {
		return false;
	}
	if (document.getElementById('max-volumes-per-node').value.trim() < 0) {
		return false;
	}

	if ($("#installation-type").val() === CONSTANTS_PARAM.OPERATOR && ($("#array").val() === CONSTANTS_PARAM.POWERFLEX || $("#array").val() === CONSTANTS_PARAM.UNITY)) {
		return false;
	}

	const powermaxSelected = document.getElementById('array').value.trim() === CONSTANTS_PARAM.POWERMAX;
	const vSphereEnabled = $("#vSphere").prop('checked') ? true : false;

	const powerflexSelected = document.getElementById('array').value.trim() === CONSTANTS_PARAM.POWERFLEX;
	const renameSDCEnabled = $("#rename-sdc").prop('checked') ? true : false;

	if (powermaxSelected) {
		if (document.getElementById('installation-type').value === CONSTANTS_PARAM.HELM) {
			if (document.getElementById('storage-array-id').value.trim() === "") {
				return false;
			}
			if (document.getElementById('storage-array-endpoint-url').value.trim() === "") {
				return false;
			}
		} else {
			if (document.getElementById('manage-array-id').value.trim() === "") {
				return false;
			}
			if (document.getElementById('manage-array-endpoint-url').value.trim() === "") {
				return false;
			}
		}		
		if (document.getElementById('cluster-prefix').value.trim() === "") {
			return false;
		}


		if (vSphereEnabled) {
			if (document.getElementById('vSphere-fc-port-group').value.trim() === "") {
				return false;
			}
			if (document.getElementById('vSphere-fc-host-name').value.trim() === "") {
				return false;
			}
			if (document.getElementById('vSphere-vCenter-host').value.trim() === "") {
				return false;
			}
			if (document.getElementById('vSphere-vCenter-cred-secret').value.trim() === "") {
				return false;
			}
		}
	}
	if (powerflexSelected) {
		if (document.getElementById('installation-type').value === CONSTANTS_PARAM.HELM) {
			if (renameSDCEnabled) {
				if (document.getElementById('sdc-prefix').value.trim() === "") {
					return false;
				}
			}
		}
	}
	if ($('#controller-pods-node-selector').prop('checked') || $('#node-pods-node-selector').prop('checked')){
		if (document.getElementById('node-selector-label').value.trim() === "") {
			return false;
		}
	}
	if ($('#controller-pods-node-selector').prop('checked') || $('#node-pods-node-selector').prop('checked')){
		if (document.getElementById('taint').value.trim() === "") {
			return false;
		}
	}

	const authorizationEnabled = $("#authorization").prop('checked') ? true : false;
	if (authorizationEnabled && document.getElementById('authorization-proxy-host').value.trim() === "") {
		return false;
	}

	return true;
}

function loadDefaultValues() {
	var defaultValuesFile = CONSTANTS.VERSIONS_DIR + CONSTANTS.SLASH + CONSTANTS.DEFAULT_VALUES + CONSTANTS.PROPERTIES;
	$.get(defaultValuesFile, function(data) {
		defaultValues = String(data)
	}, "text");
}

function setDefaultValues(defaultValuesParam, csmMapValues) {
	setMap(defaultValuesParam);
	document.getElementById("image-repository").value = csmMapValues.get("imageRepository");
	document.getElementById("csm-version").value = String(csmMapValues.get("csmVersion"));
	document.getElementById("max-volumes-per-node").value = String(csmMapValues.get("maxVolumesPerNode"));
	document.getElementById("controller-count").value = String(csmMapValues.get("controllerCount"));
	document.getElementById("vol-name-prefix").value = csmMapValues.get("volNamePrefix");
	document.getElementById("snapshot-prefix").value = csmMapValues.get("snapNamePrefix");
	document.getElementById("cert-secret-count").value = csmMapValues.get("certSecretCount");
	document.getElementById("taint").value = csmMapValues.get("taint");
	document.getElementById("poll-rate").value = csmMapValues.get("pollRate");
	document.getElementById("array-threshold").value = csmMapValues.get("arrayThreshold");
	document.getElementById("driver-pod-label").value = csmMapValues.get("driverPodLabel");

}

function setMap(str) {
	const testMap = new Map();
	var keyValues = str.split('\n');
	for (var i = 0; i < keyValues.length; i++) {
		var key = keyValues[i].trim().split('=')[0];
		var value = keyValues[i].trim().split('=')[1];
		csmMap.set(key, value);
		testMap.set(key, value);
	}

	return testMap;
}

if (typeof exports !== 'undefined') {
	module.exports = {
		validateForm,
		setMap,
		setDefaultValues,
	};
}
