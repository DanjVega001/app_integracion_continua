# Jenkins LTS (Java 21) + cliente Docker + plugins preinstalados
FROM jenkins/jenkins:lts-jdk21
USER root
# Cliente Docker y plugin buildx copiados desde la imagen oficial docker:cli
COPY --from=docker:cli /usr/local/bin/docker /usr/local/bin/docker
COPY --from=docker:cli /usr/local/libexec/docker/cli-plugins/docker-buildx /usr/local/libexec/docker/cli-plugins/docker-buildx
# Plugin compose: el Jenkinsfile construye y prueba con "docker compose"
COPY --from=docker:cli /usr/local/libexec/docker/cli-plugins/docker-compose /usr/local/libexec/docker/cli-plugins/docker-compose
USER jenkins
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt
COPY jenkins.yaml /usr/share/jenkins/ref/casc/jenkins.yaml
# El repositorio local montado en /repo-local pertenece a otro usuario
RUN git config --global --add safe.directory '*'
ENV CASC_JENKINS_CONFIG=/var/jenkins_home/casc/jenkins.yaml
