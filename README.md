# codeshovel - webservice

A simple Spring based web service, delivering [ataraxie/codeshovel](https://github.com/ataraxie/codeshovel/) online.

## Running the Web Service

### docker-compose

Use this method to run the web service accompanied by a frontend. Create a `.env` file in the root of the project with all the variables listed in `.env.sample`. Then from the project directory, run:
```
docker-compose build && docker-compose up -d
```

### Docker

To build an image, from the project directory run:
```
Docker build -t csweb .
```

To run a container, run:
```
Docker run -p <Port to listen on>:8080 \
           -v <Path to csv on host for logging requests>:/requests.csv \
           -v <Path to dir on host for caching repositories>:/cache \
           -e GITHUB_TOKEN=<GitHub Personal Access Token with Read permissions> \
           csweb
```

### IntelliJ IDEA

_Requires Java 8 or higher_

Add a Run Configuration following the Spring Boot Application template. Add the recommended environment variables listed below to the Run Configuration. Save the configuration and run the application within IntelliJ IDEA with `^R`.

### Command Line

_Requires Java 8 or higher_

In order to run from the command line, first download the most recent version from the [releases page](https://github.com/braxtonhall/codeshovel-webservice/releases). Set the recommended environment variables listed below. Finally, run it as follows:
```
java -Xmx<Amount of Heap Memory> -jar codeshovel-webservice-XXX.jar
```

**Recommended Environment Variables** for use with IntelliJ IDEA and Command Line:
```
GITHUB_TOKEN=<GitHub Personal Access Token with Read permissions>
LANG=java
DISABLE_ALL_OUTPUTS=false
REPO_DIR=.
```