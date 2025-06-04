const { useState, useEffect, createElement } = React;

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("data.json")
      .then(res => {
        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch(err => {
        console.error("Error loading JSON:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return createElement("div", null, "Cargando datos del modelo...");
  }

  if (error) {
    return createElement("div", { style: { color: "red" } }, `Error: ${error}`);
  }

  if (!data || !Array.isArray(data.coefficients)) {
    return createElement("div", { style: { color: "orange" } }, "Datos inválidos.");
  }

  // Encabezados de la tabla
  const headerRow = createElement("tr", null,
    ["Term", "Estimate", "Std.Error", "Statistic", "p-value"].map((h, i) =>
      createElement("th", { key: i }, h)
    )
  );

  // Filas de datos
  const rows = data.coefficients.map((c, i) =>
    createElement("tr", { key: i },
      createElement("td", null, c.name),
      createElement("td", null, c.estimate?.toFixed(3) ?? "n/a"),
      createElement("td", null, c["std.error"]?.toFixed(3) ?? "n/a"),
      createElement("td", null, c.statistic?.toFixed(3) ?? "n/a"),
      createElement("td", null, c["p.value"]?.toExponential(2) ?? "n/a")
    )
  );

  // Render gráfico
  useEffect(() => {
    const canvas = document.getElementById("coefplot");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    new Chart(ctx, {
      type: "bar",
      data: {
        labels: data.coefficients.map(c => c.name),
        datasets: [{
          label: "Estimate",
          data: data.coefficients.map(c => c.estimate),
          backgroundColor: "#29b6f6"
        }]
      },
      options: {
        scales: { y: { beginAtZero: true } }
      }
    });
  }, [data]);

  const download = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "model.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return createElement("div", null,
    createElement("h1", null, "Model Summary"),
    createElement("button", { onClick: download }, "Download JSON"),
    createElement("table", null,
      createElement("thead", null, headerRow),
      createElement("tbody", null, rows)
    ),
    createElement("canvas", { id: "coefplot", width: 400, height: 300 })
  );
}

ReactDOM.render(createElement(App), document.getElementById("root"));



