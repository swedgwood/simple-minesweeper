FROM caddy

ARG PUBLIC_URL="/minesweeper"

COPY index.html minesweeper.js "/usr/share/caddy/${PUBLIC_URL}/"
