// Mapeo de textos resumidos para botones cuando la pantalla es angosta
const shortTextMap = {
  '2026': "'26",
  '2025': "'25",
  '2024': "'24",
  '2023': "'23",
  '2022': "'22",
  '2021': "'21",
  'Press Note': 'Note',
  'Commerce': 'Comm',
  'Article': 'Art',
  'Art Design': 'Art',
  'Art-Design': 'Art',
  'Case Study': 'Case',
  'About My Work': 'Work',
  'Logistics & Operations': 'Op',
  'Logistics Ops': 'Op'
};

function updateButtonText(useShort = false) {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    const originalText = btn.textContent.trim();
    if (useShort && shortTextMap[originalText]) {
      btn.setAttribute('data-full', originalText);
      btn.textContent = shortTextMap[originalText];
    } else if (!useShort && btn.hasAttribute('data-full')) {
      btn.textContent = btn.getAttribute('data-full');
    }
  });
}

function handleResize() {
  if (window.innerWidth <= 600) {
    updateButtonText(true);
  } else {
    updateButtonText(false);
  }
}

window.addEventListener('load', handleResize);
window.addEventListener('resize', handleResize);
