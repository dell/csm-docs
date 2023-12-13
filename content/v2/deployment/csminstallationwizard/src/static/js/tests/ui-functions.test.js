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
	onAuthorizationChange,
	onObservabilityChange,
	onResiliencyChange,
	onSnapshotChange,
	onVSphereChange,
	onNodeSelectorChange,
	onCopyButtonClickHandler,
	resetImageRepository,
	resetControllerCount,
	resetNodeSelectorLabel,
	resetDriverNamespace,
	resetTaint,
	displayModules,
	displayCommands,
	hideFields,
	validateInput
} = require('../ui-functions');

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
	CSM_HELM_V170: "1.0.0"
};

describe("GIVEN onAuthorizationChange function", () => {
	test("SHOULD hide authorization components when option not checked", () => {
		document.body.innerHTML = `
            <input type="checkbox" id="authorization">
            <div class="authorization-wrapper" style="display:">
        `;

		onAuthorizationChange("Test authorization note");

		expect($(".authorization-wrapper").css("display")).toEqual("none");
	});

	test("SHOULD show authorization components when option checked", () => {
		document.body.innerHTML = `
            <input type="checkbox" id="authorization" checked>
            <div class="authorization-wrapper" style="display:none">
        `;

		onAuthorizationChange("Test authorization note");

		expect($(".authorization-wrapper").css("display")).not.toEqual("none");
	});
});

describe("GIVEN onObservabilityChange function", () => {
	test("SHOULD hide Observability Metrics components when option not checked", () => {
		document.body.innerHTML = `
            <input type="checkbox" id="observability">
            <div id="observability-metrics-wrapper" style="display:">
        `;

		onObservabilityChange();

		expect($("div#observability-metrics-wrapper").css("display")).toEqual("none");
	});

	test("SHOULD show Observability Metrics components when option checked", () => {
		document.body.innerHTML = `
            <input type="checkbox" id="observability" checked>
            <div id="observability-metrics-wrapper" style="display:none">
        `;

		onObservabilityChange();

		expect($("div#observability-metrics-wrapper").css("display")).not.toEqual("none");
	});
});

describe("GIVEN onResiliencyChange function", () => {
	test("SHOULD hide Podmon components when option not checked", () => {
		document.body.innerHTML = `
            <input type="checkbox" id="resiliency">
            <div id="podmon-note-wrapper" style="display:">
        `;

		onResiliencyChange("Test podmon note");

		expect($("div#podmon-note-wrapper").css("display")).toEqual("none");
	});

	test("SHOULD show Podmon components when option checked", () => {
		document.body.innerHTML = `
            <input type="checkbox" id="resiliency" checked>
            <div id="podmon-note-wrapper" style="display:none">
        `;

		onResiliencyChange("Test podmon note");

		expect($("div#podmon-note-wrapper").css("display")).not.toEqual("none");
	});
});

describe("GIVEN onSnapshotChange function", () => {
	test("SHOULD hide snapshot components when option not checked", () => {
		document.body.innerHTML = `
            <input type="checkbox" id="snapshot">
            <div id="snapshot-note-wrapper" style="display:">
			<div id="snap-prefix" style="display:">
        `;

		onSnapshotChange("Temp snapshot note", "unity", CONSTANTS);

		expect($("div#snapshot-note-wrapper").css("display")).toEqual("none");
		expect($("div#snap-prefix").css("display")).toEqual("none");
	});

	test("SHOULD show snapshot components when option checked", () => {
		document.body.innerHTML = `
            <input type="checkbox" id="snapshot" checked>
            <div id="snapshot-note-wrapper" style="display:none">
			<div id="snap-prefix" style="display:none">
        `;

		onSnapshotChange("Temp snapshot note", "unity", CONSTANTS);

		expect($("div#snapshot-note-wrapper").css("display")).not.toEqual("none");
		expect($("div#snap-prefix").css("display")).not.toEqual("none");
	});
});

describe("GIVEN onVSphereChange function", () => {
	test("SHOULD hide Observability Metrics components when option not checked", () => {
		document.body.innerHTML = `
            <input type="checkbox" id="vSphere">
            <div id="vSphere-wrapper" style="display:">
        `;

		onVSphereChange();

		expect($("div#vSphere-wrapper").css("display")).toEqual("none");
	});

	test("SHOULD show Observability Metrics components when option checked", () => {
		document.body.innerHTML = `
            <input type="checkbox" id="vSphere" checked>
            <div id="vSphere-wrapper" style="display:none">
        `;

		onVSphereChange();

		expect($("div#vSphere-wrapper").css("display")).not.toEqual("none");
	});
});

describe("GIVEN onNodeSelectorChange function", () => {
	const nodeSelectorNoteValue = "Test nodeSelectorNote value";
	const testCSMMap = new Map([
		["nodeSelectorLabel", "node-role.kubernetes.io/control-plane:"]
	]);

	test("SHOULD show Controller Pods components when controller-pods-node-selector option checked", () => {
		document.body.innerHTML = `
            <input type="checkbox" id="controller-pods-node-selector" checked>
            <input type="checkbox" id="node-pods-node-selector">

            <div class="node-sel-attributes" style="display:none"></div>
            <input type="text" id="node-selector-label">
        `;

		onNodeSelectorChange(nodeSelectorNoteValue, testCSMMap);

		expect($(".node-sel-attributes").css("display")).not.toEqual("none");
		expect(document.getElementById("node-selector-label").value).toEqual(testCSMMap.get("nodeSelectorLabel"));
	});

	test("SHOULD show Controller Pods components when node-pods-node-selector option checked", () => {
		document.body.innerHTML = `
            <input type="checkbox" id="controller-pods-node-selector">
            <input type="checkbox" id="node-pods-node-selector" checked>

            <div class="node-sel-attributes" style="display:none"></div>
            <input type="text" id="node-selector-label">
        `;

		onNodeSelectorChange(nodeSelectorNoteValue, testCSMMap);

		expect($(".node-sel-attributes").css("display")).not.toEqual("none");
		expect(document.getElementById("node-selector-label").value).toEqual(testCSMMap.get("nodeSelectorLabel"));
	});

	test("SHOULD hide Controller Pods components when option not checked", () => {
		document.body.innerHTML = `
            <input type="checkbox" id="controller-pods-node-selector">
            <input type="checkbox" id="node-pods-node-selector">

            <div class="node-sel-attributes" style="display:"></div>
            <input type="text" id="node-selector-label">
        `;

		onNodeSelectorChange(nodeSelectorNoteValue, testCSMMap);

		expect($(".node-sel-attributes").css("display")).toEqual("none");
		expect(document.getElementById("node-selector-label").value).toEqual("");
	});
});

describe("GIVEN onCopyButtonClickHandler function", () => {
	const mockWriteText = jest.fn();
	Object.assign(navigator, {
		clipboard: {
			writeText: mockWriteText
		}
	});

	test("SHOULD invoke onCopyButtonClickHandler function", () => {
		document.body.innerHTML = `
            <div><span id="copy">Copy</span></div>
            <div><span id="command1">Test command1</span></div>
            <div><span id="command2">Test command2</span></div>
        `;

		onCopyButtonClickHandler();

		expect(mockWriteText).toHaveBeenCalled();
		expect(document.getElementById("copy").innerHTML).toEqual("Copied");
	});
});

describe("GIVEN resetImageRepository function", () => {
	const testCSMMap = new Map([
		["imageRepository", "dellemc"]
	]);

	test("SHOULD invoke resetImageRepository function", () => {
		document.body.innerHTML = `
            <input type="text" id="image-repository">
        `;

		resetImageRepository(testCSMMap);

		expect(document.getElementById("image-repository").value).toEqual("dellemc");
	});
});

describe("GIVEN resetControllerCount function", () => {
	const testCSMMap = new Map([
		["controllerCount", "2"]
	]);

	test("SHOULD invoke resetControllerCount function", () => {
		document.body.innerHTML = `
            <input type="number" id="controller-count">
        `;

		resetControllerCount(testCSMMap);

		expect(document.getElementById("controller-count").value).toEqual("2");
	});
});

describe("GIVEN resetNodeSelectorLabel function", () => {
	const testCSMMap = new Map([
		["nodeSelectorLabel", "node-role.kubernetes.io/control-plane:"]
	]);

	test("SHOULD invoke resetNodeSelectorLabel function", () => {
		document.body.innerHTML = `
            <input type="text" id="node-selector-label">
        `;

		resetNodeSelectorLabel(testCSMMap);

		expect(document.getElementById("node-selector-label").value).toEqual(testCSMMap.get("nodeSelectorLabel"));
	});
});

describe("GIVEN resetDriverNamespace function", () => {
	test("SHOULD invoke resetDriverNamespace function", () => {
		document.body.innerHTML = `
            <input type="text" id="driver-namespace">
        `;

		resetDriverNamespace("csi-powerstore");

		expect(document.getElementById("driver-namespace").value).toEqual("csi-powerstore");
	});
});

describe("GIVEN resetTaint function", () => {
	const testCSMMap = new Map([
		["taint", "node-role.kubernetes.io/control-plane"]
	]);

	test("SHOULD invoke resetTaint function", () => {
		document.body.innerHTML = `
            <input type="text" id="taint">
        `;

		resetTaint(testCSMMap);

		expect(document.getElementById("taint").value).toEqual(testCSMMap.get("taint"));
	});
});

describe("GIVEN displayModules function", () => {
	const testHtml = `
		<select id="csm-version">
			<option value="1.7.0" selected>CSM 1.7.0</option>
			<option value="1.6.0">CSM 1.6.0</option>
		</select>
		<input type="text" id="driver-namespace">
		<div class="vgsnapshot" style="display:none"></div>
		<div class="authorization" style="display:none"></div>
		<div class="observability"></div>
	`;

	test("SHOULD show expected components for csi-powerstore", () => {
		document.body.innerHTML = testHtml;

		displayModules("powerstore", CONSTANTS);

		expect($(".vgsnapshot").css("display")).toEqual("block");
		expect($(".authorization").css("display")).toEqual("none");
		expect($(".observability").css("display")).toEqual("block");
	});

	test("SHOULD show expected components for csi-powerscale", () => {
		document.body.innerHTML = testHtml;

		displayModules("powerscale", CONSTANTS);

		expect($(".authorization").css("display")).toEqual("block");
		expect($(".observability").css("display")).toEqual("block");
	});

	test("SHOULD show expected components for csi-powermax", () => {
		document.body.innerHTML = testHtml;

		displayModules("powermax", CONSTANTS);

		expect($(".vgsnapshot").css("display")).toEqual("none");
		expect($(".authorization").css("display")).toEqual("block");
		expect($(".observability").css("display")).toEqual("block");
	});

	test("SHOULD show expected components for csi-powerflex", () => {
		document.body.innerHTML = testHtml;

		displayModules("powerflex", CONSTANTS);

		expect($(".vgsnapshot").css("display")).toEqual("block");
		expect($(".authorization").css("display")).toEqual("block");
		expect($(".observability").css("display")).toEqual("block");
	});

	test("SHOULD show expected components for csi-unity", () => {
		document.body.innerHTML = testHtml;

		displayModules("unity", CONSTANTS);

		expect($(".vgsnapshot").css("display")).toEqual("none");
		expect($(".authorization").css("display")).toEqual("none");
		expect($(".observability").css("display")).toEqual("none");
	});
});

describe("GIVEN hideFields function", () => {
	test("SHOULD hide expected components", () => {
		document.body.innerHTML = `
            <div class="authAttributes" style="display:block"></div>
            <div class="node-sel-attributes" style="display:block"></div>
            <div class="replication-attributes" style="display:block"></div>
        `;

		hideFields();

		expect($(".authAttributes").css("display")).toEqual("none");
		expect($(".node-sel-attributes").css("display")).toEqual("none");
		expect($(".replication-attributes").css("display")).toEqual("none");
	});
});

describe("GIVEN displayCommands function", () => {
	const commandTitleValue = "Run the following commands to install";
	const commandNoteValue = "Ensure that the namespaces and secrets are created before installing the helm chart";
	const command1Value = "helm repo add dell https://dell.github.io/helm-charts";
	const command2Value = "helm install $release-name dell/container-storage-modules -n $namespace --version $version -f values.yaml";

	test("SHOULD show expected commands", () => {
		document.body.innerHTML = `
			<input id="array" value="powerstore">
			<input type="text" id="driver-namespace" value="csi-powerstore">
			<input type="text" id="csm-version" value="1.7.0">
            <div id="command-text-area" style="display:none">
                <div id="command-title"></div>
                <span id="command-note" style="display:none"></span>
                <span id="command1"></span>
                <span id="command2"></span>
            </div>
        `;

		displayCommands("powerstore", commandTitleValue, commandNoteValue, command1Value, command2Value, CONSTANTS);

		expect($("#command-text-area").css("display")).toEqual("block");
		expect($("#command-title").text()).toEqual("Run the following commands to install");
		expect($("#command-note").text()).toEqual("Ensure that the namespaces and secrets are created before installing the helm chart");
		expect($("#command1").text()).toEqual("helm repo add dell https://dell.github.io/helm-charts");
		expect($("#command2").text()).toEqual("helm install powerstore dell/container-storage-modules -n csi-powerstore --version 1.0.0 -f values.yaml");
	});

});

describe("SHOULD Disable/Enable Generate YAML button based on validation of input fields", () => {

	test("SHOULD disable Generate YAML button if the array is not selected ", () => {
		document.body.innerHTML = `
			<input id="array" value="">
			<input id="installation-type" value="helm">
			<input id="image-repository" value="dell">
			<input id="csm-version" value="csm-1.6.0">
			<input type="number" id="controller-count" value="1">
			<input type="text" id="driver-namespace" value="csm-driver">
        `;

		const received = validateInput(() => false, {});
		expect(received).toEqual(false);
	});

	test("SHOULD disable Generate YAML button if driver-namespace is empty", () => {
		document.body.innerHTML = `
			<input id="array" value="powerstore">
			<input id="installation-type" value="helm">
			<input id="image-repository" value="dellemc">
			<input id="csm-version" value="csm-1.6.0">
			<input type="number" id="controller-count" value="1">
			<input type="text" id="driver-namespace" value="">
        `;

		const received = validateInput(() => false, {});
		expect(received).toEqual(false);
	});

	test("SHOULD disable Generate YAML button if controller count is less than 1 ", () => {
		document.body.innerHTML = `
			<input type="number" id="controller-count" value="0">
			<input id="array" value="powerstore">
			<input id="installation-type" value="helm">
			<input id="image-repository" value="dell">
			<input id="csm-version" value="csm-1.6.0">
			<input type="text" id="driver-namespace" value="csi-powerstore">
        `;

		const received = validateInput(() => false, {});
		expect(received).toEqual(false);
	});

	test("SHOULD enable Generate YAML button only if all the required fields have valid inputs", () => {
		document.body.innerHTML = `
			<input id="array" value="powerstore">
			<input id="installation-type" value="helm">
			<input id="image-repository" value="dell">
			<input id="csm-version" value="csm-1.6.0">
			<input type="number" id="controller-count" value="1">
			<input type="text" id="driver-namespace" value="csi-powerstore">
        `;

		const received = validateInput(() => true, {});
		expect(received).toEqual(true);

	});

});
