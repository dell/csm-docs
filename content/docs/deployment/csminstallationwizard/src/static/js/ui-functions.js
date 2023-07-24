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
var driver = "";
var driverNamespace = "";
var releaseName = "";

const setupTooltipStyle = () => {
	const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
	[...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
};

function onInstallationTypeChange(){
	driver = document.getElementById("array").value
	driver === "" ? $("#main").hide() : $("#main").show();
	installationType = document.getElementById("installation-type").value	
	displayModules(installationType, driver, CONSTANTS)
	$("#command-text-area").hide();
	onOperatorResiliencyChange();
	loadTemplate(document.getElementById("array").value, document.getElementById("installation-type").value, document.getElementById("csm-version").value);
}

function onArrayChange() {
	$('#array').on('change', function() {
		$("#command-text-area").hide();
		driver = $(this).val();
		driver === "" ? $("#main").hide() : $("#main").show();
		installationType = document.getElementById("installation-type").value
		displayModules(installationType, driver, CONSTANTS)
		loadTemplate(document.getElementById("array").value, document.getElementById("installation-type").value, document.getElementById("csm-version").value);
		setDefaultValues(defaultValues, csmMap);
		$(".namespace").show();
		onObservabilityChange();
		onAuthorizationChange();
		onResiliencyChange(podmonNote);
		onSnapshotChange(snapshotNote, driver, CONSTANTS);
		onCertManagerChange(certmanagerNote);
		onVSphereChange();
		validateInput(validateForm, CONSTANTS);
	});
}

function onAuthorizationChange(authorizationNoteValue) {
	if ($("#authorization").prop('checked') === true) {
		$('.authorization-wrapper').show();
		$('#authorization-note').html(authorizationNoteValue).show();
	} else {
		$('.authorization-wrapper').hide();
		$('#authorization-note').hide();
	}
}

function onObservabilityChange() {
	if ($("#observability").prop('checked') === true) {
		$('div#observability-metrics-wrapper').show();
	} else {
		$('div#observability-metrics-wrapper').hide();
	}
}

function onResiliencyChange(podmonNoteValue) {
	if ($("#resiliency").prop('checked') === true) {
		$('div#podmon-note-wrapper').show();
		$("#podmon-note").html(podmonNoteValue);
	} else {
		$('div#podmon-note-wrapper').hide();
	}
}

const onOperatorResiliencyChange = () => $("#operator-resiliency").prop('checked') === true ? $('div#podmon-wrapper').show() : $('div#podmon-wrapper').hide();

function onSnapshotChange(snapshotNoteValue, driverName, CONSTANTS_PARAM) {
	if ($("#snapshot").prop('checked') === true) {
		$('div#snapshot-note-wrapper').show();
		$("#snapshot-note").html(snapshotNoteValue);
		if (driverName !== CONSTANTS_PARAM.POWERFLEX){
			$('div#snap-prefix').show();
		}
	} else {
		$('div#snapshot-note-wrapper').hide();
		$('div#snap-prefix').hide();
	}
}

function onCertManagerChange(certmanagerNoteValue) {
	if ($("#certmanager").prop('checked') === true) {
		$('div#certmanager-note-wrapper').show();
		$("#certmanager-note").html(certmanagerNoteValue);
    } else {
		$('div#certmanager-note-wrapper').hide();	
	}
}

function onVSphereChange() {
	if ($("#vSphere").prop('checked') === true) {
		$('div#vSphere-wrapper').show();
	} else {
		$('div#vSphere-wrapper').hide();
	}
}

function onNodeSelectorChange(nodeSelectorNoteValue, csmMapValue) {
	if ($("#controller-pods-node-selector").prop('checked') === true || $("#node-pods-node-selector").prop('checked') === true) {
		$(".node-sel-attributes").show();
		$("#node-selector-note").html(nodeSelectorNoteValue);
		document.getElementById('node-selector-label').value = String(csmMapValue.get("nodeSelectorLabel"));
	} else {
		document.getElementById('node-selector-label').value = "";
		$(".node-sel-attributes").hide();
	}
}

const onCSMVersionChange = () => {
	document.getElementById("csm-version").value !== "" ? loadTemplate(document.getElementById("array").value, document.getElementById("installation-type").value, document.getElementById("csm-version").value) : null;
	displayModules(installationType, driver, CONSTANTS);
	onObservabilityChange();
	onAuthorizationChange();
};

const onCopyButtonClickHandler = () => {
	var c1 = $('#command1').text() + "\n";
	var c2 = $('#command2').text() + "\n";
	navigator.clipboard.writeText(c1 + c2)
	$("#copy").html("Copied")
	setTimeout(function() {
		$("#copy").html("Copy")
	}, 2000);
}

const onCopyButtonClick = () => $("#copy").on('click', onCopyButtonClickHandler);

//Reset to default values
const resetImageRepository = csmMapValue => {
	document.getElementById("image-repository").value = csmMapValue.get("imageRepository");
}

const resetControllerCount = csmMapValue => {
	document.getElementById("controller-count").value = String(csmMapValue.get("controllerCount"));
}

const resetVolNamePrefix = csmMapValue => {
	document.getElementById("vol-name-prefix").value = String(csmMapValue.get("volNamePrefix"));
}

const resetSnapNamePrefix = csmMapValue => {
	document.getElementById("snapshot-prefix").value = String(csmMapValue.get("snapNamePrefix"));
}

const resetNodeSelectorLabel = csmMapValue => {
	document.getElementById("node-selector-label").value = String(csmMapValue.get("nodeSelectorLabel"));
}

const resetDriverNamespace = (driverValue, CONSTANTS_PARAM) => {
	if (driverValue === CONSTANTS_PARAM.POWERSTORE) {
		document.getElementById("driver-namespace").value = CONSTANTS_PARAM.POWERSTORE_NAMESPACE;
	} else {
		document.getElementById("driver-namespace").value = driverValue;
	}
}

const resetArrayPollRate = csmMapValue => {
	document.getElementById("poll-rate").value = String(csmMapValue.get("pollRate"));
}

const resetLabelValue = (driverValue, CONSTANTS_PARAM) => {
	if (driverValue === CONSTANTS_PARAM.POWERSTORE) {
		document.getElementById("label-value").value = CONSTANTS_PARAM.POWERSTORE_LABEL_VALUE;
	} else {
		document.getElementById("label-value").value = driverValue;
	}
}

const resetDriverPodLabel = csmMapValue => {
	document.getElementById("driver-pod-label").value = String(csmMapValue.get("driverPodLabel"));
}

const resetTaint = csmMapValue => {
	document.getElementById("taint").value = String(csmMapValue.get("taint"));
}

const downloadFile = (validateFormFunc, generateYamlFileFunc, displayCommandsFunc, validateInputFunc, CONSTANTS_PARAM) => {
	var link = document.getElementById('download-file');
	link.href = generateYamlFileFunc(template);
	link.style.display = 'inline-block';
	displayCommandsFunc(releaseName, commandTitle, commandNote, command1, command2, command3, CONSTANTS_PARAM)
	validateInputFunc(validateFormFunc, CONSTANTS_PARAM)

	return true;
}

function displayModules(installationType, driverName, CONSTANTS_PARAM) {
	$(".vgsnapshot").show();
	$(".authorization").show();
	$(".observability").show();
	$(".replication-mod").show();
	$(".cert-manager").show();
	$(".storageArrays").hide();
	$(".powermax-csi-reverse-proxy").hide();
	$(".cluster-prefix").hide();
	$(".port-groups").hide();
	$(".resiliency").hide();
	$(".storage-capacity").hide();
	$(".migration").hide();
	$(".vSphere").hide();
	$(".cert-secret-count-wrapper").hide();
	$(".monitor").hide();
	$(".vol-name-prefix").show();
	$("div#snap-prefix").show();
	$(".fsGroupPolicy").hide();
	$(".image-repository").show();
	$(".resizer").show();
	$(".snapshot-feature").show();
	$(".resiliency-operator").hide();
	switch (driverName) {
		case CONSTANTS_PARAM.POWERSTORE:
			$(".authorization").hide();
			$("#authorization").prop('checked', false);
			$(".storage-capacity").show();
			$(".resiliency").show();
			document.getElementById("driver-namespace").value = CONSTANTS_PARAM.POWERSTORE_NAMESPACE;
			if (installationType === 'operator'){
				$(".resiliency").hide();
				$(".resiliency-operator").show();
				$(".observability").hide();
				$(".replication-mod").hide();
				$(".image-repository").hide();
				$(".cert-manager").hide();
				$(".vgsnapshot").hide();
				$(".resizer").hide();
				$(".snapshot-feature").hide();
				$(".vol-name-prefix").hide();
				$(".fsGroupPolicy").show();
				document.getElementById("label-value").value = CONSTANTS_PARAM.POWERSTORE_LABEL_VALUE;
			}
			break;
		case CONSTANTS_PARAM.POWERSCALE:
			$(".cert-secret-count-wrapper").show();
			$(".resiliency").show();
			$(".fsGroupPolicy").show();
			$(".vgsnapshot").hide();
			$(".storage-capacity").show();
			document.getElementById("driver-namespace").value = CONSTANTS_PARAM.POWERSCALE_NAMESPACE;
			break;
		case CONSTANTS_PARAM.POWERMAX:
			$(".vgsnapshot").hide();
			$(".storageArrays").show();
			$(".cluster-prefix").show();
			$(".port-groups").show();
			$(".migration").show();
			$(".vSphere").show();
			$(".storage-capacity").show();
			document.getElementById("driver-namespace").value = CONSTANTS_PARAM.POWERMAX_NAMESPACE;
			break;
		case CONSTANTS_PARAM.POWERFLEX:
			$(".monitor").show();
			$(".resiliency").show();
			$(".cert-secret-count-wrapper").show();
			$("div#snap-prefix").hide();
			document.getElementById("driver-namespace").value = CONSTANTS_PARAM.POWERFLEX_NAMESPACE;
			break;
		case CONSTANTS_PARAM.UNITY:
			$(".observability").hide();
			$(".replication-mod").hide();
			$(".resiliency").show();
			$(".vgsnapshot").hide();
			$(".authorization").hide();
			$(".fsGroupPolicy").show();	
			$(".cert-manager").hide();			
			document.getElementById("driver-namespace").value = CONSTANTS_PARAM.UNITY_NAMESPACE;
			break;
	}
}

function displayCommands(releaseNameValue, commandTitleValue, commandNoteValue, command1Value, command2Value, command3Value, CONSTANTS) {
	driverNamespace = document.getElementById("driver-namespace").value;
	csmVersion = document.getElementById("csm-version").value;
	installationType = document.getElementById("installation-type").value
	var helmChartVersion;
	switch (csmVersion) {
		case "1.7.0":
			helmChartVersion = CONSTANTS.CSM_HELM_V170;
			break;
		case "1.8.0":
			helmChartVersion = CONSTANTS.CSM_HELM_V180;
			break;
		default:
			helmChartVersion = CONSTANTS.CSM_HELM_V180;
			break;
	}
	$("#command-text-area").show();
	$("#reverseProxyNote").hide();
	$("#command-title").html(commandTitleValue);
	$("#command-note").show();
	$("#command-note").html(commandNoteValue);
	
	if (installationType === 'helm'){
		$("#command1").html(command1Value);

		$("#command2-wrapper").show();
		var command2 = command2Value.replace("$release-name", releaseNameValue).replace("$namespace", driverNamespace).replace("$version", helmChartVersion);
		$("#command2").html(command2);
	} else {
		$("#command1").html(command3Value);
		$("#command2-wrapper").hide();
	}
	if (document.getElementById("array").value === CONSTANTS.POWERMAX) {
		$("#reverseProxyNote").show();
	}
}

function hideFields() {
	$(".authAttributes").hide()
	$(".node-sel-attributes").hide();
	$(".replication-attributes").hide();
}

function validateInput(validateFormFunc, CONSTANTS_PARAM) {
	$("#download-file").addClass("disabled");
	if (validateFormFunc(CONSTANTS_PARAM)) {
		$("#download-file").removeClass("disabled");
		return true
	}
	return false
}

const downloadFileHandler = () => $("#download-file").on('click', () => downloadFile(validateForm, generateYamlFile, displayCommands, validateInput, CONSTANTS));

function onPageLoad() {
	setupTooltipStyle();
	$("*").css("cursor", "pointer");
	$("#main").hide();
	hideFields();
	loadDefaultValues();
	$("#command-text-area").hide();

	onArrayChange();
	onCopyButtonClick();
	downloadFileHandler();
	validateInput(validateForm, CONSTANTS);
}

if (typeof exports !== 'undefined') {
	module.exports = {
		onAuthorizationChange,
		onObservabilityChange,
		onResiliencyChange,
		onOperatorResiliencyChange,
		onSnapshotChange,
		onCertManagerChange,
		onVSphereChange,
		onNodeSelectorChange,
		onCopyButtonClickHandler,
		resetImageRepository,
		resetControllerCount,
		resetNodeSelectorLabel,
		resetDriverNamespace,
		resetArrayPollRate,
		resetLabelValue,
		resetDriverPodLabel,
		resetTaint,
		downloadFile,
		displayModules,
		displayCommands,
		hideFields,
		validateInput,
		resetVolNamePrefix,
		resetSnapNamePrefix
	};
}
