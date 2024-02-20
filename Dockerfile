FROM caddy

ARG PUBLIC_URL="/minesweeper"

COPY index.html "/usr/share/caddy/${PUBLIC_URL}"
COPY minesweeper.js "/usr/share/caddy/${PUBLIC_URL}" 
