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
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                let visibleCount = 0;
                pressItems.forEach(item => {
                    const category = item.getAttribute('data-category');
                    if (filter === 'all' || category === filter || (category && category.split(' ').includes(filter))) {
                        item.style.display = 'flex';
                        item.animate([
                            { opacity: 0, transform: 'translateY(10px)' },
                            { opacity: 1, transform: 'translateY(0)' }
                        ], { duration: 300, easing: 'ease-out' });
                        visibleCount++;
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
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