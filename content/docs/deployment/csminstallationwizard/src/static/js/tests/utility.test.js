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

	test("SHOULD return true IF all values are non-empty", () => {
		document.body.innerHTML = `
			<select id="array" value="csi-powerstore">
				<option value="csi-powerstore">PowerStore</option>
			</select>
			<select id="installation-type" value="helm">
				<option value="helm">Helm</option>
			</select>
			<input type="text" id="image-repository" value="some-value">
			<select id="csm-version">
				<option value="1.4.0">CSM 1.4</option>
			</select>
		`;

		expect(validateForm()).toBe(true);
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
