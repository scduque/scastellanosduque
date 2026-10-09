/**
 * Google Analytics 4 (GA4) - Tracking de interacción y contacto
 * Sebastián Castellanos Duque - scastellanosduque.com
 *
 * Solo se rastrean elementos que EXISTEN en el proyecto:
 *   index.html + prensa.html + templates/*.html
 *
 * Reglas implementadas:
 * - Verificación typeof dataLayer !== 'undefined' para evitar errores si GTM no cargó
 * - Listeners adjuntados tras la carga del DOM (DOMContentLoaded)
 * - Verificación de existencia del DOM antes de adjuntar listeners (nodos opcionales)
 * - mailto: usa preventDefault + setTimeout(400ms) para asegurar el envío del evento
 * - Enlaces externos con target="_blank" no requieren preventDefault:
 *   la página actual no se descarga y GTM registra el evento de forma segura
 */

document.addEventListener('DOMContentLoaded', function() {

    // ==========================================
    // AUX. Envío de evento simple al dataLayer de GTM
    // ==========================================
    function pushDataLayerEvent(eventName, params) {
        if (typeof dataLayer !== 'undefined') {
            dataLayer.push(Object.assign({ 'event': eventName }, params || {}));
            console.log('GTM DataLayer event pushed: ' + eventName, params);
        } else {
            console.warn('GTM (dataLayer) no está definido. El evento no se registró:', eventName);
        }
    }

    // --- 1. CORREO ELECTRÓNICO ---
    // Evento recomendado GA4: 'contact'
    // Presente en: index.html (footer y mini-footer) y prensa.html (footer y mini-footer)
    document.querySelectorAll('a[href^="mailto:"]').forEach(function(link) {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Retenemos la acción para asegurar el registro del evento
            const targetUrl = this.href;

            pushDataLayerEvent('contact', { method: 'Correo Electrónico' });

            // mailto: no descarga la página, pero respetamos el margen de 400ms
            setTimeout(function() {
                window.location.href = targetUrl;
            }, 400);
        });
    });

    // --- 2. LINKEDIN / CONEXIÓN SOCIAL ---
    // Evento personalizado GA4: 'social_click'
    // Presente en: mini-footer de index.html y prensa.html, y CTA de footer en prensa.html
    document.querySelectorAll('.mini-footer-connect, footer.big-footer a[href*="linkedin.com"]').forEach(function(link) {
        link.addEventListener('click', function() {
            // target="_blank": la página no se descarga; no hace falta preventDefault
            pushDataLayerEvent('social_click', {
                platform: 'LinkedIn',
                method: this.classList.contains('mini-footer-connect') ? 'Mini Footer' : 'Footer CTA'
            });
        });
    });

    // --- 3. NAVEGACIÓN DEL MENÚ ---
    // Evento personalizado GA4: 'nav_menu_click'
    // Presente en: index.html (líneas 117-125) y prensa.html (líneas 66-74)
    document.querySelectorAll('.menu-content a').forEach(function(link) {
        link.addEventListener('click', function() {
            const href = this.getAttribute('href') || '';
            let section = 'Other';

            if (href.indexOf('#profile') !== -1) section = 'Profile';
            else if (href.indexOf('#experience') !== -1) section = 'Career';
            else if (href === 'prensa.html') section = 'Press Archive';
            else if (href === 'templates/en-releases.html') section = 'Releases';
            else if (href.indexOf('#contact') !== -1) section = 'Contact';
            else if (href.indexOf('index.html') !== -1) section = 'Home';

            pushDataLayerEvent('nav_menu_click', {
                section: section,
                method: 'Main Menu'
            });
        });
    });

    // --- 4. BOTONES DE FILTRADO DE PRENSA ---
    // Evento personalizado GA4: 'press_filter_click'
    // Presente en: prensa.html (filter-nav)
    document.querySelectorAll('.filter-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            pushDataLayerEvent('press_filter_click', {
                filter: this.getAttribute('data-filter'),
                filter_label: this.textContent.trim(),
                method: 'Press Archive Page'
            });
        });
    });

    // --- 5. BOTÓN EXPORTAR (abre vista previa CSV) ---
    // Evento personalizado GA4: 'press_export_click'
    // Presente en: prensa.html línea 110 (#exportCsvBtn)
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    if (exportCsvBtn) {
        exportCsvBtn.addEventListener('click', function() {
            pushDataLayerEvent('press_export_click', {
                method: 'Press Archive Page'
            });
        });
    }

    // --- 6. DESCARGA CONFIRMADA CSV / PDF (modal de vista previa) ---
    // Evento personalizado GA4: 'press_export_download'
    // Presente en: prensa.html (modal #exportPreviewModal)
    const downloadCsvBtn = document.getElementById('downloadCsvBtn');
    if (downloadCsvBtn) {
        downloadCsvBtn.addEventListener('click', function() {
            pushDataLayerEvent('press_export_download', { format: 'CSV', method: 'Preview Modal' });
        });
    }
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    if (downloadPdfBtn) {
        downloadPdfBtn.addEventListener('click', function() {
            pushDataLayerEvent('press_export_download', { format: 'PDF', method: 'Preview Modal' });
        });
    }

    // --- 7. NOTA DE INSTRUCCIONES DE FILTROS ---
    // Evento personalizado GA4: 'press_note_toggle'
    // Presente en: prensa.html línea 91 (.filter-note-toggle)
    const filterNoteToggle = document.querySelector('.filter-note-toggle');
    if (filterNoteToggle) {
        filterNoteToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            pushDataLayerEvent('press_note_toggle', {
                action: isExpanded ? 'expand' : 'collapse',
                method: 'Press Archive Page'
            });
        });
    }

    // --- 8. BOTÓN VOLVER ARRIBA ---
    // Evento personalizado GA4: 'scroll_top_click'
    // Presente en: prensa.html línea 864 (#backToTop)
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', function() {
            pushDataLayerEvent('scroll_top_click', { method: 'Scroll Button' });
        });
    }

    // --- 9. CLICS EN ARTÍCULOS DE PRENSA (enlaces salientes) ---
    // Evento personalizado GA4: 'press_article_click'
    // Presente en: prensa.html (cada .press-row abre medio externo con target="_blank")
    document.querySelectorAll('.press-row').forEach(function(row) {
        row.addEventListener('click', function() {
            pushDataLayerEvent('press_article_click', {
                article_title: this.getAttribute('data-title') || 'Unknown',
                media_source: this.getAttribute('data-media') || 'Unknown',
                article_topic: this.getAttribute('data-topic') || 'Unknown',
                article_format: this.getAttribute('data-format') || 'Unknown',
                link_url: this.href
            });
        });
    });

    // --- 10. CTA "VIEW PRESS ARCHIVE" (home) ---
    // Evento personalizado GA4: 'cta_click'
    // Presente en: index.html línea 389 (a.btn-magnetic -> prensa.html)
    document.querySelectorAll('a.btn-magnetic[href="prensa.html"]').forEach(function(cta) {
        cta.addEventListener('click', function() {
            pushDataLayerEvent('cta_click', {
                cta_name: 'View Press Archive',
                method: 'Footer CTA'
            });
        });
    });

});
