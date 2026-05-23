const STOP_WORDS = new Set([
    'the', 'and', 'of', 'to', 'a', 'in', 'for', 'is', 'on', 'that',
    'by', 'this', 'with', 'i', 'you', 'it', 'or', 'are', 'be', 'as',
    'at', 'an', 'but', 'not', 'was', 'have', 'from', 'we', 'they',
    'he', 'she', 'what', 'which', 'who', 'when', 'where', 'why',
    'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
    'other', 'some', 'such', 'no', 'nor', 'only', 'own', 'same',
    'so', 'than', 'too', 'very', 'can', 'will', 'just', 'should',
    'now', 'been', 'being', 'has', 'had', 'having', 'do', 'does',
    'did', 'doing', 'would', 'could', 'ought', 'shall', 'may', 'might',
    'must', 'am', 'about', 'also', 'up', 'down', 'out', 'over', 'under',
    'again', 'further', 'then', 'once', 'here', 'there', 'any', 'into'
]);

function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
}

function updateThemeIcon(theme) {
    const toggleBtn = document.querySelector('.theme-toggle');
    if (toggleBtn) {
        toggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

function countWords(text) {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    return trimmed.split(/\s+/).filter(word => word.length > 0).length;
}

function countCharacters(text, includeSpaces = true) {
    if (includeSpaces) {
        return text.length;
    }
    return text.replace(/\s/g, '').length;
}

function countSentences(text) {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    const sentences = trimmed.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.length;
}

function countParagraphs(text) {
    const trimmed = text.trim();
    if (!trimmed) return 0;
    const paragraphs = trimmed.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    return paragraphs.length || (trimmed.length > 0 ? 1 : 0);
}

function calculateReadingTime(wordCount) {
    const wordsPerMinute = 200;
    const minutes = wordCount / wordsPerMinute;
    if (minutes < 1) {
        const seconds = Math.ceil(minutes * 60);
        return `${seconds} sec`;
    }
    return `${Math.ceil(minutes)} min`;
}

function extractKeywords(text, minChars = 3) {
    const cleaned = text.toLowerCase().replace(/[^\w\s]/g, '');
    const words = cleaned.split(/\s+/).filter(word => 
        word.length >= minChars && !STOP_WORDS.has(word)
    );
    
    const frequency = {};
    words.forEach(word => {
        frequency[word] = (frequency[word] || 0) + 1;
    });
    
    const totalWords = words.length;
    const keywords = Object.entries(frequency)
        .map(([word, count]) => ({
            word,
            count,
            density: totalWords > 0 ? ((count / totalWords) * 100).toFixed(2) : 0
        }))
        .sort((a, b) => b.count - a.count);
    
    return keywords;
}

function getTopKeywords(text, limit = 10) {
    return extractKeywords(text).slice(0, limit);
}

function copyToClipboard(text) {
    return navigator.clipboard.writeText(text).then(() => {
        return true;
    }).catch(() => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        } catch (e) {
            document.body.removeChild(textarea);
            return false;
        }
    });
}

function showCopyFeedback(button, success = true) {
    const originalText = button.textContent;
    button.textContent = success ? '✓ Copied!' : 'Failed';
    button.disabled = true;
    setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
    }, 1500);
}

function getCharacterBreakdown(text) {
    const letters = (text.match(/[a-zA-Z]/g) || []).length;
    const numbers = (text.match(/[0-9]/g) || []).length;
    const spaces = (text.match(/\s/g) || []).length;
    const punctuation = (text.match(/[.,!?;:'"()\[\]{}\-–—]/g) || []).length;
    const special = text.length - letters - numbers - spaces - punctuation;
    
    return { letters, numbers, spaces, punctuation, special };
}

function getSocialWarnings(charCount) {
    return {
        twitter: {
            limit: 280,
            current: charCount,
            status: charCount <= 280 ? 'ok' : 'error',
            message: charCount <= 280 ? `${280 - charCount} chars remaining` : `${charCount - 280} chars over`
        },
        linkedin: {
            limit: 210,
            current: charCount,
            status: charCount <= 210 ? 'ok' : 'error',
            message: charCount <= 210 ? `${210 - charCount} chars remaining` : `${charCount - 210} chars over`
        }
    };
}

const SAMPLE_TEXT = `The quick brown fox jumps over the lazy dog. This sample text demonstrates the word counter functionality. 

You can analyze your text to see word count, character count, sentence count, and keyword density. The tool processes everything locally in your browser for complete privacy.

Try pasting your own content to see detailed statistics and keyword analysis!`;

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const nav = document.querySelector('nav');
    
    if (mobileMenuBtn && nav) {
        mobileMenuBtn.addEventListener('click', () => {
            nav.classList.toggle('active');
            mobileMenuBtn.textContent = nav.classList.contains('active') ? '✕' : '☰';
        });
    }

    document.addEventListener('click', (e) => {
        if (nav && !nav.contains(e.target) && !mobileMenuBtn?.contains(e.target)) {
            nav.classList.remove('active');
            if (mobileMenuBtn) {
                mobileMenuBtn.textContent = '☰';
            }
        }
    });

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (nav) {
                nav.classList.remove('active');
            }
            if (mobileMenuBtn) {
                mobileMenuBtn.textContent = '☰';
            }
        });
    });

    const textInput = document.getElementById('textInput');
    const sampleBtn = document.getElementById('sampleBtn');
    const clearBtn = document.getElementById('clearBtn');
    const copyBtn = document.getElementById('copyBtn');

    if (sampleBtn && textInput && !sampleBtn.dataset.bound) {
        sampleBtn.dataset.bound = 'true';
        sampleBtn.addEventListener('click', () => {
            textInput.value = SAMPLE_TEXT;
            textInput.dispatchEvent(new Event('input'));
        });
    }

    if (clearBtn && textInput && !clearBtn.dataset.bound) {
        clearBtn.dataset.bound = 'true';
        clearBtn.addEventListener('click', () => {
            textInput.value = '';
            textInput.dispatchEvent(new Event('input'));
        });
    }

    if (copyBtn && textInput && !copyBtn.dataset.bound) {
        copyBtn.dataset.bound = 'true';
        copyBtn.addEventListener('click', async () => {
            const success = await copyToClipboard(textInput.value);
            showCopyFeedback(copyBtn, success);
        });
    }
});
