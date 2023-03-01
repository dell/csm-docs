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

const { validateForm, setMap, setDefaultValues } = require("../utility");

describe("GIVEN validateForm functions", () => {
	test("SHOULD return false IF array value is empty", () => {
		document.body.innerHTML = `
			<select id="array"></select>
			<select id="installation-type" value=""></select>
			<input type="text" id="image-repository" value="">
			<select id="csm-version"></select>
		`;

		expect(validateForm()).toBe(false);
	});

	test("SHOULD return false IF installationType value is empty", () => {
		document.body.innerHTML = `
			<select id="array" value="csi-powerstore">
				<option value="csi-powerstore">PowerStore</option>
			</select>
			<select id="installation-type"></select>
			<input type="text" id="image-repository">
			<select id="csm-version"></select>
		`;

		expect(validateForm()).toBe(false);
	});

	test("SHOULD return false IF imageRepository value is empty", () => {
		document.body.innerHTML = `
			<select id="array" value="csi-powerstore">
				<option value="csi-powerstore">PowerStore</option>
			</select>
			<select id="installation-type" value="helm">
				<option value="helm">Helm</option>
			</select>
			<input type="text" id="image-repository" value="">
			<select id="csm-version"></select>
		`;

		expect(validateForm()).toBe(false);
	});

	test("SHOULD return false IF csmVersion value is empty", () => {
		document.body.innerHTML = `
			<select id="array" value="csi-powerstore">
				<option value="csi-powerstore">PowerStore</option>
			</select>
			<select id="installation-type" value="helm">
				<option value="helm">Helm</option>
			</select>
			<input type="text" id="image-repository" value="some-value">
			<select id="csm-version"></select>
		`;

		expect(validateForm()).toBe(false);
	});

	test("SHOULD return false IF driver-namespace value is empty", () => {
		document.body.innerHTML = `
			<select id="array" value="csi-powerstore">
				<option value="csi-powerstore">PowerStore</option>
			</select>
			<select id="installation-type" value="helm">
				<option value="helm">Helm</option>
			</select>
			<input type="text" id="image-repository" value="some-value">
			<select id="csm-version" value="1.4.0">
				<option value="1.4.0" selected>CSM 1.4</option>
			</select>
			<input type="text" id="driver-namespace">
		`;

		expect(validateForm()).toBe(false);
	});

	test("SHOULD return false IF module-namespace value is empty", () => {
		document.body.innerHTML = `
			<select id="array" value="csi-powerstore">
				<option value="csi-powerstore">PowerStore</option>
			</select>
			<select id="installation-type" value="helm">
				<option value="helm">Helm</option>
			</select>
			<input type="text" id="image-repository" value="some-value">
			<select id="csm-version" value="1.4.0">
				<option value="1.4.0" selected>CSM 1.4</option>
			</select>
			<input type="text" id="driver-namespace" value="temp-value">
			<input type="text" id="module-namespace">
		`;

		expect(validateForm()).toBe(false);
	});

	test("SHOULD return false IF controller-count value is empty", () => {
		document.body.innerHTML = `
			<select id="array" value="csi-powerstore">
				<option value="csi-powerstore">PowerStore</option>
			</select>
			<select id="installation-type" value="helm">
				<option value="helm">Helm</option>
			</select>
			<input type="text" id="image-repository" value="some-value">
			<select id="csm-version" value="1.4.0">
				<option value="1.4.0" selected>CSM 1.4</option>
			</select>
			<input type="text" id="driver-namespace" value="temp-value">
			<input type="text" id="module-namespace" value="temp-value">
			<input type="number" id="controller-count">
		`;

		expect(validateForm()).toBe(false);
	});

	const powermaxTestHtml = `
		<select id="array" value="powermax">
			<option value="powermax">PowerMax</option>
		</select>
		<select id="installation-type" value="helm">
			<option value="helm">Helm</option>
		</select>
		<input type="text" id="image-repository" value="some-value">
		<select id="csm-version" value="1.4.0">
			<option value="1.4.0" selected>CSM 1.4</option>
		</select>
		<input type="text" id="driver-namespace" value="temp-value">
		<input type="text" id="module-namespace" value="temp-value">
		<input type="number" id="controller-count" value="1">
		<input type="text" id="storage-array-id">
		<input type="text" id="storage-array-endpoint-url">
		<input type="text" id="storage-array-backup-endpoint-url">
		<input type="text" id="cluster-prefix">
		<input type="checkbox" id="vSphere">
		<input type="text" id="vSphere-fc-port-group">
		<input type="text" id="vSphere-fc-host-name">
		<input type="text" id="vSphere-vCenter-host">
		<input type="text" id="vSphere-vCenter-cred-secret">
	`;

	const CONSTANT_PARAM = {
		POWERMAX: "powermax"
	};

	test("SHOULD return false IF storage-array-id value is empty", () => {
		document.body.innerHTML = powermaxTestHtml;

		expect(validateForm(CONSTANT_PARAM)).toBe(false);
	});

	test("SHOULD return false IF storage-array-endpoint-url value is empty", () => {
		document.body.innerHTML = powermaxTestHtml;
		document.getElementById('storage-array-id').value = "test-value";

		expect(validateForm(CONSTANT_PARAM)).toBe(false);
	});

	test("SHOULD return false IF cluster-prefix value is empty", () => {
		document.body.innerHTML = powermaxTestHtml;
		document.getElementById('storage-array-id').value = "test-value";
		document.getElementById('storage-array-endpoint-url').value = "test-value";
		document.getElementById('storage-array-backup-endpoint-url').value = "test-value";

		expect(validateForm(CONSTANT_PARAM)).toBe(false);
	});

	test("SHOULD return true IF vSphere value is unchecked", () => {
		document.body.innerHTML = powermaxTestHtml;
		document.getElementById('storage-array-id').value = "test-value";
		document.getElementById('storage-array-endpoint-url').value = "test-value";
		document.getElementById('storage-array-backup-endpoint-url').value = "test-value";
		document.getElementById('cluster-prefix').value = "test-value";

		expect(validateForm(CONSTANT_PARAM)).toBe(true);
	});

	test("SHOULD return false IF vSphere value is checked AND vSphere-fc-port-group value is empty", () => {
		document.body.innerHTML = powermaxTestHtml;
		document.getElementById('storage-array-id').value = "test-value";
		document.getElementById('storage-array-endpoint-url').value = "test-value";
		document.getElementById('storage-array-backup-endpoint-url').value = "test-value";
		document.getElementById('cluster-prefix').value = "test-value";
		$("#vSphere").prop('checked', true);

		expect(validateForm(CONSTANT_PARAM)).toBe(false);
	});

	test("SHOULD return false IF vSphere value is checked AND vSphere-fc-host-name value is empty", () => {
		document.body.innerHTML = powermaxTestHtml;
		document.getElementById('storage-array-id').value = "test-value";
		document.getElementById('storage-array-endpoint-url').value = "test-value";
		document.getElementById('storage-array-backup-endpoint-url').value = "test-value";
		document.getElementById('cluster-prefix').value = "test-value";
		$("#vSphere").prop('checked', true);
		document.getElementById('vSphere-fc-port-group').value = "test-value";

		expect(validateForm(CONSTANT_PARAM)).toBe(false);
	});

	test("SHOULD return false IF vSphere value is checked AND vSphere-vCenter-host value is empty", () => {
		document.body.innerHTML = powermaxTestHtml;
		document.getElementById('storage-array-id').value = "test-value";
		document.getElementById('storage-array-endpoint-url').value = "test-value";
		document.getElementById('storage-array-backup-endpoint-url').value = "test-value";
		document.getElementById('cluster-prefix').value = "test-value";
		$("#vSphere").prop('checked', true);
		document.getElementById('vSphere-fc-port-group').value = "test-value";
		document.getElementById('vSphere-fc-host-name').value = "test-value";

		expect(validateForm(CONSTANT_PARAM)).toBe(false);
	});

	test("SHOULD return false IF vSphere value is checked AND vSphere-vCenter-cred-secret value is empty", () => {
		document.body.innerHTML = powermaxTestHtml;
		document.getElementById('storage-array-id').value = "test-value";
		document.getElementById('storage-array-endpoint-url').value = "test-value";
		document.getElementById('storage-array-backup-endpoint-url').value = "test-value";
		document.getElementById('cluster-prefix').value = "test-value";
		$("#vSphere").prop('checked', true);
		document.getElementById('vSphere-fc-port-group').value = "test-value";
		document.getElementById('vSphere-fc-host-name').value = "test-value";
		document.getElementById('vSphere-vCenter-host').value = "test-value";

		expect(validateForm(CONSTANT_PARAM)).toBe(false);
	});

	test("SHOULD return false IF vSphere value is checked AND all required values are non-empty", () => {
		document.body.innerHTML = powermaxTestHtml;
		document.getElementById('storage-array-id').value = "test-value";
		document.getElementById('storage-array-endpoint-url').value = "test-value";
		document.getElementById('storage-array-backup-endpoint-url').value = "test-value";
		document.getElementById('cluster-prefix').value = "test-value";
		$("#vSphere").prop('checked', true);
		document.getElementById('vSphere-fc-port-group').value = "test-value";
		document.getElementById('vSphere-fc-host-name').value = "test-value";
		document.getElementById('vSphere-vCenter-host').value = "test-value";
		document.getElementById('vSphere-vCenter-cred-secret').value = "test-value";

		expect(validateForm(CONSTANT_PARAM)).toBe(true);
	});
});

describe("GIVEN setMap function", () => {
	test("SHOULD create map from given filled string", () => {
		const receivedMap = setMap("firstKey=firstValue\r\nsecondKey=secondValue\r\nthirdKey=thirdValue");
		const expectedMap = new Map([
			["firstKey", "firstValue"],
			["secondKey", "secondValue"],
			["thirdKey", "thirdValue"]
		]);

		expect(receivedMap).toEqual(expectedMap);
	});

	test("SHOULD create map from given empty string", () => {
		const receivedMap = setMap("");
		const expectedMap = new Map([["", undefined]]);

		expect(receivedMap).toEqual(expectedMap);
	});
});

describe("GIVEN setDefaultValues function", () => {
	test("SHOULD fill values in dom", () => {
		document.body.innerHTML = `
			<input type="text" id="image-repository">
			<input type="number" id="controller-count">
			<select id="csm-version">
				<option value="" selected>Select the CSM version</option>
				<option value="1.4.0">CSM 1.4</option>
			</select>
		`;

		const testCSMMap = new Map([
			["csmVersion", "1.4.0"],
			["imageRepository", "dellemc"],
			["controllerCount", "2"]
		]);

		setDefaultValues("csmVersion=1.4.0\r\nimageRepository=dellemc\r\ncontrollerCount=2", testCSMMap);

		expect(document.getElementById("image-repository").value).toEqual("dellemc");
		expect(document.getElementById("controller-count").value).toEqual("2");
		expect(document.getElementById("csm-version").value).toEqual("1.4.0");
	});
});
