FROM maven:3.5.2-jdk-8-alpine AS MAVEN_TOOL_CHAIN
COPY pom.xml /tmp/
COPY src /tmp/src/
WORKDIR /tmp/
RUN mvn package

FROM openjdk:8-jre-alpine

ENV GITHUB_TOKEN=passed-from-env-file
ENV LANG=java
ENV DISABLE_ALL_OUTPUTS=true
ENV REPO_DIR=.

COPY --from=MAVEN_TOOL_CHAIN /tmp/target/codeshovel-webservice-0.1.0.jar /app.war

RUN mkdir cache

# For testing
CMD ["/usr/bin/java", "-Xmx60m", "-jar", "/app.war"]
# Correct
#CMD ["/usr/bin/java", "-Xmx4096m", "-jar", "/app.war"]
