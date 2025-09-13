import { createContext, useState, useEffect, useCallback } from "react";

export const GaiolasContext = createContext();

export function GaiolasProvider({ children }) {
  const [gaiolas, setGaiolas] = useState([]);
  const [bancadas, setBancadas] = useState([]);
  const [ultimaSolicitacao, setUltimaSolicitacao] = useState(Date.now());

  // === GERAR BANCADAS ===
  const gerarBancadas = (num) => {
    const novos = [];
    for (let i = 1; i <= num; i++) {
      novos.push({ id: i, status: "livre", fila: [], historico: [] });
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
    if (!rota) return;
    setUltimaSolicitacao(Date.now());

    // ❌ Bloqueia se a rota estiver expedida
    if (rota.status === "conferida" && rota.subStatus === "expedida") {
      alert(`Rota ${rota.letter}-${rota.num} já foi expedida e não pode ser solicitada novamente.`);
      return;
    }

    // Atualiza status global
    setGaiolas((prev) =>
      prev.map((g) =>
        g.letter === rota.letter && g.num === rota.num
          ? { ...g, status: bancadaId ? "em_conferencia" : "em_fila" }
          : g
      )
    );

    // Se tiver bancada disponível, atribui direto
    if (bancadaId) {
      setBancadas((prev) =>
        prev.map((b) =>
          b.id === bancadaId
            ? {
                ...b,
                status: "em_conferencia",
                fila: [...b.fila, { letter: rota.letter, num: rota.num }],
              }
            : b
        )
      );
    }
  };

  const selecionarRotaManual = (rotaId, bancadaId) => {
    setGaiolas((prevGaiolas) => {
      const rota = prevGaiolas.find((g) => g.id === rotaId);
      if (!rota) return prevGaiolas;

      // Não pode selecionar rota que já está na fila
      if (rota.status === "em_fila") {
        alert("Não é possível selecionar uma rota que já está na fila.");
        return prevGaiolas;
      }

      // Encontrar rota vizinha para verificar conflito
      const vizinha = prevGaiolas.find((g) =>
        g.letter === rota.letter &&
        (g.num === rota.num - 1 || g.num === rota.num + 1) &&
        g.status === "em_conferencia"
      );

      if (vizinha) {
        alert("A rota vizinha está em conferência. Não é possível selecionar esta rota agora.");
        return prevGaiolas;
      }

      // Validar se a bancada existe e está livre
      const bancada = bancadas.find((b) => b.id === bancadaId);
      if (!bancada) {
        alert("Bancada inválida.");
        return prevGaiolas;
      }

      if (bancada.status !== "livre") {
        alert("A bancada selecionada não está livre.");
        return prevGaiolas;
      }

      // Atualiza a bancada para em conferência
      const novasBancadas = bancadas.map((b) =>
        b.id === bancadaId
          ? { ...b, status: "em_conferencia", fila: [rotaId] }
          : b
      );
      setBancadas(novasBancadas);

      // Atualiza status da rota
      return prevGaiolas.map((g) =>
        g.id === rotaId ? { ...g, status: "em_conferencia", bancadaId } : g
      );
    });
  };

  // === ATUALIZAR STATUS ===
  const atualizarStatus = (bancadaId, index, novoStatus, subStatus = null) => {
  setUltimaSolicitacao(Date.now());

  setBancadas(prev =>
    prev.map(b => {
      if (b.id === bancadaId && b.fila[index]) {
        const rotaAtual = b.fila[index];
        const novaFila = [...b.fila];
        novaFila.splice(index, 1);
        const novoHistorico = [...(b.historico || [])];

        if (novoStatus === "conferida") {
          novoHistorico.push({ ...rotaAtual, status: novoStatus, subStatus });
        }

        // Atualiza status global
        setGaiolas(prevG =>
          prevG.map(g =>
            g.letter === rotaAtual.letter && g.num === rotaAtual.num
              ? { ...g, status: novoStatus, subStatus } // <- aqui usamos o parâmetro
              : g
          )
        );

        const novoStatusBancada = novaFila.length > 0 ? "em_conferencia" : "livre";

        return { ...b, fila: novaFila, historico: novoHistorico, status: novoStatusBancada };
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

  // === ATRIBUIÇÃO AUTOMÁTICA RESPEITANDO VIZINHAS ===
 const atribuirRotasAutomaticamente = useCallback(() => {
  setBancadas((prevBancadas) => {
    const novasBancadas = prevBancadas.map(b => ({
      ...b,
      fila: [...b.fila],
      historico: [...(b.historico || [])],
    }));

    // Faz uma cópia local do estado de gaiolas para checar vizinhas em tempo real
    let gaiolasLocais = gaiolas.map(g => ({ ...g }));

    // Pega apenas gaiolas pendentes ou em fila
    const pendentes = gaiolasLocais.filter(g => g.status === "pendente" || g.status === "em_fila");

    for (let rota of pendentes) {
      // encontra bancada livre
      const bancadaLivreIndex = novasBancadas.findIndex(b => b.status === "livre");
      if (bancadaLivreIndex === -1) break;

      // verifica vizinhas (-1 / +1)
      const anterior = gaiolasLocais.find(g => g.letter === rota.letter && g.num === rota.num - 1);
      const proximo = gaiolasLocais.find(g => g.letter === rota.letter && g.num === rota.num + 1);
      if ((rota.num % 2 === 0 && anterior?.status === "em_conferencia") ||
          (rota.num % 2 !== 0 && proximo?.status === "em_conferencia")) {
        continue; // pula se vizinha em conferencia
      }

      // dar preferência por vizinhas conferidas
      const temVizinhaHistorico = novasBancadas.some(b =>
        b.historico?.some(h => h.letter === rota.letter && (h.num === rota.num - 1 || h.num === rota.num + 1))
      );

      // Atualiza gaiola local
      gaiolasLocais = gaiolasLocais.map(g =>
        g.letter === rota.letter && g.num === rota.num
          ? { ...g, status: "em_conferencia" }
          : g
      );

      // Atualiza bancada
      const bancada = novasBancadas[bancadaLivreIndex];
      novasBancadas[bancadaLivreIndex] = {
        ...bancada,
        status: "em_conferencia",
        fila: temVizinhaHistorico
          ? [{ ...rota, status: "em_conferencia" }, ...bancada.fila]
          : [...bancada.fila, { ...rota, status: "em_conferencia" }],
      };
    }

    // Atualiza o estado global de gaiolas após a atribuição
    setGaiolas(gaiolasLocais);

    return novasBancadas;
  });
}, [gaiolas]);


  // === PROCESSAR FILA AUTOMÁTICA ===
  const processarFila = useCallback(() => {
    setBancadas((prevBancadas) => {
      const novasBancadas = prevBancadas.map((b) => ({ ...b, fila: [...b.fila], historico: [...(b.historico || [])] }));
      const filaGlobal = gaiolas.filter((g) => g.status === "em_fila");

      for (let rota of filaGlobal) {
        const bancadaLivreIndex = novasBancadas.findIndex((b) => b.status === "livre");
        if (bancadaLivreIndex === -1) break;

        const anterior = gaiolas.find(g => g.letter === rota.letter && g.num === rota.num - 1);
        const proximo = gaiolas.find(g => g.letter === rota.letter && g.num === rota.num + 1);
        let podeEntrar = true;

        if ((rota.num % 2 === 0 && anterior?.status === "em_conferencia") ||
            (rota.num % 2 !== 0 && proximo?.status === "em_conferencia")) {
          podeEntrar = false;
        }

        if (!podeEntrar) continue;

        // Atualiza gaiola global
        setGaiolas(prevG =>
          prevG.map(g =>
            g.letter === rota.letter && g.num === rota.num
              ? { ...g, status: "em_conferencia" }
              : g
          )
        );

        // Atualiza bancada
        const bancada = novasBancadas[bancadaLivreIndex];
        novasBancadas[bancadaLivreIndex] = {
          ...bancada,
          status: "em_conferencia",
          fila: [...bancada.fila, { ...rota, status: "em_conferencia" }],
        };
      }

      return novasBancadas;
    });
  }, [gaiolas]);

  // === TIMER AUTOMÁTICO ===
  useEffect(() => {
    const interval = setInterval(() => {
      if (Date.now() - ultimaSolicitacao >= 60000) processarFila();
    }, 10000);
    return () => clearInterval(interval);
  }, [ultimaSolicitacao, processarFila]);

  // Timer de atribuição automática para teste
  useEffect(() => {
    const interval = setInterval(() => atribuirRotasAutomaticamente(), 40000);
    return () => clearInterval(interval);
  }, [atribuirRotasAutomaticamente]);

  // Auto-processamento inicial
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
        selecionarRotaManual,
        atualizarStatus,
        toggleBancada,
        processarFila,
        atribuirRotasAutomaticamente,
      }}
    >
      {children}
    </GaiolasContext.Provider>
  );
}
