# Agenda Raphael

Página pública da agenda, com Google Calendar + mapa de deslocamentos por Minas Gerais.

## Publicação
O GitHub Actions publica automaticamente a branch main no GitHub Pages.

Endereço esperado:
https://lffzdsf.github.io/agendarapha/

## Integração com Google Apps Script
1. Acesse https://script.google.com/
2. Crie um novo projeto.
3. Substitua o conteúdo do arquivo Code.gs pelo conteúdo de Code.gs deste repositório.
4. Clique em Implantar > Nova implantação.
5. Tipo: Aplicativo da Web.
6. Executar como: você.
7. Quem pode acessar: Qualquer pessoa.
8. Autorize Calendar e Maps quando solicitado.
9. Copie a URL terminada em /exec.
10. Abra config.js e coloque essa URL em apiUrl.

Exemplo:
window.AGENDA_CONFIG = {
  apiUrl: "https://script.google.com/macros/s/SEU_ID/exec"
};

Ao salvar config.js na main, o GitHub Pages publica a integração automaticamente.

## Agenda
Calendar ID:
fc142fad8373709f04073ac360daa0b2685aef89f98efc130300574a879c183c@group.calendar.google.com

Para o mapa funcionar melhor, preencha o campo Local dos eventos com cidade/UF ou endereço.
