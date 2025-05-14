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

# Gere o cliente Prisma e sincronize o schema com o banco
RUN npx prisma generate && npx prisma db push

# Exponha a porta da aplicação
EXPOSE 3000

# Comando para iniciar a aplicação em produção com limitação de memória
CMD ["npm", "start"]
