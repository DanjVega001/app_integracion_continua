# Jenkins LTS (Java 21) + cliente Docker + plugins preinstalados
FROM jenkins/jenkins:lts-jdk21
USER root

# Cliente Docker CLI (docker, buildx, compose)
COPY --from=docker:cli /usr/local/bin/docker /usr/local/bin/docker
COPY --from=docker:cli /usr/local/libexec/docker/cli-plugins/docker-buildx /usr/local/libexec/docker/cli-plugins/docker-buildx
COPY --from=docker:cli /usr/local/libexec/docker/cli-plugins/docker-compose /usr/local/libexec/docker/cli-plugins/docker-compose

# gosu: permite al entrypoint correr como root y luego bajar a jenkins
RUN apt-get update && apt-get install -y --no-install-recommends gosu \
    && rm -rf /var/lib/apt/lists/*

# Plugins y configuración de Jenkins (se instalan como jenkins)
USER jenkins
COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt
COPY jenkins.yaml /usr/share/jenkins/ref/casc/jenkins.yaml
RUN git config --global --add safe.directory '*'
ENV CASC_JENKINS_CONFIG=/var/jenkins_home/casc/jenkins.yaml

# Entrypoint: detecta el GID del socket de Docker y lo asigna a jenkins
USER root
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["/usr/bin/tini", "--", "/usr/local/bin/docker-entrypoint.sh"]
