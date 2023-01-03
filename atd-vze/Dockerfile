FROM node:16-bullseye
RUN apt-get update
RUN apt-get install -y vim aptitude magic-wormhole
WORKDIR /root/
RUN curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash
RUN npm install -g npm-check-updates
WORKDIR /root/atd-vze
#COPY . /root/atd-vze
#RUN npm install
CMD ["npm", "start"]
