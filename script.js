// Configuración inicial
document.addEventListener('DOMContentLoaded', function() {
    // Variables globales
    let currentAudio = null;
    let currentPlayer = null;

    // ===== TEMA CLARO/OSCURO =====
    const themeToggle = document.getElementById('theme-toggle');
    const themeIcon = themeToggle.querySelector('.fa-moon');
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

    // ===== CURSOR PERSONALIZADO =====
    const cursor = document.querySelector('.custom-cursor');

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });

    // Cambiar cursor en elementos interactivos
    const interactiveElements = document.querySelectorAll('a, button, input, .play-btn, .gallery-item');

    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            cursor.style.background = 'var(--neon-cyan)';
        });

        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            cursor.style.background = 'var(--neon-green)';
        });
    });

    // ===== MENÚ MÓVIL =====
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Cerrar menú al hacer clic en enlace
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');

            // Actualizar enlace activo
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // ===== SCROLL SUAVE Y ANIMACIONES =====
    window.addEventListener('scroll', () => {
        // Navbar con scroll
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'var(--glass)';
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            navbar.style.background = 'transparent';
            navbar.style.backdropFilter = 'none';
        }

        // Animaciones al hacer scroll
        const sections = document.querySelectorAll('.section');
        const windowHeight = window.innerHeight;
        const scrollY = window.scrollY + windowHeight * 0.8;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;

            if (scrollY > sectionTop && scrollY < sectionTop + sectionHeight) {
                const elements = section.querySelectorAll('.fade-in-up');
                elements.forEach((el, index) => {
                    setTimeout(() => {
                        el.classList.add('fade-in-up');
                    }, index * 100);
                });
            }
        });
    });

    // ===== REPRODUCTOR DE AUDIO =====
    const playButtons = document.querySelectorAll('.play-btn');
    const audioPlayers = document.querySelectorAll('.audio-player');

    // URLs de audio de ejemplo (SoundHelix)
    const audioUrls = {
        mix1: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        mix2: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        mix3: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3'
    };

    playButtons.forEach(button => {
        button.addEventListener('click', function() {
            const audioId = this.getAttribute('data-audio');
            const audioElement = document.getElementById(`audio-${audioId}`);
            const playerId = `player-${audioId}`;
            const playerElement = document.getElementById(playerId);

            // Si hay un audio reproduciéndose, pausarlo
            if (currentAudio && currentAudio !== audioElement) {
                currentAudio.pause();
                const currentPlayBtn = currentPlayer.querySelector('.play-pause i');
                currentPlayBtn.className = 'fas fa-play';
            }

            // Si es el mismo audio, pausar/reanudar
            if (currentAudio === audioElement) {
                if (audioElement.paused) {
                    audioElement.play();
                    playerElement.querySelector('.play-pause i').className = 'fas fa-pause';
                } else {
                    audioElement.pause();
                    playerElement.querySelector('.play-pause i').className = 'fas fa-play';
                }
            } else {
                // Reproducir nuevo audio
                audioElement.play();
                playerElement.querySelector('.play-pause i').className = 'fas fa-pause';
            }

            currentAudio = audioElement;
            currentPlayer = playerElement;

            // Actualizar progreso
            updateAudioProgress(audioElement, playerElement);
        });
    });

    // Controladores de reproducción en cada player
    audioPlayers.forEach(player => {
        const playPauseBtn = player.querySelector('.play-pause');
        const progressBar = player.querySelector('.progress');
        const progressContainer = player.querySelector('.progress-bar');
        const timeDisplay = player.querySelector('.time');
        const volumeSlider = player.querySelector('.volume-slider');

        // Obtener el elemento audio correspondiente
        const playerId = player.id.replace('player-', '');
        const audioElement = document.getElementById(`audio-${playerId}`);

        if (!audioElement) return;

        // Play/Pause
        playPauseBtn.addEventListener('click', () => {
            if (audioElement.paused) {
                // Pausar audio actual si hay uno reproduciéndose
                if (currentAudio && currentAudio !== audioElement) {
                    currentAudio.pause();
                    currentPlayer.querySelector('.play-pause i').className = 'fas fa-play';
                }

                audioElement.play();
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
            const progressPercent = (currentTime / duration) * 100;

            progressBar.style.width = `${progressPercent}%`;

            // Formatear tiempo
            const formatTime = (time) => {
                const minutes = Math.floor(time / 60);
                const seconds = Math.floor(time % 60);
                return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            };

            timeDisplay.textContent = `${formatTime(currentTime)} / ${formatTime(duration)}`;
        });

        // Click en barra de progreso
        progressContainer.addEventListener('click', (e) => {
            const clickX = e.offsetX;
            const width = progressContainer.clientWidth;
            const duration = audioElement.duration;

            audioElement.currentTime = (clickX / width) * duration;
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
    });

    function updateAudioProgress(audio, player) {
        if (!audio || !player) return;

        const progressBar = player.querySelector('.progress');
        const timeDisplay = player.querySelector('.time');

        audio.addEventListener('timeupdate', function() {
            const percent = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = `${percent}%`;

            const formatTime = (time) => {
                const minutes = Math.floor(time / 60);
                const seconds = Math.floor(time % 60);
                return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            };

            timeDisplay.textContent = `${formatTime(audio.currentTime)} / ${formatTime(audio.duration)}`;
        });
    }

    // ===== ANIMACIÓN DE TECLADO =====
    const typingText = document.querySelector('.typing-text');
    const texts = [
        'DJ - productor - animador',
        'Experiencia internacional',
        'Más de 150 eventos',
        'Sonido potente',
        'Luces espectaculares y más...'
    ];

    let textIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let isEnd = false;

    function typeEffect() {
        const currentText = texts[textIndex];

        if (isDeleting) {
            typingText.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typingText.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        if (!isDeleting && charIndex === currentText.length) {
            isEnd = true;
            isDeleting = true;
            setTimeout(typeEffect, 2000);
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            textIndex = (textIndex + 1) % texts.length;
            setTimeout(typeEffect, 500);
        } else {
            setTimeout(typeEffect, isDeleting ? 50 : 100);
        }
    }

    // Iniciar animación de teclado
    setTimeout(typeEffect, 1000);

    // ===== ANIMACIÓN DE BARRAS DE HABILIDAD =====
    const skillLevels = document.querySelectorAll('.skill-level');

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

    // ===== FORMULARIO DE CONTACTO =====
    const bookingForm = document.getElementById('bookingForm');

    bookingForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Animación de envío
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
        submitBtn.disabled = true;

        // Envío REAL con EmailJS
        if (!window.emailjs) {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            showNotification('EmailJS no está cargado. Revisa el orden de scripts en el HTML.', 'error');
            return;
        }

        emailjs.sendForm('service_vxm8dti', 'template_xlb04zb', this)
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

                showNotification('No se pudo enviar. Intenta nuevamente.', 'error');
            });
    });

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
        `;

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    // ===== CARGAR IMÁGENES CON EFECTO =====
    const images = document.querySelectorAll('img');
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

    // ===== INICIALIZAR ANIMACIONES AL CARGAR =====
    window.dispatchEvent(new Event('scroll'));
});
