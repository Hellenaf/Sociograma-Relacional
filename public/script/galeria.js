document.addEventListener("DOMContentLoaded", async function () {
  let alunosSelecionados = [];
  let maxEscolhas = 5;

  const turmaSelect = document.getElementById('turmaSelect');
  turmaSelect.addEventListener('change', carregarAlunos);

  async function carregarAlunos() {
    const turmaSelect = document.getElementById('turmaSelect');
    const selectedTurma = turmaSelect.value;

    try {
      const response = await fetch(`http://localhost:5500/alunos/${selectedTurma}`);
      const data = await response.json();

      console.log('Dados recebidos do servidor:', data);

      // Chame uma função para exibir os alunos na página
      exibirAlunos(data);
    } catch (error) {
      console.error(`Erro ao carregar alunos da turma ${selectedTurma}:`, error);
    }
  }


  const turmas = ['...', '6anoA', '6anoB', '6anoC']; 
  turmas.forEach(turma => {
    const option = document.createElement('option');
    option.value = turma;
    option.textContent = `${turma}`; 
    turmaSelect.appendChild(option);
  });

  function exibirAlunos(alunos) {
    const studentsArea = document.getElementById('studentsArea');
    studentsArea.innerHTML = ''; 

    alunos.forEach(aluno => {
      console.log('Criando elemento para aluno:', aluno);
      const alunoElement = criarElementoAluno(aluno);
      studentsArea.appendChild(alunoElement);
    });
  }

  function adicionarAoCarrinho(aluno) {
    if (alunosSelecionados.length < maxEscolhas) {
      const raDoAluno = aluno[2];
      alunosSelecionados.push({ nome: aluno[0], raDoAluno: aluno[2], escolhas: [] });
      console.log('Aluno adicionado ao carrinho:', aluno);
    } else {
      // Exibe uma mensagem de aviso ao usuário
      alert('Você pode escolher no máximo 5 opções.');
    }
  }
  

  const visualizarCarrinhoBtn = document.getElementById('visualizarCarrinhoBtn');

  if (visualizarCarrinhoBtn) {
    visualizarCarrinhoBtn.onclick = toggleCarrinhoVisibility;
  } else {
    console.error("Elemento 'visualizarCarrinhoBtn' não encontrado no DOM.");
  }
  
  function toggleCarrinhoVisibility() {
    const carrinhoLista = document.getElementById('carrinhoLista');
  
    // Se o carrinho estiver visível, oculta; se estiver oculto, exibe
    carrinhoLista.style.display = carrinhoLista.style.display === 'none' ? 'block' : 'none';
  
    // Exibe ou oculta os alunos selecionados no carrinho
    if (carrinhoLista.style.display === 'block') {
      exibirCarrinho();
    }
  }
  
  function exibirCarrinho() {
    const carrinhoLista = document.getElementById('carrinhoLista');
    carrinhoLista.innerHTML = ''; // Limpa a lista do carrinho
  
    // Exibe os alunos selecionados no carrinho
    alunosSelecionados.forEach(aluno => {
      console.log('Aluno no carrinho:', aluno); // Adiciona este log para verificar o conteúdo
      const listItem = document.createElement('li');
      listItem.textContent = `Nome: ${aluno.nome} - RA: ${aluno.raDoAluno}`;
      carrinhoLista.appendChild(listItem);
    });
  }

  const finalizarEscolhasBtn = document.getElementById('finalizarEscolhas');
  if (finalizarEscolhasBtn) {
    finalizarEscolhasBtn.onclick = finalizarEscolhas;
  } else {
    console.error("Elemento 'finalizarEscolhas' não encontrado no DOM.");
  }
  
  async function finalizarEscolhas() {
    const raDoAluno = await obterRaDoAlunoDoServidor();
    const dadosDosAlunos = alunosSelecionados.map(aluno => ({
      raDoAluno: aluno.raDoAluno
    }));
    console.log('RA do aluno:', raDoAluno);
    console.log('Dados dos alunos:', dadosDosAlunos);
  
    try {
      const response = await fetch('/finalizarEscolhas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          raDoAluno: raDoAluno,
          dadosDosAlunos: dadosDosAlunos,
        }),
      });
  
      const data = await response.json();
      console.log('Escolhas finalizadas com sucesso:', data);
  
      // Mostra pop-up de aviso
      mostrarPopupAviso('Escolhas finalizadas com sucesso!');
      
    } catch (error) {
      console.error('Erro ao finalizar escolhas:', error);
    }
  }
  
  function mostrarPopupAviso(mensagem) {
    window.alert(mensagem);
  }
  

  async function obterRaDoAlunoDoServidor() {
    try {
      const response = await fetch('/obterRaDoAluno');
      if (!response.ok) {
        throw new Error(`Erro ao obter RA do aluno do servidor. Código: ${response.status}`);
      }
      const data = await response.json();
      return data.raDoAluno;
    } catch (error) {
      console.error('Erro ao obter RA do aluno do servidor:', error);
      return null;
    }
  }
  
    // Adiciona um ouvinte de eventos ao botão de login do Google
    const gerarSociograma = document.getElementById('gerarSociograma');
    gerarSociograma.addEventListener('click', function() {
      // Redireciona para a página de autenticação do Google ao clicar
      window.location.href = 'http://localhost:5500';
  });

  function criarElementoAluno(aluno) {
    const alunoElement = document.createElement('div');
    alunoElement.classList.add('student-card');

    const imagemElement = document.createElement('img');
    imagemElement.src = aluno[1]; // Substitua '1' pela posição correta do campo da foto em seus dados
    imagemElement.alt = aluno[0]; // Substitua '0' pela posição correta do campo do nome em seus dados
    imagemElement.classList.add('student-image');
    alunoElement.appendChild(imagemElement);

    const nomeElement = document.createElement('div');
    nomeElement.textContent = aluno[0]; // Substitua '0' pela posição correta do campo do nome em seus dados
    nomeElement.classList.add('student-name');
    alunoElement.appendChild(nomeElement);

    const raElement = document.createElement('div');
    raElement.textContent = `RA: ${aluno[2]}`; // Substitua '2' pela posição correta do campo do RA em seus dados
    raElement.classList.add('student-ra'); // Adicione uma classe específica para o RA
    alunoElement.appendChild(raElement);

    const carrinhoElement = document.createElement('div');
    carrinhoElement.textContent = 'Adicionar ao Carrinho';
    carrinhoElement.classList.add('student-cart');
    carrinhoElement.addEventListener('click', () => adicionarAoCarrinho(aluno));
    alunoElement.appendChild(carrinhoElement);

    return alunoElement;
  }
});
