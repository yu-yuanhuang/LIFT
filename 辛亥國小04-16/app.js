const state = {
  hotspotConfig: null,
  activeModes: {
    part1: 'config',
    part2: 'default',
    part3: 'default',
  },
  tooltipTimer: null,
};

const tooltipPanel = document.getElementById('tooltip-panel');
const tooltipContent = document.getElementById('tooltip-content');
const tooltipClose = document.getElementById('tooltip-close');
const tooltipShell = tooltipPanel.querySelector('.tooltip-shell');
const hotspotTemplate = document.getElementById('hotspot-template');

const part1ModeLabel = document.getElementById('part1-mode-label');
const part1Caption = document.getElementById('part1-caption');

init();

async function init() {
  bindModeButtons();
  bindTooltipEvents();
  await loadHotspotConfig();
  renderAllHotspots();
}

async function loadHotspotConfig() {
  try {
    const response = await fetch('data/hotspots.json');
    if (!response.ok) throw new Error('Failed to load hotspots.json');
    state.hotspotConfig = await response.json();
  } catch (error) {
    console.error(error);
    tooltipContent.innerHTML = '<p>目前無法載入hotspot設定，請確認data/hotspots.json是否存在。</p>';
  }
}

function bindModeButtons() {
  document.querySelectorAll('.mode-button').forEach((button) => {
    button.addEventListener('click', () => {
      const target = button.dataset.modeTarget;
      const mode = button.dataset.mode;
      state.activeModes[target] = mode;

      const siblings = document.querySelectorAll(`.mode-button[data-mode-target="${target}"]`);
      siblings.forEach((item) => {
        const isActive = item === button;
        item.classList.toggle('active', isActive);
        item.classList.toggle('ghost', !isActive);
        item.setAttribute('aria-selected', String(isActive));
      });

      updateModeCopy(target, mode);
      renderHotspotsForStage(target);
      hideTooltip();
    });
  });
}

function bindTooltipEvents() {
  tooltipClose.addEventListener('click', hideTooltip);

  tooltipPanel.addEventListener('mouseenter', () => {
    clearTimeout(state.tooltipTimer);
  });

  tooltipPanel.addEventListener('mouseleave', () => {
    scheduleTooltipHide();
  });

  window.addEventListener('resize', hideTooltip);
  window.addEventListener('scroll', hideTooltip, { passive: true });
}

function updateModeCopy(target, mode) {
  if (target !== 'part1') return;

  const copyMap = {
    config: {
      label: '目前模式：配置',
      caption: '目前顯示學校端配置視角的提示點，適合呈現制度設計、資源安排與支持機制。',
    },
    access: {
      label: '目前模式：獲取',
      caption: '目前顯示學生端獲取視角的提示點，適合呈現實際接觸、參與與感受。',
    },
    both: {
      label: '目前模式：配置與獲取',
      caption: '目前顯示整合視角的提示點，適合對照制度配置與學生獲取之間的落差或連動。',
    },
  };

  const copy = copyMap[mode];
  if (!copy) return;
  part1ModeLabel.textContent = copy.label;
  part1Caption.textContent = copy.caption;
}

function renderAllHotspots() {
  ['part1', 'part2', 'part3'].forEach(renderHotspotsForStage);
}

function renderHotspotsForStage(stageName) {
  if (!state.hotspotConfig) return;

  const layer = document.querySelector(`[data-hotspot-layer="${stageName}"]`);
  if (!layer) return;
  layer.innerHTML = '';

  const stageConfig = state.hotspotConfig[stageName];
  if (!stageConfig) return;

  let hotspots = [];
  if (stageName === 'part1') {
    const currentMode = state.activeModes.part1 || 'config';
    hotspots = stageConfig[currentMode] || [];
  } else {
    hotspots = stageConfig.default || [];
  }

  hotspots.forEach((item) => {
    const fragment = hotspotTemplate.content.cloneNode(true);
    const button = fragment.querySelector('.hotspot-point');
    button.style.left = `${item.x}%`;
    button.style.top = `${item.y}%`;
    button.dataset.md = item.md;
    button.dataset.title = item.title || '資料說明';
    button.dataset.stage = stageName;
    button.setAttribute('aria-label', item.title || '資料說明');

    button.addEventListener('mouseenter', (event) => {
      clearTimeout(state.tooltipTimer);
      showTooltipForPoint(event.currentTarget);
    });

    button.addEventListener('focus', (event) => {
      clearTimeout(state.tooltipTimer);
      showTooltipForPoint(event.currentTarget);
    });

    button.addEventListener('mouseleave', scheduleTooltipHide);
    button.addEventListener('blur', scheduleTooltipHide);

    layer.appendChild(fragment);
  });
}

function scheduleTooltipHide() {
  clearTimeout(state.tooltipTimer);
  state.tooltipTimer = window.setTimeout(hideTooltip, 120);
}

async function showTooltipForPoint(button) {
  const allHotspots = document.querySelectorAll('.hotspot-point');
  allHotspots.forEach((item) => item.classList.remove('active'));
  button.classList.add('active');

  const title = button.dataset.title || '資料說明';
  const mdPath = button.dataset.md;
  tooltipPanel.hidden = false;
  tooltipContent.innerHTML = '<p>載入中…</p>';

  try {
    const response = await fetch(mdPath);
    if (!response.ok) throw new Error(`Failed to load ${mdPath}`);
    const markdown = await response.text();
    tooltipContent.innerHTML = renderMarkdown(markdown, title);
  } catch (error) {
    console.error(error);
    tooltipContent.innerHTML = `
      <h3>${escapeHtml(title)}</h3>
      <p>無法讀取Markdown內容，請確認檔案是否存在：</p>
      <p><code>${escapeHtml(mdPath)}</code></p>
    `;
  }

  positionTooltip(button);
}

function positionTooltip(button) {
  const rect = button.getBoundingClientRect();
  const shellWidth = Math.min(360, window.innerWidth - 32);
  const gap = 16;
  let left = rect.right + gap;
  let top = rect.top - 10;

  if (left + shellWidth > window.innerWidth - 16) {
    left = rect.left - shellWidth - gap;
  }

  if (left < 16) {
    left = 16;
  }

  const maxTop = window.innerHeight - 120;
  if (top > maxTop) top = maxTop;
  if (top < 16) top = 16;

  tooltipShell.style.left = `${left}px`;
  tooltipShell.style.top = `${top}px`;
}

function hideTooltip() {
  tooltipPanel.hidden = true;
  document.querySelectorAll('.hotspot-point').forEach((item) => item.classList.remove('active'));
}

function renderMarkdown(markdown, fallbackTitle = '資料說明') {
  const lines = markdown.replace(/\r/g, '').split('\n');
  const html = [];
  let listItems = [];

  const flushList = () => {
    if (!listItems.length) return;
    html.push(`<ul>${listItems.join('')}</ul>`);
    listItems = [];
  };

  let hasHeading = false;

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushList();
      continue;
    }

    if (/^#{1,4}\s/.test(line)) {
      flushList();
      const level = Math.min(line.match(/^#+/)[0].length + 1, 4);
      const content = inlineMarkdown(line.replace(/^#{1,4}\s*/, ''));
      html.push(`<h${level}>${content}</h${level}>`);
      hasHeading = true;
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      listItems.push(`<li>${inlineMarkdown(line.replace(/^[-*]\s+/, ''))}</li>`);
      continue;
    }

    flushList();
    html.push(`<p>${inlineMarkdown(line)}</p>`);
  }

  flushList();

  if (!hasHeading) {
    html.unshift(`<h3>${escapeHtml(fallbackTitle)}</h3>`);
  }

  return html.join('');
}

function inlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code>$1</code>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
