window.addEventListener('DOMContentLoaded', () => {
  // Create a section to show blockchain data
  const display = document.createElement('div');
  display.style.padding = '2rem';
  display.style.fontFamily = 'monospace';
  display.style.color = '#0f0';
  display.style.background = '#111';
  display.innerHTML = `<h2>🔗 Live Blockchain View</h2>`;
  document.body.appendChild(display);

  const chainWrapper = document.createElement('div');
  chainWrapper.style.display = 'flex';
  chainWrapper.style.flexWrap = 'wrap';
  chainWrapper.style.gap = '1rem';
  chainWrapper.style.marginTop = '1rem';
  display.appendChild(chainWrapper);

  // Fetch blockchain data
  function loadBlockchain() {
    fetch('/api/blockchain')
      .then(res => res.json())
      .then(data => {
        chainWrapper.innerHTML = '';
        data.chain.forEach((block, i) => {
          const card = document.createElement('div');
          card.style = `
            background: #222;
            border: 1px solid #0f0;
            padding: 1rem;
            border-radius: 8px;
            width: 300px;
            box-shadow: 0 0 8px #0f08;
          `;
          card.innerHTML = `
            <h4>Block #${i}</h4>
            <p><strong>Time:</strong> ${block.timestamp}</p>
            <p><strong>Hash:</strong> ${block.hash.slice(0, 16)}...</p>
            <p><strong>Prev:</strong> ${block.previousHash.slice(0, 16)}...</p>
            <p><strong>DNA:</strong> ${JSON.stringify(block.data)}</p>
          `;
          chainWrapper.appendChild(card);
        });
      });
  }

  // Optional: Live reload every 5s
  setInterval(loadBlockchain, 5000);
  loadBlockchain();
});
