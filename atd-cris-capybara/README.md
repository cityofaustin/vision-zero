# atd-cris-request-automator

This is a tool that automates the requests to CRIS's website.

### Why using docker?

This application runs on Capybara, and our app is specifically configured to run on WebKit drivers. There are other drivers available, such as selenium, native ruby drivers, firefox, etc.

WebKit drivers are built on top of Qt5WebKit for headless browsing, which in turn has other dependencies tht need to be compiled.

Docker allows us to have a fully built container with everything already built and installed. 

### Usage

##### 1. Get the image:

Depending on your broadband speed, you may want to avoid building the image, it can take a while to build. Instead it is suggested you download it via docker-pull.

Method A (Pull already built image, it's large):

```bash
docker pull atddocker/atd-cris-request-automator
```

Method B (Build image, takes very long to build)

```bash
docker build -f Dockerfile -t atddocker/atd-cris-request-automator .
```

Be sure to have the source code cloned in your computer before you can build the Dockerfile.

##### 2. We run the image:

Run:

```bash
docker run -it --rm  atddocker/atd-cris-request-automator sh -c 'xvfb-run ruby main.rb'
```