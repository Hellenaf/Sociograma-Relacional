document.addEventListener('DOMContentLoaded', function() {
    // Adiciona um ouvinte de eventos ao botão de login do Google
    const googleSignInButton = document.getElementById('googleSignInButton');
    googleSignInButton.addEventListener('click', function() {
      // Redireciona para a página de autenticação do Google ao clicar
      window.location.href = 'http://localhost:5500/auth/google';
    });
  });