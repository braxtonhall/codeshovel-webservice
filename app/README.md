# codeshovel - ui

A React based User Interface, serving interactions with [ataraxie/codeshovel](https://github.com/ataraxie/codeshovel/).

## Serving the User Interface

### docker-compose

Use this method to serve this UI accompanied by a web service. Create a `.env` file in the root of the project with all the variables listed in `.env.sample`. Then from the project directory, run:
```
docker-compose build && docker-compose up -d
```

### Docker

To build an image, from the project directory run:
```
Docker build --build-arg SERVER_ADDRESS=<Address of webservice> \
             --build-arg PUBLIC_ADDRESS=<Public address of UI> \
             -t csui .
```

To run a container, run:
```
Docker run -p <Port to listen on>:5000 csui
```

### Command Line

_Requires Node version 10 or higher and Yarn_

**Development Server**

To prepare for running, from the project directory run:
```
yarn install
```

To deploy, from the project directory run:
```
REACT_APP_SERVER_ADDRESS=<Address of webservice> yarn start
```

**Static Server**

To build the project, from the project directory run:
```
yarn install && REACT_APP_SERVER_ADDRESS=<Address of webservice> \
                PUBLIC_URL=<Public address of UI> yarn build
```

To deploy, from the project directory run:
```
yarn serve -s build
```
