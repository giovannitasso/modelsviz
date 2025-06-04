const App = () => {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("data.json")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
      })
      .then(json => setData(json))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return React.createElement("div", null, "Cargando...");
  }

  if (error) {
    return React.createElement("div", { style: { color: "red" } }, `Error: ${error}`);
  }

  if (!data || !data.coefficients) {
    return React.createElement("div", { style: { color: "orange" } }, "Datos no válidos.");
  }

  const coeffRows = data.coefficients.map((c, i) =>
    React.createElement("tr", { key: i },
      React.createElement("td", null, c.name),
      React.createElement("td", null, c.estimate?.toFixed(3) ?? "n/a"),
      React.createElement("td", null, `${data.confint?.[i]?.lower?.toFixed(3) ?? "?"} - ${data.confint?.[i]?.upper?.toFixed(3) ?? "?"}`),
      React.createElement("td", null, c["p.value"]?.toExponential(2) ?? "n/a")
    )
  );

  // Esta parte es segura ahora, porque solo se ejecuta después de tener data
  React.useEffect(() => {
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
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }, [data]);

  return React.createElement("div", null,
    React.createElement("h1", null, "Resumen del Modelo"),
    React.createElement("table", null,
      React.createElement("thead", null,
        React.createElement("tr", null,
          React.createElement("th", null, "Término"),
          React.createElement("th", null, "Estimación"),
          React.createElement("th", null, "95% CI"),
          React.createElement("th", null, "p-valor")
        )
      ),
      React.createElement("tbody", null, coeffRows)
    ),
    React.createElement("canvas", { id: "coefplot", width: 400, height: 300 })
  );
};

ReactDOM.render(React.createElement(App), document.getElementById("root"));




