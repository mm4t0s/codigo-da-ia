document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.createElement("canvas");
    const container = document.getElementById("particles-js");
    container.appendChild(canvas);

    const ctx = canvas.getContext("2d");
    let width, height;
    let particles = [];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
            this.color = `rgba(255, 107, 0, ${Math.random() * 0.5})`;
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0) this.x = width;
            if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height;
            if (this.y > height) this.y = 0;
        }

        draw() {
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function initParticles() {
        particles = [];
        const numParticles = Math.min(width * 0.1, 100); // Responsive count
        for (let i = 0; i < numParticles; i++) {
            particles.push(new Particle());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);

        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connections
        particles.forEach((p1, i) => {
            particles.slice(i + 1).forEach(p2 => {
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 100) {
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 107, 0, ${0.1 - dist / 1000})`;
                    ctx.lineWidth = 0.5;
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    ctx.stroke();
                }
            });
        });

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', () => {
        resize();
        initParticles();
    });

    resize();
    initParticles();
    animate();

    // Smooth scroll for anchors
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
    // --- SCROLL ANIMATIONS (Intersection Observer) ---
    const observerOptions = {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('scroll-visible');
                if (entry.target.classList.contains('zoom-on-scroll')) {
                    entry.target.classList.add('zoom-visible');
                }
                observer.unobserve(entry.target); // Animate once
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.scroll-hidden, .zoom-on-scroll');
    animatedElements.forEach(el => scrollObserver.observe(el));

    // --- MINI CAROUSEL LOGIC ---
    function initCarousels() {
        const carousels = document.querySelectorAll('.img-carousel');

        carousels.forEach(carousel => {
            const track = carousel.querySelector('.carousel-track');
            if (!track) return;

            const slides = Array.from(track.children);
            const nextBtn = carousel.querySelector('.carousel-next');
            const prevBtn = carousel.querySelector('.carousel-prev');
            const dots = carousel.querySelectorAll('.carousel-dot');

            let currentIndex = 0;

            const updateCarousel = (index) => {
                track.style.transform = `translateX(-${index * 100}%)`;
                dots.forEach(dot => dot.classList.remove('active'));
                if (dots[index]) dots[index].classList.add('active');
                currentIndex = index;
            };

            if (nextBtn) {
                nextBtn.addEventListener('click', (e) => {
                    e.preventDefault(); // Prevent jump
                    const newIndex = (currentIndex + 1) % slides.length;
                    updateCarousel(newIndex);
                });
            }

            if (prevBtn) {
                prevBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const newIndex = (currentIndex - 1 + slides.length) % slides.length;
                    updateCarousel(newIndex);
                });
            }

            // Swipe functionality
            let touchStartX = 0;
            let touchEndX = 0;

            track.addEventListener('touchstart', e => {
                touchStartX = e.changedTouches[0].screenX;
            }, { passive: true });

            track.addEventListener('touchend', e => {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, { passive: true });

            const handleSwipe = () => {
                const threshold = 50; // Min distance for swipe
                if (touchEndX < touchStartX - threshold) {
                    // Swipe Left -> Next
                    const newIndex = (currentIndex + 1) % slides.length;
                    updateCarousel(newIndex);
                }
                if (touchEndX > touchStartX + threshold) {
                    // Swipe Right -> Prev
                    const newIndex = (currentIndex - 1 + slides.length) % slides.length;
                    updateCarousel(newIndex);
                }
            };

            dots.forEach((dot, index) => {
                dot.addEventListener('click', (e) => {
                    e.preventDefault(); // Prevent usage
                    updateCarousel(index);
                });
            });
        });
    }

    // --- OFFER TIMER LOGIC ---
    function initOfferTimer() {
        const timerSection = document.getElementById('payment-section');
        const minEl = document.getElementById('minutes');
        const secEl = document.getElementById('seconds');

        if (!timerSection || !minEl || !secEl) return;

        let timeLeft = 10 * 60; // 10 minutes in seconds
        let interval;
        let hasStarted = false;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !hasStarted) {
                    hasStarted = true;
                    startTimer();
                }
            });
        }, { threshold: 0.1 });

        observer.observe(timerSection);

        function startTimer() {
            updateDisplay();
            interval = setInterval(() => {
                timeLeft--;

                if (timeLeft <= 0) {
                    timeLeft = 0;
                    clearInterval(interval);
                }
                updateDisplay();
            }, 1000);
        }

        function updateDisplay() {
            const m = Math.floor(timeLeft / 60);
            const s = timeLeft % 60;
            minEl.textContent = m < 10 ? '0' + m : m;
            secEl.textContent = s < 10 ? '0' + s : s;
        }
    }

    // Initialize Offer Timer
    initOfferTimer();

    // Initialize carousels
    initCarousels();

    // --- STICKY CTA LOGIC (Mobile) ---
    function initStickyCTA() {
        const paymentSection = document.getElementById('payment-section');
        const stickyCTA = document.getElementById('mobile-sticky-cta');
        if (!paymentSection || !stickyCTA) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    stickyCTA.classList.add('is-visible');
                    paymentSection.classList.add('has-sticky-padding');
                } else {
                    stickyCTA.classList.remove('is-visible');
                    paymentSection.classList.remove('has-sticky-padding');
                }
            });
        }, {
            threshold: 0,
            rootMargin: "0px"
        });

        observer.observe(paymentSection);
    }

    initStickyCTA();

    // --- VSL VIDEO SOUND TOGGLE ---
    function initVslSoundToggle() {
        const vslPlayer = document.getElementById('vsl-player');
        const soundToggle = document.querySelector('.vsl-sound-toggle');
        if (!vslPlayer || !soundToggle) return;

        const enableSound = () => {
            try {
                const url = new URL(vslPlayer.src);
                url.searchParams.set('mute', '0');
                url.searchParams.set('autoplay', '1');
                url.searchParams.set('playsinline', '1');
                url.searchParams.set('enablejsapi', '1');
                url.searchParams.set('origin', window.location.origin);
                vslPlayer.src = url.toString();
            } catch (err) {}
            vslPlayer.contentWindow.postMessage('{"event":"command","func":"unMute","args":""}', '*');
            vslPlayer.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
            soundToggle.classList.add('is-hidden');
        };

        soundToggle.addEventListener('click', enableSound);
        document.addEventListener('click', enableSound, { once: true });
        document.addEventListener('keydown', enableSound, { once: true });
    }

    initVslSoundToggle();

    // --- VIDEO CAROUSEL LOGIC ---
    function initVideoCarousel() {
        const carousel = document.querySelector('.video-carousel');
        const slides = document.querySelectorAll('.video-slide');
        const indicators = document.querySelectorAll('.indicator');
        if (!carousel || slides.length === 0) return;

        // Intersection Observer to detect active slide
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const index = Array.from(slides).indexOf(entry.target);

                    // Update indicators
                    indicators.forEach(ind => ind.classList.remove('active'));
                    if (indicators[index]) indicators[index].classList.add('active');

                    // Pause other videos
                    slides.forEach((slide, i) => {
                        if (i !== index) {
                            const iframe = slide.querySelector('iframe');
                            if (iframe) {
                                // Send pause command to YouTube API
                                iframe.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
                            }
                        }
                    });
                }
            });
        }, {
            root: carousel,
            threshold: 0.6 // Trigger when 60% visible
        });

        slides.forEach(slide => observer.observe(slide));
    }

    initVideoCarousel();


});
