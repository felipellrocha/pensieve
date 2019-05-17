const k8s = require("@kubernetes/client-node");

/*

const patch: any = { spec: { replicas: 0 } };
*/

class PatchedAppsV1Api extends k8s.Core_v1Api {
  patchApiCall(patchOperation) {
    const oldDefaultHeaders = this.defaultHeaders;
    this.defaultHeaders = {
      "Content-Type": "application/json-patch+json",
      ...this.defaultHeaders
    };
    const returnValue = patchOperation();
    this.defaultHeaders = oldDefaultHeaders;
    return returnValue;
  }

  patchService(name, namespace, patch) {
    const patchDeploymentOperation = () =>
      this.patchNamespacedService(name, namespace, patch);
    return this.patchApiCall(patchDeploymentOperation);
  }
}

module.exports = PatchedAppsV1Api;
