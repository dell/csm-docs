// Copyright © 2023 Dell Inc. or its subsidiaries. All Rights Reserved.

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//      http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
module.exports = {
	// Automatically clear mock calls, instances, contexts and results before every test
	clearMocks: true,

	// Indicates whether the coverage information should be collected while executing the test
	collectCoverage: true,

	// The directory where Jest should output its coverage files
	coverageDirectory: "coverage",

	// Indicates which provider should be used to instrument code for coverage
	coverageProvider: "v8",

	// The paths to modules that run some code to configure or set up the testing environment before each test
	setupFiles: ["./jest.setup.js"],

	// The test environment that will be used for testing
	testEnvironment: "jsdom",

	reporters: [
		'default',
		['jest-junit', {outputDirectory: 'reports', outputName: 'report.xml'}],
	]
};
