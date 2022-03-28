#!/bin/sh
RED='\033[0;31m'
GRN='\033[0;32m'
BLU='\033[0;34m'
RST='\033[0;0m'
ALL_LINE0="\n\n\n${RED}                 ┏━                                       ━┓\n\n"
ALL_LINE1="${GRN}                          T R A N S C E N D E N C E"
ALL_LINE2="${RED}                              最後のプロジェクト\n\n"
ALL_LINE3="                 ┗━                                       ━┛${RST}\n\n\n"


printf "${RST}insert UID : ${BLU}"
read -p "" uid
printf "${RST}insert SECRET : ${BLU}"
read -p "" secret
printf "${RST}insert AUTH_URL : ${BLU}"
read -p "" authurl
printf "${RST}insert DOMAIN : ${BLU}"
read -p "" domain
printf "${RST}insert MAIL : ${BLU}"
read -p "" mail
printf "${RST}insert MAIL PASSWORD : ${BLU}"
read -p "" mail_pass


# docker-compose
cp ./docker-compose-template.yml ./docker-compose.yml
sed "s<REPLACE_AUTH_URL<${authurl}<g" ./docker-compose.yml > ./docker-compose.tmp
mv ./docker-compose.tmp ./docker-compose.yml
sed "s/REPLACE_CLIENT_ID/${uid}/g" ./docker-compose.yml > ./docker-compose.tmp
mv ./docker-compose.tmp ./docker-compose.yml
sed "s/REPLACE_CLIENT_SECRET/${secret}/g" ./docker-compose.yml > ./docker-compose.tmp
mv ./docker-compose.tmp ./docker-compose.yml
sed "s<REPLACE_DOMAIN<${domain}<g" ./docker-compose.yml > ./docker-compose.tmp
mv ./docker-compose.tmp ./docker-compose.yml
sed "s<REPLACE_MAIL<${mail}<g" ./docker-compose.yml > ./docker-compose.tmp
mv ./docker-compose.tmp ./docker-compose.yml
sed "s<REPLACE_MAIL_PASS<${mail_pass}<g" ./docker-compose.yml > ./docker-compose.tmp
mv ./docker-compose.tmp ./docker-compose.yml

# global.ts
cp ./frontend/src/app/global.template ./frontend/src/app/global.ts
sed "s<REPLACE_DOMAIN<${domain}<g" ./frontend/src/app/global.ts > ./frontend/src/app/global.tmp
mv ./frontend/src/app/global.tmp ./frontend/src/app/global.ts
sed "s<REPLACE_AUTH_URL<${authurl}<g" ./frontend/src/app/global.ts > ./frontend/src/app/global.tmp
mv ./frontend/src/app/global.tmp ./frontend/src/app/global.ts

# index-game.html
cp ./backend/src/game/index-game.template.html ./backend/src/game/index-game.html
sed "s<REPLACE_DOMAIN<${domain}<g" ./backend/src/game/index-game.html > ./backend/src/game/index-game.tmp
mv ./backend/src/game/index-game.tmp ./backend/src/game/index-game.html

# game.gateway.ts
cp ./backend/src/game/game.gateway.template.ts ./backend/src/game/game.gateway.ts
sed "s<REPLACE_DOMAIN<${domain}<g" ./backend/src/game/game.gateway.ts > ./backend/src/game/game.gateway.tmp
mv ./backend/src/game/game.gateway.tmp ./backend/src/game/game.gateway.ts


echo "${ALL_LINE0}"
echo "${ALL_LINE1}"
echo "${ALL_LINE2}"
echo "${ALL_LINE3}"