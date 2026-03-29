(function () {
  const buttonIds = ['u15', 'u16', 'u17'];
  const panelStateIds = ['u18_state0', 'u18_state1', 'u18_state2'];

  function setActive(index) {
    buttonIds.forEach((id, i) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.classList.toggle('morandi-active', i === index);
      el.setAttribute('aria-pressed', i === index ? 'true' : 'false');
    });
  }

  function inferActiveFromPanel() {
    for (let i = 0; i < panelStateIds.length; i++) {
      const panel = document.getElementById(panelStateIds[i]);
      if (panel && panel.style.visibility !== 'hidden' && panel.style.display !== 'none') {
        setActive(i);
        return;
      }
    }
    setActive(0);
  }

  function bindButtons() {
    buttonIds.forEach((id, index) => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.setAttribute('role', 'button');
      btn.setAttribute('tabindex', '0');
      btn.addEventListener('click', () => {
        window.setTimeout(() => setActive(index), 20);
      });
      btn.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          btn.click();
        }
      });
    });
  }

  function observePanel() {
    const panelContainer = document.getElementById('u18');
    if (!panelContainer) return;
    const observer = new MutationObserver(() => inferActiveFromPanel());
    observer.observe(panelContainer, {
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindButtons();
    inferActiveFromPanel();
    observePanel();
  });
})();
