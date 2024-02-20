FROM caddy

ARG PUBLIC_URL="/minesweeper"

COPY index.html minesweeper.js spritesheet.png "/usr/share/caddy/${PUBLIC_URL}/"
