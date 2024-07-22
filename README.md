# Cadeia Produtiva
  - Project name: **cadeia-produtiva**
  - Programming language: **JavaScript**
  - Package manager: **Yarn**
  - UI framework: **Bootstrap Vue**
  - Nuxt.js modules: **Axios - Promise based HTTP client, Progressive Web App (PWA), Content - Git-based headless CMS**
  - Linting tools: **Prettier, Lint staged files, StyleLint, Commitlint**
  - Rendering mode: **Single Page App**
  - Deployment target: **Server (Node.js hosting)**
  - Development tools: **jsconfig.json (Recommended for VS Code if you're not using typescript), Semantic Pull Requests, Dependabot (For auto-updating dependencies, GitHub only)**
  - Continuous integration: **GitHub Actions**
  - Version control system: **Git**


## Build Setup

```bash
# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

## Download and install database

```bash
# this command will download the latest database and create a MongoDB database called "cadeia-produtiva", importing downloaded data into it
$ yarn sync_dev
```

**IMPORTANT:** you must have MongoDB database tools directory specified in your host path, because "sync_dev" script uses "mongorestore" command line tool without specifying the path (the correct behavior).

For detailed explanation on how things work, check out [Nuxt.js docs](https://nuxtjs.org).

## Licença

Este projeto está licenciado sob a [GNU Affero General Public License v3.0](LICENSE) - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

