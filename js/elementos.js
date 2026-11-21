/*
 * ELEMENTOS DE INSPEÇÃO TÉCNICA
 * Compartilhado entre admin.html e inspecao.html.
 *
 * Firestore:
 *   elementos_inspecao/{id}  -> catálogo (nome, tipo, prefixo, itens, ordem)
 *   tags_inspecao/{TAG}      -> cadastro da TAG (tag, equipamento,
 *                               elementos: [{ id, quantidade }])
 *   inspecoes_atuais/{TAG}   -> inspeção (estrutura + valores)
 *
 * Tipos de elemento:
 *   texto     -> um campo de texto           (ex.: Âncora)
 *   numerado  -> N itens "Prefixo 1..N"      (ex.: Ponta 1, Ponta 2)
 *   nomeado   -> itens com nomes fixos       (ex.: Canto LE, Canto LD)
 *   opcao     -> Sim / Não / N/A             (ex.: Lâminas já foram viradas?)
 */

export const TIPOS = {
  texto: "Texto livre",
  numerado: "Lista numerada",
  nomeado: "Itens com nomes",
  opcao: "Sim / Não / N/A",
};

export const OPCOES = ["Sim", "Não", "N/A"];

// Os IDs são os mesmos nomes de campo usados nas inspeções antigas.
export const ELEMENTOS_PADRAO = [
  { id: "folgaCuboHelice", nome: "Folga do cubo de hélice", tipo: "texto", ordem: 1 },
  { id: "ancora", nome: "Âncora", tipo: "texto", ordem: 2 },
  { id: "lamina", nome: "Lâmina", tipo: "numerado", prefixo: "Borda", ordem: 3 },
  { id: "cantos", nome: "Cantos", tipo: "nomeado", itens: ["Canto LE", "Canto LD"], ordem: 4 },
  { id: "escarificador", nome: "Escarificador", tipo: "numerado", prefixo: "Escarificador", ordem: 5 },
  { id: "pontas", nome: "Pontas", tipo: "numerado", prefixo: "Ponta", ordem: 6 },
  { id: "laminasViradas", nome: "Lâminas já foram viradas?", tipo: "opcao", ordem: 7 },
];

export function idDaTag(tag) {
  return encodeURIComponent(String(tag || "").trim().toUpperCase());
}

export function ordenarCatalogo(lista) {
  return [...lista].sort(
    (a, b) =>
      (a.ordem || 0) - (b.ordem || 0) ||
      String(a.nome || "").localeCompare(String(b.nome || ""), "pt-BR"),
  );
}

// Nomes dos itens de um elemento para uma TAG.
export function rotulosDoElemento(elemento, quantidade) {
  if (elemento.tipo === "numerado") {
    const total = Math.max(1, parseInt(quantidade, 10) || 1);
    const prefixo = elemento.prefixo || elemento.nome;
    return Array.from({ length: total }, (_, i) => prefixo + " " + (i + 1));
  }

  if (elemento.tipo === "nomeado") {
    return (elemento.itens || []).map((item) => String(item).trim()).filter(Boolean);
  }

  return [];
}

// Estrutura do formulário de uma TAG (fica salva junto com a inspeção).
export function montarEstrutura(catalogo, cadastroTag) {
  const porId = new Map(catalogo.map((el) => [el.id, el]));

  return (cadastroTag?.elementos || [])
    .map((config) => {
      const elemento = porId.get(config.id);

      if (!elemento) {
        return null;
      }

      return {
        id: elemento.id,
        nome: elemento.nome,
        tipo: elemento.tipo,
        prefixo: elemento.prefixo || "",
        itens: rotulosDoElemento(elemento, config.quantidade),
      };
    })
    .filter(Boolean);
}

// Inspeções salvas antes do cadastro por TAG.
function estruturaLegada() {
  return ELEMENTOS_PADRAO.map((el) => ({
    id: el.id,
    nome: el.nome,
    tipo: el.tipo,
    prefixo: el.prefixo || "",
    itens: el.tipo === "nomeado" ? el.itens : [],
  }));
}

export function ehRegistroLegado(registro) {
  return !Array.isArray(registro?.estrutura);
}

export function estruturaDoRegistro(registro) {
  return ehRegistroLegado(registro) ? estruturaLegada() : registro.estrutura;
}

export function valoresDoRegistro(registro) {
  if (!registro) {
    return {};
  }

  if (registro.valores) {
    return registro.valores;
  }

  const cantos =
    registro.cantoLE || registro.cantoLD
      ? [registro.cantoLE || "", registro.cantoLD || ""]
      : undefined;

  return {
    folgaCuboHelice: registro.folgaCuboHelice,
    ancora: registro.ancora,
    lamina: registro.lamina,
    cantos,
    escarificador: registro.escarificador,
    pontas: registro.pontas,
    laminasViradas: registro.laminasViradas,
  };
}

/*
 * Resumo para exibir (consulta pública e histórico):
 * [{ titulo, itens: [{ rotulo, valor }] }]
 */
export function resumoDoRegistro(registro) {
  const legado = ehRegistroLegado(registro);
  const valores = valoresDoRegistro(registro);

  return estruturaDoRegistro(registro)
    .map((el) => {
      const valor = valores[el.id];
      let itens;

      if (Array.isArray(valor) && (el.tipo === "numerado" || el.tipo === "nomeado")) {
        itens = valor.map((v, i) => ({
          rotulo: el.itens?.[i] || (el.prefixo || el.nome) + " " + (i + 1),
          valor: String(v ?? ""),
        }));
      } else {
        const texto = Array.isArray(valor) ? valor.join(", ") : String(valor ?? "");
        itens = [{ rotulo: "", valor: texto }];
      }

      return { titulo: el.nome, itens };
    })
    .filter(
      (linha) =>
        !legado || linha.itens.some((item) => item.valor.trim() !== ""),
    );
}
