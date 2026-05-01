document.addEventListener('DOMContentLoaded', function() {
    
    initPreloader();
    initParticles();
    initNavbar();
    initMusicControl();
    initScrollAnimations();
    initCounters();
    initContactForm();
    initScrollTop();
    initSmoothScroll();
    initGSAPAnimations();
});

function initPreloader() {
    const preloader = document.getElementById('preloader');
    
    // Hide preloader after a short delay
    setTimeout(() => {
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 300);
        }
    }, 800);
    
    // Fallback: ensure preloader is hidden after max 2 seconds
    setTimeout(() => {
        if (preloader) {
            preloader.style.display = 'none';
        }
    }, 2000);
}

function initParticles() {
    if (typeof particlesJS !== 'undefined') {
        particlesJS('particles-js', {
            particles: {
                number: {
                    value: 80,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: ['#ff6b00', '#00d4ff', '#ff00ff']
                },
                shape: {
                    type: 'circle',
                    stroke: {
                        width: 0,
                        color: '#000000'
                    }
                },
                opacity: {
                    value: 0.5,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: true,
                        speed: 2,
                        size_min: 0.1,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#ff6b00',
                    opacity: 0.2,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 2,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: false,
                    attract: {
                        enable: false,
                        rotateX: 600,
                        rotateY: 1200
                    }
                }
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 140,
                        line_linked: {
                            opacity: 0.5
                        }
                    },
                    push: {
                        particles_nb: 4
                    }
                }
            },
            retina_detect: true
        });
    }
}

function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
            
            if (window.innerWidth <= 992) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    });
    
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', function() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${current}`) {
                link.classList.add('active');
            }
        });
    });
}

function initMusicControl() {
    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    const volumeSlider = document.getElementById('volumeSlider');
    
    bgMusic.volume = 0.5;
    
    let musicPlaying = false;
    
    function tryPlayMusic() {
        if (!musicPlaying) {
            bgMusic.play().then(() => {
                musicPlaying = true;
                musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
                musicToggle.classList.remove('muted');
            }).catch(error => {
                console.log('Autoplay prevented:', error);
            });
        }
    }
    
    document.addEventListener('click', tryPlayMusic, { once: true });
    document.addEventListener('keydown', tryPlayMusic, { once: true });
    document.addEventListener('scroll', tryPlayMusic, { once: true });
    
    musicToggle.addEventListener('click', function(e) {
        e.stopPropagation();
        if (bgMusic.paused) {
            bgMusic.play();
            musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
            musicToggle.classList.remove('muted');
            musicPlaying = true;
        } else {
            bgMusic.pause();
            musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
            musicToggle.classList.add('muted');
            musicPlaying = false;
        }
    });
    
    volumeSlider.addEventListener('input', function() {
        bgMusic.volume = this.value / 100;
        if (this.value == 0) {
            musicToggle.innerHTML = '<i class="fas fa-volume-mute"></i>';
            musicToggle.classList.add('muted');
        } else {
            musicToggle.innerHTML = '<i class="fas fa-volume-up"></i>';
            musicToggle.classList.remove('muted');
        }
    });
}

function initScrollAnimations() {
    // AOS disabled - using GSAP for all animations
    // if (typeof AOS !== 'undefined') {
    //     AOS.init({
    //         duration: 1000,
    //         once: true,
    //         offset: 100,
    //         easing: 'ease-out-cubic'
    //     });
    // }
}

function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    let started = false;
    
    function startCounters() {
        if (started) return;
        
        const statsSection = document.getElementById('why-us');
        const statsSectionTop = statsSection.offsetTop;
        const statsSectionHeight = statsSection.clientHeight;
        
        if (window.scrollY > (statsSectionTop - window.innerHeight + 200)) {
            started = true;
            
            counters.forEach(counter => {
                const target = parseInt(counter.getAttribute('data-target'));
                const duration = 2000;
                const increment = target / (duration / 16);
                let current = 0;
                
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        counter.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target;
                    }
                };
                
                updateCounter();
            });
        }
    }
    
    window.addEventListener('scroll', startCounters);
    startCounters();
}

function initContactForm() {
    const form = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        
        console.log('Form Data:', data);
        
        formMessage.className = 'form-message success';
        formMessage.textContent = 'Thank you! Your message has been sent successfully. We will get back to you soon.';
        
        form.reset();
        
        setTimeout(() => {
            formMessage.style.display = 'none';
        }, 5000);
    });
    
    const inputs = form.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.setAttribute('data-filled', 'true');
            } else {
                this.removeAttribute('data-filled');
            }
        });
    });
}

function initScrollTop() {
    const scrollTopBtn = document.getElementById('scrollTop');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            scrollTopBtn.classList.add('visible');
        } else {
            scrollTopBtn.classList.remove('visible');
        }
    });
    
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initGSAPAnimations() {
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        
        // Hero animations - slide in from sides
        gsap.from('.hero-logo', {
            opacity: 0,
            scale: 0.5,
            duration: 1,
            ease: 'back.out(1.7)'
        });
        
        gsap.from('.hero-title', {
            opacity: 0,
            x: -100,
            duration: 1,
            delay: 0.3,
            ease: 'power3.out'
        });
        
        gsap.from('.hero-tagline', {
            opacity: 0,
            x: 100,
            duration: 1,
            delay: 0.5,
            ease: 'power3.out'
        });
        
        gsap.from('.hero-subtitle', {
            opacity: 0,
            y: 30,
            duration: 1,
            delay: 0.7,
            ease: 'power3.out'
        });
        
        gsap.from('.hero-buttons .btn', {
            opacity: 0,
            y: 50,
            duration: 0.8,
            delay: 0.9,
            stagger: 0.2,
            ease: 'power3.out'
        });
        
        // Service items - slide from left and right alternately
        const heroServiceItems = document.querySelectorAll('.hero-service-item');
        heroServiceItems.forEach((item, index) => {
            const fromLeft = index % 2 === 0;
            gsap.from(item, {
                opacity: 0,
                x: fromLeft ? -100 : 100,
                duration: 0.8,
                delay: 1.2 + (index * 0.15),
                ease: 'power3.out'
            });
        });
        
        // Tech stack - slide from bottom
        gsap.from('.hero-tech-stack', {
            opacity: 0,
            y: 50,
            duration: 1,
            delay: 2,
            ease: 'power3.out'
        });
        
        // Tech icons - slide from sides alternately
        const techIcons = document.querySelectorAll('.tech-icon');
        techIcons.forEach((icon, index) => {
            const fromLeft = index % 2 === 0;
            gsap.from(icon, {
                opacity: 0,
                x: fromLeft ? -50 : 50,
                duration: 0.6,
                delay: 2.3 + (index * 0.08),
                ease: 'power3.out'
            });
        });
        
        const serviceCards = document.querySelectorAll('.service-card');
        serviceCards.forEach((card, index) => {
            const fromLeft = index % 2 === 0;
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                x: fromLeft ? -100 : 100,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            });
        });
        
        const portfolioCards = document.querySelectorAll('.portfolio-card');
        portfolioCards.forEach((card, index) => {
            const fromLeft = index % 2 === 0;
            gsap.from(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                },
                x: fromLeft ? -80 : 80,
                opacity: 0,
                duration: 0.8,
                ease: 'power3.out'
            });
        });
        
        gsap.from('.about-image', {
            scrollTrigger: {
                trigger: '.about-section',
                start: 'top 60%',
                toggleActions: 'play none none reverse'
            },
            x: -100,
            opacity: 0,
            duration: 1
        });
        
        gsap.from('.about-text', {
            scrollTrigger: {
                trigger: '.about-section',
                start: 'top 60%',
                toggleActions: 'play none none reverse'
            },
            x: 100,
            opacity: 0,
            duration: 1
        });
        
        gsap.utils.toArray('.section-header').forEach(header => {
            gsap.from(header, {
                scrollTrigger: {
                    trigger: header,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse'
                },
                y: 50,
                opacity: 0,
                duration: 0.8
            });
        });
    }
}

window.addEventListener('load', function() {
    document.body.style.opacity = '1';
});

const cursor = document.createElement('div');
cursor.className = 'custom-cursor';
document.body.appendChild(cursor);

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

document.querySelectorAll('a, button, .service-card, .portfolio-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursor.style.transform = 'scale(1.5)';
    });
    el.addEventListener('mouseleave', () => {
        cursor.style.transform = 'scale(1)';
    });
});

const style = document.createElement('style');
style.textContent = `
    .custom-cursor {
        width: 20px;
        height: 20px;
        border: 2px solid #ff6b00;
        border-radius: 50%;
        position: fixed;
        pointer-events: none;
        z-index: 10000;
        transition: transform 0.2s ease;
        mix-blend-mode: difference;
        display: none;
    }
    
    @media (min-width: 1024px) {
        .custom-cursor {
            display: block;
        }
        body {
            cursor: none;
        }
        a, button, .service-card, .portfolio-card {
            cursor: none;
        }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    document.querySelectorAll('.service-card, .why-card, .portfolio-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

const parallaxElements = document.querySelectorAll('.hero-content, .about-image');
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    parallaxElements.forEach(el => {
        const speed = el.dataset.speed || 0.5;
        el.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-15px) scale(1.02)';
    });
    
    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

const createFloatingShapes = () => {
    const shapes = ['circle', 'triangle', 'square'];
    const colors = ['#ff6b00', '#00d4ff', '#ff00ff'];
    
    for (let i = 0; i < 10; i++) {
        const shape = document.createElement('div');
        shape.className = 'floating-shape';
        shape.style.cssText = `
            position: fixed;
            width: ${Math.random() * 100 + 50}px;
            height: ${Math.random() * 100 + 50}px;
            background: ${colors[Math.floor(Math.random() * colors.length)]};
            opacity: 0.05;
            border-radius: ${shapes[Math.floor(Math.random() * shapes.length)] === 'circle' ? '50%' : '0'};
            top: ${Math.random() * 100}%;
            left: ${Math.random() * 100}%;
            pointer-events: none;
            z-index: -1;
            filter: blur(40px);
            animation: float-random ${Math.random() * 10 + 10}s infinite ease-in-out;
        `;
        document.body.appendChild(shape);
    }
};

const floatStyle = document.createElement('style');
floatStyle.textContent = `
    @keyframes float-random {
        0%, 100% { transform: translate(0, 0) rotate(0deg); }
        25% { transform: translate(100px, -100px) rotate(90deg); }
        50% { transform: translate(-100px, 100px) rotate(180deg); }
        75% { transform: translate(100px, 100px) rotate(270deg); }
    }
`;
document.head.appendChild(floatStyle);

createFloatingShapes();
