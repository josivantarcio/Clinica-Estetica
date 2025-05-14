# Use a imagem base oficial do Node.js
FROM node:18

# Defina o diretório de trabalho
WORKDIR /app

# Copie o package.json e o package-lock.json
COPY package*.json ./

# Instale as dependências (inclui Prisma CLI)
RUN npm install

# Copie o restante do código da aplicação
COPY . .

# Exponha a porta da aplicação
EXPOSE 3000

# Comando para gerar Prisma Client, sincronizar schema, compilar TypeScript e iniciar a aplicação em produção
CMD npx prisma generate && npx prisma db push && npm run build && npm start
