import { createContext, useState, useCallback, useEffect } from "react";

export const GaiolasContext = createContext();

export function GaiolasProvider({ children }) {
  const [gaiolas, setGaiolas] = useState([]);
  const [bancadas, setBancadas] = useState([]);
  const [ultimaSolicitacao, setUltimaSolicitacao] = useState(Date.now());

  // === GERAR BANCADAS ===
  const gerarBancadas = (num) => {
    const novos = [];
    for (let i = 1; i <= num; i++) {
      novos.push({ id: i, status: "livre", fila: [], historico: [] }); // inicializa historico
    }
    setBancadas(novos);
  };

  // === GERAR GAIOLAS ===
  const gerarGaiolas = (startLetter, endLetter, lastLimit) => {
    const result = [];
    const startCode = startLetter.charCodeAt(0);
    const endCode = endLetter.charCodeAt(0);

    for (let code = startCode; code <= endCode; code++) {
      const letter = String.fromCharCode(code);
      const maxNumber = code === endCode ? lastLimit : 36;
      for (let num = 1; num <= maxNumber; num++) {
        result.push({ letter, num, status: "pendente" });
      }
    }
    setGaiolas(result);
  };

  // === SOLICITAR ROTA MANUAL ===
  const solicitarRota = (rota, bancadaId = null) => {
    setUltimaSolicitacao(Date.now());

    setGaiolas((prev) =>
      prev.map((g) =>
        g.letter === rota.letter && g.num === rota.num
          ? { ...g, status: bancadaId ? "em_conferencia" : "em_fila" }
          : g
      )
    );

    if (bancadaId) {
      setBancadas((prev) =>
        prev.map((b) =>
          b.id === bancadaId
            ? { ...b, status: "em_conferencia", fila: [...b.fila, rota], historico: b.historico || [] }
            : b
        )
      );
    }
  };

  // === PROCESSAR FILA ===
  const processarFila = useCallback(() => {
    setBancadas((prevBancadas) => {
      let novasBancadas = prevBancadas.map((b) => ({ ...b, fila: [...b.fila], historico: b.historico || [] }));
      const filaGlobal = gaiolas.filter((g) => g.status === "em_fila");

      for (let rota of filaGlobal) {
        const bancadaLivreIndex = novasBancadas.findIndex((b) => b.status === "livre");
        if (bancadaLivreIndex === -1) break;

        let podeEntrar = true;
        if (rota.num % 2 === 0) {
          const anterior = gaiolas.find((x) => x.letter === rota.letter && x.num === rota.num - 1);
          if (anterior && anterior.status === "em_conferencia") podeEntrar = false;
        } else {
          const proximo = gaiolas.find((x) => x.letter === rota.letter && x.num === rota.num + 1);
          if (proximo && proximo.status === "em_conferencia") podeEntrar = false;
        }

        if (!podeEntrar) continue;

        setGaiolas((prevG) =>
          prevG.map((g) =>
            g.letter === rota.letter && g.num === rota.num ? { ...g, status: "em_conferencia" } : g
          )
        );

        const bancada = novasBancadas[bancadaLivreIndex];
        novasBancadas[bancadaLivreIndex] = {
          ...bancada,
          status: "em_conferencia",
          fila: [...bancada.fila, rota],
          historico: bancada.historico || [],
        };
      }

      return novasBancadas;
    });
  }, [gaiolas]);

  // === ATUALIZAR STATUS ===
  const atualizarStatus = (bancadaId, index, novoStatus) => {
  setUltimaSolicitacao(Date.now());

  setBancadas((prevBancadas) =>
    prevBancadas.map((b) => {
      if (b.id === bancadaId && b.fila[index]) {
        const rotaAtual = b.fila[index];
        const novaFila = [...b.fila];
        let novoHistorico = [...(b.historico || [])];

        // Remover da fila
        novaFila.splice(index, 1);

        // Adiciona ao histórico tanto conferida quanto buffer
        if (novoStatus === "conferida" || novoStatus === "buffer") {
          novoHistorico.push({ ...rotaAtual, status: novoStatus });
        }

        // Atualiza status da bancada
        const novoStatusBancada = novaFila.length > 0 ? "em_conferencia" : "livre";

        // Atualiza status da gaiola global
        setGaiolas((prevG) =>
          prevG.map((g) =>
            g.letter === rotaAtual.letter && g.num === rotaAtual.num
              ? { ...g, status: novoStatus }
              : g
          )
        );

        processarFila();

        return { ...b, fila: novaFila, status: novoStatusBancada, historico: novoHistorico };
      }
      return b;
    })
  );
};


  // === TOGGLE BANCADA ===
  const toggleBancada = (bancadaId) => {
    setBancadas((prev) =>
      prev.map((b) =>
        b.id === bancadaId
          ? { ...b, status: b.status === "desativada" ? "livre" : "desativada" }
          : b
      )
    );
  };

  // === ATRIBUIR VIZINHA AUTOMATICAMENTE ===
  const atribuirVizinhaAutomaticamente = useCallback(() => {
    const gLocal = gaiolas.map((g) => ({ ...g }));
    const bLocal = bancadas.map((b) => ({ ...b, fila: [...b.fila], historico: b.historico || [] }));

    let houveMudanca = false;

    for (let bi = 0; bi < bLocal.length; bi++) {
      const bancada = bLocal[bi];
      if (bancada.status !== "livre") continue;

      const filaDisponivel = gLocal.find((g) => g.status === "pendente" || g.status === "em_fila");
      if (!filaDisponivel) continue;

      const gIdx = gLocal.indexOf(filaDisponivel);
      gLocal[gIdx] = { ...filaDisponivel, status: "em_conferencia" };

      bLocal[bi] = {
        ...bancada,
        fila: [...bancada.fila, filaDisponivel],
        status: "em_conferencia",
        historico: [...bancada.historico],
      };

      houveMudanca = true;
    }

    if (houveMudanca) {
      setGaiolas(gLocal);
      setBancadas(bLocal);
      setUltimaSolicitacao(Date.now());
    }
  }, [gaiolas, bancadas]);

  // === TIMER AUTOMÁTICO ===
  useEffect(() => {
    const interval = setInterval(() => {
      const diff = Date.now() - ultimaSolicitacao;
      if (diff >= 60000) {
        atribuirVizinhaAutomaticamente();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [ultimaSolicitacao, atribuirVizinhaAutomaticamente]);

  // === AUTO-PROCESSAMENTO DE FILA ===
  useEffect(() => {
    processarFila();
  }, [processarFila]);

  return (
    <GaiolasContext.Provider
      value={{
        gaiolas,
        setGaiolas,
        bancadas,
        setBancadas,
        gerarGaiolas,
        gerarBancadas,
        solicitarRota,
        atualizarStatus,
        toggleBancada,
        processarFila,
      }}
    >
      {children}
    </GaiolasContext.Provider>
  );
}
