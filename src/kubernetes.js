const k8s = require("@kubernetes/client-node");

const PatchedCoreV1Api = require("./patch");
const newEnvironment = require("./deployment");

class Kubernetes {
  constructor(namespace) {
    const kc = new k8s.KubeConfig();
    kc.loadFromDefault();

    this.namespace = namespace;
    this.v1 = kc.makeApiClient(k8s.Core_v1Api);
    this.beta = kc.makeApiClient(k8s.Apps_v1beta1Api);
    this.patched = kc.makeApiClient(PatchedCoreV1Api);
    this.watcher = new k8s.Watch(kc);
  }

  getService = async name => {
    const res = await this.v1.listNamespacedService(this.namespace);

    for (let service of res.body.items) {
      if (service && service.metadata && service.metadata.name === name)
        return service;
    }

    return null;
  };

  getPod = async name => {
    const res = await this.v1.listNamespacedPod(this.namespace);

    for (let pod of res.body.items) {
      if (pod && pod.metadata && pod.metadata.name.startsWith(name)) return pod;
    }

    return null;
  };

  waitForPodInit = name => {
    const { watcher, namespace } = this;

    return new Promise(function(resolve, reject) {
      const t = watcher.watch(
        `/api/v1/namespaces/${namespace}/pods`,
        {},
        (phase, obj) => {
          if (
            phase === "MODIFIED" &&
            (obj &&
              obj.metadata &&
              obj.metadata.labels &&
              obj.metadata.labels.name === name) &&
            (obj && obj.status && obj.status.phase === "Running")
          ) {
            t.abort();
            return resolve(obj.metadata.name);
          }
        }
      );
    });
  };

  reselectService = (name, selector) => {
    const patch = [
      {
        op: "replace",
        path: "/spec/selector",
        value: selector
      }
    ];

    return this.patched.patchService(name, this.namespace, patch);
  };

  createDeployment = config => {
    const environment = newEnvironment(config);
    return this.beta.createNamespacedDeployment(this.namespace, environment);
  };

  deleteDeployment = name => {
    return this.beta.deleteNamespacedDeployment(name, this.namespace, true, {
      propagationPolicy: "Foreground"
    });
  };
}
module.exports = Kubernetes;
