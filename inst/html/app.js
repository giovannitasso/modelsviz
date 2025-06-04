const App = () => {
  const [data, setData] = React.useState(null);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    fetch('data.json')
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch data.json');
        return res.json();
      })
      .then(setData)
      .catch(err => {
        console.error("Error loading JSON:", err);
        setError(err.message);
      });
  }, []);

  if (error) {
    return React.createElement('div', { style: { color: 'red' } }, `Error: ${error}`);
  }

  if (!data) {
    return React.createElement('div', { style: { color: 'white', fontFamily: 'Calibri' } }, 'Loading...');
  }

  const coeffRows = data.coefficients.map((c, i) =>
    React.createElement('tr', { key: i },
      React.createElement('td', null, c.name),
      React.createElement('td', null, c.estimate.toFixed(3)),
      React.createElement('td', null, `${data.confint[i].lower.toFixed(3)} - ${data.confint[i].upper.toFixed(3)}`),
      React.createElement('td', null, c["p.value"].toExponential(2))
    )
  );

  React.useEffect(() => {
    if (!data || !data.coefficients) return;

    const ctx = document.getElementById('coefplot')?.getContext('2d');
    if (!ctx) return;

    const labels = data.coefficients.map(c => c.name);
    const values = data.coefficients.map(c => c.estimate);

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Coefficient',
          data: values,
          backgroundColor: '#29b6f6'
        }]
      },
      options: {
        scales: {
          y: { beginAtZero: true }
        }
      }
    });
  }, [data]);

  const download = () => {
    const str = JSON.stringify(data, null, 2);
    const blob = new Blob([str], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'model.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  return React.createElement('div', { style: { fontFamily: 'Calibri', color: 'white', backgroundColor: '#121212', padding: '20px' } },
    React.createElement('h1', null, 'Model Summary'),
    React.createElement('p', null, `R²: ${data["r.squared"].toFixed(4)}`),
    React.createElement('p', null, `Adjusted R²: ${data["adj.r.squared"].toFixed(4)}`),
    React.createElement('button', { onClick: download }, 'Download JSON'),
    React.createElement('table', { border: 1, cellPadding: 6, style: { marginTop: '10px' } },
      React.createElement('thead', null,
        React.createElement('tr', null,
          React.createElement('th', null, 'Term'),
          React.createElement('th', null, 'Estimate'),
          React.createElement('th', null, '95% CI'),
          React.createElement('th', null, 'p-value')
        )
      ),
      React.createElement('tbody', null, coeffRows)
    ),
    React.createElement('h2', null, 'Coefficient Plot'),
    React.createElement('canvas', { id: 'coefplot', width: 400, height: 300 })
  );
};

ReactDOM.render(React.createElement(App), document.getElementById('root'));

