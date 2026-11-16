/**
 * AERO™ — O₂ as a Service Application Logic
 * Satirical Luxury Oxygen Subscription
 */

// Global State
let soundEnabled = true;
let audioCtx = null;
let currentBreatheMode = 'free'; // 'free' or 'pro'
let breatheCycleActive = false;
let breatheTimer = null;
let currentPlanSelected = 'plus';
let totalLiters = 1849200;

// Initialize when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  initMoleculesCanvas();
  initOxygenTicker();
  initAudioToggle();
});

/* ===================================================
   1. Floating Oxygen Molecules Canvas
=================================================== */
function initMoleculesCanvas() {
  const canvas = document.getElementById('molecules-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const particleCount = Math.min(Math.floor(width / 35), 45);

  class Molecule {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = (Math.random() - 0.5) * 0.45 - 0.15; // gentle upward drift
      this.radius = Math.random() * 2.5 + 1.5;
      this.alpha = Math.random() * 0.4 + 0.15;
      this.isOxygenPair = Math.random() > 0.4; // O2 pair
    }
    update() {
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < -20) this.x = width + 20;
      if (this.x > width + 20) this.x = -20;
      if (this.y < -20) this.y = height + 20;
      if (this.y > height + 20) this.y = -20;
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 242, 254, ${this.alpha})`;
      ctx.fill();

      // Draw bonded twin atom (O₂)
      if (this.isOxygenPair) {
        const twinX = this.x + 8;
        const twinY = this.y - 4;
        ctx.beginPath();
        ctx.arc(twinX, twinY, this.radius * 0.9, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(16, 185, 129, ${this.alpha * 0.8})`;
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(twinX, twinY);
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.alpha * 0.3})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Molecule());
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }
    requestAnimationFrame(animate);
  }
  animate();
}

/* ===================================================
   2. Audio Synthesizer (Web Audio API)
=================================================== */
function getAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function initAudioToggle() {
  const toggleBtn = document.getElementById('nav-sound-toggle');
  if (!toggleBtn) return;
  toggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    const icon = toggleBtn.querySelector('.sound-icon');
    const label = toggleBtn.querySelector('.sound-label');
    if (soundEnabled) {
      icon.textContent = '🔊';
      label.textContent = 'Áudio Hi-Fi';
      playSound('inhale');
    } else {
      icon.textContent = '🔇';
      label.textContent = 'Mudo';
    }
  });
}

function playSound(type) {
  if (!soundEnabled) return;
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'inhale') {
      // Soft ascending crystalline tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(520, now + 3.2);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 1.5);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 3.5);
    } else if (type === 'exhale') {
      // Warm relaxing descending tone
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 3.2);

      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 3.5);
    } else if (type === 'vip-chime') {
      // Luxury brass / harp chord (Major 7th)
      const freqs = [523.25, 659.25, 783.99, 987.77, 1046.5];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.09, now + idx * 0.08 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 1.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 1.5);
      });
    } else if (type === 'ad-beep') {
      // Sarcastic low buzzer for commercial interruption
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(130, now);
      osc.frequency.setValueAtTime(110, now + 0.15);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.4);
    }
  } catch (err) {
    console.warn('Audio playback error:', err);
  }
}

/* ===================================================
   3. Breathing Simulator
=================================================== */
function setBreatheMode(mode) {
  currentBreatheMode = mode;
  const freeBtn = document.getElementById('mode-free-btn');
  const proBtn = document.getElementById('mode-pro-btn');
  const feedback = document.getElementById('simulator-feedback');

  if (mode === 'free') {
    freeBtn.classList.add('active');
    proBtn.classList.remove('active');
    feedback.innerHTML = `Modo selecionado: <strong>Ar Grátis</strong> (Comerciais obrigatórios e partículas de monóxido).`;
  } else {
    proBtn.classList.add('active');
    freeBtn.classList.remove('active');
    feedback.innerHTML = `Modo selecionado: <strong style="color:var(--cyan-primary)">AERO™ Pro Max</strong> (99.9% de pureza, notas alpinas e zero anúncios).`;
    playSound('vip-chime');
  }

  // If running, reset
  if (breatheCycleActive) {
    stopBreatheCycle();
  }
}

function toggleBreatheCycle() {
  if (breatheCycleActive) {
    stopBreatheCycle();
  } else {
    startBreatheCycle();
  }
}

function startBreatheCycle() {
  breatheCycleActive = true;
  document.getElementById('breathe-btn-icon').textContent = '⏹';
  document.getElementById('breathe-btn-label').textContent = 'Parar Simulação';

  runBreatheStep();
}

function stopBreatheCycle() {
  breatheCycleActive = false;
  clearTimeout(breatheTimer);
  document.getElementById('breathe-btn-icon').textContent = '▶';
  document.getElementById('breathe-btn-label').textContent = 'Iniciar Ciclo de Respiração';

  const orb = document.querySelector('.orb-container');
  orb.className = 'orb-container';
  document.getElementById('orb-text').textContent = 'Pronto';
  document.getElementById('orb-subtext').textContent = 'Clique para Iniciar';

  const adOverlay = document.getElementById('ad-overlay');
  adOverlay.classList.add('hidden');
}

function runBreatheStep() {
  if (!breatheCycleActive) return;

  const orb = document.querySelector('.orb-container');
  const orbText = document.getElementById('orb-text');
  const orbSubtext = document.getElementById('orb-subtext');

  // Step 1: Inhale (4s)
  orb.className = 'orb-container inhaling';
  orbText.textContent = currentBreatheMode === 'pro' ? 'Inalação Hi-Fi' : 'Inspirando Ar Comum';
  orbSubtext.textContent = 'Encha os pulmões lentamente...';
  playSound('inhale');

  // Free mode penalty: Ad interrupt after 2.5s on free mode
  if (currentBreatheMode === 'free') {
    breatheTimer = setTimeout(() => {
      triggerFreeModeAd();
    }, 2800);
    return;
  }

  // Pro mode: Smooth continuous flow
  breatheTimer = setTimeout(() => {
    if (!breatheCycleActive) return;

    // Step 2: Hold (3s)
    orb.className = 'orb-container holding';
    orbText.textContent = 'Retenção VIP';
    orbSubtext.textContent = 'Absorvendo notas de pinheiro alpino...';

    breatheTimer = setTimeout(() => {
      if (!breatheCycleActive) return;

      // Step 3: Exhale (4s)
      orb.className = 'orb-container exhaling';
      orbText.textContent = 'Expiração Elegante';
      orbSubtext.textContent = 'Liberando CO₂ com efeito névoa suave...';
      playSound('exhale');

      breatheTimer = setTimeout(() => {
        if (!breatheCycleActive) return;
        runBreatheStep(); // Repeat loop
      }, 3800);
    }, 3000);
  }, 4000);
}

function triggerFreeModeAd() {
  playSound('ad-beep');
  const adOverlay = document.getElementById('ad-overlay');
  const countdownEl = document.getElementById('ad-countdown');
  adOverlay.classList.remove('hidden');

  let timeLeft = 4;
  countdownEl.textContent = timeLeft;

  const interval = setInterval(() => {
    timeLeft--;
    countdownEl.textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(interval);
      adOverlay.classList.add('hidden');
      if (breatheCycleActive) {
        // Exhale hurriedly
        const orb = document.querySelector('.orb-container');
        orb.className = 'orb-container exhaling';
        document.getElementById('orb-text').textContent = 'Expiração Apagada';
        document.getElementById('orb-subtext').textContent = 'Você tossiu devido à fuligem.';
        playSound('exhale');

        breatheTimer = setTimeout(() => {
          if (breatheCycleActive) runBreatheStep();
        }, 3000);
      }
    }
  }, 1000);
}

/* ===================================================
   4. Diagnostic Scan
=================================================== */
function runDiagnosticScan() {
  const city = document.getElementById('diag-city').value || 'Sua Cidade';
  const age = document.getElementById('diag-age').value || 25;
  const symptomSelect = document.getElementById('diag-symptom');
  const symptomText = symptomSelect.options[symptomSelect.selectedIndex].text;

  const btnText = document.getElementById('scan-btn-text');
  const resultsCard = document.getElementById('diagnostic-results');

  btnText.textContent = 'Calibrando espectrômetro pulmonar...';
  playSound('inhale');

  setTimeout(() => {
    btnText.textContent = 'Analisando resíduos de fuligem e bocejos...';
  }, 900);

  setTimeout(() => {
    btnText.textContent = 'Escanear Meus Pulmões Agora';
    resultsCard.classList.remove('hidden');
    playSound('vip-chime');

    // Dynamic sarcastic calculations
    const fakePurity = (Math.random() * 20 + 28).toFixed(1);
    document.getElementById('res-purity').textContent = `${fakePurity}% (Altamente Degradado)`;
    document.getElementById('res-pollution').textContent = `Nível Crítico em ${city} (${age} anos respirando sem plano)`;
    
    document.getElementById('res-verdict').textContent = 
      `"Diagnóstico: Devido a '${symptomText}', você inalou aproximadamente 3 quilos de poeira e arrependimento. Seus pulmões clamam por uma assinatura de O₂ com DRM antes que o próximo bocejo trave seu sistema operacional."`;

    // Smooth scroll to results
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 1900);
}

/* ===================================================
   5. Checkout & Activation Flow
=================================================== */
function openCheckout(plan) {
  currentPlanSelected = plan;
  const modal = document.getElementById('checkout-modal');
  const badge = document.getElementById('modal-plan-badge');
  const price = document.getElementById('modal-total-price');

  document.getElementById('modal-step-form').classList.remove('hidden');
  document.getElementById('modal-step-success').classList.add('hidden');

  if (plan === 'free') {
    badge.textContent = 'PLANO AR COMUM (PLEBE)';
    price.textContent = 'R$ 0,00/mês (Com Anúncios)';
  } else if (plan === 'ultra') {
    badge.textContent = 'PLANO ATMO PRO MAX ULTRA 💎';
    price.textContent = 'R$ 499,90/mês';
  } else {
    badge.textContent = 'PLANO AERO™ PLUS 🔥';
    price.textContent = 'R$ 89,90/mês';
  }

  modal.classList.remove('hidden');
}

function closeCheckout() {
  document.getElementById('checkout-modal').classList.add('hidden');
}

function handleCheckoutSubmit(e) {
  e.preventDefault();
  const name = document.getElementById('user-name').value || 'Assinante Ilustre';
  const flavorSelect = document.getElementById('flavor-choice');
  const flavorName = flavorSelect.options[flavorSelect.selectedIndex].text;

  // Switch to success certificate
  document.getElementById('modal-step-form').classList.add('hidden');
  const successStep = document.getElementById('modal-step-success');
  successStep.classList.remove('hidden');

  document.getElementById('cert-title').textContent = `Parabéns, ${name}!`;
  document.getElementById('cert-name').textContent = name;
  document.getElementById('cert-flavor').textContent = flavorName;
  document.getElementById('cert-code').textContent = `O2-${Math.floor(10000 + Math.random() * 90000)}-VIP`;

  playSound('vip-chime');
}

function celebrateInhale() {
  closeCheckout();
  // Switch simulator directly to Pro mode and launch it
  setBreatheMode('pro');
  scrollToSection('simulator');
  setTimeout(() => {
    startBreatheCycle();
  }, 600);
}

/* ===================================================
   6. Utilities & Tickers
=================================================== */
function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' });
  }
}

function initOxygenTicker() {
  const counterEl = document.getElementById('counter-liters');
  if (!counterEl) return;

  setInterval(() => {
    totalLiters += Math.floor(Math.random() * 12) + 4;
    counterEl.textContent = totalLiters.toLocaleString('pt-BR') + ' L';
  }, 2200);
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
  const modal = document.getElementById('checkout-modal');
  if (e.target === modal) {
    closeCheckout();
  }
});
