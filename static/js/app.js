/**
 * რა? სად? როდის? — Elite AI Team Client Application
 */

(function () {
  'use strict';

  // State
  let soundEnabled = true;
  let audioCtx = null;
  let timerInterval = null;
  let timerSeconds = 60;
  let isDeliberating = false;
  let activeEventSource = null;

  // DOM Elements
  const questionForm = document.getElementById('questionForm');
  const questionInput = document.getElementById('questionInput');
  const submitBtn = document.getElementById('submitBtn');
  const clearBtn = document.getElementById('clearBtn');
  const volchokIcon = document.getElementById('volchokIcon');
  const timerValue = document.getElementById('timerValue');
  const timerBox = document.getElementById('timerBox');
  const deliberationProgress = document.getElementById('deliberationProgress');
  const progressBarFill = document.getElementById('progressBarFill');
  const step1 = document.getElementById('step1');
  const step2 = document.getElementById('step2');
  const step3 = document.getElementById('step3');
  const conn1 = document.getElementById('conn1');
  const conn2 = document.getElementById('conn2');
  const soundToggleBtn = document.getElementById('soundToggleBtn');
  const globalStatusPill = document.getElementById('globalStatusPill');

  // Leader elements
  const leaderStage = document.getElementById('leaderStage');
  const leaderIdleState = document.getElementById('leaderIdleState');
  const leaderThinkingState = document.getElementById('leaderThinkingState');
  const leaderVerdictBox = document.getElementById('leaderVerdictBox');
  const leaderRichText = document.getElementById('leaderRichText');
  const leaderAuditCode = document.getElementById('leaderAuditCode');
  const leaderStatusChip = document.getElementById('leaderStatusChip');
  const leaderStatusText = document.getElementById('leaderStatusText');
  const leaderTiming = document.getElementById('leaderTiming');
  const totalTiming = document.getElementById('totalTiming');
  const copyLeaderBtn = document.getElementById('copyLeaderBtn');
  const speakAnswerBtn = document.getElementById('speakAnswerBtn');
  const askNewBtn = document.getElementById('askNewBtn');

  // Member IDs
  const MEMBER_IDS = ['sporti', 'istorikosi', 'enatmcodne', 'geografi'];

  // Initialize
  document.addEventListener('DOMContentLoaded', () => {
    initSoundSystem();
    initPresets();
    bindEvents();
  });

  /* ==========================================================================
     Web Audio Sound Synthesis (Self-contained, no external files)
     ========================================================================== */
  function getAudioContext() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function initSoundSystem() {
    const saved = localStorage.getItem('rsr_sound_enabled');
    if (saved !== null) {
      soundEnabled = saved === 'true';
    }
    updateSoundButtonUI();

    soundToggleBtn.addEventListener('click', () => {
      soundEnabled = !soundEnabled;
      localStorage.setItem('rsr_sound_enabled', soundEnabled);
      updateSoundButtonUI();
      if (soundEnabled) {
        playGongSound();
      }
    });
  }

  function updateSoundButtonUI() {
    const icon = soundToggleBtn.querySelector('.sound-icon');
    const label = soundToggleBtn.querySelector('.sound-label');
    if (soundEnabled) {
      icon.textContent = '🔊';
      label.textContent = 'ხმა ჩართულია';
      soundToggleBtn.classList.remove('muted');
    } else {
      icon.textContent = '🔇';
      label.textContent = 'ხმა გამორთულია';
      soundToggleBtn.classList.add('muted');
    }
  }

  // Authentic Gong Bell
  function playGongSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(196, now); // G3
      osc1.frequency.exponentialRampToValueAtTime(140, now + 2.5);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(293.66, now); // D4
      osc2.frequency.exponentialRampToValueAtTime(220, now + 2.0);

      gain.gain.setValueAtTime(0.55, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 3.0);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 3.0);
      osc2.stop(now + 3.0);
    } catch (e) {
      console.warn('Audio play failed', e);
    }
  }

  // Clock Tick
  function playTickSound() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.04);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch (e) {}
  }

  // Answer Member Ping
  function playMemberChime() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.25); // E5

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch (e) {}
  }

  // Grand Crystal Owl Final Chime
  function playLeaderVictoryChime() {
    if (!soundEnabled) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;

      const notes = [440, 554.37, 659.25, 880]; // A major arpeggio
      notes.forEach((freq, idx) => {
        const now = ctx.currentTime + idx * 0.12;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + 1.3);
      });
    } catch (e) {}
  }

  /* ==========================================================================
     Countdown Timer
     ========================================================================== */
  function startTimer() {
    clearInterval(timerInterval);
    timerSeconds = 60;
    updateTimerDisplay();

    timerInterval = setInterval(() => {
      timerSeconds--;
      if (timerSeconds <= 0) {
        timerSeconds = 0;
        clearInterval(timerInterval);
      }
      updateTimerDisplay();
      if (timerSeconds > 0 && timerSeconds <= 10) {
        timerBox.classList.add('pulse-danger');
      } else {
        timerBox.classList.remove('pulse-danger');
      }
      playTickSound();
    }, 1000);
  }

  function stopTimer() {
    clearInterval(timerInterval);
    timerBox.classList.remove('pulse-danger');
  }

  function updateTimerDisplay() {
    const mins = Math.floor(timerSeconds / 60);
    const secs = timerSeconds % 60;
    timerValue.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  /* ==========================================================================
     Presets & Bindings
     ========================================================================== */
  function initPresets() {
    const chips = document.querySelectorAll('.preset-chip');
    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        const q = chip.getAttribute('data-question');
        if (q) {
          questionInput.value = q;
          questionInput.focus();
        }
      });
    });
  }

  function bindEvents() {
    questionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleDeliberation();
    });

    clearBtn.addEventListener('click', () => {
      if (isDeliberating) return;
      questionInput.value = '';
      questionInput.focus();
    });

    volchokIcon.addEventListener('click', () => {
      volchokIcon.classList.add('spinning');
      playGongSound();
      setTimeout(() => {
        if (!isDeliberating) {
          volchokIcon.classList.remove('spinning');
        }
      }, 2000);
    });

    askNewBtn.addEventListener('click', () => {
      resetBoard();
      questionInput.value = '';
      questionInput.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    copyLeaderBtn.addEventListener('click', () => {
      copyToClipboard(leaderRichText.innerText, copyLeaderBtn, 'კოპირებულია!');
    });

    // Copy handlers for individual cards
    MEMBER_IDS.forEach((id) => {
      const copyBtn = document.getElementById(`copy-${id}`);
      if (copyBtn) {
        copyBtn.addEventListener('click', () => {
          const textEl = document.getElementById(`text-${id}`);
          if (textEl) {
            copyToClipboard(textEl.innerText, copyBtn, '✓');
          }
        });
      }
    });

    // Text to Speech
    speakAnswerBtn.addEventListener('click', () => {
      speakLeaderAnswer();
    });
  }

  /* ==========================================================================
     Main Deliberation Flow
     ========================================================================== */
  async function handleDeliberation() {
    const question = questionInput.value.trim();
    if (!question || isDeliberating) return;

    isDeliberating = true;
    const startTime = Date.now();

    // Visuals & Sound
    playGongSound();
    volchokIcon.classList.add('spinning');
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-label').textContent = 'ვოლჩოკი ტრიალებს...';

    // Global Status
    setGlobalStatus('thinking', 'განხილვა მიმდინარეობს...');

    // Progress bar start
    deliberationProgress.classList.add('active');
    setStep(1);
    progressBarFill.style.width = '20%';

    // Start 60s Timer
    startTimer();

    // Prepare Member Cards
    MEMBER_IDS.forEach((id) => {
      showMemberThinking(id);
    });

    // Prepare Leader Section
    leaderIdleState.classList.add('hidden');
    leaderThinkingState.classList.remove('hidden');
    leaderVerdictBox.classList.add('hidden');
    leaderStatusChip.className = 'leader-status-chip deliberating';
    leaderStatusText.textContent = 'ელის გუნდის ვერსიებს';

    // Scroll smoothly toward cards
    deliberationProgress.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    // Use SSE Streaming for real-time live member reveals
    const streamUrl = `/api/stream?question=${encodeURIComponent(question)}`;

    try {
      if (window.EventSource) {
        runDeliberationStream(streamUrl, question, startTime);
      } else {
        await runDeliberationRest(question, startTime);
      }
    } catch (err) {
      console.warn('Stream failed, falling back to REST', err);
      await runDeliberationRest(question, startTime);
    }
  }

  function runDeliberationStream(url, question, startTime) {
    if (activeEventSource) {
      activeEventSource.close();
    }

    const es = new EventSource(url);
    activeEventSource = es;

    setStep(2);
    progressBarFill.style.width = '45%';

    es.addEventListener('start', (e) => {
      console.log('Deliberation started');
    });

    es.addEventListener('member', (e) => {
      try {
        const data = JSON.parse(e.data);
        showMemberAnswer(data.id, data.answer, data.elapsed);
        playMemberChime();
      } catch (err) {
        console.error('Member parse err', err);
      }
    });

    es.addEventListener('status', (e) => {
      try {
        const data = JSON.parse(e.data);
        leaderStatusText.textContent = 'აანალიზებს ვერსიებს...';
        setStep(3);
        progressBarFill.style.width = '75%';
      } catch (err) {}
    });

    es.addEventListener('leader', (e) => {
      try {
        const data = JSON.parse(e.data);
        const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);
        showLeaderVerdict(data, totalElapsed);
        playLeaderVictoryChime();
        stopTimer();
      } catch (err) {
        console.error('Leader parse err', err);
      }
    });

    es.addEventListener('done', (e) => {
      es.close();
      activeEventSource = null;
      finishDeliberation();
    });

    es.onerror = (e) => {
      console.warn('SSE encountered an issue, closing', e);
      es.close();
      activeEventSource = null;
      // If leader is not shown yet, fallback to REST
      if (leaderVerdictBox.classList.contains('hidden')) {
        runDeliberationRest(question, startTime);
      } else {
        finishDeliberation();
      }
    };
  }

  async function runDeliberationRest(question, startTime) {
    try {
      setStep(2);
      progressBarFill.style.width = '50%';

      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question })
      });

      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }

      const data = await res.json();

      // Show members
      if (data.members) {
        Object.values(data.members).forEach((m) => {
          showMemberAnswer(m.id, m.answer, m.elapsed);
        });
      }

      setStep(3);
      progressBarFill.style.width = '90%';

      // Show leader
      if (data.leader) {
        showLeaderVerdict(data.leader, data.total_elapsed);
        playLeaderVictoryChime();
      }

      stopTimer();
    } catch (err) {
      console.error('REST deliberation failed', err);
      alert('შეცდომა შეკითხვის დამუშავებისას: ' + err.message);
    } finally {
      finishDeliberation();
    }
  }

  function finishDeliberation() {
    isDeliberating = false;
    volchokIcon.classList.remove('spinning');
    submitBtn.disabled = false;
    submitBtn.querySelector('.btn-label').textContent = 'დატრიალდეს ვოლჩოკი';
    setGlobalStatus('ready', 'გუნდი მზადყოფნაშია');
    progressBarFill.style.width = '100%';
  }

  /* ==========================================================================
     UI Updates: Members & Leader
     ========================================================================== */
  function showMemberThinking(memberId) {
    const card = document.getElementById(`card-${memberId}`);
    const placeholder = document.getElementById(`placeholder-${memberId}`);
    const thinking = document.getElementById(`thinking-${memberId}`);
    const answer = document.getElementById(`answer-${memberId}`);
    const statusChip = document.getElementById(`status-${memberId}`);
    const copyBtn = document.getElementById(`copy-${memberId}`);
    const timeEl = document.getElementById(`time-${memberId}`);

    if (card) card.classList.add('thinking');
    if (placeholder) placeholder.classList.add('hidden');
    if (thinking) thinking.classList.remove('hidden');
    if (answer) answer.classList.add('hidden');
    if (copyBtn) copyBtn.classList.add('hidden');
    if (timeEl) timeEl.textContent = 'ფიქრობს...';

    if (statusChip) {
      statusChip.className = 'member-status-chip thinking';
      statusChip.querySelector('.status-chip-label').textContent = 'ფიქრობს...';
    }
  }

  function showMemberAnswer(memberId, text, elapsed) {
    const card = document.getElementById(`card-${memberId}`);
    const thinking = document.getElementById(`thinking-${memberId}`);
    const answer = document.getElementById(`answer-${memberId}`);
    const textEl = document.getElementById(`text-${memberId}`);
    const statusChip = document.getElementById(`status-${memberId}`);
    const copyBtn = document.getElementById(`copy-${memberId}`);
    const timeEl = document.getElementById(`time-${memberId}`);

    if (card) {
      card.classList.remove('thinking');
      card.classList.add('active-speaker');
      setTimeout(() => card.classList.remove('active-speaker'), 1500);
    }
    if (thinking) thinking.classList.add('hidden');
    if (answer) answer.classList.remove('hidden');
    if (textEl) textEl.innerHTML = formatMarkdown(text);
    if (copyBtn) copyBtn.classList.remove('hidden');
    if (timeEl) timeEl.textContent = `${elapsed} წმ`;

    if (statusChip) {
      statusChip.className = 'member-status-chip done';
      statusChip.querySelector('.status-chip-label').textContent = 'ვერსია მზადაა ✓';
    }
  }

  function showLeaderVerdict(leaderData, totalElapsed) {
    leaderThinkingState.classList.add('hidden');
    leaderVerdictBox.classList.remove('hidden');

    leaderRichText.innerHTML = formatMarkdown(leaderData.answer);
    if (leaderData.submitted_prompt) {
      leaderAuditCode.textContent = leaderData.submitted_prompt.trim();
    }

    leaderTiming.textContent = `ლიდერი: ${leaderData.elapsed} წმ`;
    totalTiming.textContent = `სრული დრო: ${totalElapsed} წმ`;

    leaderStatusChip.className = 'leader-status-chip finalized';
    leaderStatusText.textContent = 'საბოლოო პასუხი გაცემულია ✓';

    leaderStage.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function resetBoard() {
    stopTimer();
    timerSeconds = 60;
    updateTimerDisplay();

    deliberationProgress.classList.remove('active');
    progressBarFill.style.width = '0%';
    resetSteps();

    // Reset members
    MEMBER_IDS.forEach((id) => {
      const card = document.getElementById(`card-${id}`);
      const placeholder = document.getElementById(`placeholder-${id}`);
      const thinking = document.getElementById(`thinking-${id}`);
      const answer = document.getElementById(`answer-${id}`);
      const statusChip = document.getElementById(`status-${id}`);
      const copyBtn = document.getElementById(`copy-${id}`);
      const timeEl = document.getElementById(`time-${id}`);

      if (card) card.className = 'member-card';
      if (placeholder) placeholder.classList.remove('hidden');
      if (thinking) thinking.classList.add('hidden');
      if (answer) answer.classList.add('hidden');
      if (copyBtn) copyBtn.classList.add('hidden');
      if (timeEl) timeEl.textContent = '-- წმ';

      if (statusChip) {
        statusChip.className = 'member-status-chip idle';
        statusChip.querySelector('.status-chip-label').textContent = 'მოლოდინში';
      }
    });

    // Reset leader
    leaderIdleState.classList.remove('hidden');
    leaderThinkingState.classList.add('hidden');
    leaderVerdictBox.classList.add('hidden');
    leaderStatusChip.className = 'leader-status-chip';
    leaderStatusText.textContent = 'მოლოდინში';
    leaderTiming.textContent = 'დაყოვნება: -- წმ';
    totalTiming.textContent = 'სულ: -- წმ';
  }

  /* ==========================================================================
     Progress Steps
     ========================================================================== */
  function setStep(stepNum) {
    resetSteps();
    if (stepNum >= 1) step1.classList.add('completed');
    if (stepNum >= 2) {
      conn1.classList.add('active');
      step2.classList.add(stepNum === 2 ? 'active' : 'completed');
    }
    if (stepNum >= 3) {
      conn2.classList.add('active');
      step3.classList.add('completed');
    }
  }

  function resetSteps() {
    [step1, step2, step3].forEach((s) => s.classList.remove('active', 'completed'));
    [conn1, conn2].forEach((c) => c.classList.remove('active'));
  }

  function setGlobalStatus(state, text) {
    globalStatusPill.className = `status-indicator ${state}`;
    globalStatusPill.querySelector('.status-text').textContent = text;
  }

  /* ==========================================================================
     Markdown Formatter
     ========================================================================== */
  function formatMarkdown(text) {
    if (!text) return '';
    let html = escapeHtml(text);

    // Bold: **text**
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    // Italic: *text*
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Bullet points: lines starting with * or -
    const lines = html.split('\n');
    let inList = false;
    const formattedLines = [];

    for (let line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
        if (!inList) {
          formattedLines.push('<ul>');
          inList = true;
        }
        formattedLines.push(`<li>${trimmed.substring(2)}</li>`);
      } else {
        if (inList) {
          formattedLines.push('</ul>');
          inList = false;
        }
        if (trimmed.length > 0) {
          formattedLines.push(`<p>${line}</p>`);
        }
      }
    }
    if (inList) formattedLines.push('</ul>');

    return formattedLines.join('');
  }

  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ==========================================================================
     Speech & Clipboard
     ========================================================================== */
  function copyToClipboard(text, btnElement, successMsg) {
    if (!navigator.clipboard) {
      fallbackCopy(text);
      return;
    }
    navigator.clipboard.writeText(text).then(() => {
      const origText = btnElement.textContent;
      btnElement.textContent = successMsg;
      setTimeout(() => {
        btnElement.textContent = origText;
      }, 2000);
    });
  }

  function fallbackCopy(text) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  }

  function speakLeaderAnswer() {
    if (!('speechSynthesis' in window)) {
      alert('თქვენს ბრაუზერს არ გააჩნია ხმოვანი წაკითხვის (Speech Synthesis) მხარდაჭერა.');
      return;
    }

    window.speechSynthesis.cancel();
    const rawText = leaderRichText.innerText.trim();
    if (!rawText) return;

    const utterance = new SpeechSynthesisUtterance(rawText);
    utterance.lang = 'ka-GE';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Check for Georgian voice or fallback
    const voices = window.speechSynthesis.getVoices();
    const kaVoice = voices.find((v) => v.lang.includes('ka') || v.lang.includes('geo'));
    if (kaVoice) utterance.voice = kaVoice;

    speakAnswerBtn.textContent = '🔊 კითხულობს...';
    utterance.onend = () => {
      speakAnswerBtn.textContent = '🗣️ მოსმენა';
    };
    utterance.onerror = () => {
      speakAnswerBtn.textContent = '🗣️ მოსმენა';
    };

    window.speechSynthesis.speak(utterance);
  }
})();
