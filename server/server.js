import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import path from 'path';
import passport from 'passport';
import session from 'express-session';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import config from './config.cjs';
import { getDataFromGoogleSheets, getDataFromGoogleSheetsTurma, getEmailsFromSheet, inserirEscolhasNaPlanilha } from './googlesheets.cjs';

console.log('Importação bem-sucedida');
console.log('Início do arquivo server.js');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Configurações do Passport
app.use(cors());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(session({
  secret: 'a1b2C3d4E5f6G7h8I9j0K!L@M#N$O%P^Q&R*S(T)U_V-W+X=Y/Z',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: true, 
    maxAge: 604800000, 
  },
  proxy: true, 
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(new GoogleStrategy({
  clientID: config.clientID,
  clientSecret: config.clientSecret,
  callbackURL: config.callbackURL,
}, (accessToken, refreshToken, profile, done) => {
  return done(null, { email: profile.emails[0].value });
}));

const ensureSession = (req, res, next) => {
  if (!req.session) {
    return res.status(500).send('Erro interno do servidor');
  }
  next();
};

const processData = (data) => {
  const processedData = {};

 
  data.forEach(row => {
    const memberId = row[0]; 
    const choices = row.slice(1); 

    if (!processedData[memberId]) {
      processedData[memberId] = choices;
    } else {
      
      processedData[memberId] = [...new Set([...processedData[memberId], ...choices])];
    }
  });

  return processedData;
};

app.get("/login", (req, res) => {
  const loginPath = path.join(__dirname, "..", "public", "login.html");
  res.sendFile(loginPath);
});

app.get("/", (req, res) => {
  const indexPath = path.join(__dirname, "..", "public", "index.html");
  res.sendFile(indexPath);
});

let dadosMembros; 

app.get("/fetchData", async (req, res) => {
  try {
    console.log('Recebida solicitação para /fetchData');
    const data = await getDataFromGoogleSheets();
    const processedData = processData(data);
    dadosMembros = processedData;
    console.log('Data do processo enviado ao cliente:', dadosMembros);
    res.send(dadosMembros);
  } catch (error) {
    console.error('Erro ao processar solicitação para /fetchData:', error);
    res.status(500).send("Internal Server Error");
  }
});

app.get("/galeria", (req, res) => {
  const galeriaPath = path.join(__dirname, "..", "public", "galeria.html");
  res.sendFile(galeriaPath);
});

app.get('/alunos/:turma', async (req, res) => {
  const turma = req.params.turma;

  try {
    // Código propenso a erros
    const data = await getDataFromGoogleSheetsTurma(req.params.turma);
    res.json(data);
  } catch (error) {
    console.error('Erro ao obter dados dos alunos da turma:', error);
    res.status(500).send('Erro interno do servidor');
  }
});

function obterRaDoAluno(email) {

  const ra = email.split('@')[0]; 
  return ra;
}

app.get('/auth/google',
  ensureSession,
  passport.authenticate('google', { scope: ['https://www.googleapis.com/auth/plus.login', 'email'] }));

  app.get('/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  ensureSession,
  async (req, res) => {
    const userEmail = req.user.email;
    console.log(`Usuário autenticado com o e-mail: ${userEmail}`);

    try {

      const authorizedEmails = await getEmailsFromSheet('6ano'); // Substitua pelo nome correto da sua aba

      const normalizedAuthorizedEmails = authorizedEmails.map(row => row[0].toLowerCase());
      const normalizedUserEmail = userEmail.toLowerCase();

      if (normalizedAuthorizedEmails.includes(normalizedUserEmail)) {
        // Se estiver autorizado, continue o processo
        const raDoAluno = obterRaDoAluno(userEmail);
        console.log('RA do aluno obtido:', raDoAluno);

        // Armazenar o RA do aluno na sessão
        req.session.raDoAluno = raDoAluno;

        // Redirecionar para a galeria
        res.redirect('/galeria');
      } else {
        // Se não estiver autorizado, redirecione ou recuse a entrada
        res.status(403).send('Acesso não autorizado');
      }
    } catch (error) {
      console.error('Erro ao verificar autorização:', error);
      res.status(500).send('Erro interno do servidor');
    }
  });


  app.post('/finalizarEscolhas', async (req, res) => {
    try {
      const raDoAluno = req.body.raDoAluno;
      const dadosDosAlunos = req.body.dadosDosAlunos;
  
      console.log('Recebida solicitação para finalizar escolhas. RA do aluno:', raDoAluno);
      console.log('Dados dos alunos:', dadosDosAlunos);
  
      // Adicione este log para verificar se a função é chamada
      console.log('Chamando inserirEscolhasNaPlanilha');
  
      // Insira as informações na planilha do Google Sheets (utilizando a função apropriada)
      await inserirEscolhasNaPlanilha(raDoAluno, dadosDosAlunos);
  
      // Envie uma resposta ao cliente
      res.json({ message: 'Escolhas finalizadas com sucesso.' });
    } catch (error) {
      // Adicione logs para capturar detalhes do erro
      console.error('Erro ao finalizar escolhas:', error);
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

app.get('/obterRaDoAluno', (req, res) => {
  const raDoAluno = req.session.raDoAluno;
  res.json({ raDoAluno });
});

app.get('/unauthorized', (req, res) => {
  res.status(401).send('Acesso não autorizado.');
});

app.listen(5500, () => {
  console.log("Servidor iniciado na porta 5500");
});
