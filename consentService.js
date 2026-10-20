const supabase = require("@supabase/supabase-js");

function normalizarTelefone(telefone) {
  if (typeof telefone !== "string" && typeof telefone !== "number") {
    throw new Error("Telefone deve ser uma string ou número.");
  }
  const numero = String(telefone).replace(/\D/g, "");

  if (numero.length < 10 || numero.length > 15) {
    throw new Error("Telefone Inválido.");
  }
  return numero;
}

async function cadastrarContato({
  nome,
  telefone,
  consentimento,
  origemConsentimento,
}) {
  if (typeof nome != "string" || !nome.trim()) {
    throw new Error("Nome é obrigatório.");
  }

  if (consentimento !== true) {
    throw new Error("É necessário registrar o consentimento para a campanha.");
  }

  const numero = normalizarTelefone(telefone);

  const { data: bloqueio, error: erroBloqueio } = await supabase
    .from("suppression_list")
    .select("id")
    .eq("phone", numero)
    .maybeSingle();

  if (erroBloqueio) {
    throw new Error(
      "Não foi possível verificar a lista de bloqueio: " + erroBloqueio.message,
    );
  }

  if (bloqueio) {
    throw new Error(
      "Este número está na lista de bloqueio e não pode ser adicionado.",
    );
  }

  const { data, erro } = await supabase
    .from("contacts")
    .insert({
      name: nome.trim(),
      phone: numero,
      consent_status: "granted",
      consent_source: origemConsentimento,
      consent_at: new Date().toISOString(),
    })
    .select("id, name, phone, consent_status, consent_source, consent_at")
    .single();

  if (error) {
    if (error.code === "23505") {
      throw new Error("Este número já está cadastrado.");
    }
    throw new Error("Não foi possível cadastrar o contato: ");
  }
  return data;
}

async function listarContatos() {
  const { data, error } = await supabase
  .from("contacts")
  .select("id, name, phone, consent_status, consent_source, consent_at")
  .eq("consent_status", "granted")
  .order("consent_at", { ascending: false });

  if (error) {
    throw new Error("Não foi possível listar os contatos: " + error.message);
  }

  return data;
}

async function bloquearContato(telefone) {

    //registar bloqueio permanente
    const { error: erroBloqueio } = await supabase
    .from("suppression_list")
    .upsert({ 
        phone: numero,
        reason: "opt-out"
     },
     {conflict: "phone"}    
    );

    if (erroBloqueio){
        throw new Error("Não foi possível bloquear o contato: ");
    }

    //revoga autorização de contato 
    const {error: erroContato} = await supabase
    .from("contacts")
    .update({ consent_status: "revoked" })
    .eq("phone", numero);

    if (erroContato){
        throw new Error("Não foi possível revogar o consentimento do contato: ");
    }

    return{
        telefone: numero,
        bloqueado: true,
    };
}

module.exports = {
  cadastrarContato,
  listarContatos,
  bloquearContato,  
};
