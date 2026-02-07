// Configuración inicial
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let currentAudio = null;
    let currentPlayer = null;

    // ===== TEMA CLARO/OSCURO =====
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    // Verificar tema guardado o preferencia del sistema
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme) {
        html.setAttribute('data-theme', savedTheme);
    } else if (systemPrefersDark) {
        html.setAttribute('data-theme', 'dark');
    }

    // Alternar tema
    themeToggle.addEventListener('click', () => {
        const currentTheme = html.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);

        // Animación del botón
        themeToggle.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            themeToggle.style.transform = 'rotate(0)';
        }, 300);
    });

    // ===== CURSOR PERSONALIZADO - CORREGIDO =====
    const cursor = document.querySelector('.custom-cursor');
    
    // Solo inicializar cursor si existe el elemento
    if (cursor) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });

        // Cambiar cursor en elementos interactivos
        const interactiveElements = document.querySelectorAll('a, button, input, .play-btn, .gallery-item, .video-card');

        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
                cursor.style.background = 'var(--neon-cyan)';
                cursor.style.opacity = '1';
            });

            el.addEventListener('mouseleave', () => {
                cursor.style.transform = 'translate(-50%, -50%) scale(1)';
                cursor.style.background = 'var(--neon-green)';
                cursor.style.opacity = '0.7';
            });
        });

        // Ocultar cursor en móviles
        if (window.matchMedia('(max-width: 768px)').matches) {
            cursor.style.display = 'none';
        }
    }

    // ===== MENÚ MÓVIL - COMPLETAMENTE CORREGIDO =====
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navBackdrop = document.getElementById('navBackdrop');
    const navLinks = document.querySelectorAll('.nav-link');

    // Función para abrir/cerrar menú
    function toggleMenu() {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        navBackdrop.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    }

    // Evento para el botón hamburguesa
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }

    // Evento para el backdrop
    if (navBackdrop) {
        navBackdrop.addEventListener('click', toggleMenu);
    }

    // Cerrar menú al hacer clic en enlace
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            navBackdrop.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ===== SCROLL SUAVE Y ANIMACIONES =====
    window.addEventListener('scroll', () => {
        // Navbar con scroll
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.background = 'var(--glass)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.background = 'transparent';
                navbar.style.backdropFilter = 'none';
            }
        }
    });

    // ===== REPRODUCTOR DE AUDIO =====
    const playButtons = document.querySelectorAll('.play-btn');
    const audioPlayers = document.querySelectorAll('.audio-player');

    // Controladores de reproducción
    audioPlayers.forEach(player => {
        const playPauseBtn = player.querySelector('.play-pause');
        const progressBar = player.querySelector('.progress');
        const progressContainer = player.querySelector('.progress-bar');
        const timeDisplay = player.querySelector('.time');
        const volumeSlider = player.querySelector('.volume-slider');

        // Obtener el elemento audio correspondiente
        const playerId = player.id.replace('player-', '');
        const audioElement = document.getElementById(`audio-${playerId}`);

        if (!audioElement || !playPauseBtn) return;

        // Play/Pause
        playPauseBtn.addEventListener('click', () => {
            if (audioElement.paused) {
                // Pausar audio actual si hay uno reproduciéndose
                if (currentAudio && currentAudio !== audioElement) {
                    currentAudio.pause();
                    const currentBtn = currentPlayer.querySelector('.play-pause i');
                    if (currentBtn) currentBtn.className = 'fas fa-play';
                }

                audioElement.play().catch(e => {
                    console.error('Error reproduciendo audio:', e);
                    playPauseBtn.querySelector('i').className = 'fas fa-play';
                });
                playPauseBtn.querySelector('i').className = 'fas fa-pause';
                currentAudio = audioElement;
                currentPlayer = player;
            } else {
                audioElement.pause();
                playPauseBtn.querySelector('i').className = 'fas fa-play';
            }
        });

        // Actualizar tiempo
        audioElement.addEventListener('timeupdate', () => {
            const currentTime = audioElement.currentTime;
            const duration = audioElement.duration;
            
            if (duration) {
                const progressPercent = (currentTime / duration) * 100;
                progressBar.style.width = `${progressPercent}%`;

                // Formatear tiempo
                const formatTime = (time) => {
                    const minutes = Math.floor(time / 60);
                    const seconds = Math.floor(time % 60);
                    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
                };

                timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
            }
        });

        // Click en barra de progreso
        progressContainer.addEventListener('click', (e) => {
            const clickX = e.offsetX;
            const width = progressContainer.clientWidth;
            const duration = audioElement.duration;

            if (duration) {
                audioElement.currentTime = (clickX / width) * duration;
            }
        });

        // Control de volumen
        volumeSlider.addEventListener('input', (e) => {
            audioElement.volume = e.target.value / 100;
        });

        // Cuando termina la reproducción
        audioElement.addEventListener('ended', () => {
            playPauseBtn.querySelector('i').className = 'fas fa-play';
            progressBar.style.width = '0%';
        });

        // Inicializar volumen
        audioElement.volume = volumeSlider.value / 100;
    });

    // Botones play en las tarjetas
    playButtons.forEach(button => {
        button.addEventListener('click', function() {
            const audioId = this.getAttribute('data-audio');
            const audioElement = document.getElementById(`audio-${audioId}`);
            const playerId = `player-${audioId}`;
            const playerElement = document.getElementById(playerId);

            if (!audioElement || !playerElement) return;

            const playPauseBtn = playerElement.querySelector('.play-pause');

            if (currentAudio && currentAudio !== audioElement) {
                currentAudio.pause();
                const currentBtn = currentPlayer.querySelector('.play-pause i');
                if (currentBtn) currentBtn.className = 'fas fa-play';
            }

            if (audioElement.paused) {
                audioElement.play().catch(e => {
                    console.error('Error reproduciendo audio:', e);
                });
                playPauseBtn.querySelector('i').className = 'fas fa-pause';
            } else {
                audioElement.pause();
                playPauseBtn.querySelector('i').className = 'fas fa-play';
            }

            currentAudio = audioElement;
            currentPlayer = playerElement;
        });
    });

    // ===== ANIMACIÓN DE TECLADO =====
    const typingText = document.querySelector('.typing-text');
    if (typingText) {
        const texts = [
            'DJ & Producer especializado en House, Techno y EDM',
            'Más de 150 eventos realizados',
            'Sonido único y energía inigualable',
            'Booking disponible para tu evento'
        ];

        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typingSpeed = 100;

        function typeEffect() {
            const currentText = texts[textIndex];

            if (isDeleting) {
                typingText.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
                typingSpeed = 50;
            } else {
                typingText.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
                typingSpeed = 100;
            }

            if (!isDeleting && charIndex === currentText.length) {
                isDeleting = true;
                typingSpeed = 1000;
                setTimeout(typeEffect, typingSpeed);
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typingSpeed = 500;
                setTimeout(typeEffect, typingSpeed);
            } else {
                setTimeout(typeEffect, typingSpeed);
            }
        }

        // Iniciar animación de teclado
        setTimeout(typeEffect, 1000);
    }

    // ===== ANIMACIÓN DE BARRAS DE HABILIDAD =====
    const skillLevels = document.querySelectorAll('.skill-level');
    if (skillLevels.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const level = entry.target.getAttribute('data-level');
                    entry.target.style.width = `${level}%`;
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });

        skillLevels.forEach(skill => observer.observe(skill));
    }

    // ===== FORMULARIO DE CONTACTO - CORREGIDO PARA ENVÍO REAL =====
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();

            // Animación de envío
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitBtn.disabled = true;

            // Verificar que EmailJS esté disponible
            if (!window.emailjs || typeof emailjs.sendForm !== 'function') {
                console.error('EmailJS no está disponible');
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                showNotification('Error: El servicio de correo no está disponible. Por favor, contáctanos directamente.', 'error');
                return;
            }

            // ENVÍO REAL CON EMAILJS
            emailjs.sendForm('service_vxm8dti', 'template_xlb04zb', this, 'IVLsP4yuQkEPPqxYl')
                .then(() => {
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> ¡Enviado!';
                    submitBtn.style.background = 'var(--neon-green)';

                    setTimeout(() => {
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                        submitBtn.style.background = '';
                        bookingForm.reset();

                        // Mostrar notificación
                        showNotification('¡Solicitud enviada! Te contactaremos pronto.', 'success');
                    }, 2000);
                })
                .catch((err) => {
                    console.error('EmailJS error:', err);
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    submitBtn.style.background = '';

                    // Mensaje de error específico
                    let errorMessage = 'No se pudo enviar. Intenta nuevamente.';
                    if (err.text && err.text.includes('Invalid template ID')) {
                        errorMessage = 'Error: ID de plantilla inválido. Revisa la configuración.';
                    } else if (err.text && err.text.includes('Invalid service ID')) {
                        errorMessage = 'Error: ID de servicio inválido. Revisa la configuración.';
                    }

                    showNotification(errorMessage, 'error');
                });
        });
    }

    // ===== NOTIFICACIONES =====
    function showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        `;

        document.body.appendChild(notification);

        // Estilos de notificación
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? 'var(--neon-green)' : 'var(--neon-purple)'};
            color: #000;
            padding: 15px 20px;
            border-radius: 10px;
            display: flex;
            align-items: center;
            gap: 10px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        `;

        // Añadir animaciones CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        document.head.appendChild(style);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // ===== CARGAR IMÁGENES CON EFECTO =====
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
        img.addEventListener('load', function() {
            this.style.opacity = '1';
            this.style.transform = 'scale(1)';
        });

        img.style.opacity = '0';
        img.style.transform = 'scale(0.95)';
        img.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

        // Forzar carga
        if (img.complete) {
            img.dispatchEvent(new Event('load'));
        }
    });

    // ===== PREVENIR COMPORTAMIENTO POR DEFECTO EN ENLACES =====
    document.querySelectorAll('a[href="#"]').forEach(link => {
        link.addEventListener('click', e => e.preventDefault());
    });
});