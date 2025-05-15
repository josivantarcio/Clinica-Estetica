const fs = require('fs');
const path = require('path');

// Escreve um arquivo .vercelignore na raiz do projeto
fs.writeFileSync(
  path.join(__dirname, '..', '.vercelignore'),
  `*
!frontend/
!frontend/**
!vercel.json
`
);

// Força um novo commit na forma de um arquivo timestamp
fs.writeFileSync(
  path.join(__dirname, 'deploy-timestamp.txt'),
  `Timestamp do deploy: ${new Date().toISOString()}`
);

console.log('Arquivos de deploy gerados com sucesso.');
