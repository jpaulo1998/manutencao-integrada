function inicializarMaster() {
  const usuarios = getUsuarios();
  if (usuarios.length === 0) {
    const master = {
      id:      gerarId(),
      usuario: 'admin',
      senha:   'lubeasy@2026',
      perfil:  'master',
      ativo:   true
    };
    localStorage.setItem('lubeasy_usuarios', JSON.stringify([master]));
  }
}

function getUsuarios() {
  const dados = localStorage.getItem('lubeasy_usuarios');
  return dados ? JSON.parse(dados) : [];
}

function gerarId() {
  return '_' + Math.random().toString(36).substr(2, 9);
}

function fazerLogin(event) {
  event.preventDefault();

  const usuario = document.getElementById('input-usuario').value.trim();
  const senha   = document.getElementById('input-senha').value.trim();
  const msgErro = document.getElementById('msg-erro');
  const txtErro = document.getElementById('texto-erro');

  const usuarios   = getUsuarios();
  const encontrado = usuarios.find(
    u => u.usuario === usuario && u.senha === senha && u.ativo === true
  );

  if (encontrado) {
    const sessao = {
      id:      encontrado.id,
      usuario: encontrado.usuario,
      perfil:  encontrado.perfil,
      hora:    new Date().toISOString()
    };
    sessionStorage.setItem('lubeasy_sessao', JSON.stringify(sessao));
    window.location.href = 'admin.html';
  } else {
    txtErro.textContent        = 'Usuário ou senha incorretos.';
    msgErro.style.display      = 'flex';
    document.getElementById('input-senha').value = '';
    document.getElementById('input-senha').focus();
  }
}

function verificarSessao() {
  const sessao = sessionStorage.getItem('lubeasy_sessao');
  if (!sessao) {
    window.location.href = 'login.html';
    return null;
  }
  return JSON.parse(sessao);
}

function fazerLogout() {
  sessionStorage.removeItem('lubeasy_sessao');
  window.location.href = 'login.html';
}

function toggleSenha() {
  const input = document.getElementById('input-senha');
  const icone = document.getElementById('icone-olho');
  if (input.type === 'password') {
    input.type      = 'text';
    icone.className = 'fa-solid fa-eye-slash';
  } else {
    input.type      = 'password';
    icone.className = 'fa-solid fa-eye';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  inicializarMaster();
});