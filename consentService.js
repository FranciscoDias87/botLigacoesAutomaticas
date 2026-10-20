const contatos = new Map();
const bloqueados = new Set();

function normalizarTelefone(telefone) {
  if (typeof telefone !== "string" &&
      typeof telefone !== "number") {
    throw new Error("Telefone deve ser uma string ou número.");
  }
  const numero = String(telefone).replace(/\D/g, "");
  if (!numero){
    throw new Error("Telefone obrigatório.");
  }
  return numero;
}

function cadastrarContato({ nome, telefone, consentimento }) {
  if (!nome || !telefone) {
    throw new Error("Nome e telefone são obrigatórios.");
  }

  if (consentimento !== true) {
    throw new Error("É necessário registrar o consentimento para a campanha.");
  }

  const numero = normalizarTelefone(telefone);

  if (numero.length < 10 || numero.length > 15) {
    throw new Error("Número de telefone inválido.");
  }

  if (bloqueados.has(numero)) {
    throw new Error("Este número está na lista de bloqueio.");
  }

  contatos.set(numero, {
    nome,
    telefone: numero,
    consentimento: true,
    dataConsentimento: new Date().toISOString(),
    status: "autorizado",
  });

  return contatos.get(numero);
}

function listarContatos() {
  return [...contatos.values()];
}

function bloquearContato(telefone) {
  const numero = normalizarTelefone(telefone);

  bloqueados.add(numero);
  contatos.delete(numero);

  return {
    telefone: numero,
    bloqueado: true,
  };
}

function estaBloqueado(telefone) {
  return bloqueados.has(normalizarTelefone(telefone));
}

module.exports = {
  cadastrarContato,
  listarContatos,
  bloquearContato,
  estaBloqueado,
};
