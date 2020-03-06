FROM node:10-alpine AS App

WORKDIR /tmp
COPY app/ ./
RUN yarn install && \
    yarn build

FROM maven:3.5.2-jdk-8-alpine AS MAVEN_TOOL_CHAIN
WORKDIR /tmp
COPY pom.xml ./
COPY src/main/java /tmp/src/main/java
COPY --from=App /tmp/build /tmp/src/main/resources/public
RUN mvn package

FROM openjdk:8-jre-alpine
ENV LANG=java
ENV DISABLE_ALL_OUTPUTS=true
ENV REPO_DIR=.

COPY --from=MAVEN_TOOL_CHAIN /tmp/target/codeshovel-webservice-0.1.0.jar /app.war

CMD ["/usr/bin/java", "-Xmx4096m", "-jar", "/app.war"]
