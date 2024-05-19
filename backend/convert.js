// backend/convert.js
const fs = require('fs');
const yaml = require('yaml');
const ejs = require('ejs');

const deploymentTemplate = `
apiVersion: apps/v1
kind: Deployment
metadata:
  name: <%= serviceName %>
spec:
  replicas: 1
  selector:
    matchLabels:
      app: <%= serviceName %>
  template:
    metadata:
      labels:
        app: <%= serviceName %>
    spec:
      containers:
        - name: <%= serviceName %>
          image: <%= service.image %>
          <% if (service.environment) { %>
          env:<% service.environment.forEach(envVar => { %>
            - name: <%= envVar.split('=')[0] %>
              value: "<%= envVar.split('=')[1] %>"<% }) %>
          <% } %>
          <% if (service.ports) { %>
          ports:<% service.ports.forEach(port => { %>
            - containerPort: <%= port.split(":")[1].split('/')[0] %><% }) %>
          <% } %>
          <% if (service.volumes) { %>
          volumeMounts:<% service.volumes.forEach(volume => { %>
            - mountPath: <%= volume.split(':')[1] %>
              name: <%= sanitizeName(volume.split(':')[0]) %><% }) %>
          <% } %>
      <% if (service.volumes) { %>
      volumes:<% service.volumes.forEach(volume => { %>
        - name: <%= sanitizeName(volume.split(':')[0]) %>
          persistentVolumeClaim:
            claimName: <%= sanitizeName(volume.split(':')[0]) %>-pvc<% }) %>
      <% } %>
`.replace(/^\s*$(?:\r\n?|\n)/gm, ""); // Supprime les lignes vides

const serviceTemplate = `
apiVersion: v1
kind: Service
metadata:
  name: <%= serviceName %>
spec:
  selector:
    app: <%= serviceName %>
  <% if (service.ports) { %>
  ports:<% service.ports.forEach(port => { %>
    - protocol: TCP
      port: <%= port.split(":")[0] %>
      targetPort: <%= port.split(":")[1].split('/')[0] %><% }) %>
  <% } %>
  type: ClusterIP
`.replace(/^\s*$(?:\r\n?|\n)/gm, ""); // Supprime les lignes vides

const pvcTemplate = `
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: <%= pvcName %>-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi
  storageClassName: <%= storageClass %>
`.replace(/^\s*$(?:\r\n?|\n)/gm, ""); // Supprime les lignes vides

const sanitizeName = (name) => {
    return name.replace(/[^\w-]/g, '');
};

function convertDockerComposeToK8s(dockerComposeContent) {
    const dockerCompose = yaml.parse(dockerComposeContent);
    const output = {};

    Object.entries(dockerCompose.services).forEach(([serviceName, service]) => {
        const serviceDir = serviceName;
        output[serviceDir] = {};

        const deploymentYaml = ejs.render(deploymentTemplate, { serviceName, service, sanitizeName }).trim();
        const serviceYaml = ejs.render(serviceTemplate, { serviceName, service }).trim();

        output[serviceDir][`${serviceName}-deployment.yaml`] = deploymentYaml;
        output[serviceDir][`${serviceName}-service.yaml`] = serviceYaml;

        if (service.volumes) {
            service.volumes.forEach(volume => {
                const pvcName = sanitizeName(volume.split(':')[0]);
                const pvcYaml = ejs.render(pvcTemplate, { pvcName, storageClass: 'standard' }).trim();
                output[serviceDir][`${pvcName}-pvc.yaml`] = pvcYaml;
            });
        }
    });

    return output;
}

module.exports = { convertDockerComposeToK8s };
