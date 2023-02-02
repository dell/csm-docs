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
var moduleNamespace = "csm-module";

function onArrayChange() {
	$('#array').on('change', function() {
		$("#command-text-area").hide();
		driver = $(this).val();
		driver === "" ? $("#main").hide() : $("#main").show();
		displayModules(driver, CONSTANTS)
		loadTemplate();
		setDefaultValues(defaultValues, csmMap);
		document.getElementById("driver-namespace").value = driver;
		document.getElementById("module-namespace").value = moduleNamespace;
		$(".namespace").show();
		loadCSMVersions(document.getElementById("csm-version").value);
	});
}

function onAuthorizationChange() {
	if ($("#authorization").prop('checked') === true) {
		$('label[for=authorization-skip-cert-validation], input#authorization-skip-cert-validation').show();
	} else {
		$('label[for=authorization-skip-cert-validation], input#authorization-skip-cert-validation').hide();
	}
}

function onObservabilityChange() {
	if ($("#observability").prop('checked') === true) {
		$('label[for=observability-metrics], input#observability-metrics').show();
	} else {
		$('label[for=observability-metrics], input#observability-metrics').hide();
	}
}

function singleNamespaceCheck() {
	if ($("#single-namespace").prop('checked') === true) {
		$('label[for=driver-namespace], input#driver-namespace, label[for=module-namespace], input#module-namespace,#reset-driver-namespace,#reset-module-namespace').hide();
	} else {
		$('label[for=driver-namespace], input#driver-namespace, label[for=module-namespace], input#module-namespace,#reset-driver-namespace,#reset-module-namespace').show();
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

const onCSMVersionChange = () => document.getElementById("csm-version").value !== "" ? loadCSMVersions(document.getElementById("csm-version").value) : null;

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

const resetControllerCount  = csmMapValue => {
	document.getElementById("controller-count").value = String(csmMapValue.get("controllerCount"));
}

const resetNodeSelectorLabel = csmMapValue => {
	document.getElementById("node-selector-label").value = String(csmMapValue.get("nodeSelectorLabel"));
}

const resetDriverNamespace = driverValue => {
	document.getElementById("driver-namespace").value = driverValue;
}

const resetModuleNameSpace = moduleNamespaceValue => {
	document.getElementById("module-namespace").value = moduleNamespaceValue;
}

const downloadFile = (validateFormFunc, generateYamlFileFunc, displayCommandsFunc, loadDefaultValuesFunc, hideFieldsFunc, setDefaultValuesFunc) => {
	if (!validateFormFunc()) {
		return false
	}
	var link = document.getElementById('download-file');
	link.href = generateYamlFileFunc(driverTemplate);
	link.style.display = 'inline-block';
	displayCommandsFunc(driver, commandTitle, commandNote, command1, command2, command3)
	document.getElementById("csm-form").reset();
	loadDefaultValuesFunc();
	hideFieldsFunc();
	setDefaultValuesFunc(defaultValues, csmMap);
	$(".namespace").hide();
	return true
}

function displayModules(driverName, CONSTANTS_PARAM) {
	$(".vgsnapshot").show();
	$(".authorization").show();
	$(".observability").show();
	$(".appMobility").show();
	switch (driverName) {
		case CONSTANTS_PARAM.POWERSTORE:
			$(".authorization").hide();
			break;
		case CONSTANTS_PARAM.POWERSCALE:
			break;
		case CONSTANTS_PARAM.POWERMAX:
			$(".vgsnapshot").hide();
			$(".observability").hide();
			$(".appMobility").hide();
			break;
		case CONSTANTS_PARAM.POWERFLEX:
			break;
		case CONSTANTS_PARAM.UNITY:
			break;
	}
}

function displayCommands(driverName, commandTitleValue, commandNoteValue, command1Value, command2Value, command3Value) {
	driverNamespace = document.getElementById("driver-namespace").value
	$("#command-text-area").show();
	$("#command-title").html(commandTitleValue);
	$("#command-note").show();
	$("#command1").html(command1Value.replaceAll("$drivernamespace", driverNamespace));
	$("#command-note").html(commandNoteValue.replaceAll("$drivernamespace", driverNamespace));
	if ($("#single-namespace").prop('checked') === true) {
		$("#command2").html(command2Value.replace("$driver", driverName));
	} else {
		$("#command2").html(command3Value.replace("$driver", driverName));
	}
}

function hideFields() {
	$(".authAttributes").hide()
	$(".node-sel-attributes").hide();
	$(".replication-attributes").hide();
	$('label[for=authorization-skip-cert-validation], input#authorization-skip-cert-validation').hide();
	$('label[for=observability-metrics], input#observability-metrics').hide();
}

const downloadFileHandler = () => $("#download-file").on('click', () => downloadFile(validateForm, generateYamlFile, displayCommands, loadDefaultValues, hideFields, setDefaultValues));

function onPageLoad() {
	$("*").css("cursor", "pointer");
	$("#main").hide();
	hideFields();
	loadDefaultValues();
	$("#command-text-area").hide();

	onArrayChange();
	onCopyButtonClick();
	downloadFileHandler();
}

if (typeof exports !== 'undefined') {
	module.exports = {
		onAuthorizationChange,
		onObservabilityChange,
		singleNamespaceCheck,
		onNodeSelectorChange,
		onCopyButtonClickHandler,
		resetImageRepository,
		resetControllerCount,
		resetNodeSelectorLabel,
		resetDriverNamespace,
		resetModuleNameSpace,
		downloadFile,
		displayModules,
		displayCommands,
		hideFields
	};
}
