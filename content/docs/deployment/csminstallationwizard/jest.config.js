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
	testEnvironment: "jsdom"
};
