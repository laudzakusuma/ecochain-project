window.addEventListener('DOMContentLoaded', () => {
  // Inject global CSS animasi (tanpa ubah index.html)
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .block-anim {
      animation: fadeInUp 0.6s ease-out;
    }

    .block-card:hover {
      box-shadow: 0 0 15px #0f0;
      transform: scale(1.03);
      transition: all 0.3s ease;
    }
  `;
  document.head.appendChild(style);

  // Wrapper
  const display = document.createElement('div');
  display.style.padding = '2rem';
  display.style.fontFamily = 'monospace';
  display.style.color = '#0f0';
  display.style.background = '#111';
  display.innerHTML = `<h2 style="text-align:center;">🌐 Live Blockchain View</h2>`;
  document.body.appendChild(display);

  const chainWrapper = document.createElement('div');
  chainWrapper.style.display = 'flex';
  chainWrapper.style.flexWrap = 'wrap';
  chainWrapper.style.justifyContent = 'center';
  chainWrapper.style.gap = '1.5rem';
  chainWrapper.style.marginTop = '2rem';
  display.appendChild(chainWrapper);

  function loadBlockchain() {
    fetch('/api/blockchain')
      .then(res => res.json())
      .then(data => {
        chainWrapper.innerHTML = '';
        data.chain.forEach((block, i) => {
          const card = document.createElement('div');
          card.classList.add('block-card', 'block-anim');
          card.style = `
            background: #1a1a1a;
            border: 1px solid #0f0;
            border-radius: 12px;
            padding: 1rem;
            width: 300px;
            color: #0f0;
            font-family: monospace;
            box-shadow: 0 0 10px #0f04;
            transition: all 0.3s ease;
          `;
          card.innerHTML = `
            <h3>🧱 Block #${i}</h3>
            <p><strong>Time:</strong> ${block.timestamp}</p>
            <p><strong>Hash:</strong> ${block.hash.slice(0, 14)}...</p>
            <p><strong>Prev:</strong> ${block.previousHash.slice(0, 14)}...</p>
            <p><strong>DNA:</strong> ${JSON.stringify(block.data)}</p>
          `;
          chainWrapper.appendChild(card);
        });
      });
  }

  // Load first time + refresh every 5s
  loadBlockchain();
  setInterval(loadBlockchain, 5000);
});
