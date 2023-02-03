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
} = require('../ui-functions');

const CONSTANTS = {
	POWERSTORE: "csi-powerstore",
	POWERSCALE: "csi-powerscale",
	POWERFLEX: "csi-powerflex",
	POWERMAX: "csi-powermax",
	UNITY: "csi-unity",
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

describe("GIVEN onAuthorizationChange function", () => {
	test("SHOULD hide authorization components when option not checked", () => {
		document.body.innerHTML = `
            <input type="checkbox" id="authorization">
            <input type="checkbox" id="authorization-skip-cert-validation" style="display:">
            <label for="authorization-skip-cert-validation" style="display:"></label>
        `;

		onAuthorizationChange();

		expect($("label[for=authorization-skip-cert-validation]").css("display")).toEqual("none");
		expect($("input#authorization-skip-cert-validation").css("display")).toEqual("none");
	});

	test("SHOULD show authorization components when option checked", () => {
		document.body.innerHTML = `
            <input type="checkbox" id="authorization" checked>
            <input type="checkbox" id="authorization-skip-cert-validation" style="display:none">
            <label for="authorization-skip-cert-validation" style="display:none"></label>
        `;

		onAuthorizationChange();

		expect($("label[for=authorization-skip-cert-validation]").css("display")).not.toEqual("none");
		expect($("input#authorization-skip-cert-validation").css("display")).not.toEqual("none");
	});
});

describe("GIVEN onObservabilityChange function", () => {
	test("SHOULD hide Observability Metrics components when option not checked", () => {
		document.body.innerHTML = `
            <input type="checkbox" id="observability">
            <input type="checkbox" id="observability-metrics" style="display:">
            <label for="observability-metrics" style="display:"></label>
        `;

		onObservabilityChange();

		expect($("label[for=observability-metrics]").css("display")).toEqual("none");
		expect($("input#observability-metrics").css("display")).toEqual("none");
	});

	test("SHOULD show Observability Metrics components when option checked", () => {
		document.body.innerHTML = `
            <input type="checkbox" id="observability" checked>
            <input type="checkbox" id="observability-metrics" style="display:none">
            <label for="observability-metrics" style="display:none"></label>
        `;

		onObservabilityChange();

		expect($("label[for=observability-metrics]").css("display")).not.toEqual("none");
		expect($("input#observability-metrics").css("display")).not.toEqual("none");
	});
});

describe("GIVEN singleNamespaceCheck function", () => {
	test("SHOULD hide namespace components when option checked", () => {
		document.body.innerHTML = `
            <input type="checkbox" id="single-namespace" checked>
            <label for="driver-namespace" style="display:"></label>
            <input type="text" id="driver-namespace">
            <label for="module-namespace" style="display:"></label>
            <input type="text" id="module-namespace">
            <a id="reset-driver-namespace"></a>
            <a id="reset-module-namespace"></a>
        `;

		singleNamespaceCheck();

		expect($("label[for=driver-namespace]").css("display")).toEqual("none");
		expect($("input#driver-namespace").css("display")).toEqual("none");
		expect($("label[for=module-namespace]").css("display")).toEqual("none");
		expect($("input#module-namespace").css("display")).toEqual("none");
		expect($("#reset-driver-namespace").css("display")).toEqual("none");
		expect($("#reset-module-namespace").css("display")).toEqual("none");
	});

	test("SHOULD show namespace components when option not checked", () => {
		document.body.innerHTML = `
            <input type="checkbox" id="single-namespace">
            <label for="driver-namespace" style="display:none"></label>
            <input type="text" id="driver-namespace" style="display:none">
            <label for="module-namespace" style="display:none"></label>
            <input type="text" id="module-namespace" style="display:none">
            <a id="reset-driver-namespace" style="display:none"></a>
            <a id="reset-module-namespace" style="display:none"></a>
        `;

		singleNamespaceCheck();

		expect($("label[for=driver-namespace]").css("display")).not.toEqual("none");
		expect($("input#driver-namespace").css("display")).not.toEqual("none");
		expect($("label[for=module-namespace]").css("display")).not.toEqual("none");
		expect($("input#module-namespace").css("display")).not.toEqual("none");
		expect($("#reset-driver-namespace").css("display")).not.toEqual("none");
		expect($("#reset-module-namespace").css("display")).not.toEqual("none");
	});
});

describe("GIVEN onNodeSelectorChange function", () => {
	const nodeSelectorNoteValue = "Test nodeSelectorNote value";
	const testCSMMap = new Map([["nodeSelectorLabel", "node-role.kubernetes.io/control-plane:"]]);

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
	const testCSMMap = new Map([["imageRepository", "dellemc"]]);

	test("SHOULD invoke resetImageRepository function", () => {
		document.body.innerHTML = `
            <input type="text" id="image-repository">
        `;

		resetImageRepository(testCSMMap);

		expect(document.getElementById("image-repository").value).toEqual("dellemc");
	});
});

describe("GIVEN resetControllerCount function", () => {
	const testCSMMap = new Map([["controllerCount", "2"]]);

	test("SHOULD invoke resetControllerCount function", () => {
		document.body.innerHTML = `
            <input type="number" id="controller-count">
        `;

		resetControllerCount(testCSMMap);

		expect(document.getElementById("controller-count").value).toEqual("2");
	});
});

describe("GIVEN resetNodeSelectorLabel function", () => {
	const testCSMMap = new Map([["nodeSelectorLabel", "node-role.kubernetes.io/control-plane:"]]);

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

describe("GIVEN resetModuleNameSpace function", () => {
	test("SHOULD invoke resetModuleNameSpace function", () => {
		document.body.innerHTML = `
            <input type="text" id="module-namespace">
        `;

		resetModuleNameSpace("csm-module");

		expect(document.getElementById("module-namespace").value).toEqual("csm-module");
	});
});

describe("GIVEN downloadFile function", () => {
	test("SHOULD return false if validate function returns false", () => {
		const received = downloadFile(() => false)

		expect(received).toEqual(false);
	});
});

describe("GIVEN displayModules function", () => {
	test("SHOULD show expected components for csi-powerstore", () => {
		document.body.innerHTML = `
            <div class="vgsnapshot" style="display:none"></div>
            <div class="authorization" style="display:none"></div>
            <div class="observability" style="display:none"></div>
            <div class="appMobility" style="display:none"></div>
        `;

		displayModules("csi-powerstore", CONSTANTS);

		expect($(".vgsnapshot").css("display")).toEqual("block");
		expect($(".authorization").css("display")).toEqual("none");
		expect($(".observability").css("display")).toEqual("block");
		expect($(".appMobility").css("display")).toEqual("block");
	});

	test("SHOULD show expected components for csi-powerscale", () => {
		document.body.innerHTML = `
            <div class="vgsnapshot" style="display:none"></div>
            <div class="authorization" style="display:none"></div>
            <div class="observability" style="display:none"></div>
            <div class="appMobility" style="display:none"></div>
        `;

		displayModules("csi-powerscale", CONSTANTS);

		expect($(".vgsnapshot").css("display")).toEqual("block");
		expect($(".authorization").css("display")).toEqual("block");
		expect($(".observability").css("display")).toEqual("block");
		expect($(".appMobility").css("display")).toEqual("block");
	});

	test("SHOULD show expected components for csi-powermax", () => {
		document.body.innerHTML = `
            <div class="vgsnapshot" style="display:none"></div>
            <div class="authorization" style="display:none"></div>
            <div class="observability" style="display:none"></div>
            <div class="appMobility" style="display:none"></div>
        `;

		displayModules("csi-powermax", CONSTANTS);

		expect($(".vgsnapshot").css("display")).toEqual("none");
		expect($(".authorization").css("display")).toEqual("block");
		expect($(".observability").css("display")).toEqual("none");
		expect($(".appMobility").css("display")).toEqual("none");
	});

	test("SHOULD show expected components for csi-powerflex", () => {
		document.body.innerHTML = `
            <div class="vgsnapshot" style="display:none"></div>
            <div class="authorization" style="display:none"></div>
            <div class="observability" style="display:none"></div>
            <div class="appMobility" style="display:none"></div>
        `;

		displayModules("csi-powerflex", CONSTANTS);

		expect($(".vgsnapshot").css("display")).toEqual("block");
		expect($(".authorization").css("display")).toEqual("block");
		expect($(".observability").css("display")).toEqual("block");
		expect($(".appMobility").css("display")).toEqual("block");
	});

	test("SHOULD show expected components for csi-unity", () => {
		document.body.innerHTML = `
            <div class="vgsnapshot" style="display:none"></div>
            <div class="authorization" style="display:none"></div>
            <div class="observability" style="display:none"></div>
            <div class="appMobility" style="display:none"></div>
        `;

		displayModules("csi-unity", CONSTANTS);

		expect($(".vgsnapshot").css("display")).toEqual("block");
		expect($(".authorization").css("display")).toEqual("block");
		expect($(".observability").css("display")).toEqual("block");
		expect($(".appMobility").css("display")).toEqual("block");
	});
});

describe("GIVEN hideFields function", () => {
	test("SHOULD hide expected components", () => {
		document.body.innerHTML = `
            <div class="authAttributes" style="display:block"></div>
            <div class="node-sel-attributes" style="display:block"></div>
            <div class="replication-attributes" style="display:block"></div>
            <input type="checkbox" id="authorization-skip-cert-validation" style="display:block">
            <label for="authorization-skip-cert-validation" title="" style="display:block"></label>
            <input type="checkbox" id="observability-metrics" style="display:block">
            <label for="observability-metrics" title="" style="display:block"></label>
        `;

		hideFields();

		expect($(".authAttributes").css("display")).toEqual("none");
		expect($(".node-sel-attributes").css("display")).toEqual("none");
		expect($(".replication-attributes").css("display")).toEqual("none");
		expect($("label[for=authorization-skip-cert-validation]").css("display")).toEqual("none");
		expect($("input#authorization-skip-cert-validation").css("display")).toEqual("none");
		expect($("label[for=observability-metrics]").css("display")).toEqual("none");
		expect($("input#observability-metrics").css("display")).toEqual("none");
	});
});

describe("GIVEN displayCommands function", () => {
	const commandTitleValue = "Run the following commands to install";
	const commandNoteValue = "Ensure that the namespaces and secrets are created before installing the helm chart";
	const command1Value = "helm repo add dell https://chaganti-rajitha.github.io/csm-installation/charts/pkg";
	const command2Value = "helm install $driver  dell/csm-drivers-modules -n [namespace] -f values.yaml";
	const command3Value = "helm install $driver  dell/csm-drivers-modules -f values.yaml";
	test("SHOULD show expected commands", () => {
		document.body.innerHTML = `
            <input type="text" id="driver-namespace" value="csi-powerstore">
            <input type="checkbox" id="single-namespace" value="">

            <div id="command-text-area" style="display:none">
                <div id="command-title"></div>
                <span id="command-note" style="display:none"></span>
                <span id="command1"></span>
                <span id="command2"></span>
            </div>
        `;

		displayCommands("csi-powerstore", commandTitleValue, commandNoteValue, command1Value, command2Value, command3Value);

		expect($("#command-text-area").css("display")).toEqual("block");
		expect($("#command-title").text()).toEqual("Run the following commands to install");
		expect($("#command-note").text()).toEqual("Ensure that the namespaces and secrets are created before installing the helm chart");
		expect($("#command1").text()).toEqual("helm repo add dell https://chaganti-rajitha.github.io/csm-installation/charts/pkg");
		expect($("#command2").text()).toEqual("helm install csi-powerstore  dell/csm-drivers-modules -f values.yaml");
	});

	test("SHOULD show expected commands for singleNamespace", () => {
		document.body.innerHTML = `
            <input type="text" id="driver-namespace" value="csi-powerstore">
            <input type="checkbox" id="single-namespace" checked>

            <div id="command-text-area" style="display:none">
                <div id="command-title"></div>
                <span id="command-note" style="display:none"></span>
                <span id="command1"></span>
                <span id="command2"></span>
            </div>
        `;

		displayCommands("csi-powerstore", commandTitleValue, commandNoteValue, command1Value, command2Value, command3Value);

		expect($("#command-text-area").css("display")).toEqual("block");
		expect($("#command-title").text()).toEqual("Run the following commands to install");
		expect($("#command-note").text()).toEqual("Ensure that the namespaces and secrets are created before installing the helm chart");
		expect($("#command1").text()).toEqual("helm repo add dell https://chaganti-rajitha.github.io/csm-installation/charts/pkg");
		expect($("#command2").text()).toEqual("helm install csi-powerstore  dell/csm-drivers-modules -n [namespace] -f values.yaml");
	});
});
