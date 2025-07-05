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
        // Make cursor visible immediately
        this.cursor.style.opacity = '1';
        this.updateCursor();
        this.bindEvents();
    }
    
    bindEvents() {
        // Track mouse position with throttling for better performance
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
        
        // Handle hover effects with better event delegation
        document.addEventListener('mouseover', (e) => {
            if (this.isClickableElement(e.target)) {
                this.cursor.classList.add('hover');
            }
        });
        
        document.addEventListener('mouseout', (e) => {
            this.cursor.classList.remove('hover');
        });
        
        // Handle click effects
        document.addEventListener('mousedown', () => {
            this.cursor.classList.add('click');
        });
        
        document.addEventListener('mouseup', () => {
            this.cursor.classList.remove('click');
        });
    }
    
    isClickableElement(element) {
        // Check the element and its parent elements
        let current = element;
        while (current && current !== document.body) {
            if (
                current.classList.contains('clickable') ||
                current.tagName === 'BUTTON' ||
                current.tagName === 'A' ||
                current.tagName === 'INPUT' ||
                current.tagName === 'TEXTAREA' ||
                current.tagName === 'SELECT' ||
                current.classList.contains('news-card') ||
                current.classList.contains('country-card') ||
                current.classList.contains('speak-btn') ||
                current.classList.contains('pause-btn') ||
                current.classList.contains('stop-btn') ||
                current.classList.contains('neutral-btn') ||
                current.classList.contains('update-topic-btn') ||
                current.classList.contains('submit-btn') ||
                current.classList.contains('news-source-link')
            ) {
                return true;
            }
            current = current.parentElement;
        }
        return false;
    }
    
    updateCursor() {
        if (!this.cursor) return;
        
        // Much faster and smoother interpolation
        const ease = 0.25; // Increased for more responsiveness
        
        this.cursorX += (this.mouseX - this.cursorX) * ease;
        this.cursorY += (this.mouseY - this.cursorY) * ease;
        
        // Use transform with translate3d for hardware acceleration
        this.cursor.style.transform = `translate3d(${this.cursorX}px, ${this.cursorY}px, 0)`;
        
        // Continue animation
        requestAnimationFrame(() => this.updateCursor());
    }
}

// Initialize smooth cursor
const smoothCursor = new SmoothCursor();

// Text-to-Speech functionality
class NewsVoiceReader {
    constructor() {
        this.synthesis = window.speechSynthesis;
        this.currentUtterance = null;
        this.isSupported = 'speechSynthesis' in window;
        this.voices = [];
        this.currentSpeakingCard = null;
        
        // Load voices when they're available
        this.loadVoices();
        if (this.synthesis.onvoiceschanged !== undefined) {
            this.synthesis.onvoiceschanged = () => this.loadVoices();
        }
    }

    loadVoices() {
        this.voices = this.synthesis.getVoices();
    }

    speak(text, cardElement) {
        if (!this.isSupported) {
            alert('Text-to-speech is not supported in your browser.');
            return;
        }

        // Stop any current speech
        this.stop();

        // Create new utterance
        this.currentUtterance = new SpeechSynthesisUtterance(text);
        this.currentSpeakingCard = cardElement;

        // Set voice properties
        this.currentUtterance.rate = 0.8; // Slightly slower for clarity
        this.currentUtterance.pitch = 1;
        this.currentUtterance.volume = 1;

        // Try to use a clear English voice
        const englishVoice = this.voices.find(voice => 
            voice.lang.includes('en') && voice.name.includes('Google')
        ) || this.voices.find(voice => voice.lang.includes('en'));
        
        if (englishVoice) {
            this.currentUtterance.voice = englishVoice;
        }

        // Update button states
        this.updateSpeakButton(cardElement, 'speaking');

        // Event listeners
        this.currentUtterance.onend = () => {
            this.updateSpeakButton(cardElement, 'idle');
            this.currentSpeakingCard = null;
        };

        this.currentUtterance.onerror = (event) => {
            console.error('Speech synthesis error:', event);
            this.updateSpeakButton(cardElement, 'idle');
            this.currentSpeakingCard = null;
        };

        // Start speaking
        this.synthesis.speak(this.currentUtterance);
    }

    stop() {
        if (this.synthesis.speaking) {
            this.synthesis.cancel();
        }
        if (this.currentSpeakingCard) {
            this.updateSpeakButton(this.currentSpeakingCard, 'idle');
            this.currentSpeakingCard = null;
        }
    }

    pause() {
        if (this.synthesis.speaking && !this.synthesis.paused) {
            this.synthesis.pause();
            if (this.currentSpeakingCard) {
                this.updateSpeakButton(this.currentSpeakingCard, 'paused');
            }
        }
    }

    resume() {
        if (this.synthesis.paused) {
            this.synthesis.resume();
            if (this.currentSpeakingCard) {
                this.updateSpeakButton(this.currentSpeakingCard, 'speaking');
            }
        }
    }

    updateSpeakButton(cardElement, state) {
        const speakBtn = cardElement.querySelector('.speak-btn');
        const pauseBtn = cardElement.querySelector('.pause-btn');
        const stopBtn = cardElement.querySelector('.stop-btn');

        if (!speakBtn) return;

        switch (state) {
            case 'speaking':
                speakBtn.textContent = '🔊 Speaking...';
                speakBtn.disabled = true;
                pauseBtn.style.display = 'inline-block';
                stopBtn.style.display = 'inline-block';
                break;
            case 'paused':
                speakBtn.textContent = '▶️ Resume';
                speakBtn.disabled = false;
                pauseBtn.style.display = 'none';
                stopBtn.style.display = 'inline-block';
                break;
            case 'idle':
            default:
                speakBtn.textContent = '🔊 Listen';
                speakBtn.disabled = false;
                pauseBtn.style.display = 'none';
                stopBtn.style.display = 'none';
                break;
        }
    }
}

// Initialize voice reader
const voiceReader = new NewsVoiceReader();

// Enhanced voice control functions with better error handling
function speakHeadline(button) {
    try {
        const newsCard = button.closest('.news-card');
        if (!newsCard) return;
        
        const headlineElement = newsCard.querySelector('h3');
        const sourceElement = newsCard.querySelector('.source');
        
        if (!headlineElement || !sourceElement) return;
        
        const headline = headlineElement.textContent;
        const source = sourceElement.textContent.replace(' 🔗', ''); // Remove link icon
        
        // Create full text to speak
        const fullText = `Breaking news from ${source}: ${headline}`;
        
        if (voiceReader.synthesis.paused) {
            voiceReader.resume();
        } else {
            voiceReader.speak(fullText, newsCard);
        }
    } catch (error) {
        console.error('Error in speakHeadline:', error);
        alert('Unable to play audio. Please try again.');
    }
}

function pauseHeadline(button) {
    try {
        voiceReader.pause();
    } catch (error) {
        console.error('Error in pauseHeadline:', error);
    }
}

function stopHeadline(button) {
    try {
        voiceReader.stop();
    } catch (error) {
        console.error('Error in stopHeadline:', error);
    }
}

// Mock news data with working links
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
    },
    {
        title: "Japan Embraces AI Workforce: Robots and Humans Collaborate",
        source: "Nikkei Asia",
        country: "🇯🇵 Japan",
        sentiment: "😊 Positive",
        url: "https://asia.nikkei.com"
    },
    {
        title: "Brazilian Workers Protest AI Implementation in Manufacturing",
        source: "Folha de S.Paulo",
        country: "🇧🇷 Brazil",
        sentiment: "😤 Frustrated",
        url: "https://www.folha.uol.com.br"
    }
];

// Global voices
const globalVoices = [
    {
        flag: "🇺🇸",
        country: "United States",
        tone: "Optimistic",
        opinion: "AI is the future! It's creating new opportunities faster than it's eliminating old ones. We need to embrace innovation.",
        sentiment: "😊"
    },
    {
        flag: "🇮🇳",
        country: "India",
        tone: "Adaptive",
        opinion: "We're focusing on reskilling our workforce. AI is a tool that will help us compete globally if we use it wisely.",
        sentiment: "🤔"
    },
    {
        flag: "🇯🇵",
        country: "Japan",
        tone: "Pragmatic",
        opinion: "With our aging population, AI helpers are essential. Robots have always been part of our vision for the future.",
        sentiment: "😊"
    },
    {
        flag: "🇬🇧",
        country: "United Kingdom",
        tone: "Cautious",
        opinion: "We need proper regulations and safety nets. The benefits of AI shouldn't come at the cost of worker security.",
        sentiment: "😰"
    },
    {
        flag: "🇧🇷",
        country: "Brazil",
        tone: "Resistant",
        opinion: "AI benefits only the wealthy. We need policies that protect workers and ensure fair distribution of AI's advantages.",
        sentiment: "😤"
    },
    {
        flag: "🇫🇷",
        country: "France",
        tone: "Reflective",
        opinion: "We're exploring AI for healthcare and education but remain cautious about mass automation.",
        sentiment: "😐"
    },
    {
        flag: "🇨🇦",
        country: "Canada",
        tone: "Balanced",
        opinion: "AI adoption should be inclusive and regulated, with attention to privacy and mental health impacts.",
        sentiment: "🙂"
    },
    {
        flag: "🇸🇬",
        country: "Singapore",
        tone: "Forward-Thinking",
        opinion: "We're investing in AI education and governance. AI is central to our vision of a smart, efficient society.",
        sentiment: "🚀"
    }
];

// User-submitted opinions
let userSubmissions = [];

// Render news cards with voice controls and working links
function renderNews() {
    const newsGrid = document.getElementById('newsGrid');
    newsGrid.innerHTML = '';

    mockNews.forEach(news => {
        const newsCard = document.createElement('div');
        newsCard.className = 'news-card';
        newsCard.innerHTML = `
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
                <button class="speak-btn clickable" onclick="speakHeadline(this)" type="button">
                    🔊 Listen
                </button>
                <button class="pause-btn clickable" onclick="pauseHeadline(this)" type="button" style="display: none;">
                    ⏸️ Pause
                </button>
                <button class="stop-btn clickable" onclick="stopHeadline(this)" type="button" style="display: none;">
                    ⏹️ Stop
                </button>
            </div>
            <button class="neutral-btn clickable" onclick="rewriteNeutral(this)" type="button">
                🔄 Rewrite in Neutral Tone
            </button>
        `;
        newsGrid.appendChild(newsCard);
    });
}

// Render Global Voices section
function renderGlobalVoices() {
    const globalVoicesContainer = document.getElementById('globalVoices');
    globalVoicesContainer.innerHTML = '';

    globalVoices.forEach(voice => {
        const countryCard = document.createElement('div');
        countryCard.className = 'country-card';
        countryCard.innerHTML = `
            <div class="country-flag">${voice.flag}</div>
            <div class="country-name">${voice.country}</div>
            <div class="country-tone">${voice.tone}</div>
            <div class="country-opinion">"${voice.opinion}"</div>
            <div class="sentiment-emoji">${voice.sentiment}</div>
        `;
        globalVoicesContainer.appendChild(countryCard);
    });

    userSubmissions.forEach(submission => {
        const countryCard = document.createElement('div');
        countryCard.className = 'country-card';
        countryCard.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        countryCard.innerHTML = `
            <div class="country-flag">🌍</div>
            <div class="country-name">${submission.country}</div>
            <div class="country-tone">User Voice</div>
            <div class="country-opinion">"${submission.opinion}"</div>
            <div class="sentiment-emoji">${submission.sentiment}</div>
        `;
        globalVoicesContainer.appendChild(countryCard);
    });
}

// Rewrite headline to neutral tone
function rewriteNeutral(button) {
    const neutralRewrites = [
        "Study Shows AI Implementation Affects Employment Patterns",
        "Research Indicates Mixed Results from AI Workplace Integration",
        "Analysis Reveals AI's Impact on Labor Market Dynamics",
        "Report Examines AI Technology's Role in Workforce Changes",
        "Survey Documents AI Adoption Effects on Employment"
    ];

    const randomRewrite = neutralRewrites[Math.floor(Math.random() * neutralRewrites.length)];
    const newsCard = button.closest('.news-card');
    const titleElement = newsCard.querySelector('h3');
    
    titleElement.textContent = randomRewrite;
    button.textContent = "✅ Neutralized";
    button.style.background = "linear-gradient(135deg, #4CAF50, #45a049)";
    button.disabled = true;
}

// Handle topic change
function updateTopic() {
    const newTopic = document.getElementById('topicInput').value.trim();
    if (newTopic !== '') {
        document.getElementById('currentTopic').textContent = `📰 Current Topic: "${newTopic}"`;
        document.getElementById('topicDescription').textContent = `Exploring global perspectives on ${newTopic.toLowerCase()}`;
        updateNewsForTopic(newTopic);
        updateGlobalVoicesForTopic(newTopic);
    }
}

// Update news based on topic
function updateNewsForTopic(topic) {
    const headlines = generateHeadlinesForTopic(topic);
    headlines.forEach((headline, index) => {
        if (mockNews[index]) {
            mockNews[index].title = headline;
        }
    });
    renderNews();
}

function generateHeadlinesForTopic(topic) {
    const headlineTemplates = {
        ai: [
            `${topic}: Tech Companies Report Revolutionary Breakthrough`,
            `Workers Express Concerns About ${topic} Impact on Employment`,
            `${topic} Adoption Accelerates Across Global Markets`,
            `Experts Debate Long-term Effects of ${topic} on Society`,
            `Government Announces New Regulations for ${topic} Development`
        ],
        climate: [
            `${topic}: Scientists Report Unprecedented Changes`,
            `Global Leaders Gather for Emergency ${topic} Summit`,
            `${topic} Activists Demand Immediate Action`,
            `Economic Impact of ${topic} Reaches New Heights`,
            `Technology Offers Hope in Fight Against ${topic}`
        ],
        crypto: [
            `${topic} Market Reaches All-Time High`,
            `Regulators Announce New ${topic} Guidelines`,
            `${topic} Adoption Surges in Developing Nations`,
            `Banks Embrace ${topic} Technology`,
            `${topic} Volatility Raises Investor Concerns`
        ],
        default: [
            `${topic}: Breaking News from Around the World`,
            `Global Impact of ${topic} Continues to Grow`,
            `Experts Analyze ${topic} Trends and Patterns`,
            `${topic} Sparks International Debate`,
            `Future of ${topic} Remains Uncertain`
        ]
    };

    const lowerTopic = topic.toLowerCase();
    if (lowerTopic.includes('ai')) return headlineTemplates.ai;
    if (lowerTopic.includes('climate')) return headlineTemplates.climate;
    if (lowerTopic.includes('crypto')) return headlineTemplates.crypto;
    return headlineTemplates.default;
}

// Update opinions for topic
function updateGlobalVoicesForTopic(topic) {
    const opinions = generateOpinionsForTopic(topic);
    globalVoices.forEach((voice, index) => {
        if (opinions[index]) {
            voice.opinion = opinions[index];
        }
    });
    renderGlobalVoices();
}

function generateOpinionsForTopic(topic) {
    const opinionTemplates = {
        ai: [
            `${topic} represents the future of innovation. We must embrace it while preparing our workforce for new opportunities.`,
            `We need careful regulation of ${topic} to ensure it benefits everyone, not just tech companies.`,
            `${topic} will help us solve complex problems and improve efficiency across all sectors.`,
            `The rapid pace of ${topic} development requires international cooperation and ethical guidelines.`,
            `${topic} should be developed with social responsibility in mind, protecting workers and communities.`
        ],
        climate: [
            `${topic} is the defining challenge of our time. We need immediate action and international cooperation.`,
            `Economic growth and ${topic} action can go hand in hand with proper planning and investment.`,
            `Technology and innovation are key to addressing ${topic} while maintaining quality of life.`,
            `${topic} requires a balanced approach that considers both environmental and economic factors.`,
            `Developing nations need support to address ${topic} without compromising their growth.`
        ],
        crypto: [
            `${topic} represents financial freedom and decentralization. It's the future of money.`,
            `We need strong regulations for ${topic} to prevent fraud and ensure consumer safety.`,
            `${topic} adoption is exciting but volatile — invest wisely and learn the tech.`,
            `Many countries are testing central bank digital currencies as alternatives to ${topic}.`,
            `The global impact of ${topic} is massive, but education and infrastructure are key for inclusion.`
        ],
        default: [
            `People are discussing the implications of ${topic} in various sectors.`,
            `There are mixed opinions globally on how ${topic} should be handled.`,
            `Many believe ${topic} is both an opportunity and a challenge.`,
            `${topic} is making headlines worldwide for its controversial impacts.`,
            `Public sentiment on ${topic} is evolving based on recent events.`
        ]
    };

    const lowerTopic = topic.toLowerCase();
    if (lowerTopic.includes('ai')) return opinionTemplates.ai;
    if (lowerTopic.includes('climate')) return opinionTemplates.climate;
    if (lowerTopic.includes('crypto')) return opinionTemplates.crypto;
    return opinionTemplates.default;
}

// User submission - Fixed form handling
function submitUserOpinion() {
    const country = document.getElementById('countryInput').value.trim();
    const opinion = document.getElementById('opinionInput').value.trim();
    const sentiment = document.getElementById('sentimentInput').value;

    if (country && opinion && sentiment) {
        userSubmissions.push({ country, opinion, sentiment });
        document.getElementById('countryInput').value = '';
        document.getElementById('opinionInput').value = '';
        document.getElementById('sentimentInput').value = '';

        renderGlobalVoices();
        alert('Thanks for sharing your opinion!');
    } else {
        alert('Please fill in all fields!');
    }
}

// Handle form submission
document.addEventListener('DOMContentLoaded', () => {
    const submitForm = document.getElementById('submitForm');
    if (submitForm) {
        submitForm.addEventListener('submit', (e) => {
            e.preventDefault();
            submitUserOpinion();
        });
    }
});

// Trigger topic update on Enter key
document.getElementById('topicInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        updateTopic();
    }
});

// Global voice controls
function stopAllVoices() {
    voiceReader.stop();
}

// Add keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        stopAllVoices();
    }
});

// Initial render
window.onload = () => {
    renderNews();
    renderGlobalVoices();
    
    // Check for speech synthesis support
    if (!voiceReader.isSupported) {
        console.warn('Text-to-speech is not supported in this browser.');
    }
};