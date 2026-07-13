document.addEventListener('DOMContentLoaded', function(){
  const btn = document.querySelector('.filter-note-toggle');
  const content = document.querySelector('.filter-note-content');
  if (!btn || !content) return;
  btn.addEventListener('click', function(){
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    btn.setAttribute('aria-expanded', String(!expanded));
    if (expanded) { content.hidden = true; btn.textContent = 'Notas: Cómo usar los filtros ▾'; }
    else { content.hidden = false; btn.textContent = 'Notas: Cómo usar los filtros ▴'; }
  });
});