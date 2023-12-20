# Sociograma Relacional

O Sociograma Relacional é uma ferramenta que cria grafos de relações com base nas escolhas de cada membro presente na lista. Esses grafos possibilitam a análise de amizades, grupos, conflitos e isolamentos dentro da comunidade analisada.

## Instalação

1. **Clone o Repositório:**
    ```bash
    git clone https://github.com/Hellenaf/sociograma-relacional.git
    ```

2. **Crie suas Credenciais (Serviço de E-mail) através do Google API.**

3. **Integre a API do Google:**
    - Insira sua planilha com os dados dos membros, incluindo e-mail, nome completo, setor ou turma, e a foto.

4. **Organize a Planilha:**
    - Crie uma planilha geral com as seguintes abas:
      - A primeira para o nome do membro e suas escolhas.
      - A segunda para o e-mail geral de todos os membros.
      - Abas adicionais para inserir os membros por setor ou turma.

5. **Autenticação de Login:**
    - Crie uma autenticação para o login, permitindo o acesso apenas aos e-mails listados na aba correspondente.

6. **Configuração no Servidor:**
    - Mude o nome das planilhas no arquivo `server/googlesheets.cjs` de acordo com a sua planilha.

## Licença

Este projeto é disponibilizado sob a [Licença MIT](LICENSE). Consulte o arquivo [LICENSE](LICENSE) para obter detalhes sobre os termos e condições.

Para mais detalhes, consulte o texto completo da Licença MIT no arquivo LICENSE fornecido ou visite [https://www.mit.edu/~amini/LICENSE.md](https://www.mit.edu/~amini/LICENSE.md).
