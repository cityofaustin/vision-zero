# Use the official HAProxy image as a base
FROM haproxy:latest

# Extend image to let us have some environment variable tools
USER root

# Install gettext package to get envsubst
RUN apt-get update && apt-get install -y gettext-base

# Copy entrypoint script and make it executable
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh
RUN chown -R haproxy:haproxy /usr/local/etc/haproxy/

# Become a non-root user
USER haproxy

ENTRYPOINT ["/bin/bash", "/entrypoint.sh"]
