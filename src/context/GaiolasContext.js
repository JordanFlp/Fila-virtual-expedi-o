import { createContext, useState, useCallback, useEffect } from "react";

export const GaiolasContext = createContext();

export function GaiolasProvider({ children }) {
  const [gaiolas, setGaiolas] = useState([]);
  const [bancadas, setBancadas] = useState([]);

  const gerarBancadas = (num) => {
    const novos = [];
    for (let i = 1; i <= num; i++) {
      novos.push({ id: i, status: "livre", fila: [] });
    }
    setBancadas(novos);
  };

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

  const solicitarRota = (rota, bancadaId = null) => {
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
            ? { ...b, status: "em_conferencia", fila: [...b.fila, rota] }
            : b
        )
      );
    }
  };

  const processarFila = useCallback(() => {
    setBancadas((prevBancadas) => {
      let novasBancadas = [...prevBancadas];

      const filaGlobal = gaiolas.filter((g) => g.status === "em_fila");

      for (let rota of filaGlobal) {
        const bancadaLivreIndex = novasBancadas.findIndex((b) => b.status === "livre");
        if (bancadaLivreIndex === -1) break;

        let podeEntrar = true;
        if (rota.num % 2 === 0) {
          const anterior = gaiolas.find(
            (x) => x.letter === rota.letter && x.num === rota.num - 1
          );
          if (anterior && anterior.status === "em_conferencia") podeEntrar = false;
        } else {
          const proximo = gaiolas.find(
            (x) => x.letter === rota.letter && x.num === rota.num + 1
          );
          if (proximo && proximo.status === "em_conferencia") podeEntrar = false;
        }

        if (!podeEntrar) continue;

        setGaiolas((prevG) =>
          prevG.map((g) =>
            g.letter === rota.letter && g.num === rota.num
              ? { ...g, status: "em_conferencia" }
              : g
          )
        );

        novasBancadas[bancadaLivreIndex] = {
          ...novasBancadas[bancadaLivreIndex],
          status: "em_conferencia",
          fila: [...novasBancadas[bancadaLivreIndex].fila, rota],
        };
      }

      return novasBancadas;
    });
  }, [gaiolas]);

  const atualizarStatus = (bancadaId, index, novoStatus) => {
    setBancadas((prevBancadas) =>
      prevBancadas.map((b) => {
        if (b.id === bancadaId && b.fila[index]) {
          const rotaAtual = b.fila[index];

          setGaiolas((prevG) =>
            prevG.map((g) =>
              g.letter === rotaAtual.letter && g.num === rotaAtual.num
                ? { ...g, status: novoStatus }
                : g
            )
          );

          let novaFila = [...b.fila];
          let novoStatusBancada = b.status;

          if (novoStatus === "conferida" || novoStatus === "buffer") {
            novaFila.splice(index, 1);
            novoStatusBancada = novaFila.length > 0 ? "em_conferencia" : "livre";

            // Processa fila imediatamente
            processarFila();
          }

          return { ...b, fila: novaFila, status: novoStatusBancada };
        }
        return b;
      })
    );
  };

  const toggleBancada = (bancadaId) => {
    setBancadas((prev) =>
      prev.map((b) =>
        b.id === bancadaId
          ? { ...b, status: b.status === "desativada" ? "livre" : "desativada" }
          : b
      )
    );
  };

  // Exemplo de useEffect sem warning
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
