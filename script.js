// Ultra-smooth Custom cursor functionality
class SmoothCursor {
    constructor() {
        this.cursor = document.querySelector('.cursor');
        this.mouseX = 0;
        this.mouseY = 0;
        this.cursorX = 0;
        this.cursorY = 0;

        if (!this.cursor) return;
        this.init();
    }

    init() {
        this.cursor.style.opacity = '1';
        this.updateCursor();
        this.bindEvents();
    }

    bindEvents() {
        let ticking = false;
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;

            if (!ticking) {
                requestAnimationFrame(() => {
                    ticking = false;
                });
                ticking = true;
            }
        });

        document.addEventListener('mouseover', (e) => {
            if (this.isClickableElement(e.target)) {
                this.cursor.classList.add('hover');
            }
        });

        document.addEventListener('mouseout', (e) => {
            this.cursor.classList.remove('hover');
        });

        document.addEventListener('mousedown', () => {
            this.cursor.classList.add('click');
        });

        document.addEventListener('mouseup', () => {
            this.cursor.classList.remove('click');
        });
    }

    isClickableElement(element) {
        let current = element;
        while (current && current !== document.body) {
            if (
                current.classList.contains('clickable') ||
                ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT'].includes(current.tagName) ||
                current.classList.contains('news-card') ||
                current.classList.contains('country-card')
            ) {
                return true;
            }
            current = current.parentElement;
        }
        return false;
    }

    updateCursor() {
        if (!this.cursor) return;
        const ease = 0.25;
        this.cursorX += (this.mouseX - this.cursorX) * ease;
        this.cursorY += (this.mouseY - this.cursorY) * ease;
        this.cursor.style.transform = `translate3d(${this.cursorX}px, ${this.cursorY}px, 0)`;
        requestAnimationFrame(() => this.updateCursor());
    }
}

const smoothCursor = new SmoothCursor();

// Text-to-Speech
class NewsVoiceReader {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.voices = [];
        this.currentUtterance = null;
        this.currentSpeakingCard = null;
        this.isSupported = 'speechSynthesis' in window;

        this.loadVoices();
        if (this.synthesis.onvoiceschanged !== undefined) {
            this.synthesis.onvoiceschanged = () => this.loadVoices();
        }
    }

    loadVoices() {
        this.voices = this.synthesis.getVoices();
    }

    speak(text, cardElement) {
        if (!this.isSupported) return alert('Text-to-speech not supported');

        this.stop();

        const utterance = new SpeechSynthesisUtterance(text);
        this.currentSpeakingCard = cardElement;

        utterance.rate = 0.8;
        utterance.pitch = 1;

        const voice = this.voices.find(v => v.lang.includes('en') && v.name.includes('Google')) ||
                      this.voices.find(v => v.lang.includes('en'));
        if (voice) utterance.voice = voice;

        utterance.onend = () => this.updateSpeakButton(cardElement, 'idle');
        utterance.onerror = () => this.updateSpeakButton(cardElement, 'idle');

        this.updateSpeakButton(cardElement, 'speaking');
        this.synthesis.speak(utterance);
        this.currentUtterance = utterance;
    }

    stop() {
        if (this.synthesis.speaking) this.synthesis.cancel();
        if (this.currentSpeakingCard) {
            this.updateSpeakButton(this.currentSpeakingCard, 'idle');
            this.currentSpeakingCard = null;
        }
    }

    pause() {
        if (this.synthesis.speaking && !this.synthesis.paused) {
            this.synthesis.pause();
            if (this.currentSpeakingCard) this.updateSpeakButton(this.currentSpeakingCard, 'paused');
        }
    }

    resume() {
        if (this.synthesis.paused) {
            this.synthesis.resume();
            if (this.currentSpeakingCard) this.updateSpeakButton(this.currentSpeakingCard, 'speaking');
        }
    }

    updateSpeakButton(card, state) {
        const speakBtn = card.querySelector('.speak-btn');
        const pauseBtn = card.querySelector('.pause-btn');
        const stopBtn = card.querySelector('.stop-btn');

        if (!speakBtn) return;

        if (state === 'speaking') {
            speakBtn.textContent = '🔊 Speaking...';
            speakBtn.disabled = true;
            pauseBtn.style.display = 'inline-block';
            stopBtn.style.display = 'inline-block';
        } else if (state === 'paused') {
            speakBtn.textContent = '▶️ Resume';
            speakBtn.disabled = false;
            pauseBtn.style.display = 'none';
            stopBtn.style.display = 'inline-block';
        } else {
            speakBtn.textContent = '🔊 Listen';
            speakBtn.disabled = false;
            pauseBtn.style.display = 'none';
            stopBtn.style.display = 'none';
        }
    }
}

const voiceReader = new NewsVoiceReader();

function speakHeadline(button) {
    const card = button.closest('.news-card');
    const title = card.querySelector('h3 a')?.textContent;
    const source = card.querySelector('.source')?.textContent.replace(' 🔗', '');
    const fullText = `Breaking news from ${source}: ${title}`;
    if (voiceReader.synthesis.paused) {
        voiceReader.resume();
    } else {
        voiceReader.speak(fullText, card);
    }
}

function pauseHeadline() {
    voiceReader.pause();
}

function stopHeadline() {
    voiceReader.stop();
}

const mockNews = [
    {
        title: "AI Revolution: Tech Companies Report 30% Efficiency Gains",
        source: "TechCrunch",
        country: "🇺🇸 USA",
        sentiment: "😊 Optimistic",
        url: "https://techcrunch.com"
    },
    {
        title: "Workers Fear Job Displacement as AI Adoption Accelerates",
        source: "The Guardian",
        country: "🇬🇧 UK",
        sentiment: "😰 Concerned",
        url: "https://www.theguardian.com"
    },
    {
        title: "India's IT Sector Adapts to AI: Reskilling Programs Launch",
        source: "Economic Times",
        country: "🇮🇳 India",
        sentiment: "🤔 Analytical",
        url: "https://economictimes.indiatimes.com"
    }
];

function renderNews() {
    const newsGrid = document.getElementById('newsGrid');
    newsGrid.innerHTML = '';
    mockNews.forEach(news => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.innerHTML = `
            <div class="news-meta">
                <a href="${news.url}" target="_blank" rel="noopener noreferrer" class="news-source-link clickable">
                    <span class="source">${news.source} 🔗</span>
                </a>
                <span class="sentiment">
                    <span class="sentiment-emoji">${news.sentiment.split(' ')[0]}</span>
                    <span>${news.sentiment.split(' ')[1]}</span>
                </span>
            </div>
            <h3>
                <a href="${news.url}" target="_blank" rel="noopener noreferrer" class="news-title-link clickable">
                    ${news.title}
                </a>
            </h3>
            <div class="voice-controls">
                <button class="speak-btn clickable" onclick="speakHeadline(this)">🔊 Listen</button>
                <button class="pause-btn clickable" onclick="pauseHeadline(this)" style="display:none;">⏸️ Pause</button>
                <button class="stop-btn clickable" onclick="stopHeadline(this)" style="display:none;">⏹️ Stop</button>
            </div>
            <button class="neutral-btn clickable" onclick="rewriteNeutral(this)">🔄 Rewrite in Neutral Tone</button>
        `;
        newsGrid.appendChild(card);
    });
}

function rewriteNeutral(button) {
    const neutralRewrites = [
        "Study Shows AI Implementation Affects Employment Patterns",
        "Research Indicates Mixed Results from AI Workplace Integration",
        "Analysis Reveals AI's Impact on Labor Market Dynamics",
        "Report Examines AI Technology's Role in Workforce Changes",
        "Survey Documents AI Adoption Effects on Employment"
    ];
    const newsCard = button.closest('.news-card');
    const titleElement = newsCard.querySelector('h3 a');
    if (titleElement) {
        titleElement.textContent = neutralRewrites[Math.floor(Math.random() * neutralRewrites.length)];
        button.textContent = "✅ Neutralized";
        button.disabled = true;
    }
}

window.onload = () => {
    renderNews();
};
