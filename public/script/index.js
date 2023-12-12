document.addEventListener("DOMContentLoaded", function () {
  let dadosMembros; // Declarada globalmente para que seja acessível em toda parte do script

  fetch('http://localhost:5500/fetchData')
    .then(response => response.json())
    .then(data => {
      dadosMembros = data;
      generateSociogram();
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
    
    function generateSociogram() {
      const alunos = Object.keys(dadosMembros);
    
      const turmas = {
        turmaA: [],
        turmaB: [],
        turmaC: [],
        turmaD: []
      };
    
      // Defina 25% dos alunos como limite para cada turma
      const limiteTurma = Math.ceil(alunos.length * 0.25);
    
      // Iterar sobre cada aluno
      alunos.forEach(aluno => {
        const escolhas = dadosMembros[aluno];
    
        // Garantir que cada aluno escolha exatamente 5 colegas
        if (escolhas.length === 5) {
          // Tentar adicionar o aluno à turma respeitando as escolhas
          let turmaAdicionada = false;
    
          for (const turma in turmas) {
            const escolhasTurma = turmas[turma].flatMap(alunoTurma => dadosMembros[alunoTurma]);
            const conflitos = escolhas.filter(escolha => escolhasTurma.includes(escolha));
    
            // Verificar se pelo menos 3 escolhas são respeitadas e não há conflitos
            if (conflitos.length <= 2 && turmas[turma].length < limiteTurma) {
              turmas[turma].push(aluno);
              turmaAdicionada = true;
              break;
            }
          }
    
          // Se o aluno não foi adicionado a nenhuma turma, adicionar com base em relações próximas
          if (!turmaAdicionada) {
            // Priorizar as relações mais próximas
            for (const turma in turmas) {
              const escolhasTurma = turmas[turma].flatMap(alunoTurma => dadosMembros[alunoTurma]);
              const proximasEscolhas = escolhasTurma.map(escolha => escolhas.includes(escolha));
    
              // Encontrar a turma com a menor quantidade de conflitos
              const menorConflitoIndex = proximasEscolhas.indexOf(true);
              if (turmas[turma].length < limiteTurma) {
                turmas[turma].push(aluno);
                break;
              }
            }
          }
        }
      });
    
      console.log(turmas);
  
      // Obtém os elementos de texto para a contagem de membros por turma
      const turmaACounter = document.getElementById("turmaA-counter");
      const turmaBCounter = document.getElementById("turmaB-counter");
      const turmaCCounter = document.getElementById("turmaC-counter");
      const turmaDCounter = document.getElementById("turmaD-counter");
      const totalMembersCounter = document.getElementById("total-members");
  
      // Calcula o total de membros por turma
      const totalTurmaA = turmas["turmaA"].length;
      const totalTurmaB = turmas["turmaB"].length;
      const totalTurmaC = turmas["turmaC"].length;
      const totalTurmaD = turmas["turmaD"].length;
      const totalMembers = Object.values(turmas).flat().length;
  
      // Define os textos com os totais de membros por turma
      turmaACounter.textContent = `Turma A: ${totalTurmaA}`;
      turmaBCounter.textContent = `Turma B: ${totalTurmaB}`;
      turmaCCounter.textContent = `Turma C: ${totalTurmaC}`;
      turmaDCounter.textContent = `Turma D: ${totalTurmaD}`;
      totalMembersCounter.textContent = `Total de Membros: ${totalMembers}`;
  
      // Seletor para todos os botões "Ler mais"
      const lerMaisBtns = document.querySelectorAll('.ler-mais-btn');
  
      // Adicionar evento de clique a cada botão "Ler mais"
      lerMaisBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const conteudo = btn.nextElementSibling;
  
          // Alternar a visibilidade do conteúdo ao clicar no botão "Ler mais"
          if (conteudo.style.display === 'none' || conteudo.style.display === '') {
            conteudo.style.display = 'block';
            btn.textContent = 'Ler menos';
  
            // Adicione o código para preencher o conteúdo das turmas aqui
            const turmaId = btn.parentElement.id; // Obtém o ID da turma
            const turmaContent = document.getElementById(`${turmaId}-content`);
            turmaContent.innerHTML = turmas[turmaId].join(', ');
          } else {
            conteudo.style.display = 'none';
            btn.textContent = 'Ler mais';
          }
        });
      });
  
      const largura = window.innerWidth * 0.6; // 80% da largura da janela
      const altura = window.innerHeight * 0.9; // 90% da altura da janela
  
      const svg = d3.select("#sociogram")
        .attr("width", largura)
        .attr("height", altura)
        .append("g"); // Container para círculos e linhas
  
      const nodes = Object.keys(dadosMembros).map(d => ({ id: d }));

        const links = [];
      
        alunos.forEach(source => {
          dadosMembros[source].forEach(target => {
            links.push({ source, target });
          });
        });
      
        console.log(links);
  
      Object.keys(dadosMembros).forEach(source => {
        dadosMembros[source].forEach(target => {
          const mutualChoice = dadosMembros[target] && dadosMembros[target].includes(source);
          const myChoice = dadosMembros[source].includes(target);
  
          let type = "unchosen"; // Inicialmente, a escolha não corresponde
  
          if (mutualChoice) {
            type = "mutual"; // Eu escolho a pessoa e ela me escolheu (verde)
          } else if (myChoice) {
            type = "chosenUnilateral"; // A pessoa me escolheu e eu não a escolhi (azul)
          } else if (!mutualChoice && !myChoice) {
            type = "unchosen"; // Eu escolhi a pessoa e ela não me escolheu (vermelho)
          }
  
          links.push({ source, target, type });
        });
      });
  
      const link = svg.selectAll(".link")
        .data(links)
        .enter().append("line")
        .attr("class", d => `link ${d.type}`)
        .style("stroke", "#4F4F4F"); // Cor cinza claro inicial
  
      const simulation = d3.forceSimulation(nodes)
        .force("link", d3.forceLink(links).id(d => d.id))
        .force("charge", d3.forceManyBody().strength(-800))
        .force("center", d3.forceCenter(largura / 2, altura / 2));
  
      const defs = svg.append("defs");
      defs.append("marker")
        .attr("id", "arrowhead")
        .attr("markerWidth", 10)
        .attr("markerHeight", 7)
        .attr("refX", 0)
        .attr("refY", 3.5)
        .attr("orient", "auto")
        .append("polygon")
        .attr("points", "0 0, 10 3.5, 0 7");
  
      const circleRadius = 30;
  
      const node = svg.selectAll(".node")
      .data(nodes)
      .enter().append("g")
      .attr("class", "node")
      .attr("transform", d => `translate(${d.x},${d.y})`)
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);

      
      node.append("circle")
        .attr("r", circleRadius)
        .attr("class", function (d) {
          // Adicione classes de turma com base no pertencimento do aluno à turma
          if (turmas.turmaA.includes(d.id)) {
            return "node-circle turmaA";
          } else if (turmas.turmaB.includes(d.id)) {
            return "node-circle turmaB";
          } else if (turmas.turmaC.includes(d.id)) {
            return "node-circle turmaC";
          } else if (turmas.turmaD.includes(d.id)) {
            return "node-circle turmaD";
          }
        });
  
        node.append("text")
        .attr("dy", "0.30em")
        .attr("text-anchor", "middle")
        .text(d => d.id)
        .style("fill", "black")
        .style("font-size", "10px")
        .style("font-weight", "bold") 
        .style("pointer-events", "none");
    
    simulation.nodes(nodes).on("tick", ticked);
    simulation.force("link").links(links);
    
      
  
      // Atualiza a posição dos círculos e das linhas com base na largura e altura da tela
      function ticked() {
        link
          .attr("x1", d => Math.max(25, Math.min(largura - 25, d.source.x)))
          .attr("y1", d => Math.max(25, Math.min(altura - 25, d.source.y)))
          .attr("x2", d => Math.max(25, Math.min(largura - 25, d.target.x)))
          .attr("y2", d => Math.max(25, Math.min(altura - 25, d.target.y)));
      
        node.attr("transform", d => `translate(${Math.max(25, Math.min(largura - 25, d.x))},${Math.max(25, Math.min(altura - 25, d.y))})`);
      }
  
      // Adiciona um ouvinte de evento de redimensionamento da janela para atualizar os contadores e o tamanho do svg quando a tela é redimensionada
  
      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }
  
      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }
  
      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }
  
      function mouseover(event, d) {
        // Destaque o nó e suas conexões quando o mouse está sobre ele
        link.style("stroke", function (l) {
          if ((d === l.source && l.type === "chosenUnilateral") || (d === l.target && l.type === "unchosen")) {
            return "red"; // Eu escolhi a pessoa e ela não me escolheu (vermelho)
          } else if ((d === l.source && l.type === "unchosen") || (d === l.target && l.type === "chosenUnilateral")) {
            return "blue"; // A pessoa me escolheu e eu não a escolhi (azul)
          } else if ((d === l.source || d === l.target) && l.type === "mutual") {
            return "green"; // Eu escolho a pessoa e ela me escolheu (verde)
          } else {
            return "#0000"; // cor padrão para outras conexões (cinza claro)
          }
        });
      }
  
      function mouseout() {
        // Restaura a cor cinza claro das conexões quando o mouse sai do nó
        link.style("stroke", "#4F4F4F");
      }
    }
  });
