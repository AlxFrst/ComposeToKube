const fs = require('fs');
const path = require('path');
const yaml = require('yaml');
const ejs = require('ejs');

// Vérifiez si le chemin du fichier docker-compose.yml a été passé en argument
if (process.argv.length < 3) {
    console.error('Usage: node converter.js <path-to-docker-compose.yml>');
    process.exit(1);
}

const dockerComposePath = process.argv[2];

// Lire et parser le fichier docker-compose.yml
const dockerComposeContent = fs.readFileSync(dockerComposePath, 'utf8');
const dockerCompose = yaml.parse(dockerComposeContent);

const outputDir = './k8s-deployments';

// Fonction utilitaire pour générer des noms valides pour les volumes
const sanitizeName = (name) => {
    return name.replace(/[^\w-]/g, '');
};

// Modèle EJS pour les déploiements Kubernetes
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

// Créer le répertoire de sortie s'il n'existe pas
if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
}

// Générer les fichiers de déploiement pour chaque service
Object.entries(dockerCompose.services).forEach(([serviceName, service]) => {
    const serviceDir = path.join(outputDir, serviceName);
    if (!fs.existsSync(serviceDir)) {
        fs.mkdirSync(serviceDir);
    }

    const deploymentYaml = ejs.render(deploymentTemplate, { serviceName, service, sanitizeName }).trim();
    const serviceYaml = ejs.render(serviceTemplate, { serviceName, service }).trim();

    // Écrire les fichiers de déploiement et de service
    fs.writeFileSync(path.join(serviceDir, `${serviceName}-deployment.yaml`), deploymentYaml);
    fs.writeFileSync(path.join(serviceDir, `${serviceName}-service.yaml`), serviceYaml);

    // Générer et écrire les fichiers PVC pour chaque volume
    if (service.volumes) {
        service.volumes.forEach(volume => {
            const pvcName = sanitizeName(volume.split(':')[0]);
            const pvcYaml = ejs.render(pvcTemplate, { pvcName, storageClass: 'standard' }).trim();
            fs.writeFileSync(path.join(serviceDir, `${pvcName}-pvc.yaml`), pvcYaml);
        });
    }
});

console.log('Kubernetes deployment files generated successfully.');
