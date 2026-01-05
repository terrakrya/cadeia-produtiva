# IÊ - Inteligência Econômica Ecológica

## Sobre o Projeto

O **IÊ (Inteligência Econômica Ecológica)** é um sistema web e mobile (PWA) desenvolvido para apoiar a gestão de cadeias produtivas de produtos florestais não-madeireiros, com foco inicial na cadeia da castanha-da-Amazônia. A plataforma permite o monitoramento de preços, coleta de dados ecológicos e análise de informações de mercado em diferentes regiões produtoras vinculadas à sociobiodiversidade.

### Principais Funcionalidades

- **Monitoramento de Preços**: Registro e acompanhamento de preços praticados em diferentes regiões e períodos (safra, mês, quinzena, semana)
- **Dados Ecológicos**: Coleta de informações sobre produção, floração, frutificação e outros indicadores ecológicos
- **Painel de Análise**: Visualização de estatísticas (preço mínimo, máximo, médio e moda) por região
- **Comparativo Regional**: Comparação de preços entre diferentes regiões castanheiras
- **Gestão de Usuários**: Sistema de perfis com diferentes níveis de acesso (Admin, Gestor Global, Gestor, Mensageiro)
- **Funcionamento Offline**: Suporte a operação offline com sincronização automática (PWA)

## Contexto do Projeto

Este software foi desenvolvido com o objetivo de fortalecer cadeias produtivas da sociobiodiversidade. A plataforma visa empoderar comunidades extrativistas com informações de mercado em tempo real, contribuindo para uma comercialização mais justa e transparente de produtos da sociobiodiversidade.

O sistema está disponível em: [iesociobio.org](https://iesociobio.org)

## Estrutura do Projeto

```
cadeia-produtiva/
├── api/                    # Backend da aplicação (Express.js)
│   ├── config/             # Configurações (autenticação, email, etc.)
│   ├── models/             # Modelos MongoDB (User, Product, Region, etc.)
│   ├── routes/             # Rotas da API REST
│   └── utils/              # Funções utilitárias
│
├── assets/                 # Recursos estáticos
│   ├── css/                # Estilos customizados (SASS)
│   └── img/                # Imagens do sistema
│
├── components/             # Componentes Vue.js reutilizáveis
│   ├── *Form.vue           # Formulários (UserForm, ProductForm, etc.)
│   ├── LineChart.vue       # Gráfico de linhas
│   ├── FilterModal.vue     # Modal de filtros
│   └── ...                 # Outros componentes UI
│
├── data/                   # Dados de referência em JSON
│   ├── estados.json        # Estados brasileiros
│   ├── municipios.json     # Municípios
│   ├── regioes-castanheiras.json  # Regiões produtoras
│   └── ...                 # Outros dados de referência
│
├── layouts/                # Templates de layout Nuxt.js
│   ├── default.vue         # Layout padrão (usuário autenticado)
│   ├── front.vue           # Layout público (login, primeiro acesso)
│   └── super.vue           # Layout administrativo
│
├── pages/                  # Páginas da aplicação (roteamento automático)
│   ├── cadastros/          # Páginas de cadastro (CRUD)
│   ├── operacional/        # Páginas operacionais
│   ├── painel.vue          # Painel principal
│   ├── login.vue           # Página de login
│   └── ...                 # Outras páginas
│
├── plugins/                # Plugins Vue.js/Nuxt.js
│   ├── axios-api.js        # Configuração do cliente HTTP
│   ├── vee-validate.js     # Validação de formulários
│   ├── offline-sync-service.js  # Sincronização offline
│   └── ...                 # Outros plugins
│
├── scripts/                # Scripts utilitários
│   ├── database.js         # Operações de banco de dados
│   ├── seed-*.js           # Scripts de seed
│   └── migrate-*.js        # Scripts de migração
│
├── static/                 # Arquivos estáticos públicos
├── store/                  # Vuex store (gerenciamento de estado)
├── locale/                 # Arquivos de internacionalização
│
├── nuxt.config.js          # Configuração do Nuxt.js
├── package.json            # Dependências do projeto
└── yarn.lock               # Lock file do Yarn
```

## Tecnologias Utilizadas

| Categoria | Tecnologia |
|-----------|------------|
| Frontend | Vue.js 2, Nuxt.js 2, Bootstrap Vue |
| Backend | Node.js, Express.js |
| Banco de Dados | MongoDB |
| Autenticação | JWT (JSON Web Tokens) |
| PWA | Workbox, Service Workers |
| Gráficos | Chart.js, vue-chartjs |
| Mapas | Leaflet |
| Validação | VeeValidate |

## Instalação e Configuração

### Pré-requisitos

- Node.js 20.x
- MongoDB 4.4+
- Yarn (gerenciador de pacotes)
- MongoDB Database Tools (para sincronização de dados)

### Instalação

```bash
# Clonar o repositório
$ git clone https://github.com/[seu-usuario]/cadeia-produtiva.git
$ cd cadeia-produtiva

# Instalar dependências
$ yarn install

# Desenvolvimento com hot reload em localhost:3000
$ yarn dev

# Build para produção
$ yarn build
$ yarn start

# Gerar versão estática
$ yarn generate
```

### Configuração do Banco de Dados

```bash
# Este comando baixa o banco de dados mais recente e cria um banco MongoDB 
# chamado "cadeia-produtiva", importando os dados automaticamente
$ yarn sync_dev
```

**IMPORTANTE:** O diretório do MongoDB Database Tools deve estar no PATH do sistema, pois o script `sync_dev` utiliza o comando `mongorestore`.

## Documentação Adicional

Para informações detalhadas sobre o funcionamento do Nuxt.js, consulte a [documentação oficial do Nuxt.js](https://nuxtjs.org).

## Licença

Este projeto está licenciado sob a [GNU Affero General Public License v3.0](LICENSE) - veja o arquivo [LICENSE](LICENSE) para mais detalhes.
