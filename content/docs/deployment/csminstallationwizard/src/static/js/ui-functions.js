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
var releaseName ="";

const setupTooltipStyle = () => {
	const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
	[...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
};

function onArrayChange() {
	$('#array').on('change', function() {
		$("#command-text-area").hide();
		driver = $(this).val();
		driver === "" ? $("#main").hide() : $("#main").show();
		displayModules(driver, CONSTANTS)
		loadTemplate(document.getElementById("array").value, document.getElementById("installation-type").value,document.getElementById("csm-version").value);
		setDefaultValues(defaultValues, csmMap);
		driver === CONSTANTS.POWERSTORE ? document.getElementById("driver-namespace").value = CONSTANTS.POWERSTORE_NAMESPACE : document.getElementById("driver-namespace").value = driver;
		$(".namespace").show();
		onObservabilityChange();
		onAuthorizationChange();
		onAppMobilityChange(veleroNote);
		onResiliencyChange(podmonNote);
		onSnapshotChange(snapshotNote);
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

function onAppMobilityChange(veleroNoteValue) {
	if ($("#application-mobility").prop('checked') === true) {
		$('div#velero-wrapper').show();
		$("#velero-note").html(veleroNoteValue);
	} else {
		$('div#velero-wrapper').hide();
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

function onSnapshotChange(snapshotNoteValue) {
	if ($("#snapshot").prop('checked') === true) {
		$('div#snapshot-note-wrapper').show();
		$("#snapshot-note").html(snapshotNoteValue);
	} else {
		$('div#snapshot-note-wrapper').hide();
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
	document.getElementById("csm-version").value !== "" ? loadTemplate(document.getElementById("array").value, document.getElementById("installation-type").value,document.getElementById("csm-version").value): null;
	displayModules(driver, CONSTANTS);
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

const resetNodeSelectorLabel = csmMapValue => {
	document.getElementById("node-selector-label").value = String(csmMapValue.get("nodeSelectorLabel"));
}

const resetDriverNamespace = driverValue => {
	document.getElementById("driver-namespace").value = driverValue;
}

const downloadFile = (validateFormFunc, generateYamlFileFunc, displayCommandsFunc, validateInputFunc, CONSTANTS_PARAM) => {
	var link = document.getElementById('download-file');
	link.href = generateYamlFileFunc(template);
	link.style.display = 'inline-block';
	displayCommandsFunc(releaseName, commandTitle, commandNote, command1, command2, CONSTANTS_PARAM)
	validateInputFunc(validateFormFunc, CONSTANTS_PARAM)

	return true;
}

function displayModules(driverName, CONSTANTS_PARAM) {
	$(".vgsnapshot").show();
	$(".authorization").show();
	$(".appMobility").show();
	$(".storageArrays").hide();
	$(".powermax-csi-reverse-proxy").hide();
	$(".cluster-prefix").hide();
	$(".port-groups").hide();
	$(".resiliency").hide();
	$(".storage-capacity").hide();
	$(".migration").hide();
	$(".vSphere").hide();

	switch (driverName) {
		case CONSTANTS_PARAM.POWERSTORE:
			$(".authorization").hide();
			$("#authorization").prop('checked', false);
			$(".storage-capacity").show();
			$(".resiliency").show();
			break;
		case CONSTANTS_PARAM.POWERSCALE:
			break;
		case CONSTANTS_PARAM.POWERMAX:
			$(".vgsnapshot").hide();
			$(".appMobility").hide();
			$(".storageArrays").show();
			$(".cluster-prefix").show();
			$(".port-groups").show();
			$(".migration").show();
			$(".vSphere").show();
			break;
		case CONSTANTS_PARAM.POWERFLEX:
			break;
		case CONSTANTS_PARAM.UNITY:
			break;
	}
}

function displayCommands(releaseNameValue, commandTitleValue, commandNoteValue, command1Value, command2Value, CONSTANTS_PARAM) {
	driverNamespace = document.getElementById("driver-namespace").value;
	csmVersion = document.getElementById("csm-version").value;
	var helmChartVersion;
	switch(csmVersion){
		case "1.7.0": 
			helmChartVersion =  CONSTANTS_PARAM.CSM_HELM_v170;
			break;
		case "1.6.0": 
			helmChartVersion =  CONSTANTS_PARAM.CSM_HELM_v160;
			break;
		default:
			helmChartVersion =  CONSTANTS_PARAM.CSM_HELM_v170;
			break;
	}
	
	$("#command-text-area").show();
	$("#reverseProxyNote").hide();
	$("#command-title").html(commandTitleValue);
	$("#command-note").show();
	$("#command1").html(command1Value);
	$("#command-note").html(commandNoteValue);
	var command2 = command2Value.replace("$release-name", releaseNameValue).replace("$namespace",driverNamespace).replace("$version",helmChartVersion);
	$("#command2").html(command2);
	if (document.getElementById("array").value === CONSTANTS_PARAM.POWERMAX){
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

const downloadFileHandler = () => $("#download-file").on('click', () => downloadFile(validateForm, generateYamlFile, displayCommands, loadDefaultValues, hideFields, setDefaultValues, validateInput, CONSTANTS));

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
		onAppMobilityChange,
		onResiliencyChange,
		onSnapshotChange,
		onVSphereChange,
		onNodeSelectorChange,
		onCopyButtonClickHandler,
		resetImageRepository,
		resetControllerCount,
		resetNodeSelectorLabel,
		resetDriverNamespace,
		downloadFile,
		displayModules,
		displayCommands,
		hideFields,
		validateInput
	};
}
