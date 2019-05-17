const process = require("process");

module.exports = ({
  image,
  name,
  port = [{}],
  instance,
  directory,
  env = [{}],
  ports
} = {}) => ({
  apiVersion: "apps/v1beta1",
  kind: "Deployment",
  metadata: {
    name: `${name}-${instance}`,
    labels: {
      name: `${name}-${instance}`
    }
  },
  spec: {
    replicas: 1,
    selector: {
      matchLabels: {
        name: `${name}-${instance}`,
        instance
      }
    },
    template: {
      metadata: {
        labels: {
          name: `${name}-${instance}`,
          instance
        }
      },
      spec: {
        volumes: [
          {
            name: "localdev",
            nfs: {
              server: "192.168.99.1",
              path: directory
            }
          }
        ],
        containers: [
          {
            name,
            image,
            imagePullPolicy: "Always",
            volumeMounts: [
              {
                name: "localdev",
                mountPath: "/opt/app"
              }
            ],
            env,
            ports,
            livenessProbe: {
              exec: {
                command: ["touch", "/tmp/healthy"]
              }
            },
            readinessProbe: {
              exec: {
                command: ["touch", "/tmp/healthy"]
              }
            },
            resources: {}
          }
        ]
      }
    }
  }
});
