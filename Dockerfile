FROM openjdk:8-jre-alpine

ENV GITHUB_TOKEN=passed-from-env-file
ENV LANG=java
ENV DISABLE_ALL_OUTPUTS=true
ENV REPO_DIR=.

EXPOSE 8080

COPY target/gs-spring-boot-0.1.0.jar /app.war
# run application with this command line
CMD ["/usr/bin/java", "-jar", "/app.war"]
