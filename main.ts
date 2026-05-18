// ── Types ──────────────────────────────────────────────────────────────────
interface TestState {
  words: string[];
  currentWordIndex: number;
  typedWords: string[];
  input: string;
  startTime: number | null;
  endTime: number | null;
  errors: number;
  status: "idle" | "running" | "finished";
  duration: number; // seconds
  countdown: number;
  countdownTimer: ReturnType<typeof setInterval> | null;
}

interface TestResult {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  errors: number;
  duration: number;
}

// ── Word Bank ───────────────────────────────────────────────────────────────
const WORD_BANK: string[] = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "it",
  "for", "not", "on", "with", "he", "as", "you", "do", "at", "this",
  "but", "his", "by", "from", "they", "we", "say", "her", "she", "or",
  "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know",
  "take", "people", "into", "year", "your", "good", "some", "could",
  "them", "see", "other", "than", "then", "now", "look", "only", "come",
  "its", "over", "think", "also", "back", "after", "use", "two", "how",
  "our", "work", "first", "well", "way", "even", "new", "want", "because",
  "any", "these", "give", "day", "most", "us", "great", "between", "need",
  "large", "often", "hand", "high", "place", "hold", "turn", "help", "each",
  "through", "much", "before", "line", "right", "too", "mean", "old", "same",
];

// ── State ───────────────────────────────────────────────────────────────────
const state: TestState = {
  words: [],
  currentWordIndex: 0,
  typedWords: [],
  input: "",
  startTime: null,
  endTime: null,
  errors: 0,
  status: "idle",
  duration: 60,
  countdown: 60,
  countdownTimer: null,
};

// ── DOM Refs ────────────────────────────────────────────────────────────────
const wordsDisplay = document.getElementById("words-display") as HTMLDivElement;
const inputField = document.getElementById("input-field") as HTMLInputElement;
const timerDisplay = document.getElementById("timer") as HTMLSpanElement;
const wpmDisplay = document.getElementById("wpm") as HTMLSpanElement;
const accuracyDisplay = document.getElementById("accuracy") as HTMLSpanElement;
const resultPanel = document.getElementById("result-panel") as HTMLDivElement;
const resultWpm = document.getElementById("result-wpm") as HTMLSpanElement;
const resultRaw = document.getElementById("result-raw") as HTMLSpanElement;
const resultAccuracy = document.getElementById("result-accuracy") as HTMLSpanElement;
const resultErrors = document.getElementById("result-errors") as HTMLSpanElement;
const restartBtn = document.getElementById("restart-btn") as HTMLButtonElement;
const durationBtns = document.querySelectorAll<HTMLButtonElement>(".duration-btn");

// ── Word Generation ─────────────────────────────────────────────────────────
function generateWords(count = 80): string[] {
  const result: string[] = [];
  for (let i = 0; i < count; i++) {
    result.push(WORD_BANK[Math.floor(Math.random() * WORD_BANK.length)]);
  }
  return result;
}

// ── Render Words ────────────────────────────────────────────────────────────
function renderWords(): void {
  wordsDisplay.innerHTML = "";

  state.words.forEach((word, wi) => {
    const wordEl = document.createElement("span");
    wordEl.className = "word";

    if (wi < state.currentWordIndex) {
      const typed = state.typedWords[wi] ?? "";
      wordEl.classList.add(typed === word ? "correct" : "incorrect");
    } else if (wi === state.currentWordIndex) {
      wordEl.classList.add("active");
    }

    word.split("").forEach((char, ci) => {
      const charEl = document.createElement("span");
      charEl.className = "char";
      charEl.textContent = char;

      if (wi === state.currentWordIndex) {
        const typed = state.input;
        if (ci < typed.length) {
          charEl.classList.add(typed[ci] === char ? "char-correct" : "char-wrong");
        } else if (ci === typed.length) {
          charEl.classList.add("char-cursor");
        }
      }

      wordEl.appendChild(charEl);
    });

    // extra chars typed beyond the word
    if (wi === state.currentWordIndex && state.input.length > word.length) {
      for (let e = word.length; e < state.input.length; e++) {
        const extra = document.createElement("span");
        extra.className = "char char-extra";
        extra.textContent = state.input[e];
        wordEl.appendChild(extra);
      }
    }

    wordsDisplay.appendChild(wordEl);
  });

  scrollActiveWordIntoView();
}

function scrollActiveWordIntoView(): void {
  const activeWord = wordsDisplay.querySelector<HTMLSpanElement>(".word.active");
  if (!activeWord) return;

  const containerTop = wordsDisplay.scrollTop;
  const containerBottom = containerTop + wordsDisplay.clientHeight;
  const wordTop = activeWord.offsetTop;
  const wordBottom = wordTop + activeWord.offsetHeight;

  if (wordTop < containerTop || wordBottom > containerBottom) {
    wordsDisplay.scrollTo({ top: wordTop - 8, behavior: "smooth" });
  }
}

// ── Timer ───────────────────────────────────────────────────────────────────
function startCountdown(): void {
  state.countdown = state.duration;
  timerDisplay.textContent = String(state.countdown);

  state.countdownTimer = setInterval(() => {
    state.countdown--;
    timerDisplay.textContent = String(state.countdown);

    updateLiveStats();

    if (state.countdown <= 0) {
      finishTest();
    }
  }, 1000);
}

function stopCountdown(): void {
  if (state.countdownTimer) {
    clearInterval(state.countdownTimer);
    state.countdownTimer = null;
  }
}

// ── Live Stats ───────────────────────────────────────────────────────────────
function updateLiveStats(): void {
  if (!state.startTime || state.status !== "running") return;

  const elapsed = (Date.now() - state.startTime) / 1000 / 60; // minutes
  const correctWords = state.typedWords.filter(
    (w, i) => w === state.words[i]
  ).length;
  const wpm = elapsed > 0 ? Math.round(correctWords / elapsed) : 0;

  const totalTyped = state.typedWords.length;
  const correct = state.typedWords.filter((w, i) => w === state.words[i]).length;
  const accuracy = totalTyped > 0 ? Math.round((correct / totalTyped) * 100) : 100;

  wpmDisplay.textContent = String(wpm);
  accuracyDisplay.textContent = `${accuracy}%`;
}

// ── Compute Results ─────────────────────────────────────────────────────────
function computeResults(): TestResult {
  const durationMin = state.duration / 60;
  const correctWords = state.typedWords.filter(
    (w, i) => w === state.words[i]
  ).length;
  const totalWords = state.typedWords.length;
  const wpm = Math.round(correctWords / durationMin);
  const rawWpm = Math.round(totalWords / durationMin);
  const accuracy =
    totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 100;

  return { wpm, rawWpm, accuracy, errors: state.errors, duration: state.duration };
}

// ── Test Lifecycle ──────────────────────────────────────────────────────────
function initTest(): void {
  stopCountdown();
  state.words = generateWords(100);
  state.currentWordIndex = 0;
  state.typedWords = [];
  state.input = "";
  state.startTime = null;
  state.endTime = null;
  state.errors = 0;
  state.status = "idle";
  state.countdown = state.duration;

  inputField.value = "";
  timerDisplay.textContent = String(state.duration);
  wpmDisplay.textContent = "0";
  accuracyDisplay.textContent = "100%";

  resultPanel.classList.add("hidden");
  wordsDisplay.scrollTop = 0;

  renderWords();
  inputField.focus();
}

function finishTest(): void {
  stopCountdown();
  state.status = "finished";
  state.endTime = Date.now();
  inputField.disabled = true;

  const results = computeResults();

  resultWpm.textContent = String(results.wpm);
  resultRaw.textContent = String(results.rawWpm);
  resultAccuracy.textContent = `${results.accuracy}%`;
  resultErrors.textContent = String(results.errors);

  resultPanel.classList.remove("hidden");
  animateResults();
}

function animateResults(): void {
  const items = resultPanel.querySelectorAll(".result-item");
  items.forEach((el, i) => {
    (el as HTMLElement).style.animationDelay = `${i * 80}ms`;
    el.classList.add("pop-in");
  });
}

// ── Input Handling ──────────────────────────────────────────────────────────
inputField.addEventListener("input", (e: Event) => {
  if (state.status === "finished") return;

  const target = e.target as HTMLInputElement;
  const value = target.value;

  // Start on first keystroke
  if (state.status === "idle" && value.length > 0) {
    state.status = "running";
    state.startTime = Date.now();
    startCountdown();
  }

  // Space = commit word
  if (value.endsWith(" ")) {
    const typed = value.trim();
    if (typed.length === 0) {
      inputField.value = "";
      state.input = "";
      return;
    }

    const expected = state.words[state.currentWordIndex];
    if (typed !== expected) state.errors++;

    state.typedWords[state.currentWordIndex] = typed;
    state.currentWordIndex++;
    inputField.value = "";
    state.input = "";

    // Need more words?
    if (state.currentWordIndex >= state.words.length - 10) {
      state.words.push(...generateWords(30));
    }
  } else {
    state.input = value;
  }

  renderWords();
  updateLiveStats();
});

inputField.addEventListener("keydown", (e: KeyboardEvent) => {
  // Prevent backspacing into a previous word (optional: allow if desired)
  if (e.key === "Backspace" && state.input === "" && state.currentWordIndex > 0) {
    e.preventDefault();
  }
});

// ── Duration Toggle ─────────────────────────────────────────────────────────
durationBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    durationBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    state.duration = parseInt(btn.dataset.duration ?? "60", 10);
    initTest();
  });
});

// ── Restart ─────────────────────────────────────────────────────────────────
restartBtn.addEventListener("click", () => initTest());

document.addEventListener("keydown", (e: KeyboardEvent) => {
  if (e.key === "Escape") initTest();
  if (
    e.key !== "Escape" &&
    document.activeElement !== inputField &&
    state.status !== "finished"
  ) {
    inputField.focus();
  }
});

// ── Init ────────────────────────────────────────────────────────────────────
initTest();
