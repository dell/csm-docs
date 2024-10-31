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
const CONSTANTS = {
	POWERSTORE: "powerstore",
	POWERSCALE: "isilon",
	POWERFLEX: "vxflexos",
	POWERMAX: "powermax",
	UNITY: "unity",
	POWERSTORE_NAMESPACE: "csi-powerstore",
	POWERFLEX_NAMESPACE: "vxflexos",
	POWERMAX_NAMESPACE: "powermax",
	POWERSCALE_NAMESPACE: "isilon",
	UNITY_NAMESPACE: "unity",
	POWERSTORE_LABEL_VALUE: "csi-powerstore",
	POWERMAX_LABEL_VALUE: "csi-powermax",
	POWERSCALE_LABEL_VALUE: "csi-isilon",
	VALUES: "values",
	TEMP_DIR: "templates",
	TEMP_EXT: ".template",
	HYPHEN: "-",
	SLASH: "/",
	VERSIONS_DIR: "csm-versions",
	CSM: "csm",
	DEFAULT_VALUES: "default-values",
	PROPERTIES: ".properties",
	HELM: "helm",
	OPERATOR: "operator",
	CSM_HELM_V170: "1.0.0",
	CSM_HELM_V180: "1.1.0",
	CSM_HELM_V193: "1.2.1",
	HELM_TAINTS: `
     - key: "$KEY"
       operator: "Exists"
       effect: "NoSchedule"
	`,
	OPERATOR_TAINTS: `
      - key: "$KEY"
        operator: "Exists"
        effect: "NoSchedule"
	`
};
