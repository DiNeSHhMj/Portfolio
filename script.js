document.addEventListener('DOMContentLoaded', () => {
    
    // Web Audio API context for retro sounds
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let audioCtx;

    function playRetroBlip() {
        if (!audioCtx) {
            audioCtx = new AudioContext();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        // Retro square wave for an 8-bit feel
        osc.type = 'square';
        osc.frequency.setValueAtTime(600, audioCtx.currentTime); // High pitch tick
        osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.03); 
        
        // Volume envelope (very short)
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.03);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start();
        osc.stop(audioCtx.currentTime + 0.03);
    }

    const tabButtons = document.querySelectorAll('.tab-btn');
    const sections = document.querySelectorAll('.section-content');

    // 1. RPG-Style Tab Switching Logic
    const tabAbout = document.querySelector('[data-target="about"]');
    const tabExperience = document.querySelector('[data-target="experience"]');
    const tabContact = document.querySelector('[data-target="contact"]');
    
    let tourState = 0; // 0=Home, 1=About Triggered, 2=Exp Triggered, 3=Contact Triggered

    function promptNextTab(elementId, nextTabElement, targetState) {
        let triggered = false;
        const trigger = () => {
            // Strict sequence check prevents old listeners from firing on reset
            if (!triggered && tourState === targetState - 1) {
                triggered = true;
                tourState = targetState;
                nextTabElement.classList.add('highlight-next');
                playRetroBlip(); // friendly beep when unlocked
            }
        };
        
        // Timer fallback in case they don't/can't scroll
        setTimeout(trigger, 3500);
        
        // Scroll detection
        const scrollBox = document.querySelector(`#${elementId} .rpg-dialogue-box`) || document.querySelector(`#${elementId} .inventory-grid`);
        if(scrollBox) {
            scrollBox.addEventListener('scroll', () => {
                if (scrollBox.scrollTop > 5) trigger();
            });
        }
    }

    // PRESS START Flow!
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
        startBtn.addEventListener('click', () => {
            playRetroBlip();
            startBtn.classList.remove('blinking-text');
            startBtn.style.color = '#555'; // deactivate visual
            
            if (tourState === 0) {
                tourState = 1;
                tabAbout.classList.add('highlight-next');
            }
        });
    }

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Stop the highlight once they click it
            button.classList.remove('highlight-next');
            
            // Remove 'active' class from all buttons and sections
            tabButtons.forEach(btn => btn.classList.remove('active'));
            sections.forEach(sec => sec.classList.remove('active'));

            // Get target ID from clicked tab
            const targetId = button.getAttribute('data-target');

            // Add 'active' class to clicked tab and corresponding section
            button.classList.add('active');
            document.getElementById(targetId).classList.add('active');

            // Play the retro UI blip sound!
            playRetroBlip();
            
            // Loop functionality reset when navigating back to home
            if (targetId === 'home') {
                tourState = 0; // Reset loop
                tabAbout.classList.remove('highlight-next');
                tabExperience.classList.remove('highlight-next');
                tabContact.classList.remove('highlight-next');
                
                const startBtn = document.getElementById('start-btn');
                if (startBtn) {
                    startBtn.classList.add('blinking-text');
                    startBtn.style.color = 'var(--text-secondary)'; // restores visual
                }
            }
            
            // Start the scroll/time listener for the NEXT tab in sequence
            if (targetId === 'about' && tourState === 1) {
                promptNextTab('about', tabExperience, 2);
            } else if (targetId === 'experience' && tourState === 2) {
                promptNextTab('experience', tabContact, 3);
            }
        });
    });

    // 2. Typing Effect for Dialogue Box (Optional Bonus)
    const dialogueLines = document.querySelectorAll('.rpg-dialogue-box p');
    // We could add logic to reveal text letter-by-letter, but showing them all instantly fits a fast RPG start.
});
