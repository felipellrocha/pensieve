const process = require('process');

module.exports = ({
  image,
  name,
  instance,
  directory,
  volumes = [{}],
  volumeMounts = [{}],
  port = [{}],
  env = [{}],
  ports,
} = {}) => ({
  apiVersion: 'apps/v1beta1',
  kind: 'Deployment',
  metadata: {
    name: `${name}-${instance}`,
    labels: {
      name: `${name}-${instance}`,
      development: 'pensieve',
    },
  },
  spec: {
    replicas: 1,
    selector: {
      matchLabels: {
        name: `${name}-${instance}`,
        instance,
      },
    },
    template: {
      metadata: {
        labels: {
          name: `${name}-${instance}`,
          instance,
        },
      },
      spec: {
        volumes: [
          ...volumes,
          {
            name: 'localdev',
            nfs: {
              // virtualbox - minikube
              //server: '192.168.99.1',
              // virtualbox - hyperkit
              server: '192.168.64.1',
              //              server: 'docker.for.mac.localhost',
              path: directory,
            },
          },
        ],
        containers: [
          {
            name,
            image,
            imagePullPolicy: 'Always',
            securityContext: {
              privileged: true,
            },
            volumeMounts: [
              ...volumeMounts,
              {
                name: 'localdev',
                mountPath: '/opt/app',
              },
            ],
            env,
            ports,
            livenessProbe: {
              exec: {
                command: ['touch', '/tmp/healthy'],
              },
            },
            readinessProbe: {
              exec: {
                command: ['touch', '/tmp/healthy'],
              },
            },
            resources: {},
          },
        ],
      },
    },
  },
});
