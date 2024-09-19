envsubst < /usr/local/etc/haproxy/haproxy.cfg.template > /usr/local/etc/haproxy/haproxy.cfg
exec haproxy -W -db -f /usr/local/etc/haproxy/haproxy.cfg
