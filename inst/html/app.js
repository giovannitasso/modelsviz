const App = () => {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch('data.json')
      .then(res => res.json())
      .then(setData)
      .catch(err => {
        console.error("Error loading JSON:", err);
      });
  }, []);

  if (!data || !data.coefficients || !data.confint) {
    return React.createElement('div', null, 'Loading...');
  }

  const coeffRows = data.coefficients.map((c, i) => {
    const conf = data.confint[i] || {};
    return React.createElement('tr', { key: i },
      React.createElement('td', null, c.name || 'N/A'),
      React.createElement('td', null, isFinite(c.estimate) ? c.estimate.toFixed(3) : 'N/A'),
      React.createElement('td', null,
        isFinite(conf.lower) && isFinite(conf.upper)
          ? `${conf.lower.toFixed(3)} - ${conf.upper.toFixed(3)}`
          : 'N/A'
      ),
      React.createElement('td', null,
        isFinite(c["p.value"]) ? c["p.value"].toExponential(2) : 'n/a')
    );
  });

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

  return React.createElement('div', null,
    React.createElement('h1', null, 'Model Summary'),
    React.createElement('button', { onClick: download }, 'Download JSON'),
    React.createElement('table', null,
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
    React.createElement('canvas', { id: 'coefplot', width: 400, height: 300 })
  );
};

ReactDOM.render(React.createElement(App), document.getElementById('root'));



