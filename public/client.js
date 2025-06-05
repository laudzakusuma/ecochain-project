window.addEventListener('DOMContentLoaded', () => {
  // Inject global style
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    .eco-section {
      padding: 4rem 2rem;
      background: linear-gradient(to bottom, #0d0d0d, #000000);
      color: #fff;
      font-family: 'Segoe UI', sans-serif;
      text-align: center;
    }

    .eco-section h2 {
      font-size: 2rem;
      font-weight: bold;
      background: linear-gradient(90deg, #00ffe0, #ff00ff);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 2rem;
    }

    .blockchain-wrapper {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 2rem;
    }

    .block-card {
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid rgba(0,255,200,0.3);
      box-shadow: 0 0 20px rgba(0, 255, 200, 0.15);
      border-radius: 16px;
      padding: 1.5rem;
      width: 320px;
      backdrop-filter: blur(8px);
      animation: fadeInUp 0.6s ease;
      color: #e0fff7;
      text-align: left;
      transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .block-card:hover {
      transform: translateY(-5px) scale(1.02);
      box-shadow: 0 0 25px rgba(0, 255, 200, 0.5);
    }

    .block-card h3 {
      margin-bottom: 0.5rem;
      font-size: 1.2rem;
      color: #00ffe0;
    }

    .block-card p {
      margin: 0.25rem 0;
      font-size: 0.9rem;
      word-break: break-all;
    }
  `;
  document.head.appendChild(style);

  // Create wrapper
  const section = document.createElement('section');
  section.className = 'eco-section';
  section.innerHTML = `<h2>🌐 Live Blockchain View</h2><div class="blockchain-wrapper" id="ecoChainBlocks"></div>`;
  document.body.appendChild(section);

  // Fetch and render blocks
  function loadBlockchain() {
    fetch('/api/blockchain')
      .then(res => res.json())
      .then(data => {
        const wrapper = document.getElementById('ecoChainBlocks');
        wrapper.innerHTML = '';

        data.chain.forEach((block, i) => {
          const card = document.createElement('div');
          card.className = 'block-card';
          card.innerHTML = `
            <h3>🧱 Block #${i}</h3>
            <p><strong>🕒 Time:</strong> ${block.timestamp}</p>
            <p><strong>🔗 Hash:</strong> ${block.hash.slice(0, 16)}...</p>
            <p><strong>⬅ Prev:</strong> ${block.previousHash.slice(0, 16)}...</p>
            <p><strong>🧬 DNA:</strong><br>${JSON.stringify(block.data)}</p>
          `;
          wrapper.appendChild(card);
        });
      });
  }

  // Initial & interval
  loadBlockchain();
  setInterval(loadBlockchain, 5000);
});
