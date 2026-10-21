
const supabase = require("./supabaseClient");

async function prepararFilaLigacoes() {
  const { data: contatos, error } = await supabase
    .from("contacts")
    .select("id, name, phone, consent_status")
    .eq("consent_status", "granted")
    .order("id", { ascending: true });

  if (error) {
    console.error("Erro ao buscar contatos:", error.message);
    throw new Error("Não foi possível preparar a fila.");
  }

  const { data: bloqueados, error: erroBloqueio } = await supabase
    .from("suppression_list")
    .select("phone");

  if (erroBloqueio) {
    console.error("Erro ao consultar bloqueios:", erroBloqueio.message);
    throw new Error("Não foi possível verificar a lista de bloqueio.");
  }

  const telefonesBloqueados = new Set(
    bloqueados.map((item) => item.phone)
  );

  return contatos
    .filter((contato) => !telefonesBloqueados.has(contato.phone))
    .map((contato) => ({
      contact_id: contato.id,
      nome: contato.name,
      telefone: contato.phone,
      status: "queued"
    }));
}

async function registrarFilaLigacoes(nomeCampanha = "Campanha de teste") {
  const fila = await prepararFilaLigacoes();

  const registrosCriados = [];

  for (const contato of fila) {
    const { data: pendentes, error: erroConsulta } = await supabase
      .from("call_logs")
      .select("id")
      .eq("contact_id", contato.contact_id)
      .eq("campaign_name", nomeCampanha)
      .eq("status", "queued")
      .limit(1);

    if (erroConsulta) {
      console.error("Erro ao verificar fila existente:", erroConsulta.message);
      throw new Error("Não foi possível verificar registros pendentes.");
    }

    if (pendentes.length > 0) {
      continue;
    }

    const { data, error: erroInsercao } = await supabase
      .from("call_logs")
      .insert({
        contact_id: contato.contact_id,
        phone: contato.telefone,
        campaign_name: nomeCampanha,
        status: "queued"
      })
      .select("id, contact_id, phone, campaign_name, status, created_at")
      .single();

    if (erroInsercao) {
      console.error("Erro ao registrar ligação:", erroInsercao.message);
      throw new Error("Não foi possível registrar a fila de ligações.");
    }

    registrosCriados.push(data);
  }

  return {
    campanha: nomeCampanha,
    totalElegiveis: fila.length,
    novosRegistros: registrosCriados.length,
    registros: registrosCriados,
    ligacoesReaisHabilitadas: false
  };
}

module.exports = {
  prepararFilaLigacoes,
  registrarFilaLigacoes
};
