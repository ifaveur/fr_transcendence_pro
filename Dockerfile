FROM node:16

WORKDIR /usr/app/
COPY . .

WORKDIR /usr/app/frontend
RUN npm install
RUN npm install -g @angular/cli
RUN npm run build

WORKDIR /usr/app/backend
RUN npm install
RUN npm install -g @nestjs/cli
RUN npm run build

EXPOSE 3000
