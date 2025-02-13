FROM nginx

RUN mkdir -p /etc/nginx/ssl

RUN openssl req -x509 -newkey rsa:4096 -keyout /etc/nginx/ssl/ft_transcendence.key -out /etc/nginx/ssl/ft_transcendence.crt -days 365 -nodes \
    -subj "/C=US/ST=State/L=City/O=Organization/OU=OrgUnit/CN=ft_transcendence"

COPY conf/nginx.conf /etc/nginx/nginx.conf
