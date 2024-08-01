# Gerenciador de Mods

Um aplicativo desktop simples para gerenciar mods de jogos. Com este gerenciador, você pode facilmente ativar ou desativar mods e manter um histórico de perfis para alternar entre diferentes configurações de jogos.

## Funcionalidades

- **Escolher Pasta de Mods**: Selecione a pasta onde seus mods estão localizados.
- **Ativar/Desativar Mods**: Marque ou desmarque mods para ativá-los ou desativá-los. Mods desativados são movidos para uma pasta separada.
- **Histórico de Perfis**: Mantenha um histórico das pastas de mods usadas para alternar rapidamente entre diferentes perfis de jogo.
- **Persistência de Configurações**: A pasta de mods selecionada é salva e carregada automaticamente na próxima vez que o aplicativo for aberto.

## Requisitos

- **Node.js**: Certifique-se de que o Node.js esteja instalado. Você pode baixar a versão mais recente [aqui](https://nodejs.org/).

## Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/seu-usuario/gerenciador-de-mods.git
   ```
2. Navegue até o diretório do projeto:
   ```bash
   cd gerenciador-de-mods
   ```
3. Instale as dependências:
   ```bash
   yarn install
   ```

## Executando o Aplicativo

Para iniciar o aplicativo, use o comando:

```bash
   yarn start
```

Isso abrirá uma janela do Electron onde você poderá usar o gerenciador de mods.

## Estrutura do Projeto

- **`main.js`**: Script principal do Electron, responsável pela criação da janela e manipulação de eventos.
- **`renderer.js`**: Lógica do frontend para interações com o usuário e manipulação de arquivos.
- **`index.html`**: Interface do usuário do aplicativo.
- **`settings.json`**: Armazena as configurações do usuário, incluindo a pasta de mods e o histórico de perfis.

## Personalização

Você pode personalizar o estilo do aplicativo editando o arquivo `index.html` e as regras CSS no `<style>` do mesmo.

## Contribuindo

1. Faça um fork do repositório.
   
2. Crie uma nova branch:
   ```bash
   git checkout -b minha-nova-funcionalidade
   ```
3. Faça suas alterações e commit:
   ```bash
   git commit -am 'Adiciona nova funcionalidade'
   ```
4. Envie para o repositório remoto:
   ```bash
   git push origin minha-nova-funcionalidade
   ```
5. Abra um Pull Request.

## Criando o Executável

Para criar o executável do projeto, execute:
```bash
yarn dist
```

## Licença

Este projeto é autoral e público, e qualquer pessoa pode contribuir com ele.

## Contato

Se você tiver dúvidas ou sugestões, sinta-se à vontade para abrir uma [issue](https://discord.gg/5rXK3uVq) ou me contatar diretamente.

---