const { google } = require('googleapis');
const fs = require('fs');
const config = require('./config.cjs');

const spreadsheetId = config.spreadsheetId;

const credentials = require(__dirname + '/../credentials.json');

const client = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  ['https://www.googleapis.com/auth/spreadsheets']
);

// -------------------------------------
const getDataFromGoogleSheets = async () => {
  return new Promise((resolve, reject) => {
    console.log('Iniciando a autorização do cliente...');
    client.authorize((err) => {
      if (err) {
        console.error('Erro ao autorizar o cliente:', err);
        reject(err);
        return;
      }

      console.log('Autorização do cliente bem-sucedida. Obtendo dados da planilha...');
      const sheets = google.sheets({ version: 'v4', auth: client });

      sheets.spreadsheets.values.get({
        spreadsheetId,
        range:'DB!A2:F100',
      }, (err, res) => {
        if (err) {
          console.error('Erro ao obter os valores da planilha:', err);
          reject(err);
          return;
        }

        const data = res.data.values;

        if (data.length) {

          resolve(data);
        } else {
          console.warn('Nenhum dado encontrado na planilha.');
          reject('No data found.');
        }
      });
    });
  });
};

// ------------------------------------------

const getDataFromGoogleSheetsTurma = async (turma) => {
  return new Promise((resolve, reject) => {
    console.log('Iniciando a autorização do cliente para a turma', turma);
    client.authorize((err) => {
      if (err) {
        console.error('Erro ao autorizar o cliente:', err);
        reject(err);
        return;
      }

      console.log('Autorização do cliente bem-sucedida. Obtendo dados da planilha...');
      const sheets = google.sheets({ version: 'v4', auth: client });

      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${turma}!A2:C100`,
      }, (err, res) => {
        if (err) {
          console.error('Erro ao obter os valores da planilha:', err);
          reject(err);
          return;
        }

        const data = res.data.values;

        if (data.length) {
          console.log(`Dados da turma ${turma} obtidos com sucesso:`, data);
          resolve(data);
        } else {
          console.warn(`Nenhum dado encontrado na turma ${turma}.`);
          reject(`No data found for ${turma}.`);
        }
      });
    });
  });
};

const getEmailsFromSheet = async (sheetName) => {
  return new Promise((resolve, reject) => {
    console.log('Iniciando a autorização do cliente para a aba', sheetName);
    client.authorize((err) => {
      if (err) {
        console.error('Erro ao autorizar o cliente:', err);
        reject(err);
        return;
      }

      console.log('Autorização do cliente bem-sucedida. Obtendo dados da planilha...');
      const sheets = google.sheets({ version: 'v4', auth: client });

      sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A2:A100`,
      }, (err, res) => {
        if (err) {
          console.error('Erro ao obter os valores da planilha:', err);
          reject(err);
          return;
        }

        const data = res.data.values;

        if (data.length) {
          console.log(`Dados da aba ${sheetName} obtidos com sucesso:`, data);
          resolve(data);
        } else {
          console.warn(`Nenhum dado encontrado na aba ${sheetName}.`);
          reject(`No data found for ${sheetName}.`);
        }
      });
    });
  });
};

const inserirEscolhasNaPlanilha = async (raDoAluno, escolhasDoAluno) => {
  return new Promise((resolve, reject) => {
    client.authorize((err) => {
      if (err) {
        console.error('Erro ao autorizar o cliente:', err);
        reject(err);
        return;
      }

      const sheets = google.sheets({ version: 'v4', auth: client });

      // Extrai apenas os números de RA
      const numerosDeRA = escolhasDoAluno.map(aluno => aluno.raDoAluno);

      // Cria a matriz de valores
      const values = [[raDoAluno, ...numerosDeRA]];

      sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `DB!F:K`,
        valueInputOption: 'RAW',
        resource: {
          values: values
        }
      }, (err, res) => {
        if (err) {
          console.error('Erro ao inserir dados na planilha:', err);
          reject(err);
          return;
        }

        console.log('Dados inseridos na planilha com sucesso:', res.data);
        resolve(true);
        console.log('Fim da função inserirEscolhasNaPlanilha');
      });
    });
  });
};

module.exports = { getDataFromGoogleSheets, getDataFromGoogleSheetsTurma, getEmailsFromSheet, inserirEscolhasNaPlanilha};
