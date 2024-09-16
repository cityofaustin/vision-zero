FROM python:3.11-bookworm

# Set the timezone
RUN ln -snf /usr/share/zoneinfo/America/Chicago /etc/localtime && echo America/Chicago > /etc/timezone
RUN apt-get update && apt-get install -y tzdata

RUN apt-get -y upgrade
RUN apt-get install -y aptitude magic-wormhole vim black python3-pip postgresql-client-15 postgresql-client-common libpq-dev

# bastion host support for local dev
RUN apt-get install -y openssh-server
# sshd needs this folder for connection tracking
RUN mkdir /run/sshd
# generate a keypair for ssh
RUN ssh-keygen -t ed25519 -C "airflow@airflow" -f /root/.ssh/id_ed25519 -q -N ""
# allow ssh to localhost
RUN cat /root/.ssh/id_ed25519.pub > /root/.ssh/authorized_keys
# disable the "are you sure you want to connect" prompt
RUN printf "Host *\n\tStrictHostKeyChecking no\n" >> /root/.ssh/config

COPY requirements.txt /tmp/requirements.txt
RUN pip install -r /tmp/requirements.txt

COPY entrypoint.sh /entrypoint.sh

COPY . /app

WORKDIR /app
ENTRYPOINT ["/entrypoint.sh"]
CMD ["ems"]
