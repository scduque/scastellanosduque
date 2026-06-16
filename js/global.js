document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const menuContent = document.getElementById('menuContent');
    const yearElement = document.getElementById('year');
    const timeElement = document.getElementById('local-time');
    const menuClose = document.getElementById('menuClose');

    // Mobile Menu Logic - Robust Version
    if (menuToggle && menuContent) {
        // Initial state
        menuToggle.setAttribute('aria-expanded', 'false');
        
        // Menu toggle
        menuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpen = !document.body.classList.contains('menu-open');
            
            // Toggle classes
            document.body.classList.toggle('menu-open', isOpen);
            menuToggle.classList.toggle('is-active', isOpen);
            menuToggle.classList.toggle('open', isOpen); // Maintain for CSS animations
            menuToggle.setAttribute('aria-expanded', isOpen);
        });
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (document.body.classList.contains('menu-open') && 
                !menuContent.contains(e.target) && 
                !menuToggle.contains(e.target)) {
                closeMenu();
            }
        });
        
        // Close when clicking internal close button
        if (menuClose) {
            menuClose.addEventListener('click', closeMenu);
        }
        
        // Close with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.body.classList.contains('menu-open')) {
                closeMenu();
                menuToggle.focus();
            }
        });
        
        // Close when clicking a menu link
        menuContent.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });
        
        // Helper function to close
        function closeMenu() {
            document.body.classList.remove('menu-open');
            menuToggle.classList.remove('is-active', 'open');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    }

    // Press Filtering Logic
    const filterButtons = document.querySelectorAll('.filter-btn');
    const pressItems = document.querySelectorAll('.press-row');

    if (filterButtons.length && pressItems.length) {
        const filterGroups = document.querySelectorAll('.filter-group');
        const allButton = document.querySelector('.filter-btn[data-filter="all"]');

        // Configuración centralizada de mapeos especiales
        const CONFIG = {
            mappings: {
                'commerce': ['e-commerce', 'social-commerce', 'social-driven']
            },
            hiddenClass: 'is-hidden',
            blockedClass: 'is-blocked'
        };

        /**
         * Algoritmo de coincidencia con lógica AND entre grupos y bloqueo dinámico
         */
        const applyFilters = () => {
            // Agrupamos filtros activos por su contenedor (grupo)
            const filtersByGroup = new Map();
            const activeButtons = Array.from(document.querySelectorAll('.filter-btn.active'))
                .filter(btn => btn.getAttribute('data-filter') !== 'all');

            activeButtons.forEach(btn => {
                const group = btn.closest('.filter-group');
                const val = (btn.getAttribute('data-filter') || '').trim().toLowerCase();
                if (!filtersByGroup.has(group)) filtersByGroup.set(group, []);
                filtersByGroup.get(group).push(val);
            });

            const allActiveFilters = activeButtons
                .filter(btn => btn.getAttribute('data-filter') !== 'all')
                .map(btn => ({
                    val: (btn.getAttribute('data-filter') || '').trim().toLowerCase(),
                    group: btn.closest('.filter-group')
                }));

            pressItems.forEach(item => {
                const itemCategories = (item.getAttribute('data-category') || '').trim().toLowerCase().split(/\s+/);
                let isMatch = true;

                // Lógica: (Grupo1_A OR Grupo1_B) AND (Grupo2_C OR Grupo2_D)
                for (const [group, filters] of filtersByGroup) {
                    const matchesAnyInGroup = filters.some(f => {
                        const targets = CONFIG.mappings[f] || [f];
                        return targets.some(t => itemCategories.includes(t));
                    });
                    if (!matchesAnyInGroup) {
                        isMatch = false;
                        break;
                    }
                }

                if (isMatch) {
                    const wasHidden = item.classList.contains(CONFIG.hiddenClass);
                    item.classList.remove(CONFIG.hiddenClass);
                    item.setAttribute('aria-hidden', 'false');
                    if (wasHidden) {
                        item.animate([{ opacity: 0, transform: 'translateY(10px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 300, easing: 'ease-out' });
                    }
                } else {
                    item.classList.add(CONFIG.hiddenClass);
                    item.setAttribute('aria-hidden', 'true');
                }
            });

            // Lógica de bloqueo (Faceted filtering)
            filterButtons.forEach(btn => {
                const btnFilter = (btn.getAttribute('data-filter') || '').trim().toLowerCase();
                if (btnFilter === 'all') return;

                const btnGroup = btn.closest('.filter-group');
                const others = allActiveFilters.filter(f => f.group !== btnGroup);
                const testSet = [...others, { val: btnFilter }];

                let count = 0;
                pressItems.forEach(item => {
                    const cats = (item.getAttribute('data-category') || '').trim().toLowerCase().split(/\s+/);
                    let match = true;
                    for (const f of testSet) {
                        const targets = CONFIG.mappings[f.val] || [f.val];
                        if (!targets.some(t => cats.includes(t))) { match = false; break; }
                    }
                    if (match) count++;
                });

                if (count === 0 && !btn.classList.contains('active')) {
                    btn.classList.add(CONFIG.blockedClass);
                    btn.setAttribute('aria-disabled', 'true');
                } else {
                    btn.classList.remove(CONFIG.blockedClass);
                    btn.setAttribute('aria-disabled', 'false');
                }
            });

            if (typeof ScrollTrigger !== 'undefined') ScrollTrigger.refresh();
        };

        const resetAll = () => {
            filterButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-pressed', 'false');
            });
            allButton?.classList.add('active');
            allButton?.setAttribute('aria-pressed', 'true');
            applyFilters();
        };

        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const clickedFilter = (btn.getAttribute('data-filter') || '').trim().toLowerCase();
                if (!clickedFilter) return;

                if (clickedFilter === 'all') {
                    resetAll();
                } else if (btn.classList.contains('active')) {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                    const anyActive = Array.from(filterButtons).some(b => b !== allButton && b.classList.contains('active'));
                    if (!anyActive) {
                        allButton?.classList.add('active');
                        allButton?.setAttribute('aria-pressed', 'true');
                    }
                } else {
                    // Comprobar si seleccionar este botón activaría TODOS los del grupo
                    const group = btn.closest('.filter-group');
                    if (group) {
                        const totalInGroup = group.querySelectorAll('.filter-btn').length;
                        const activeInGroup = group.querySelectorAll('.filter-btn.active').length;

                        if (activeInGroup >= totalInGroup - 1) {
                            // No permitir seleccionar todos los filtros de una fila
                            return;
                        }
                    }

                    allButton?.classList.remove('active');
                    allButton?.setAttribute('aria-pressed', 'false');
                    btn.classList.add('active');
                    btn.setAttribute('aria-pressed', 'true');
                }

                applyFilters();
            });

            btn.addEventListener('dblclick', () => {
                const clickedFilter = (btn.getAttribute('data-filter') || '').trim().toLowerCase();
                if (!clickedFilter || clickedFilter === 'all') return;
                
                filterButtons.forEach(b => {
                    b.classList.remove('active');
                    b.setAttribute('aria-pressed', 'false');
                });
                btn.classList.add('active');
                btn.setAttribute('aria-pressed', 'true');
                allButton?.classList.remove('active');
                allButton?.setAttribute('aria-pressed', 'false');
                applyFilters();
            });
        });

        // Inicialización
        if (allButton) {
            allButton.classList.add('active');
            allButton.setAttribute('aria-pressed', 'true');
        }
        applyFilters();
    }

    // Dynamic year update in Footer
    if (yearElement) yearElement.textContent = new Date().getFullYear();

    // Real-time Clock Logic (Miami Time)
    if (timeElement) {
        const updateMiamiTime = () => {
            const now = new Date();
            const miamiTime = now.toLocaleTimeString('en-US', {
                timeZone: 'America/New_York',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            timeElement.textContent = miamiTime;
        };
        updateMiamiTime(); // Initial call
        setInterval(updateMiamiTime, 1000); // Update every second
    }

    // Subtle image zoom logic on scroll (GSAP + ScrollTrigger)
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);

        // Selecting key visual elements
        const zoomTargets = document.querySelectorAll('.hero-avatar, .press-cover, .imagen-brochure');
        
        zoomTargets.forEach(target => {
            gsap.to(target, {
                scale: 1.15, // Zoom level (1.15 = 15% increase)
                ease: "none",
                scrollTrigger: {
                    trigger: target,
                    start: "top bottom", // Starts when the top of the image enters the bottom of the screen
                    end: "bottom top",   // Ends when the bottom of the image exits through the top
                    scrub: 1.5           // Movement smoothing (higher = slower/smoother)
                }
            });
        });
    }

    // Logic to activate "Kindle" effect on scroll (especially for mobiles)
    const activeOnScrollItems = document.querySelectorAll('.press-row, .item-trayectoria');
    
    if (activeOnScrollItems.length && typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        let mm = gsap.matchMedia();

        // Only activate on mobile/tablet screens (less than 1024px)
        mm.add("(max-width: 1023px)", () => {
            activeOnScrollItems.forEach(item => {
                ScrollTrigger.create({
                    trigger: item,
                    start: "top 60%", 
                    end: "bottom 40%",
                    toggleClass: "active-scroll"
                });
            });
        });
    }

    // Logic to hide thumbnail if the large avatar is visible (Only on index.html)
    const heroAvatar = document.querySelector('.hero-avatar');
    const navAvatar = document.querySelector('.nav-avatar-mini');

    if (heroAvatar && navAvatar) {
        const avatarObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Large avatar is visible: hide thumbnail
                    navAvatar.classList.add('avatar-hidden');
                } else {
                    // Large avatar not visible: show thumbnail
                    navAvatar.classList.remove('avatar-hidden');
                }
            });
        }, { threshold: 0.1 }); // Activated when 10% of the avatar is visible

        avatarObserver.observe(heroAvatar);
    }

    // ==========================================
    // Lógica de Exportación (CSV y PDF) con Vista Previa
    // ==========================================
    const exportBtn = document.getElementById('exportCsvBtn');
    const previewModal = document.getElementById('exportPreviewModal');
    const previewTableContainer = document.getElementById('previewTableContainer');
    const previewCount = document.getElementById('previewCount');
    const closePreviewBtn = document.getElementById('closePreviewModal');
    const downloadCsvBtn = document.getElementById('downloadCsvBtn');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');

    if (exportBtn && previewModal) {
        let currentExportData = [];

        // 1. Obtener datos de los elementos visibles
        const getVisibleItemsData = () => {
            const visibleItems = Array.from(document.querySelectorAll('.press-row')).filter(item => {
                return !item.classList.contains('is-hidden') && item.style.display !== 'none';
            });
            
            return visibleItems.map(item => ({
                date: item.dataset.date || '',
                tag: item.dataset.tag || '',
                lang: item.dataset.lang || '',
                topic: item.dataset.topic || '',
                media: item.dataset.media || '',
                format: item.dataset.format || '',
                title: item.dataset.title || '',
                subtitle: item.dataset.subtitle || '',
                why: item.dataset.why || '',
                url: item.dataset.url || '#'
            }));
        };

        // 2. Generar tabla HTML para la vista previa
        const generatePreviewTable = (data) => {
            const headers = ['Date', 'Media', 'Format', 'Title'];
            let html = '<table><thead><tr>';
            headers.forEach(h => html += `<th>${h}</th>`);
            html += '</tr></thead><tbody>';
            
            data.forEach(row => {
                html += '<tr>';
                html += `<td>${row.date}</td>`;
                html += `<td>${row.media}</td>`;
                html += `<td>${row.format}</td>`;
                html += `<td>${row.title}</td>`;
                html += '</tr>';
            });
            html += '</tbody></table>';
            return html;
        };

        // 3. Función de descarga CSV
        const triggerCsvDownload = (data) => {
            const headers = ['Date', 'Tag', 'Lang', 'Topic', 'Media', 'Format', 'Title', 'Subtitle', 'Why'];
            const escapeCSV = (text) => {
                if (text === null || text === undefined) return '""';
                const str = String(text).replace(/"/g, '""');
                return `"${str}"`;
            };

            let csvContent = headers.map(escapeCSV).join(',') + '\n';

            data.forEach(row => {
                // Fórmula HYPERLINK compatible con Excel/Google Sheets (usa coma como separador)
                const hyperlinkedTitle = (row.url && row.url !== '#') 
                    ? `=HYPERLINK("${row.url}", "${row.title.replace(/"/g, '""')}")` 
                    : row.title;

                const csvRow = [
                    escapeCSV(row.date), escapeCSV(row.tag), escapeCSV(row.lang),
                    escapeCSV(row.topic), escapeCSV(row.media), escapeCSV(row.format),
                    escapeCSV(hyperlinkedTitle), escapeCSV(row.subtitle), escapeCSV(row.why)
                ];
                csvContent += csvRow.join(',') + '\n';
            });

            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.setAttribute('href', URL.createObjectURL(blob));
            link.setAttribute('download', `SCD_Prensa_Seleccion_${new Date().toISOString().slice(0, 10)}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        // 4. Función de descarga PDF
        const triggerPdfDownload = (data) => {
            if (typeof window.jspdf === 'undefined') {
                alert('Error: La librería de PDF no se ha cargado correctamente.');
                return;
            }
            const { jsPDF } = window.jspdf;
            // Orientación horizontal (landscape) para que quepan las 9 columnas
            const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
            
            doc.setFontSize(16);
            doc.text('ARCA - Selección de Prensa', 14, 15);
            doc.setFontSize(10);
            doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 22);

            const tableHeaders = [['Date', 'Tag', 'Lang', 'Topic', 'Media', 'Format', 'Title', 'Subtitle', 'Why']];
            const tableData = data.map(row => [
                row.date, row.tag, row.lang, row.topic, row.media, row.format, 
                row.title, row.subtitle, row.why
            ]);

            doc.autoTable({
                head: tableHeaders,
                body: tableData,
                startY: 28,
                theme: 'grid',
                styles: { fontSize: 8, cellPadding: 2, overflow: 'linebreak' },
                headStyles: { fillColor: [59, 130, 246] }, // Color accent (#3b82f6)
                columnStyles: {
                    6: { cellWidth: 50 }, // Title más ancho
                    7: { cellWidth: 60 }, // Subtitle más ancho
                    8: { cellWidth: 60 }  // Why más ancho
                }
            });

            doc.save(`SCD_Prensa_Seleccion_${new Date().toISOString().slice(0, 10)}.pdf`);
        };

        // 5. Event Listeners
        exportBtn.addEventListener('click', () => {
            currentExportData = getVisibleItemsData();
            if (currentExportData.length === 0) {
                alert('No hay elementos visibles para exportar. Aplica un filtro o selecciona "All".');
                return;
            }
            if (previewCount) previewCount.textContent = currentExportData.length;
            previewTableContainer.innerHTML = generatePreviewTable(currentExportData);
            previewModal.classList.remove('is-hidden');
            document.body.style.overflow = 'hidden';
        });

        const closeModal = () => {
            previewModal.classList.add('is-hidden');
            document.body.style.overflow = '';
        };

        if (closePreviewBtn) closePreviewBtn.addEventListener('click', closeModal);
        
        if (downloadCsvBtn) {
            downloadCsvBtn.addEventListener('click', () => { 
                triggerCsvDownload(currentExportData); 
                closeModal(); 
            });
        }
        
        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', () => { 
                triggerPdfDownload(currentExportData); 
                closeModal(); 
            });
        }
    }

    // ==========================================
    // Lógica del Botón "Volver Arriba" (Back to Top)
    // ==========================================
    const backToTopBtn = document.getElementById('backToTop');

    if (backToTopBtn) {
        let isVisible = false; // Estado inicial del botón
        const scrollThreshold = 400; // Aparece después de bajar 400px

        window.addEventListener('scroll', () => {
            if (window.scrollY > scrollThreshold && !isVisible) {
                isVisible = true;
                
                if (typeof gsap !== 'undefined') {
                    gsap.to(backToTopBtn, {
                        autoAlpha: 1,
                        // autoAlpha maneja opacity y visibility automáticamente
                        y: 0,
                        duration: 0.5,
                        ease: "back.out(1.7)",
                        overwrite: true
                    });
                } else {
                    // Fallback nativo si GSAP no está disponible
                    backToTopBtn.style.opacity = '1';
                    backToTopBtn.style.transform = 'translateY(0)';
                }
            } else if (window.scrollY <= scrollThreshold && isVisible) {
                isVisible = false;
                
                if (typeof gsap !== 'undefined') {
                    gsap.to(backToTopBtn, {
                        autoAlpha: 0,
                        y: 20,
                        duration: 0.3,
                        ease: "power2.in",
                        overwrite: true
                    });
                } else {
                    // Fallback nativo
                    backToTopBtn.style.opacity = '0';
                    backToTopBtn.style.transform = 'translateY(20px)';
                }
            }
        });

        // Acción de clic para subir suavemente
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ==========================================
    // Lógica del Mini Footer Flotante
    // ==========================================
    const miniFooter = document.getElementById('miniFooter');
    const bigFooter = document.querySelector('.big-footer');

    if (miniFooter && bigFooter) {
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            // Estado inicial oculto por debajo de la pantalla
            gsap.set(miniFooter, { y: 100, opacity: 0, autoAlpha: 0 });

            // Mostrar el mini footer tras hacer scroll de 200px
            ScrollTrigger.create({
                trigger: "body",
                start: "top -200px",
                onEnter: () => {
                    gsap.to(miniFooter, { y: 0, opacity: 1, autoAlpha: 1, duration: 0.4, ease: "power2.out" });
                    document.body.classList.add('mini-footer-active');
                },
                onLeaveBack: () => {
                    gsap.to(miniFooter, { y: 100, opacity: 0, autoAlpha: 0, duration: 0.3, ease: "power2.in" });
                    document.body.classList.remove('mini-footer-active');
                }
            });

            // Ocultar el mini footer cuando el footer grande entra en el viewport
            ScrollTrigger.create({
                trigger: bigFooter,
                start: "top bottom", // Cuando la parte superior de big-footer entra por abajo de la pantalla
                onEnter: () => {
                    gsap.to(miniFooter, { y: 100, opacity: 0, autoAlpha: 0, duration: 0.4, ease: "power2.in" });
                    document.body.classList.remove('mini-footer-active');
                },
                onLeaveBack: () => {
                    gsap.to(miniFooter, { y: 0, opacity: 1, autoAlpha: 1, duration: 0.4, ease: "power2.out" });
                    document.body.classList.add('mini-footer-active');
                }
            });
        } else {
            // Fallback de scroll nativo si GSAP o ScrollTrigger no están disponibles
            const handleNativeScroll = () => {
                const scrollY = window.scrollY;
                const docHeight = document.documentElement.scrollHeight;
                const winHeight = window.innerHeight;
                
                // Mostrar a los 200px y ocultar unos 150px antes del final de la página (donde aparece el big-footer)
                if (scrollY > 200 && (docHeight - winHeight - scrollY > 150)) {
                    miniFooter.classList.add('is-visible');
                    miniFooter.classList.remove('is-hidden');
                    document.body.classList.add('mini-footer-active');
                } else {
                    miniFooter.classList.remove('is-visible');
                    miniFooter.classList.add('is-hidden');
                    document.body.classList.remove('mini-footer-active');
                }
            };
            
            window.addEventListener('scroll', handleNativeScroll);
            handleNativeScroll(); // Ejecución inicial
        }
    }
});

/*
    __/\\\\\\\\\\\\\\\__/\\\________/\\\____/\\\\\\\\\________/\\\\\\\\\___________/\\\\\_______/\\\\\_____/\\\____________/\\\\\\\\\\\\_____/\\\\\\\\\\\\\\\____________/\\\_________________/\\\\\\\\\_____________________/\\\\\\\\\__/\\\\\\\\\\\__/\\\\\\\\\\\\\\\__/\\\\\\\\\\\\\\\_______________/\\\\\\\\\\\_______/\\\\\\\\\_______________/\\\\\\\\\\\\_____/\\\\\\\\\\\\\\\__________________/\\\\\\\\\__/\\\________/\\\_        
     _\///////\\\/////__\/\\\_______\/\\\__/\\\///////\\\____/\\\///////\\\_______/\\\///\\\____\/\\\\\\___\/\\\___________\/\\\////////\\\__\/\\\///////////____________\/\\\_______________/\\\\\\\\\\\\\________________/\\\////////__\/////\\\///__\///////\\\/////__\/\\\///////////______________/\\\/////////\\\___/\\\\\\\\\\\\\____________\/\\\////////\\\__\/\\\///////////________________/\\\////////__\/\\\_______\/\\\_       
      _______\/\\\_______\/\\\_______\/\\\_\/\\\_____\/\\\___\/\\\_____\/\\\_____/\\\/__\///\\\__\/\\\/\\\__\/\\\___________\/\\\______\//\\\_\/\\\_______________________\/\\\______________/\\\/////////\\\_____________/\\\/_______________\/\\\___________\/\\\_______\/\\\________________________\//\\\______\///___/\\\/////////\\\___________\/\\\______\//\\\_\/\\\_________________________/\\\/___________\//\\\______/\\\__      
       _______\/\\\_______\/\\\_______\/\\\_\/\\\\\\\\\\\/____\/\\\\\\\\\\\/_____/\\\______\//\\\_\/\\\//\\\_\/\\\___________\/\\\_______\/\\\_\/\\\\\\\\\\\_______________\/\\\_____________\/\\\_______\/\\\____________/\\\_________________\/\\\___________\/\\\_______\/\\\\\\\\\\\_________________\////\\\_________\/\\\_______\/\\\___________\/\\\_______\/\\\_\/\\\\\\\\\\\________________/\\\______________\//\\\____/\\\___     
        _______\/\\\_______\/\\\_______\/\\\_\/\\\//////\\\____\/\\\//////\\\____\/\\\_______\/\\\_\/\\\\//\\\\/\\\___________\/\\\_______\/\\\_\/\\\///////________________\/\\\_____________\/\\\\\\\\\\\\\\\___________\/\\\_________________\/\\\___________\/\\\_______\/\\\///////_____________________\////\\\______\/\\\\\\\\\\\\\\\___________\/\\\_______\/\\\_\/\\\///////________________\/\\\_______________\//\\\__/\\\____    
         _______\/\\\_______\/\\\_______\/\\\_\/\\\____\//\\\___\/\\\____\//\\\___\//\\\______/\\\__\/\\\_\//\\\/\\\___________\/\\\_______\/\\\_\/\\\_______________________\/\\\_____________\/\\\/////////\\\___________\//\\\________________\/\\\___________\/\\\_______\/\\\_______________________________\////\\\___\/\\\/////////\\\___________\/\\\_______\/\\\_\/\\\_______________________\//\\\_______________\//\\\/\\\_____   
          _______\/\\\_______\//\\\______/\\\__\/\\\_____\//\\\__\/\\\_____\//\\\___\///\\\__/\\\____\/\\\__\//\\\\\\___________\/\\\_______/\\\__\/\\\_______________________\/\\\_____________\/\\\_______\/\\\____________\///\\\______________\/\\\___________\/\\\_______\/\\\________________________/\\\______\//\\\__\/\\\_______\/\\\___________\/\\\_______/\\\__\/\\\________________________\///\\\______________\//\\\\\______  
           _______\/\\\________\///\\\\\\\\\/___\/\\\______\//\\\_\/\\\______\//\\\____\///\\\\\/_____\/\\\___\//\\\\\___________\/\\\\\\\\\\\\/___\/\\\\\\\\\\\\\\\___________\/\\\\\\\\\\\\\\\_\/\\\_______\/\\\______________\////\\\\\\\\\__/\\\\\\\\\\\_______\/\\\_______\/\\\\\\\\\\\\\\\___________\///\\\\\\\\\\\/___\/\\\_______\/\\\___________\/\\\\\\\\\\\\/___\/\\\\\\\\\\\\\\\______________\////\\\\\\\\\______\//\\\_______ 
            _______\///___________\/////////_____\///________\///__\///________\///_______\/////_______\///_____\/////____________\////////////_____\///////////////____________\///////////////__\///________\///__________________\/////////__\///////////________\///________\///////////////______________\///////////_____\///________\///____________\////////////_____\///////////////__________________\/////////________\///________
      
      
                                                                     =#                                    
                                                                    =@@#                                   
                                                                   -@@@@*                                  
                                                                  :@@@@@@+                                 
                             .=============.           :==========%@@@@@@@=                                
                              #@@@@@@@@@@@+           :@@@@@@@@@@@@@@@@@@@@-                               
                              .%@@@@@@@@@*           :@@@@@@@@@@@@@@@@@@@@@@-                              
                               .%@@@@@@@#           :%@@@@@@@@@@@@@@@@@@@@@@#                              
                                :@@@@@@%.          .%@@@@@@@@@@@@@@@@@@@@@*:                               
                                 -@@@@%.          .%@@@@@@@@@@@@@@@@@@@%+.                                 
                                  ----.          .#@@@@@@@@%-----------                                    
                                                 #@@@@@@@@=                                                
                                                *@@@@@@@#.                                                 
                                               *@@@@@@%-                                                   
                                              +@@@@@@*.                                                    
                                             +@@@@@%:                                                      
                                            =@@@@@+                                                        
                                ...........=@@@@#.                                                         
                               :%@@@@@@@@@@@@@%-                                                           
                                .############*.  

This template was edited by TURRON DE LA CITE SA DE CV // ADVERTISING AGENCY // for more information contact via tci.publicidad@hotmail.com 
Developer: ALÁN MEZA CHÁVEZ https://www.linkedin.com/in/alanmzch/
*/