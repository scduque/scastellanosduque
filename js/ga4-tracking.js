/**
Google Analytics 4 (GA4) - Tracking de conversión y contacto
Sebastián Castellanos Duque
Reglas implementadas:
- event.preventDefault() para enlaces de redirección (wa.me, tel:, mailto:, maps)
- Retraso controlado (setTimeout 400ms) antes de ejecutar la redirección
- Verificación typeof dataLayer !== 'undefined' para evitar errores si GTM no cargó
- Listeners adjuntados tras la carga del DOM (DOMContentLoaded)
- window.open para evitar que el browser de Meta intercepte la navegación
*/

document.addEventListener('DOMContentLoaded', function() {

    // Función auxiliar para rastrear y redirigir de forma segura en GA4
    function trackAndRedirectGA4(event, eventName, params = {}) {
        event.preventDefault(); // Evita la acción por defecto inmediata
        const targetUrl = event.currentTarget.href;

        // 1. Disparar el evento en Google Tag Manager
        if (typeof dataLayer !== 'undefined') {
            dataLayer.push({ 'event': eventName, ...params });
            console.log('GTM DataLayer event pushed: ' + eventName, params);
        } else {
            console.warn('GTM (dataLayer) no está definido. El evento no se registró.');
        }

        // 2. Retraso controlado y redirección segura según tipo de enlace
        setTimeout(function() {
            if (targetUrl.startsWith('tel:') || targetUrl.startsWith('mailto:')) {
                // Para esquemas nativos (tel:, mailto:) usar window.location.href
                window.location.href = targetUrl;
            } else {
                // Para URLs web (wa.me, maps.app.goo.gl) usar window.open
                window.open(targetUrl, '_blank');
            }
        }, 400); // 400ms de margen de seguridad para que GTM procese el evento
    }

    // --- 1. WHATSAPP / COTIZAR / ENVIAR ARCHIVOS ---
    // Evento recomendado GA4: 'generate_lead'
    document.querySelectorAll('a[href*="wa.me"]').forEach(link => {
        link.addEventListener('click', function(e) {
            var textParam = new URL(this.href).searchParams.get('text') || '';
            var contentName = textParam.includes('archivos') ? 'Envío de Archivos' : 'Cotización DTF';
            
            trackAndRedirectGA4(e, 'generate_lead', { 
                method: 'WhatsApp',
                content_name: contentName 
            });
        });
    });

    // --- 2. MAPA / UBICACIÓN ---
    // Evento personalizado GA4: 'view_location'
    document.querySelectorAll('a[href*="maps.app.goo.gl"]').forEach(link => {
        link.addEventListener('click', function(e) {
            trackAndRedirectGA4(e, 'view_location', {
                method: 'Google Maps'
            });
        });
    });

    // --- 3. LLAMADA TELEFÓNICA ---
    // Evento recomendado GA4: 'contact'
    document.querySelectorAll('a[href^="tel:"]').forEach(link => {
        link.addEventListener('click', function(e) {
            trackAndRedirectGA4(e, 'contact', { 
                method: 'Llamada Telefónica' 
            });
        });
    });

    // --- 4. CORREO ELECTRÓNICO ---
    // Evento recomendado GA4: 'contact'
    document.querySelectorAll('a[href^="mailto:"]').forEach(link => {
        link.addEventListener('click', function(e) {
            trackAndRedirectGA4(e, 'contact', { 
                method: 'Correo Electrónico' 
            });
        });
    });

    // --- 5. REDES SOCIALES ---
    // Evento personalizado GA4: 'social_click'
    document.querySelectorAll('a.social-link').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            var platform = this.getAttribute('data-platform') || 'Unknown';
            
            if (typeof dataLayer !== 'undefined') {
                dataLayer.push({ 'event': 'social_click', 
                    platform: platform,
                    method: 'Footer Social'
                });
                console.log('GTM DataLayer event pushed (custom): social_click', { platform: platform });
            }
            
            setTimeout(() => {
                window.open(this.href, '_blank');
            }, 300);
        });
    });

});