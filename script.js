class WebPrompter {
    constructor() {
        this.isPlaying = false;
        this.scrollSpeed = 3;
        this.scrollInterval = null;
        this.currentPosition = 0;
        this.manualOffsetY = 0;
        this.isDragging = false;
        this.dragStartY = 0;
        this.dragStartOffset = 0;
        this.textElement = document.getElementById('prompterText');
        this.scriptInput = document.getElementById('scriptInput');

        this.init();
    }

    init() {
        this.bindEvents();
        this.loadPresets();
        this.updateDisplay();
    }

    bindEvents() {
        // Control buttons
        document.getElementById('playBtn').addEventListener('click', () => this.play());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pause());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.startFromBeginning());

        // Settings
        document.getElementById('fontSize').addEventListener('change', (e) => this.changeFontSize(e.target.value));
        document.getElementById('textColor').addEventListener('change', (e) => this.changeTextColor(e.target.value));
        document.getElementById('speedControl').addEventListener('input', (e) => this.changeSpeed(e.target.value));

        // Script input - tambahkan event untuk reset posisi
        this.scriptInput.addEventListener('input', () => {
            this.updateDisplay();
            // Reset posisi scroll setelah perubahan teks
            this.resetPosition();
        });

        // Reset posisi saat paste
        this.scriptInput.addEventListener('paste', () => {
            setTimeout(() => {
                this.updateDisplay();
                this.resetPosition();
            }, 10);
        });

        // Panel toggle
        document.getElementById('togglePanel').addEventListener('click', () => this.togglePanel());

        // Fullscreen
        document.getElementById('fullscreenBtn').addEventListener('click', () => this.toggleFullscreen());

        // Preset buttons
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.loadPreset(e.target.dataset.preset));
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // Prevent accidental exit in fullscreen
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());


        // Drag functionality
        this.textElement.addEventListener('mousedown', (e) => this.startDrag(e));
        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('mouseup', () => this.endDrag());

        // Touch support for mobile
        this.textElement.addEventListener('touchstart', (e) => this.startDrag(e.touches[0]));
        document.addEventListener('touchmove', (e) => {
            if (this.isDragging) {
                e.preventDefault();
                this.drag(e.touches[0]);
            }
        });
        document.addEventListener('touchend', () => this.endDrag());
    }

    loadPresets() {
        this.presets = {
            intro: `Halo teman-teman, selamat datang di channel saya!

Nama saya [NAMA ANDA] dan ini adalah video terbaru dari channel [NAMA CHANNEL].

Hari ini kita akan membahas topik yang sangat menarik yaitu [TOPIK VIDEO].

Sebelum kita mulai, jangan lupa untuk subscribe channel ini dan nyalakan lonceng notifikasi supaya kalian tidak ketinggalan video-video terbaru dari saya.

Mari kita langsung mulai!`,

            outro: `Nah, itulah pembahasan kita hari ini tentang [TOPIK].

Bagaimana menurut kalian? Tulis di kolom komentar ya!

Jangan lupa untuk like video ini jika bermanfaat.

Subscribe channel ini untuk video-video menarik lainnya.

Dan share video ini ke teman-teman kalian.

Sampai jumpa di video selanjutnya. Terima kasih!`,

            review: `Halo semuanya! Di video kali ini saya akan mereview produk [NAMA PRODUK].

Produk ini sudah saya gunakan selama [DURASI] dan saya akan berbagi pengalaman saya secara jujur.

Kita akan bahas mulai dari unboxing, fitur-fitur utama, kelebihan dan kekurangan, serta apakah produk ini worth it atau tidak.

Jadi pastikan kalian tonton sampai selesai ya!`,

            tutorial: `Selamat datang di tutorial [NAMA TUTORIAL]!

Di video ini, saya akan mengajarkan kalian step by step bagaimana cara [DESKRIPSI TUTORIAL].

Tutorial ini cocok untuk pemula dan saya akan jelaskan dengan detail dan mudah dipahami.

Yang kalian butuhkan untuk mengikuti tutorial ini adalah [REQUIREMENTS].

Mari kita mulai dengan langkah pertama...`
        };
    }

    updateDisplay() {
        const text = this.scriptInput.value;
        this.textElement.textContent = text;
    }

    play() {
        if (!this.isPlaying) {
            this.isPlaying = true;
            this.startScrolling();
            this.updateStatus('playing', '▶️ Sedang berjalan');
        }
    }

    pause() {
        this.isPlaying = false;
        this.stopScrolling();
        this.updateStatus('paused', '⏸️ Dijeda');
    }

    stop() {
        this.isPlaying = false;
        this.stopScrolling();
        // ❌ Jangan reset posisi
        // ❌ Jangan set transform lagi
        this.updateStatus('stopped', '⏹️ Siap untuk mulai');
    }

    reset() {
        this.stop();
        this.scriptInput.value = this.presets.intro;
        this.updateDisplayOnly();
        this.resetPosition();
    }

    resetPosition() {
        this.currentPosition = 0;
        this.manualOffsetY = 0;
        // Reset ke posisi awal (atas)
        this.textElement.style.transform = 'translateX(-50%) translateY(0px)';
        this.updateStatus('stopped', '⏹️ Siap untuk mulai');
    }

    updateDisplayOnly() {
        const text = this.scriptInput.value;
        this.textElement.textContent = text;
    }

    startScrolling() {
        this.scrollInterval = setInterval(() => {
            if (this.isPlaying) {
                this.currentPosition += this.scrollSpeed * 0.5;
                // Gabungkan manual offset dengan auto scroll
                const totalOffset = this.manualOffsetY + this.currentPosition;
                this.textElement.style.transform = `translateX(-50%) translateY(-${totalOffset}px)`;

                // Auto stop when text is fully scrolled
                const textHeight = this.textElement.scrollHeight;
                const containerHeight = document.getElementById('prompterDisplay').clientHeight;
                const maxScroll = (textHeight - containerHeight) + (containerHeight / 2);

                if (this.currentPosition >= maxScroll) {
                    this.stop();
                }
            }
        }, 50);
    }

    stopScrolling() {
        if (this.scrollInterval) {
            clearInterval(this.scrollInterval);
            this.scrollInterval = null;
        }
    }

    startFromBeginning() {
        // hentikan scrolling lama kalau ada
        this.stopScrolling();
        this.isPlaying = false;

        // reset posisi teks ke atas
        this.currentPosition = 0;
        this.manualOffsetY = 0;
        this.textElement.style.transform = `translateX(-50%) translateY(0px)`;

        // langsung jalankan play lagi
        this.isPlaying = true;
        this.startScrolling();
        this.updateStatus('playing', '▶️ Mulai dari awal');
    }


    changeSpeed(speed) {
        this.scrollSpeed = parseInt(speed);
        document.getElementById('speedDisplay').textContent = speed;
    }

    changeFontSize(size) {
        this.textElement.style.fontSize = size + 'px';
    }

    changeTextColor(color) {
        this.textElement.style.color = color;
    }

    updateStatus(type, message) {
        const statusEl = document.getElementById('statusIndicator');
        statusEl.className = `status ${type}`;
        statusEl.innerHTML = `<span>${message.split(' ')[0]}</span><span>${message.split(' ').slice(1).join(' ')}</span>`;
    }

    togglePanel() {
        const panel = document.getElementById('controlPanel');
        panel.classList.toggle('hidden');
    }

    toggleFullscreen() {
        const display = document.getElementById('prompterDisplay');

        if (!document.fullscreenElement) {
            display.requestFullscreen().then(() => {
                display.classList.add('fullscreen');
                this.changeFontSize(48);
            });
        } else {
            document.exitFullscreen().then(() => {
                display.classList.remove('fullscreen');
                this.changeFontSize(document.getElementById('fontSize').value);
            });
        }
    }

    handleFullscreenChange() {
        const display = document.getElementById('prompterDisplay');
        if (!document.fullscreenElement) {
            display.classList.remove('fullscreen');
            this.changeFontSize(document.getElementById('fontSize').value);
        }
    }

    loadPreset(presetName) {
        if (this.presets[presetName]) {
            this.scriptInput.value = this.presets[presetName];
            this.updateDisplayOnly();
            this.resetPosition();
        }
    }
    handleKeyboard(e) {
        // Only handle shortcuts when not typing in input fields
        if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;

        switch (e.key) {
            case ' ': // Spacebar
                e.preventDefault();
                if (this.isPlaying) {
                    this.pause();
                } else {
                    this.play();
                }
                break;
            case 'Escape':
                this.stop();
                break;
            case 'r':
            case 'R':
                this.reset();
                break;
            case 'f':
            case 'F':
                this.toggleFullscreen();
                break;
            case 'ArrowUp':
                e.preventDefault();
                const currentSpeed = parseInt(document.getElementById('speedControl').value);
                if (currentSpeed < 10) {
                    document.getElementById('speedControl').value = currentSpeed + 1;
                    this.changeSpeed(currentSpeed + 1);
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                const currentSpeedDown = parseInt(document.getElementById('speedControl').value);
                if (currentSpeedDown > 1) {
                    document.getElementById('speedControl').value = currentSpeedDown - 1;
                    this.changeSpeed(currentSpeedDown - 1);
                }
                break;
        }
    }


    startDrag(e) {
        if (this.isPlaying) return; // Tidak bisa drag saat playing

        this.isDragging = true;
        this.dragStartY = e.clientY;
        this.dragStartOffset = this.manualOffsetY;
        this.textElement.classList.add('dragging');
        e.preventDefault();
    }

    drag(e) {
        if (!this.isDragging) return;

        const deltaY = e.clientY - this.dragStartY;
        this.manualOffsetY = this.dragStartOffset + deltaY;

        // Update posisi teks
        this.textElement.style.transform = `translateX(-50%) translateY(${this.manualOffsetY}px)`;
    }

    endDrag() {
        if (this.isDragging) {
            this.isDragging = false;
            this.textElement.classList.remove('dragging');
        }
    }

    moveText(offset) {
        if (this.isPlaying) return; // Tidak bisa move saat playing

        this.manualOffsetY += offset;
        this.textElement.style.transform = `translateX(-50%) translateY(${this.manualOffsetY}px)`;
    }
}

// Initialize the prompter
document.addEventListener('DOMContentLoaded', () => {
    new WebPrompter();
});