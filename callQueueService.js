const supabase = require("./supabaseClient");

async function prepararFilaLigacoes() {
  //buscar somente contatos com consentimento concedido
  const { data: contatos, error } = await supabase
    .from("contacts")
    .select("id, name,phone, consent_status")
    .eq("consent_status", "granted")
    .order("id", { ascending: true });

  if (error) {
    console.error("Erro ao buscar contatos: ", error.message);
    throw new Error("Não foi possível preparar a fila de ligações.");
  }

  //consultar lista de bloqueio
  const { data: bloqueados, error: erroBloqueio } = await supabase
    .from("suppression_list")
    .select("phone");

  if (erroBloqueio) {
    console.error("Erro ao buscar bloqueios", erroBloqueio.message);
    throw new Error("Não foi possível verificar a lista de bloqueios.");
  }

  const telefonesBloqueados = new Set(bloqueados.map((item) => item.phone));

  //excluir todos os números bloqueador
  const fila = contatos
    .filter((contato) => !telefonesBloqueados.has(contato.phone))
    .map((contato) => ({
      contact_id: contato.id,
      nome: contato.name,
      telefone: contato.phone,
      status: "queued",
    }));
  return fila;
}

module.exports = { prepararFilaLigacoes };
