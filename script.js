// Custom cursor functionality
const cursor = document.querySelector('.cursor');
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.left = mouseX + 'px';
    cursor.style.top = mouseY + 'px';
});

// Cursor hover effects
document.addEventListener('mouseover', (e) => {
    if (
        e.target.classList.contains('clickable') ||
        e.target.tagName === 'BUTTON' ||
        e.target.tagName === 'A' ||
        e.target.classList.contains('news-card') ||
        e.target.classList.contains('country-card')
    ) {
        cursor.classList.add('hover');
    }
});

document.addEventListener('mouseout', (e) => {
    cursor.classList.remove('hover');
});

// Mock news data
const mockNews = [
    {
        title: "AI Revolution: Tech Companies Report 30% Efficiency Gains",
        source: "TechCrunch US",
        country: "🇺🇸 USA",
        sentiment: "😊 Optimistic",
        url: "#"
    },
    {
        title: "Workers Fear Job Displacement as AI Adoption Accelerates",
        source: "The Guardian UK",
        country: "🇬🇧 UK",
        sentiment: "😰 Concerned",
        url: "#"
    },
    {
        title: "India's IT Sector Adapts to AI: Reskilling Programs Launch",
        source: "Economic Times",
        country: "🇮🇳 India",
        sentiment: "🤔 Analytical",
        url: "#"
    },
    {
        title: "Japan Embraces AI Workforce: Robots and Humans Collaborate",
        source: "Nikkei Asia",
        country: "🇯🇵 Japan",
        sentiment: "😊 Positive",
        url: "#"
    },
    {
        title: "Brazilian Workers Protest AI Implementation in Manufacturing",
        source: "Folha de S.Paulo",
        country: "🇧🇷 Brazil",
        sentiment: "😤 Frustrated",
        url: "#"
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

// Render news cards
function renderNews() {
    const newsGrid = document.getElementById('newsGrid');
    newsGrid.innerHTML = '';

    mockNews.forEach(news => {
        const newsCard = document.createElement('div');
        newsCard.className = 'news-card';
        newsCard.innerHTML = `
            <div class="news-meta">
                <span class="source">${news.source}</span>
                <span class="sentiment">
                    <span class="sentiment-emoji">${news.sentiment.split(' ')[0]}</span>
                    <span>${news.sentiment.split(' ')[1]}</span>
                </span>
            </div>
            <h3>${news.title}</h3>
            <button class="neutral-btn clickable" onclick="rewriteNeutral(this)">
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

    const titleElement = button.previousElementSibling; // ❌ this might be wrong
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
            `${topic} represents financial freedom and decentralization. It’s the future of money.`,
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

// User submission
function submitUserOpinion() {
    const country = document.getElementById('userCountry').value.trim();
    const opinion = document.getElementById('userOpinion').value.trim();
    const sentiment = document.getElementById('userSentiment').value;

    if (country && opinion && sentiment) {
        userSubmissions.push({ country, opinion, sentiment });
        document.getElementById('userCountry').value = '';
        document.getElementById('userOpinion').value = '';
        document.getElementById('userSentiment').value = '😊';

        renderGlobalVoices();
        alert('Thanks for sharing your opinion!');
    } else {
        alert('Please fill in all fields!');
    }
}

// Trigger topic update on Enter key
document.getElementById('topicInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        updateTopic();
    }
});

// Initial render
window.onload = () => {
    renderNews();
    renderGlobalVoices();
};
