# Salão de Estética - Sistema de Gestão

Sistema de gestão para salões de estética, desenvolvido com Next.js, TypeScript e Chakra UI.

## Funcionalidades

- Gestão de clientes
- Agendamento de serviços
- Controle de estoque
- Sistema de fidelidade
- Relatórios gerenciais
- Multi-tenancy (suporte a múltiplos salões)

## Tecnologias Utilizadas

- Next.js 14
- TypeScript
- Chakra UI
- Jest
- React Testing Library
- Prisma (ORM)
- PostgreSQL

## Requisitos

- Node.js 18+
- npm ou yarn
- PostgreSQL

## Instalação

1. Clone o repositório:
```bash
git clone [URL_DO_REPOSITÓRIO]
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
```bash
cp .env.example .env
```

4. Execute as migrações do banco de dados:
```bash
npx prisma migrate dev
```

5. Inicie o servidor de desenvolvimento:
```bash
npm run dev
# ou
yarn dev
```

## Testes

Para executar os testes:

```bash
npm test
# ou
yarn test
```

## Estrutura do Projeto

```
src/
  ├── app/              # Rotas e páginas da aplicação
  ├── components/       # Componentes reutilizáveis
  ├── contexts/         # Contextos React
  ├── models/          # Modelos de dados
  ├── services/        # Serviços e integrações
  ├── types/           # Definições de tipos TypeScript
  └── utils/           # Funções utilitárias
```

## Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Faça commit das suas alterações (`git commit -m 'Adiciona nova feature'`)
4. Faça push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes. 