import { supabase, supabaseConfigError } from "../supabase/client.js";

(() => {
  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => [...document.querySelectorAll(selector)];
  const storeKey = "typemater.v2";
  const todayKey = (date = new Date()) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  const oldData = (() => {
    try {
      return JSON.parse(
        localStorage.getItem(storeKey) ||
          localStorage.getItem("typemater.v1") ||
          "{}",
      );
    } catch {
      return {};
    }
  })();
  const paletteAliases = { forest: "garden", green: "garden", rose: "petal", pink: "petal", ocean: "tide", blue: "tide", sand: "honey" };
  const savedPalette = ["garden", "petal", "tide", "honey", "lavender"].includes(oldData.colorPalette) ? oldData.colorPalette : paletteAliases[oldData.colorPalette] || "garden";
  const data = {
    history: Array.isArray(oldData.history) ? oldData.history : [],
    theme: oldData.theme || "light",
    colorPalette: savedPalette,
    sound: Boolean(oldData.sound),
    soundStyle: ["soft-click", "soft-hit", "mechanical", "hard-click"].includes(oldData.soundStyle) ? oldData.soundStyle : "soft-click",
    soundVolume: Number.isFinite(Number(oldData.soundVolume)) ? Math.min(1, Math.max(0, Number(oldData.soundVolume))) : 0.6,
    musicEnabled: Boolean(oldData.musicEnabled),
    musicVolume: Number.isFinite(Number(oldData.musicVolume)) ? Math.min(1, Math.max(0, Number(oldData.musicVolume))) : 0.25,
    showLive: oldData.showLive !== false,
    font: [18, 20, 23, 27, 32].includes(Number(oldData.font))
      ? Number(oldData.font)
      : Number(oldData.font) === 24
        ? 20
        : Number(oldData.font) === 28
          ? 27
          : 23,
    roundSeconds: Number(oldData.roundSeconds) || 30,
    goalMinutes: Number(oldData.goalMinutes) || 15,
    focusLetters: Array.isArray(oldData.focusLetters)
      ? oldData.focusLetters.slice(0, 5)
      : [],
    uppercaseLetters: Boolean(oldData.uppercaseLetters),
    letterPunctuation: Boolean(oldData.letterPunctuation),
    dailyTotals: oldData.dailyTotals || {},
    dailyGoals: oldData.dailyGoals || {},
    practiceDate: oldData.practiceDate || "",
    streak: Number(oldData.streak) || 0,
    lastPractice: oldData.lastPractice || "",
    activeMode: ["time", "words", "zen", "quote"].includes(oldData.activeMode) ? oldData.activeMode : "time",
    modeDrafts: oldData.modeDrafts && typeof oldData.modeDrafts === "object" ? oldData.modeDrafts : {},
    passageSettingsPending: false,
    wordCount: [10, 25, 50, 100].includes(Number(oldData.wordCount)) ? Number(oldData.wordCount) : 25,
    uppercase: oldData.uppercase === undefined ? Boolean(oldData.uppercaseLetters) : Boolean(oldData.uppercase),
    numbers: Boolean(oldData.numbers),
  };
  const defaultDataSnapshot = JSON.parse(JSON.stringify(data));
  let activeStoreKey = storeKey;
  let storeGeneration = 0;
  const soundAssets = {
    "soft-click": new URL("../assets/mixkit-typewriter-soft-click.wav", import.meta.url).href,
    "soft-hit": new URL("../assets/mixkit-typewriter-soft-hit.wav", import.meta.url).href,
    mechanical: new URL("../assets/mixkit-mechanical-typewriter-single-hit.wav", import.meta.url).href,
    "hard-click": new URL("../assets/mixkit-hard-typewriter-click.wav", import.meta.url).href,
  };
  const soundPlayers = Object.fromEntries(Object.entries(soundAssets).map(([name, url]) => [name, Array.from({ length: 5 }, () => { const audio = new Audio(url); audio.preload = "auto"; return audio; })]));
  const soundCursor = Object.fromEntries(Object.keys(soundAssets).map((name) => [name, 0]));
  const backgroundMusic = new Audio(new URL("../assets/andriih-bgmusic.mp3", import.meta.url).href);
  backgroundMusic.loop = true;
  backgroundMusic.preload = "none";
  backgroundMusic.volume = data.musicVolume;
  function playTypingSound(style = data.soundStyle, preview = false) {
    if (!data.sound && !preview) return;
    const name = soundPlayers[style] ? style : "soft-click";
    const pool = soundPlayers[name];
    const audio = pool[soundCursor[name]++ % pool.length];
    audio.pause();
    audio.currentTime = 0;
    audio.volume = data.soundVolume;
    void audio.play().catch(() => {});
  }
  function resumeBackgroundMusic() {
    if (!data.musicEnabled || !backgroundMusic.paused) return;
    void backgroundMusic.play().catch(() => {});
  }
  document.addEventListener("pointerdown", resumeBackgroundMusic, { passive: true });
  document.addEventListener("keydown", resumeBackgroundMusic);
  if (!data.dailyTotals[todayKey()] && oldData.todaySeconds)
    data.dailyTotals[todayKey()] = Number(oldData.todaySeconds) * 1000;
  data.dailyGoals[todayKey()] =
    data.dailyGoals[todayKey()] || data.goalMinutes * 60000;
  const wordBank =
    "the of and to a in is you that it he was for on are as with his they I at be this have from or one had by word but not what all were we when your can said there use an each which she do how their if will up other about out many then them these so some her would make like him into time has look two more write go see number no way could people my than first water been call who oil its now find long down day did get come made may part over new sound take only little work know place year live me back give most very after thing our just name good sentence man think say great where help through much before line right too mean old any same tell boy follow came want show also around form three small set put end why again turn here few off went well because picture try kind hand school still must learn should every near add food between own below keep tree never start city eyes light thought head under story saw left few while along might close something seem next hard open example begin life always those both paper together got group often run important until children side feet car mile night walk white sea began grow took river four carry state once book hear stop without second later enough eat face watch far real almost let above girl sometimes mountain cut young talk soon list song being leave family body music color stand sun questions fish area mark dog horse birds problem complete room knew since ever piece told usually friends easy heard order red door sure become top ship across today during short better best low hours black products happened whole measure remember early waves reached listen wind rock space covered fast several hold himself toward step morning passed true hundred pattern table north slowly money map farm pulled draw voice seen cold cried plan notice south sing ground fall king town unit figure certain field travel wood fire upon done road half ten fly gave box finally wait correct oh quickly person became shown minutes strong verb stars front feel fact street decided contain course surface produce building ocean class note nothing rest carefully scientists inside wheels stay green known island week less machine base ago stood plane system behind ran round boat game force brought understand warm common bring explain dry though language shape deep thousands yes clear filled heat full hot check object rule among noun power cannot able six size dark ball material special heavy fine pair circle include built can matter square bill felt suddenly test direction center farmers ready anything divided general energy subject moon region return believe dance members picked simple cells paint mind love cause rain exercise train blue wish drop developed window difference distance heart sum summer wall forest probably legs sat main winter wide written length reason kept interest arms brother race present beautiful store job edge past sign record finished discovered wild happy beside gone sky grass million west lay weather root instruments meet third months paragraph raised represent soft whether clothes flowers shall teacher held describe drive cross speak solve appear metal son either ice sleep village factors result jumped snow ride care floor hill pushed baby buy century outside everything tall already instead phrase soil bed copy free hope spring case laughed nation quite type themselves temperature bright lead everyone method section lake iron within dictionary hair age semester".split(
      /\s+/,
    );
  // Extra vocabulary for letter drills. The common-word list above has almost
  // nothing for letters like q, z, x or j, so drills pull from this as well.
  const practiceWords =
    "quick quiet quite quote quality question quarter queen quest queue quilt quiz quack quartz quarrel quench query squirrel equal require request acquire square liquid frequent sequence unique technique antique mosquito banquet bouquet equip zero zone zoo zebra zip zinc zest zigzag zoom zeal size prize amazing crazy dozen freeze frozen graze gaze lazy maze puzzle razor sneeze breeze blaze buzz fizz jazz pizza topaz wizard organize realize recognize horizon bronze citizen box fox six mix fix wax tax relax exact example excellent exercise explain explore express extra extreme excite expect expert expand axis maximum taxi toxic complex index next text mixture exit oxygen jump just join joy job jar jam jet jog joke judge juice jungle journey jewel jacket jelly jigsaw enjoy object project subject reject adjust major banjo ninja keep key kind king kitchen knock knee knife kite kettle kayak keen kick kid kiss kit knit knot lake make take walk work park book look milk sky skill skin ask risk task desk market pocket rocket basket blanket very voice value visit view vine village violet vivid vast vote vase van vacuum valley vapor velvet venture verb victory vital volume volcano voyage have give live love move every river silver over never travel gravel water wall want warm wash watch wave weak wear weather week weight well west wheel white wide wild wind window winter wish wonder wood world worry wrong wrap wrist yes yellow yard yarn yawn yell young youth yoga yogurt yield yesterday happy hobby baby candy fancy story body play stay bubble bridge brave brown bright butter bottle button balance bamboo forest flower friend family fabric feather finger flame flavor fresh frog funny future garden gentle giant glass green group guitar ginger gather gift grape grass harbor heart honey horse house hammer hello hunt hungry humble paper pencil pepper pillow planet purple plant picnic pretty magic melody memory mirror monkey moon morning mountain muffin music daily dance danger dark dinner dolphin dragon dream drum duck during candle castle circle cloud coffee copper cotton country cricket crystal curious lamp ladder lemon letter light lizard lunch lovely lantern narrow nature needle neighbor night noodle north notice nurse rabbit rainbow ribbon robot round rubber ruler running sailor salad season secret shadow simple smile soccer street sugar summer table tiger ticket tomato tower treasure turtle twenty thunder apple animal aunt autumn eagle earth elbow engine island insect iron ocean orange otter outside umbrella uncle usual".split(
      /\s+/,
    );
  const quotePool = [
    "Ang Lupa ay para sa mga Pilipino at hindi para sa dayuhan! Tutulan ang PX SILICA! TUNAY NA REPORMA PARA SA MAGSASAKA!",
    "The secret of getting ahead is getting started.",
    "It always seems impossible until it is done.",
    "Great things are done by a series of small things brought together.",
    "What we think, we become. What we feel, we attract. What we imagine, we create.",
    "There is no substitute for hard work.",
    "The future depends on what you do today.",
    "Nothing will work unless you do.",
    "Life is a journey, not a destination.",
  ];
  const lessons = {
    home: {
      label: "HOME ROW",
      title: "Rest your fingers at home.",
      description:
        "Place your left fingers on A, S, D, F and your right fingers on J, K, L, ;. Let both thumbs rest lightly over the space bar. The small raised marks on F and J help you find home without looking.",
      tip: "Rest your index fingers on F and J. Your other fingers fall naturally into place.",
      keys: "asdfghjkl;".split(""),
      drill:
        "asdf jkl; asdf jkl; sad lad fall ask flask hall; dad asks; all fall; glad shall;",
    },
    top: {
      label: "TOP ROW",
      title: "Reach up with the nearest finger.",
      description:
        "Keep your hands anchored. On the left, pinky reaches Q, ring W, middle E, and index R and T. On the right, index reaches Y and U, middle I, ring O, and pinky P. Return each finger to its home key.",
      tip: "Reach gently. Let each finger return to its home key before the next word.",
      keys: "qwertyuiop".split(""),
      drill:
        "type quiet power write you were quite proud; your tower grew; we try;",
    },
    bottom: {
      label: "BOTTOM ROW",
      title: "Reach down, then come back home.",
      description:
        "Keep your wrists relaxed. On the left, pinky reaches Z, ring X, middle C, and index V and B. On the right, index reaches N and M, middle reaches comma, ring period, and pinky slash. Return each finger home.",
      tip: "Use the finger closest to each key. Reset on the home row between reaches.",
      keys: "zxcvbnm,./".split(""),
      drill: "mix box, zoom, civic; move, maybe; examine every symbol;",
    },
  };
  const lessonOrder = ["home", "top", "bottom"];
  let activeLesson = "home";
  let practicedLessonKeys = new Set();
  const naturalSentences = [
    "Every morning, Maya opens the window and lets the quiet light fill the room.",
    "We grow more confident when we give ourselves space to practice.",
    "The small green garden looked brighter after the gentle rain.",
    "Learning a new skill is easier when curiosity leads the way.",
    "A warm cup of tea and a good book can make an ordinary day feel special.",
    "Sam packed a light lunch before leaving for the long train ride.",
    "Fresh ideas often arrive when we slow down and notice what is around us.",
    "The little fox crossed the path and disappeared into the woods.",
    "Friends shared stories while the sun slowly set behind the hills.",
    "Each careful step brought the young musician closer to the stage.",
    "Quiet music filled the kitchen as the family made dinner together.",
    "The curious child asked thoughtful questions about the stars.",
    "After a long walk, we found a peaceful place beside the river.",
    "The bright yellow kite danced above the open field.",
    "Good things take patience, practice, and a little bit of courage.",
    "The old wooden table held bowls of fruit from the market.",
    "A clear plan helps turn a big idea into small, useful steps.",
    "Nina wrote a note to remember the lovely afternoon by the sea.",
    "The quiet library offered a calm place to think and learn.",
    "Several neighbors worked together to clean the narrow street.",
    "Fresh bread, ripe tomatoes, and soft cheese made a simple lunch.",
    "We took the scenic road through the valley and stopped for a view.",
    "A soft breeze moved the leaves while the birds sang nearby.",
    "The little bookstore on the corner always has something surprising.",
    "Practice gives your hands time to find a smooth and steady rhythm.",
    "A thoughtful question can open the door to a new idea.",
    "The train moved quickly across the quiet countryside.",
    "Under the bright moon, the lake looked like polished silver.",
    "The team made a flexible plan and adjusted it as they went.",
    "A delicious meal feels even better when everyone helps prepare it.",
    "The neighborhood market was full of colorful flowers and fresh fruit.",
    "She chose a cozy chair near the window and began to read.",
    "Taking a short break can help your mind return with fresh energy.",
    "The excited puppy raced across the grass to greet its family.",
    "We made a quiet promise to keep trying, even when progress felt slow.",
    "Bright orange leaves covered the path after the autumn storm.",
    "The gentle teacher explained the lesson with patience and care.",
    "A quick stretch helped ease the tension in his shoulders.",
    "They explored the museum and found an unusual exhibit about space.",
    "The queen thanked the villagers for their generous welcome.",
    "A quiet afternoon is a lovely time to reflect and recharge.",
    "The box of old photographs brought back many happy memories.",
    "Zoe fixed the loose zipper on her jacket before the trip.",
    "The exact shape of each cloud changed as it crossed the sky.",
    "We made a checklist, packed the essentials, and left before sunrise.",
    "The jazz band played a relaxed tune in the small town square.",
    "A fresh perspective can make a familiar place feel new again.",
    "The quiet queen enjoyed a quick walk around the garden.",
    "Each new experience adds another color to the picture of our lives.",
    "The mix of citrus, ginger, and honey made a bright morning drink.",
    "We gathered around the fire and listened to the rain outside.",
    "A good routine makes room for both focus and rest.",
    "The young artist used a soft brush to paint a blue horizon.",
    "Max and Alex fixed the old wooden bench beside the path.",
    "The breeze carried the scent of jasmine across the courtyard.",
    "She asked for extra time to finish the thoughtful project.",
    "The quiet fox watched a family of ducks cross the pond.",
    "Taking care of your hands is part of taking care of your craft.",
    "We found a hidden path that led to a wide view of the valley.",
    "The shopkeeper wrapped each small gift with care.",
    "With practice, the tricky passage began to feel natural.",
  ];
  const inputEl = $("#typingInput");
  let mode = data.activeMode,
    duration = data.roundSeconds,
    wordCount = data.wordCount,
    punctuation = Boolean(oldData.punctuation ?? data.letterPunctuation),
    numbers = data.numbers;
  let target = "",
    targetMode = "",
    input = "",
    roundRunning = false,
    finished = false,
    roundStartedAt = 0,
    roundElapsedBeforeStart = 0,
    elapsed = 0,
    timer = null,
    chartPoints = [],
    typedAttempts = 0,
    correctAttempts = 0;
  let focusPromptActive = false,
    toastTimer,
    pendingStreakCelebration = null,
    focusFilterTimer = null,
    lastTickAt = 0,
    lastPersistSecond = -1;
  let currentUser = null;

  function persist() {
    try {
      localStorage.setItem(activeStoreKey, JSON.stringify(data));
    } catch {}
  }
  function syncPracticeFont() {
    const fontSize = [18, 20, 23, 27, 32].includes(Number(data.font))
      ? Number(data.font)
      : 23;
    data.font = fontSize;
    $("#fontSetting").value = String(fontSize);
    $("#textDisplay").style.fontSize = `${fontSize}px`;
  }
  function readDataStore(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value && typeof value === "object" && !Array.isArray(value) ? value : null;
    } catch {
      return null;
    }
  }
  function freshGuestSnapshot() {
    return {
      ...JSON.parse(JSON.stringify(defaultDataSnapshot)),
      history: [], theme: "light", colorPalette: "garden", sound: false,
      soundStyle: "soft-click", soundVolume: 0.6, musicEnabled: false,
      musicVolume: 0.25, showLive: true, font: 23, roundSeconds: 30,
      goalMinutes: 15, focusLetters: [], uppercase: false, numbers: false,
      punctuation: false, letterPunctuation: false, dailyTotals: {},
      dailyGoals: {}, practiceDate: "", streak: 0, lastPractice: "",
      activeMode: "time", modeDrafts: {}, wordCount: 25,
      passageSettingsPending: false,
    };
  }
  function activateUserStore(user) {
    const nextKey = user ? `${storeKey}:user:${user.id}` : storeKey;
    if (nextKey === activeStoreKey) return storeGeneration;

    if (roundRunning) pauseRound("Paused when the account changed");
    persist();
    const guestSnapshot = readDataStore(storeKey) || defaultDataSnapshot;
    const existingUserSnapshot = user ? readDataStore(nextKey) : null;
    const migrateGuestData = Boolean(user && !existingUserSnapshot);
    const savedSnapshot = user
      ? existingUserSnapshot || guestSnapshot
      : readDataStore(storeKey) || freshGuestSnapshot();
    for (const key of Object.keys(defaultDataSnapshot)) {
      const value = Object.hasOwn(savedSnapshot, key) ? savedSnapshot[key] : defaultDataSnapshot[key];
      data[key] = value && typeof value === "object" ? JSON.parse(JSON.stringify(value)) : value;
    }
    activeStoreKey = nextKey;
    storeGeneration += 1;
    if (migrateGuestData) {
      try { localStorage.setItem(storeKey, JSON.stringify(freshGuestSnapshot())); } catch {}
    }

    data.history = Array.isArray(data.history) ? data.history.filter((row) => row && typeof row === "object" && !Array.isArray(row)) : [];
    data.dailyTotals = data.dailyTotals && typeof data.dailyTotals === "object" && !Array.isArray(data.dailyTotals) ? data.dailyTotals : {};
    data.dailyGoals = data.dailyGoals && typeof data.dailyGoals === "object" && !Array.isArray(data.dailyGoals) ? data.dailyGoals : {};
    data.modeDrafts = data.modeDrafts && typeof data.modeDrafts === "object" && !Array.isArray(data.modeDrafts) ? data.modeDrafts : {};
    data.focusLetters = Array.isArray(data.focusLetters) ? [...new Set(data.focusLetters.filter((letter) => typeof letter === "string").join("").toLowerCase().match(/[a-z]/g) || [])].slice(0, 5) : [];
    data.colorPalette = ["garden", "petal", "tide", "honey", "lavender"].includes(data.colorPalette) ? data.colorPalette : "garden";
    data.theme = data.theme === "dark" ? "dark" : "light";
    data.sound = Boolean(data.sound);
    data.musicEnabled = Boolean(data.musicEnabled);
    data.showLive = data.showLive !== false;
    data.uppercase = Boolean(data.uppercase);
    data.numbers = Boolean(data.numbers);
    data.punctuation = Boolean(data.punctuation ?? data.letterPunctuation);
    data.letterPunctuation = data.punctuation;
    data.streak = Math.max(0, Number(data.streak) || 0);
    syncPracticeFont();
    data.goalMinutes = [5, 10, 15, 20].includes(Number(data.goalMinutes)) ? Number(data.goalMinutes) : 15;
    data.soundStyle = ["soft-click", "soft-hit", "mechanical", "hard-click"].includes(data.soundStyle) ? data.soundStyle : "soft-click";
    data.soundVolume = Number.isFinite(Number(data.soundVolume)) ? Math.min(1, Math.max(0, Number(data.soundVolume))) : 0.6;
    data.musicVolume = Number.isFinite(Number(data.musicVolume)) ? Math.min(1, Math.max(0, Number(data.musicVolume))) : 0.25;
    mode = ["time", "words", "zen", "quote"].includes(data.activeMode) ? data.activeMode : "time";
    data.activeMode = mode;
    duration = [15, 30, 60, 120].includes(Number(data.roundSeconds)) ? Number(data.roundSeconds) : 30;
    data.roundSeconds = duration;
    wordCount = [10, 25, 50, 100].includes(Number(data.wordCount)) ? Number(data.wordCount) : 25;
    data.wordCount = wordCount;
    punctuation = Boolean(data.punctuation ?? data.letterPunctuation);
    numbers = Boolean(data.numbers);

    document.body.classList.toggle("dark", data.theme === "dark");
    document.body.dataset.palette = data.colorPalette;
    syncPracticeFont();
    $("#liveStats").classList.toggle("hidden", !data.showLive);
    $("#liveSetting").checked = data.showLive;
    $("#soundSetting").checked = data.sound;
    $("#soundStyleSetting").value = data.soundStyle;
    $("#soundVolumeSetting").value = String(Math.round(data.soundVolume * 100));
    $("#soundVolumeValue").textContent = `${Math.round(data.soundVolume * 100)}%`;
    for (const pool of Object.values(soundPlayers))
      for (const audio of pool) audio.volume = data.soundVolume;
    $("#musicSetting").checked = data.musicEnabled;
    $("#musicVolumeSetting").value = String(Math.round(data.musicVolume * 100));
    $("#musicVolumeValue").textContent = `${Math.round(data.musicVolume * 100)}%`;
    backgroundMusic.volume = data.musicVolume;
    if (data.musicEnabled) resumeBackgroundMusic();
    else {
      backgroundMusic.pause();
      backgroundMusic.currentTime = 0;
    }
    $$(".palette-choice").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.palette === data.colorPalette)));
    updateModeStartup();
    renderTextOptions();
    applySavedPreferences();
    updateDashboard();
    delete data.modeDrafts[mode];
    restart(false, true);
    captureModeDraft();
    renderText();
    return storeGeneration;
  }
  function randomWord() {
    return wordBank[Math.floor(Math.random() * wordBank.length)];
  }
  // Builds a word picker for one passage. With focus letters chosen, about 90%
  // of words contain one of them, cycling through the letters so each gets a
  // fair share, preferring words that contain the letter more than once, and
  // avoiding repeats until the pool runs out.
  function makeWordPicker() {
    const letters = [...new Set(data.focusLetters.map((letter) => letter.toLowerCase()))];
    if (!letters.length) return randomWord;
    const all = [...new Set([...wordBank, ...practiceWords].map((w) => w.toLowerCase()))];
    const pools = letters
      .map((letter) => ({ letter, words: all.filter((word) => word.includes(letter)) }))
      .filter((pool) => pool.words.length);
    if (!pools.length) return randomWord;
    const occurrences = (word, letter) => word.split(letter).length - 1;
    const recent = [];
    let turn = Math.floor(Math.random() * pools.length);
    return () => {
      if (Math.random() > 0.9) return randomWord();
      const { letter, words } = pools[turn++ % pools.length];
      let best = "";
      for (let tries = 0; tries < 6; tries++) {
        const word = words[Math.floor(Math.random() * words.length)];
        if (recent.includes(word) && words.length > recent.length) continue;
        if (!best || occurrences(word, letter) > occurrences(best, letter)) best = word;
      }
      best = best || words[Math.floor(Math.random() * words.length)];
      recent.push(best);
      if (recent.length > Math.min(12, words.length - 1)) recent.shift();
      return best;
    };
  }
  function applyCase(text) {
    if (!data.uppercase) return text.toLowerCase();
    return text.replace(/(^|[.!?]\s+)([a-z])/g, (_match, boundary, letter) => boundary + letter.toUpperCase()).replace(/\bi\b/g, "I");
  }
  function makeWords(count) {
    const result = [];
    const pickWord = makeWordPicker();
    for (let i = 0; i < count; i++) {
      let word = pickWord();
      if (punctuation && i > 1 && Math.random() < 0.18)
        word += [",", ".", ";", "?"][Math.floor(Math.random() * 4)];
      if (numbers && Math.random() < 0.09) word = String(Math.floor(Math.random() * 100));
      result.push(word);
    }
    return applyCase(result.join(" "));
  }
  function makeNaturalParagraph(focused = false) {
    // A fixed sentence set can't hold much of a rare letter, so letter drills
    // are built from words instead.
    if (focused && data.focusLetters.length) return makeWords(45);
    const count = 3 + Math.floor(Math.random() * 3);
    const selected = focused && data.focusLetters.length ? makeFocusSentences(count) : [...naturalSentences].sort(() => Math.random() - 0.5).slice(0, count);
    let passage = selected.join(" ");
    if (numbers) {
      const numberSentence = `There were ${1 + Math.floor(Math.random() * 99)} bright markers along the path.`;
      passage = count >= 5 ? `${selected.slice(0, -1).join(" ")} ${numberSentence}` : `${passage} ${numberSentence}`;
    }
    passage = applyCase(passage);
    if (!punctuation) passage = passage.replace(/[.,;:!?]/g, "");
    return passage;
  }
  function makeFocusSentences(count) {
    const focus = new Set(data.focusLetters.map((letter) => letter.toLowerCase()));
    const scored = naturalSentences.map((sentence) => {
      const chars = sentence.toLowerCase().replace(/[^a-z]/g, "");
      const words = sentence.toLowerCase().match(/[a-z]+/g) || [];
      const hits = [...chars].filter((char) => focus.has(char)).length;
      const hitWords = words.filter((word) => [...focus].some((letter) => word.includes(letter))).length;
      return { sentence, score: hitWords / Math.max(words.length, 1) * 0.8 + hits / Math.max(chars.length, 1) * 0.2, hits };
    }).filter((row) => row.hits).sort((a, b) => b.score - a.score);
    const pool = scored.slice(0, Math.max(count, Math.ceil(scored.length * 0.4)));
    const chosen = [];
    while (chosen.length < count && pool.length) chosen.push(pool.splice(Math.floor(Math.random() * Math.min(pool.length, 12)), 1)[0].sentence);
    while (chosen.length < count) chosen.push(naturalSentences[Math.floor(Math.random() * naturalSentences.length)]);
    return chosen;
  }
  function makeTarget(forMode = mode) {
    focusPromptActive = data.focusLetters.length > 0 && forMode !== "quote";
    if (forMode === "quote") {
      // Quotes retain their authored capitalization and punctuation. They are
      // intentionally independent of the shared passage toggles.
      return quotePool[Math.floor(Math.random() * quotePool.length)];
    }
    if (forMode === "time") return makeNaturalParagraph(focusPromptActive);
    if (forMode === "zen") return makeWords(220);
    return makeWords(wordCount);
  }
  function captureModeDraft() {
    if (!target || targetMode !== mode || finished) return;
    data.activeMode = mode;
    data.modeDrafts[mode] = { generationVersion: 7, mode, targetMode, wordCount, target, input, elapsedMs: currentRoundMs(), typedAttempts, correctAttempts };
    persist();
  }
  function restoreModeDraft() {
    const draft = data.modeDrafts[mode];
    if (!draft || draft.generationVersion !== 7 || draft.mode !== mode || draft.targetMode !== mode || (mode === "words" && draft.wordCount !== wordCount) || typeof draft.target !== "string" || !draft.target.trim() || typeof draft.input !== "string") return false;
    target = draft.target;
    targetMode = mode;
    focusPromptActive = data.focusLetters.length > 0 && mode !== "quote";
    input = draft.input.slice(0, target.length);
    inputEl.value = input;
    roundElapsedBeforeStart = Math.max(0, Number(draft.elapsedMs) || 0);
    roundStartedAt = 0;
    roundRunning = false;
    finished = false;
    typedAttempts = Math.max(input.length, Number(draft.typedAttempts) || 0);
    const inferredCorrect = [...input].reduce((sum, char, index) => sum + Number(char === target[index]), 0);
    correctAttempts = Math.min(typedAttempts, draft.correctAttempts === undefined ? inferredCorrect : Math.max(0, Number(draft.correctAttempts) || 0));
    chartPoints = [];
    $("roundStatus").textContent = input.length ? "Your place is saved · ready when you are" : "This passage is saved · ready when you are";
    renderText(); updateTimerLabel(); updateGoalUI();
    return true;
  }
  function setMode(next) {
    if (!["time", "words", "zen", "quote"].includes(next) || (next === mode && targetMode === next)) return;
    if (roundRunning) pauseRound("Paused · your place is saved");
    if (next !== mode) captureModeDraft();
    mode = next;
    data.activeMode = mode;
    persist();
    $$(".mode-tab").forEach((button) => button.classList.toggle("selected", button.dataset.mode === mode));
    $("#durationChoices").classList.toggle("hidden", mode !== "time");
    $("#wordChoices").classList.toggle("hidden", mode !== "words");
    $("#roundOptions").classList.toggle("hidden", mode === "quote");
    $("#practiceTextControls").classList.toggle("hidden", mode === "quote");
    $("#passageCustomizer").classList.toggle("hidden", mode === "quote");
    $("#globalTextOptions").classList.toggle("hidden", mode === "quote");
    $("#timerValue").innerHTML = mode === "time" ? `${duration}<span>s</span>` : mode === "zen" ? "∞" : "—";
    $("#escapeAction").textContent = mode === "zen" ? "finish" : "pause";
    $("#sessionHint").textContent = mode === "zen" ? "Type for as long as you like. Press esc when you’re ready to stop." : "Easy does it. Accuracy first, speed follows.";
    const descriptions = {
      time: "A short passage against the clock.",
      words: "A set word count, finished at your own pace.",
      zen: "Keep typing with no timer or finish line.",
      quote: "A small reminder to keep going. Type each quote exactly as written.",
    };
    $("#modeDescription").lastElementChild.textContent = descriptions[mode];
    // A mode change always presents a fresh passage for the newly selected
    // mode, even when that mode had an older saved draft.
    delete data.modeDrafts[mode];
    restart(false, true);
    captureModeDraft();
    renderText();
    updateTimerLabel();
  }
  function updateModeStartup() {
    $$(".mode-tab").forEach((button) => button.classList.toggle("selected", button.dataset.mode === mode));
    $("#durationChoices").classList.toggle("hidden", mode !== "time");
    $("#wordChoices").classList.toggle("hidden", mode !== "words");
    $("#roundOptions").classList.toggle("hidden", mode === "quote");
    $("#practiceTextControls").classList.toggle("hidden", mode === "quote");
    $("#passageCustomizer").classList.toggle("hidden", mode === "quote");
    $("#globalTextOptions").classList.toggle("hidden", mode === "quote");
    const descriptions = {time: "A short passage against the clock.", words: "A set word count, finished at your own pace.", zen: "Keep typing with no timer or finish line.", quote: "A small reminder to keep going. Type each quote exactly as written."};
    $("#modeDescription").lastElementChild.textContent = descriptions[mode];
    $("#escapeAction").textContent = mode === "zen" ? "finish" : "pause";
    $("#timerValue").innerHTML = mode === "time" ? `${duration}<span>s</span>` : mode === "zen" ? "∞" : "—";
  }
  function renderText() {
    const fragment = document.createDocumentFragment();
    for (let i = 0; i < target.length; i++) {
      const span = document.createElement("span");
      span.className = "char";
      if (input[i] !== undefined)
        span.classList.add(input[i] === target[i] ? "correct" : "incorrect");
      else if (!finished && i === input.length)
        span.classList.add("current");
      if (
        focusPromptActive &&
        i < input.length &&
        input[i] === target[i] &&
        data.focusLetters.includes(target[i].toLowerCase())
      )
        span.classList.add("focus-letter");
      span.textContent = target[i];
      fragment.appendChild(span);
    }
    $("#textDisplay").replaceChildren(fragment);
    $("#textDisplay").dataset.mode = mode;
    if (input.length >= target.length && !finished && mode !== "zen")
      completeRound();
  }
  function accuracyNow() {
    return typedAttempts ? Math.round((correctAttempts / typedAttempts) * 100) : 100;
  }
  function currentCorrectCharacters() {
    let correct = 0;
    for (let i = 0; i < input.length; i++)
      if (input[i] === target[i]) correct++;
    return correct;
  }
  function speedNow() {
    const minutes = currentRoundMs() / 60000;
    if (minutes <= 0) return { net: 0, raw: 0 };
    const gross = typedAttempts / 5 / minutes;
    // Net speed counts only correct characters (5 per word), so it can never
    // go below zero. Hold it at 0 for the first 2 seconds so a few early
    // keystrokes don't produce a wildly inflated reading.
    const net = minutes < 2 / 60 ? 0 : correctAttempts / 5 / minutes;
    return { net: Math.round(net), raw: Math.round(gross) };
  }
  function currentRoundMs() {
    return (
      roundElapsedBeforeStart + (roundRunning ? Date.now() - roundStartedAt : 0)
    );
  }
  function dailyMilliseconds() {
    return Number(data.dailyTotals[todayKey()]) || 0;
  }
  function showStreakCelebration(streak, previousStreak) {
    const popup = $("#streakCelebration");
    const count = $("#streakCelebrationCount");
    $("#streakValue").textContent = String(streak);
    count.textContent = String(previousStreak);
    popup.classList.add("show");
    popup.setAttribute("aria-hidden", "false");
    $("#closeStreakCelebration").focus();
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      count.textContent = String(streak);
      return;
    }
    const start = performance.now();
    const duration = 650;
    const animateCount = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - (1 - progress) ** 3;
      count.textContent = String(Math.round(previousStreak + (streak - previousStreak) * eased));
      if (progress < 1) requestAnimationFrame(animateCount);
    };
    requestAnimationFrame(animateCount);
  }
  function closeStreakCelebration() {
    const popup = $("#streakCelebration");
    popup.classList.remove("show");
    popup.setAttribute("aria-hidden", "true");
    if (!$("#practiceView").classList.contains("hidden") && !finished) {
      inputEl.focus({ preventScroll: true });
      $("#typingArea").classList.add("focused");
    }
  }
  function updateStreak() {
    const previousStreak = Number(data.streak) || 0;
    const today = todayKey();
    const yesterday = todayKey(new Date(Date.now() - 86400000));
    const todayHit =
      dailyMilliseconds() >=
      (Number(data.dailyGoals[today]) || data.goalMinutes * 60000);
    let cursor = todayHit ? new Date() : new Date(Date.now() - 86400000);
    let streak = 0;
    for (let i = 0; i < 366; i++) {
      const key = todayKey(cursor);
      const goal = Number(data.dailyGoals[key]) || data.goalMinutes * 60000;
      if ((Number(data.dailyTotals[key]) || 0) < goal) break;
      streak++;
      cursor.setDate(cursor.getDate() - 1);
    }
    data.streak = streak;
    if (todayHit && streak > previousStreak) {
      pendingStreakCelebration = {
        from: pendingStreakCelebration?.from ?? previousStreak,
        to: Math.max(pendingStreakCelebration?.to ?? 0, streak),
      };
    }
    data.lastPractice = todayHit
      ? today
      : (Number(data.dailyTotals[yesterday]) || 0) >=
          (Number(data.dailyGoals[yesterday]) || data.goalMinutes * 60000)
        ? yesterday
        : data.lastPractice;
    return todayHit;
  }
  function updateGoalUI() {
    const goal = data.goalMinutes * 60000;
    const elapsedToday = Math.min(dailyMilliseconds(), goal);
    const remaining = Math.max(0, goal - elapsedToday);
    const complete = remaining === 0;
    const percent = goal
      ? Math.min(100, Math.round((elapsedToday / goal) * 100))
      : 0;
    const mm = String(Math.floor(remaining / 60000)).padStart(2, "0");
    const ss = String(Math.floor((remaining % 60000) / 1000)).padStart(2, "0");
    $("#goalClock").textContent = complete ? "Done!" : `${mm}:${ss}`;
    $("#goalClockLabel").textContent = complete ? "GOAL REACHED" : "LEFT TODAY";
    $("#goalPercent").textContent = `${percent}%`;
    $("#goalRing").style.width = `${percent}%`;
    $("#goalMessage").textContent = complete
      ? "You showed up for yourself."
      : `${data.goalMinutes} minutes for you.`;
    $("#goalSubmessage").textContent = complete
      ? "Today’s goal is in the books. Lovely work."
      : roundRunning
        ? "A round is underway. Stay in your flow."
        : "One round at a time. We’ll keep track.";
    const control = $("#goalControl");
    control.classList.toggle("complete", complete);
    control.classList.toggle("paused", !roundRunning && !complete);
    $("#goalControlIcon").textContent = complete
      ? "✓"
      : roundRunning
        ? "Ⅱ"
        : "▶";
    $("#goalControlLabel").textContent = complete
      ? "Daily goal complete"
      : roundRunning
        ? "Pause practice"
        : finished
          ? "New passage"
          : input.length
            ? "Resume this round"
            : "Start a round";
    $("#goalControl").disabled = complete;
    const dot = $(".goal-dot");
    dot.classList.toggle("active", roundRunning);
    $("#goalStatus").textContent = complete
      ? "Streak saved for today"
      : roundRunning
        ? "Practice timer is running"
        : finished
          ? "Paused between rounds"
          : "Timer starts when you type";
    $("#streakValue").textContent = String(pendingStreakCelebration?.from ?? data.streak);
  }
  function updateTimerLabel() {
    const ms = currentRoundMs();
    if (mode === "time") {
      const left = Math.max(0, duration - ms / 1000);
      $("#timerValue").innerHTML = `${Math.ceil(left)}<span>s</span>`;
    } else if (mode === "zen")
      $("#timerValue").textContent =
        `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;
    else
      $("#timerValue").innerHTML = `${Math.floor(ms / 1000)}<span>s</span>`;
    const { net } = speedNow();
    $("#liveWpm").innerHTML = `${net}<span> wpm</span>`;
    $("#liveAccuracy").innerHTML = `${accuracyNow()}<span>%</span>`;
  }
  function tick() {
    if (!roundRunning) return;
    const now = Date.now();
    const delta = Math.max(0, now - lastTickAt);
    lastTickAt = now;
    const day = todayKey();
    data.dailyTotals[day] = (Number(data.dailyTotals[day]) || 0) + delta;
    if (!data.dailyGoals[day]) data.dailyGoals[day] = data.goalMinutes * 60000;
    elapsed = currentRoundMs() / 1000;
    updateTimerLabel();
    const second = Math.floor(dailyMilliseconds() / 1000);
    const elapsedSecond = Math.floor(currentRoundMs() / 1000);
    const { net: liveWpm } = speedNow();
    if (chartPoints.at(-1)?.sec !== elapsedSecond)
      chartPoints.push({ sec: elapsedSecond, wpm: liveWpm });
    else if (chartPoints.length)
      chartPoints[chartPoints.length - 1].wpm = liveWpm;
    if (second !== lastPersistSecond) {
      lastPersistSecond = second;
      updateStreak();
      persist();
      updateGoalUI();
      updateDashboard(false);
    }
    if (mode === "time" && currentRoundMs() >= duration * 1000) completeRound();
    if (mode === "zen") {
      if (target.length - input.length < 80) target += ` ${makeWords(100)}`;
      if (target.length - input.length < 300) renderText();
    }
  }
  function beginRound() {
    if (roundRunning || finished) return;
    roundRunning = true;
    roundStartedAt = Date.now();
    lastTickAt = roundStartedAt;
    if (timer) clearInterval(timer);
    timer = setInterval(tick, 200);
    $("#typingArea").classList.add("focused");
    $("#roundStatus").textContent = "You’re in your flow";
    updateGoalUI();
  }
  function pauseRound(message = "Practice paused") {
    if (!roundRunning) return;
    const stoppedAt = Date.now();
    const dailyTail = Math.max(0, stoppedAt - lastTickAt);
    if (dailyTail) data.dailyTotals[todayKey()] = (Number(data.dailyTotals[todayKey()]) || 0) + dailyTail;
    roundElapsedBeforeStart += stoppedAt - roundStartedAt;
    lastTickAt = stoppedAt;
    roundRunning = false;
    clearInterval(timer);
    timer = null;
    $("#roundStatus").textContent = message;
    $("#typingArea").classList.remove("focused");
    inputEl.blur();
    updateTimerLabel();
    updateStreak();
    updateGoalUI();
    captureModeDraft();
    persist();
  }
  function completeRound() {
    if (finished || (!roundRunning && typedAttempts === 0)) return;
    const now = Date.now();
    const runningMilliseconds = currentRoundMs();
    const activeMilliseconds = mode === "time" && runningMilliseconds >= duration * 1000 ? duration * 1000 : runningMilliseconds;
    const dailyTail = roundRunning ? Math.max(0, now - lastTickAt) : 0;
    if (dailyTail) data.dailyTotals[todayKey()] = (Number(data.dailyTotals[todayKey()]) || 0) + dailyTail;
    elapsed = activeMilliseconds / 1000;
    roundElapsedBeforeStart = activeMilliseconds;
    lastTickAt = now;
    roundRunning = false;
    if (timer) clearInterval(timer);
    timer = null;
    finished = true;
    inputEl.blur();
    $("#typingArea").classList.remove("focused");
    $("#roundStatus").textContent = "Round complete";
    const correct = currentCorrectCharacters();
    const accuracy = accuracyNow();
    const { net: wpm, raw } = speedNow();
    const record = {
      id: crypto.randomUUID(),
      wpm,
      raw,
      accuracy,
      chars: typedAttempts,
      errors: Math.max(0, typedAttempts - correctAttempts),
      formulaVersion: 2,
      correct,
      duration: Math.round(elapsed),
      activeMilliseconds: Math.round(activeMilliseconds),
      roundSeconds:
        mode === "time" ? duration : Math.max(1, Math.round(elapsed)),
      mode,
      date: new Date().toISOString(),
      practiceDate: todayKey(),
      focusLetters: focusPromptActive ? data.focusLetters : [],
    };
    delete data.modeDrafts[mode];
    data.history.unshift(record);
    data.history = data.history.slice(0, 100);
    updateStreak();
    persist();
    showResult(record);
    prepareNextPassage();
    updateDashboard();
    updateGoalUI();
    if (data.sound) playTypingSound();
    if (currentUser) void syncSession(record);
  }
  function finishRound(save = true) {
    if (roundRunning) pauseRound("Round paused");
    if (save && typedAttempts && !finished) completeRound();
  }
  function drawChart(points) {
    const svg = $("#resultChart"),
      width = 640,
      height = 100,
      pad = 7;
    const values = points.length ? points.map((p) => p.wpm) : [0],
      max = Math.max(20, ...values) * 1.1;
    const coords = values
      .map(
        (v, i) =>
          `${pad + i * ((width - pad * 2) / Math.max(1, values.length - 1))},${height - pad - (v / max) * (height - pad * 2)}`,
      )
      .join(" ");
    svg.innerHTML = `<path class="chart-grid" d="M0 28H640M0 54H640M0 80H640"/><polygon class="chart-area" points="${pad},${height - pad} ${coords} ${width - pad},${height - pad}"/><polyline class="chart-line" points="${coords}"/>`;
  }
  function showResult(record) {
    $("#resultWpm").textContent = record.wpm;
    $("#resultAccuracy").textContent = `${record.accuracy}%`;
    $("#resultRaw").textContent = record.raw;
    $("#resultChars").textContent = `${record.correct}/${record.chars}`;
    $("#resultTitle").textContent =
      record.accuracy >= 97
        ? "That was a good run."
        : record.accuracy >= 90
          ? "Nice, steady typing."
          : "Every round builds the habit.";
    $("#resultNote").textContent = record.focusLetters?.length
      ? `You gave ${record.focusLetters.map((v) => v.toUpperCase()).join(", ")} extra practice.`
      : record.accuracy >= 97
        ? "Great accuracy. Keep that rhythm going."
        : "Come back for another round when you’re ready.";
    drawChart(chartPoints);
    openResult();
  }
  function prepareNextPassage() {
    finished = false;
    input = "";
    typedAttempts = 0;
    correctAttempts = 0;
    roundElapsedBeforeStart = 0;
    roundStartedAt = 0;
    elapsed = 0;
    chartPoints = [];
    target = makeTarget(mode);
    targetMode = mode;
    inputEl.value = "";
    $("#roundStatus").textContent = "A new passage is ready";
    $("#typingArea").classList.remove("focused");
    if (mode === "time") $("#timerValue").innerHTML = `${duration}<span>s</span>`;
    else if (mode === "zen") $("#timerValue").textContent = "0:00";
    else $("#timerValue").textContent = "—";
    $("#liveWpm").innerHTML = "0<span> wpm</span>";
    $("#liveAccuracy").innerHTML = "100<span>%</span>";
    renderText();
    updateGoalUI();
    captureModeDraft();
    persist();
  }
  function openResult() {
    const overlay = $("#resultOverlay");
    overlay.classList.remove("hidden");
    overlay.setAttribute("aria-hidden", "false");
    $("#resultCloseAction").focus();
  }
  function closeResult(restoreTypingFocus = true) {
    const overlay = $("#resultOverlay");
    overlay.classList.add("hidden");
    overlay.setAttribute("aria-hidden", "true");
    if (finished) restart(true, false);
    else if (restoreTypingFocus) inputEl.focus();
    if (restoreTypingFocus && pendingStreakCelebration) {
      const { from, to } = pendingStreakCelebration;
      pendingStreakCelebration = null;
      showStreakCelebration(to, from);
    }
  }
  function restart(focus = true, newPassage = true) {
    delete data.modeDrafts[mode];
    if (timer) clearInterval(timer);
    timer = null;
    roundRunning = false;
    finished = false;
    input = "";
    typedAttempts = 0;
    correctAttempts = 0;
    roundElapsedBeforeStart = 0;
    roundStartedAt = 0;
    elapsed = 0;
    chartPoints = [];
    closeResult(false);
    if (newPassage || !target || targetMode !== mode) {
      target = makeTarget(mode);
      targetMode = mode;
    }
    if (newPassage) clearPassageSettingsPending();
    inputEl.value = "";
    $("#liveWpm").innerHTML = "0<span> wpm</span>";
    $("#liveAccuracy").innerHTML = "100<span>%</span>";
    $("#timerValue").innerHTML =
      mode === "time"
        ? `${duration}<span>s</span>`
        : mode === "zen"
          ? "0:00"
          : "—";
    $("#roundStatus").textContent = "Start whenever you’re ready";
    $("#typingArea").classList.remove("focused");
    renderText();
    updateGoalUI();
    persist();
    if (focus) {
      inputEl.focus();
      $("#typingArea").classList.add("focused");
    } else inputEl.blur();
  }
  function updateDashboard(updateProgress = true) {
    const best = Math.max(0, ...data.history.map((row) => Number(row.wpm) || 0));
    $("#streakValue").textContent = String(pendingStreakCelebration?.from ?? data.streak);
    if (updateProgress) {
      $("#progressBest").textContent = best || "—";
      $("#progressTests").textContent = data.history.length;
      $("#progressAverage").textContent = data.history.length ? Math.round(data.history.reduce((sum, row) => sum + (Number(row.wpm) || 0), 0) / data.history.length) : "—";
      $("#progressAccuracy").textContent = data.history.length ? Math.max(...data.history.map((row) => Number(row.accuracy) || 0)) : "—";
      renderHistory();
    }
    updateGoalUI();
  }
  function renderHistory() {
    const list = $("#historyList"), chart = $("#progressChart"), labels = $("#progressChartLabels");
    const modeLabels = new Map([["time", "Timed"], ["words", "Words"], ["zen", "Free type"], ["quote", "Quote"]]);
    const seen = new Set(), recent = [];
    for (const row of [...data.history].sort((a, b) => new Date(b.date) - new Date(a.date))) {
      const parsedSpeed = Number(row.wpm);
      const speed = Number.isFinite(parsedSpeed) ? Math.max(0, parsedSpeed) : 0;
      if (seen.has(speed)) continue;
      const parsedAccuracy = Number(row.accuracy);
      const parsedDate = new Date(row.date);
      seen.add(speed); recent.push({
        ...row,
        wpm: speed,
        accuracy: Number.isFinite(parsedAccuracy) ? Math.min(100, Math.max(0, parsedAccuracy)) : 100,
        mode: modeLabels.get(row.mode) || "Practice",
        date: Number.isNaN(parsedDate.getTime()) ? new Date(0).toISOString() : parsedDate.toISOString(),
      });
      if (recent.length === 10) break;
    }
    $("#paceCount").textContent = `${recent.length} / 10`;
    if (!recent.length) {
      list.innerHTML = '<div class="history-empty">Your rounds will show up here. Start with a quick 30-second practice.</div>';
      chart.replaceChildren(); labels.replaceChildren();
      $("#progressObservation").textContent = "Finish a round and your pace will appear here.";
      return;
    }
    const chronological = recent.slice().reverse();
    const max = Math.max(20, ...chronological.map((row) => row.wpm)) * 1.15;
    $("#paceAxisTop").textContent = Math.round(max);
    $("#paceAxisMid").textContent = Math.round(max / 2);
    const points = chronological.map((row, i) => ({ x: chronological.length === 1 ? 350 : 24 + i * 652 / (chronological.length - 1), y: 174 - row.wpm / max * 148, row }));
    const path = points.map((point) => `${point.x},${point.y}`).join(" ");
    chart.innerHTML = `<path class="pace-gridline" d="M24 28H676M24 78H676M24 128H676M24 178H676"/><polygon class="pace-area" points="24,180 ${path} 676,180"/><polyline class="pace-line" points="${path}"/>${points.map((point) => `<circle class="pace-point" cx="${point.x}" cy="${point.y}" r="4"/>`).join("")}`;
    labels.innerHTML = points.map(({ row }) => `<span><i>${row.mode}</i><small>${new Date(row.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</small></span>`).join("");
    const bestWpm = Math.max(1, ...recent.map((row) => row.wpm));
    list.innerHTML = recent.map((row, i) => `<article class="unique-round"><span class="unique-round-number">${String(i + 1).padStart(2, "0")}</span><div class="unique-round-content"><div class="unique-round-top"><strong>${row.wpm}<small> wpm</small></strong><span>${row.accuracy ?? 100}% accuracy</span></div><div class="unique-round-track"><i style="width:${Math.max(3, Math.round(row.wpm / bestWpm * 100))}%"></i></div><small class="unique-round-meta">${row.mode} · ${new Date(row.date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</small></div></article>`).join("");
    if (recent.length < 2) $("#progressObservation").textContent = "Your first distinct pace is on the board. A few more rounds will bring the line to life.";
    else {
      const difference = recent[0].wpm - recent[1].wpm;
      $("#progressObservation").textContent = difference > 0 ? `Your latest unique speed is up ${difference} wpm from the one before.` : difference < 0 ? `Your latest unique speed is ${Math.abs(difference)} wpm below the one before. Keep practicing at your own pace.` : "Two distinct speeds, side by side. Keep finding your rhythm.";
    }
  }
  function renderTextOptions() {
    $("#focusLetterInput").value = data.focusLetters.join("");
    $("#clearLetters").setAttribute("aria-disabled", String(!data.focusLetters.length));
    $("#uppercaseToggle").setAttribute("aria-pressed", String(data.uppercase));
    $("#punctuationToggle").setAttribute("aria-pressed", String(punctuation));
    $("#numbersToggle").setAttribute("aria-pressed", String(numbers));
  }
  function notify(message) {
    const toast = $("#toast");
    toast.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2300);
  }
  function clearPassageSettingsPending() {
    data.passageSettingsPending = false;
    persist();
    $("#restartButton").classList.remove("has-pending-changes");
    $("#restartButton").title = "Generate a new passage";
  }
  function applyNextPassageSettings() {
    if (focusFilterTimer) clearTimeout(focusFilterTimer);
    focusFilterTimer = null;
    restart(false, true);
    captureModeDraft();
  }
  let settingsReturnFocus = null;
  function openSettings() {
    syncPracticeFont();
    settingsReturnFocus = document.activeElement;
    $("#settingsPanel").classList.add("open");
    $("#scrim").classList.add("visible");
    $("#settingsPanel").setAttribute("aria-hidden", "false");
    $("#closeSettings").focus();
  }
  function closeSettings() {
    $("#settingsPanel").classList.remove("open");
    $("#scrim").classList.remove("visible");
    $("#settingsPanel").setAttribute("aria-hidden", "true");
    if (settingsReturnFocus instanceof HTMLElement) settingsReturnFocus.focus();
  }

  function fingerForKey(key) {
    const map = {
      "left-pinky": "1qaz",
      "left-ring": "2wsx",
      "left-middle": "3edc",
      "left-index": "45rtfgvb",
      "right-index": "67yuhjnm",
      "right-middle": "8ik,",
      "right-ring": "9ol.",
      "right-pinky": "0p;/-=[]\\",
    };
    const char = key.toLowerCase();
    return (
      Object.entries(map).find(([, keys]) => keys.includes(char))?.[0] ||
      "thumb"
    );
  }
  function renderLessonKeyboard() {
    const rows = ["1234567890", "qwertyuiop", "asdfghjkl;", "zxcvbnm,./"];
    const homeRow = new Set("asdfghjkl;".split(""));
    const lessonKeys = new Set(lessons[activeLesson].keys.map((key) => key.toLowerCase()));
    const board = $("#lessonKeyboard");
    board.replaceChildren();
    rows.forEach((row, index) => {
      const rowEl = document.createElement("div");
      rowEl.className = `keyboard-row row-${index}`;
      [...row].forEach((key) => {
        const keyEl = document.createElement("button");
        keyEl.type = "button";
        keyEl.className = `keyboard-key ${fingerForKey(key)}`;
        if (homeRow.has(key.toLowerCase())) keyEl.classList.add("home-anchor");
        const isLessonKey = lessonKeys.has(key.toLowerCase());
        if (isLessonKey) keyEl.classList.add("lesson-key");
        else keyEl.disabled = true;
        const wasPracticed = practicedLessonKeys.has(key.toLowerCase());
        keyEl.classList.toggle("key-practiced", wasPracticed);
        keyEl.setAttribute("aria-pressed", String(wasPracticed));
        keyEl.textContent = key.toUpperCase();
        keyEl.setAttribute(
          "aria-label",
          `${key}, ${keyEl.classList[1].replace("-", " ")} finger${isLessonKey ? ". Click to mark this key." : ". Not in this lesson."}`,
        );
        if (isLessonKey) keyEl.addEventListener("click", () => toggleLessonKey(key.toLowerCase(), keyEl));
        rowEl.append(keyEl);
      });
      board.append(rowEl);
    });
    const spaceRow = document.createElement("div");
    spaceRow.className = "keyboard-row space-row";
    const space = document.createElement("button");
    space.type = "button";
    space.className = "keyboard-key thumb home-anchor lesson-key space-key";
    space.classList.toggle("key-practiced", practicedLessonKeys.has(" "));
    space.setAttribute("aria-pressed", String(practicedLessonKeys.has(" ")));
    space.textContent = "SPACE · THUMB";
    space.setAttribute("aria-label", "Space bar, thumb");
    space.addEventListener("click", () => toggleLessonKey(" ", space));
    spaceRow.append(space);
    board.append(spaceRow);
  }
  function toggleLessonKey(key, button) {
    if (practicedLessonKeys.has(key)) practicedLessonKeys.delete(key);
    else practicedLessonKeys.add(key);
    const practiced = practicedLessonKeys.has(key);
    button.classList.toggle("key-practiced", practiced);
    button.setAttribute("aria-pressed", String(practiced));
  }
  function selectLesson(key) {
    activeLesson = key;
    practicedLessonKeys = new Set();
    const lesson = lessons[key];
    $$(".lesson-step").forEach((button) =>
      button.classList.toggle("active", button.dataset.lesson === key),
    );
    $("#lessonCounter").textContent =
      `LESSON ${lessonOrder.indexOf(key) + 1} OF ${lessonOrder.length} · ${lesson.label}`;
    $("#lessonTitle").textContent = lesson.title;
    $("#lessonDescription").textContent = lesson.description;
    $("#lessonTip").textContent = lesson.tip;
    $("#nextLesson").innerHTML =
      key === "bottom"
        ? "Back to home <span>↶</span>"
        : "Next lesson <span>→</span>";
    renderLessonKeyboard();
  }

  function sessionPayload(record, userId) {
    return {
      user_id: userId,
      client_session_id: record.id,
      practice_date: record.practiceDate || todayKey(new Date(record.date)),
      mode: record.mode,
      round_seconds: record.roundSeconds || record.duration || 1,
      active_milliseconds: Math.max(0, Number(record.activeMilliseconds) || Math.round((record.duration || 0) * 1000)),
      words_per_minute: record.wpm || 0,
      raw_wpm: record.raw || 0,
      accuracy: record.accuracy ?? 100,
      correct_characters: record.correct || 0,
      total_characters: record.chars || 0,
      focus_letters: record.focusLetters || [],
      created_at: record.date || new Date().toISOString(),
    };
  }
  async function syncSession(record) {
    const user = currentUser;
    if (!supabase || !user) return;
    const { error } = await supabase
      .from("typing_sessions")
      .upsert(sessionPayload(record, user.id), {
        onConflict: "user_id,client_session_id",
      });
    if (currentUser?.id !== user.id) return;
    if (error) {
      console.error("Round sync failed:", error.message);
      notify("Round saved here. Cloud sync will retry when you sign in again.");
      return;
    }
    await syncDailyPractice(record.practiceDate || todayKey(), user);
  }
  async function syncDailyPractice(day = todayKey(), user = currentUser) {
    if (!supabase || !user) return;
    const active = Number(data.dailyTotals[day]) || 0;
    const goal = Number(data.dailyGoals[day]) || data.goalMinutes * 60000;
    const reached = active >= goal;
    const { error } = await supabase.from("daily_practice").upsert(
      {
        user_id: user.id,
        practice_date: day,
        active_milliseconds: active,
        goal_milliseconds: goal,
        goal_reached_at: reached ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,practice_date" },
    );
    if (error) console.error("Daily practice sync failed:", error.message);
  }
  async function syncPreferences(user = currentUser) {
    if (!supabase || !user) return;
    const { error } = await supabase.from("user_preferences").upsert(
      {
        user_id: user.id,
        daily_goal_minutes: data.goalMinutes,
        round_seconds: duration,
        focus_letters: data.focusLetters,
        caps_lock: data.uppercase,
        include_punctuation: data.letterPunctuation,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
    if (error) console.error("Preference sync failed:", error.message);
  }
  async function syncLocalData(user = currentUser) {
    if (!supabase || !user) return;
    currentUser = user;
    const generation = activateUserStore(user);
    const isCurrentScope = () => storeGeneration === generation && currentUser?.id === user.id;
    const { data: remotePrefs, error: prefsError } = await supabase
      .from("user_preferences")
      .select("*")
      .maybeSingle();
    if (!isCurrentScope()) return;
    if (prefsError)
      console.error("Preference read failed:", prefsError.message);
    if (remotePrefs) {
      data.goalMinutes = remotePrefs.daily_goal_minutes;
      data.roundSeconds = remotePrefs.round_seconds;
      data.focusLetters = remotePrefs.focus_letters || [];
      data.uppercase = Boolean(remotePrefs.caps_lock);
      data.letterPunctuation = Boolean(remotePrefs.include_punctuation);
      punctuation = data.letterPunctuation;
      data.punctuation = punctuation;
      duration = data.roundSeconds;
    }
    for (const record of data.history)
      if (!record.id) record.id = crypto.randomUUID();
    const { data: remoteSessions, error: sessionsError } = await supabase
      .from("typing_sessions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (!isCurrentScope()) return;
    if (sessionsError)
      console.error("Round history read failed:", sessionsError.message);
    if (remoteSessions) {
      const localIds = new Set(data.history.map((record) => record.id));
      for (const row of remoteSessions) {
        if (localIds.has(row.client_session_id)) continue;
        data.history.push({
          id: row.client_session_id,
          wpm: Number(row.words_per_minute),
          raw: Number(row.raw_wpm),
          accuracy: Number(row.accuracy),
          chars: row.total_characters,
          correct: row.correct_characters,
          duration: Math.round(Number(row.active_milliseconds) / 1000),
          roundSeconds: row.round_seconds,
          mode: row.mode,
          date: row.created_at,
          practiceDate: row.practice_date,
          focusLetters: row.focus_letters || [],
        });
      }
    }
    const { data: remoteDays, error: daysError } = await supabase
      .from("daily_practice")
      .select("*");
    if (!isCurrentScope()) return;
    if (daysError)
      console.error("Daily totals read failed:", daysError.message);
    if (remoteDays)
      for (const row of remoteDays) {
        const day = row.practice_date;
        data.dailyTotals[day] = Math.max(
          Number(data.dailyTotals[day]) || 0,
          Number(row.active_milliseconds) || 0,
        );
        data.dailyGoals[day] =
          Number(row.goal_milliseconds) || data.goalMinutes * 60000;
      }
    data.history.sort((a, b) => new Date(b.date) - new Date(a.date));
    data.history = data.history.slice(0, 200);
    persist();
    applySavedPreferences();
    updateStreak();
    updateDashboard();
    renderTextOptions();
    const sessionRows = data.history.map((record) =>
      sessionPayload(record, user.id),
    );
    if (sessionRows.length) {
      const { error } = await supabase
        .from("typing_sessions")
        .upsert(sessionRows, { onConflict: "user_id,client_session_id" });
      if (!isCurrentScope()) return;
      if (error) console.error("Local round sync failed:", error.message);
    }
    const dayRows = Object.keys(data.dailyTotals).map((day) => ({
      user_id: user.id,
      practice_date: day,
      active_milliseconds: Number(data.dailyTotals[day]) || 0,
      goal_milliseconds:
        Number(data.dailyGoals[day]) || data.goalMinutes * 60000,
      updated_at: new Date().toISOString(),
    }));
    if (dayRows.length) {
      const { error } = await supabase
        .from("daily_practice")
        .upsert(dayRows, { onConflict: "user_id,practice_date" });
      if (!isCurrentScope()) return;
      if (error) console.error("Local goal sync failed:", error.message);
    }
    if (!isCurrentScope()) return;
    await syncPreferences(user);
  }
  function applySavedPreferences() {
    syncPracticeFont();
    $$("#durationChoices .choice").forEach((button) =>
      button.classList.toggle(
        "selected",
        Number(button.dataset.value) === duration,
      ),
    );
    $$("#dailyGoalChoices button").forEach((button) =>
      button.classList.toggle(
        "selected",
        Number(button.dataset.value) === data.goalMinutes,
      ),
    );
    $("#timerValue").innerHTML =
      mode === "time" ? `${duration}<span>s</span>` : "—";
    persist();
    updateGoalUI();
  }
  function updateAccountUI(user) {
    currentUser = user || null;
    const label = $("#profileButton").querySelector("span:nth-child(2)");
    const avatar = $("#profileButton").querySelector(".avatar");
    label.textContent = currentUser ? currentUser.email : "Guest";
    $("#profileButton").setAttribute(
      "aria-label",
      currentUser ? `Account: ${currentUser.email}` : "Guest profile. Click to sign in.",
    );
    avatar.textContent = currentUser
      ? (currentUser.email?.[0] || "M").toUpperCase()
      : "M";
    $("#authForm").classList.toggle("hidden", Boolean(currentUser));
    $("#signOutButton").classList.toggle("hidden", !currentUser);
    $("#authEyebrow").textContent = currentUser ? "YOUR ACCOUNT" : "YOUR PRACTICE, EVERYWHERE";
    $("#authTitle").textContent = currentUser ? "You’re all set." : "Sign in";
    $("#authSubtitle").textContent = currentUser ? "Your practice is syncing." : "Save your rounds and streak across devices.";
    $("#closeAuth").setAttribute("aria-label", currentUser ? "Close account" : "Close sign in");
    $("#authAccount").textContent = currentUser?.email || "";
    $("#authAccount").classList.toggle("hidden", !currentUser);
    $("#authMessage").textContent = "";
    $("#authOverlay").classList.toggle("is-account", Boolean(currentUser));
  }
  function openAuth() {
    updateAccountUI(currentUser);
    $("#authOverlay").classList.remove("hidden");
    $("#authOverlay").setAttribute("aria-hidden", "false");
    if (!currentUser) $("#authEmail").focus();
    else $("#signOutButton").focus();
  }
  function closeAuth() {
    $("#authOverlay").classList.add("hidden");
    $("#authOverlay").setAttribute("aria-hidden", "true");
  }
  let feedbackReturnFocus = null;
  function openFeedback() {
    feedbackReturnFocus = document.activeElement;
    $("#feedbackStatus").textContent = "";
    $("#feedbackStatus").classList.remove("error");
    $("#feedbackEmail").value = currentUser?.email || "";
    $("#feedbackOverlay").classList.remove("hidden");
    $("#feedbackOverlay").setAttribute("aria-hidden", "false");
    $("#feedbackMessageInput").focus();
  }
  function closeFeedback() {
    $("#feedbackOverlay").classList.add("hidden");
    $("#feedbackOverlay").setAttribute("aria-hidden", "true");
    if (feedbackReturnFocus instanceof HTMLElement) feedbackReturnFocus.focus();
  }

  function dailyControl() {
    if (
      data.streak >= 0 &&
      dailyMilliseconds() >=
        (Number(data.dailyGoals[todayKey()]) || data.goalMinutes * 60000)
    ) {
      notify("You’ve completed today’s practice goal. See you tomorrow!");
      return;
    }
    if (roundRunning) {
      pauseRound();
      return;
    }
    if (finished) {
      restart(true, true);
      notify("A new passage is ready when you are.");
      return;
    }
    if (input.length === 0) {
      restart(true, false);
      notify("Type a few words to start your practice timer.");
      return;
    }
    roundRunning = true;
    roundStartedAt = Date.now();
    lastTickAt = roundStartedAt;
    timer = setInterval(tick, 200);
    $("#typingArea").classList.add("focused");
    inputEl.focus();
    $("#roundStatus").textContent = "You’re back in your flow";
    updateGoalUI();
  }
  $$(".mode-tab").forEach((button) =>
    button.addEventListener("click", () => setMode(button.dataset.mode)),
  );
  $$("#durationChoices .choice").forEach((button) =>
    button.addEventListener("click", () => {
      duration = Number(button.dataset.value);
      data.roundSeconds = duration;
      $$("#durationChoices .choice").forEach((item) =>
        item.classList.toggle("selected", item === button),
      );
      persist();
      void syncPreferences();
      const currentPassage = target;
      restart(false, false);
      target = currentPassage;
      renderText();
      captureModeDraft();
    }),
  );
  $$("#wordChoices .choice").forEach((button) =>
    button.addEventListener("click", () => {
      wordCount = Number(button.dataset.value);
      data.wordCount = wordCount;
      persist();
      $$("#wordChoices .choice").forEach((item) =>
        item.classList.toggle("selected", item === button),
      );
      restart(false, true);
      captureModeDraft();
    }),
  );
  $("#punctuationToggle").addEventListener("click", (event) => {
    punctuation = !punctuation;
    data.punctuation = punctuation;
    data.letterPunctuation = punctuation;
    event.currentTarget.setAttribute("aria-pressed", String(punctuation));
    persist();
    void syncPreferences();
    applyNextPassageSettings();
  });
  $("#numbersToggle").addEventListener("click", (event) => {
    numbers = !numbers;
    data.numbers = numbers;
    event.currentTarget.setAttribute("aria-pressed", String(numbers));
    persist();
    applyNextPassageSettings();
  });
  $("#uppercaseToggle").addEventListener("click", (event) => {
    data.uppercase = !data.uppercase;
    event.currentTarget.setAttribute("aria-pressed", String(data.uppercase));
    persist();
    void syncPreferences();
    applyNextPassageSettings();
  });
  $("#focusLetterInput").addEventListener("input", (event) => {
    data.focusLetters = [...new Set((event.currentTarget.value.toLowerCase().match(/[a-z]/g) || []))].slice(0, 5);
    event.currentTarget.value = data.focusLetters.join("");
    persist();
    void syncPreferences();
    if (focusFilterTimer) clearTimeout(focusFilterTimer);
    if (mode !== "quote") focusFilterTimer = setTimeout(() => {
      focusFilterTimer = null;
      applyNextPassageSettings();
    }, 180);
  });
  $("#clearLetters").addEventListener("click", () => {
    if (!data.focusLetters.length) return;
    if (focusFilterTimer) clearTimeout(focusFilterTimer);
    focusFilterTimer = null;
    data.focusLetters = [];
    persist();
    void syncPreferences();
    renderTextOptions();
    if (mode !== "quote") {
      applyNextPassageSettings();
    }
  });
  $("#restartButton").addEventListener("click", () => restart(true));
  $("#closeResult").addEventListener("click", closeResult);
  $("#resultCloseAction").addEventListener("click", closeResult);
  $("#resultBackdrop").addEventListener("click", closeResult);
  $("#closeStreakCelebration").addEventListener("click", closeStreakCelebration);
  $("#streakCelebration").addEventListener("keydown", (event) => {
    if (event.key === "Escape" || event.code === "Space") {
      event.preventDefault();
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      $("#closeStreakCelebration").focus();
    }
  });
  $("#closeAuth").addEventListener("click", closeAuth);
  $("#authBackdrop").addEventListener("click", closeAuth);
  $("#authForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!supabase) {
      $("#authMessage").textContent = supabaseConfigError || "Sign-in is unavailable right now.";
      return;
    }
    const button = $("#authSubmit");
    button.disabled = true;
    $("#authMessage").textContent = "Sending your secure sign-in link…";
    let error = null;
    try {
      ({ error } = await supabase.auth.signInWithOtp({
        email: $("#authEmail").value.trim(),
        options: { emailRedirectTo: window.location.origin },
      }));
    } catch {
      error = { message: "We couldn’t reach Supabase. Check your connection and try again." };
    }
    button.disabled = false;
    const invalidKey = error?.message?.toLowerCase().includes("invalid api key");
    $("#authMessage").textContent = error
      ? invalidKey
        ? "Supabase rejected the API key. Check that the Vercel URL and publishable/anon key belong to the same Supabase project, then redeploy."
        : error.message
      : "Check your email for the sign-in link.";
  });
  $("#signOutButton").addEventListener("click", async () => {
    if (supabase) {
      const { error } = await supabase.auth.signOut();
      if (error) notify(error.message);
      else {
        updateAccountUI(null);
        activateUserStore(null);
        closeAuth();
        notify("Signed out");
      }
    }
  });
  document.addEventListener("keydown", (event) => {
    if (event.code !== "Space") return;
    const textEntry = event.target instanceof HTMLElement &&
      event.target.matches('input:not([type="range"]),textarea,select,[contenteditable="true"]');
    if (textEntry) return;
    const popupOpen = !$("#resultOverlay").classList.contains("hidden") ||
      !$("#authOverlay").classList.contains("hidden") ||
      !$("#feedbackOverlay").classList.contains("hidden") ||
      $("#streakCelebration").classList.contains("show") ||
      $("#settingsPanel").classList.contains("open");
    if (popupOpen) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      $("#streakCelebration").classList.contains("show")
    ) {
      event.preventDefault();
      return;
    }
    if (
      event.key === "Escape" &&
      !$("#resultOverlay").classList.contains("hidden")
    ) {
      closeResult();
      return;
    }
    if (
      event.key === "Escape" &&
      !$("#authOverlay").classList.contains("hidden")
    ) {
      closeAuth();
      return;
    }
    if (event.key === "Escape" && !$("#feedbackOverlay").classList.contains("hidden")) {
      closeFeedback();
      return;
    }
  });
  $("#typingArea").addEventListener("click", () => {
    if ($("#practiceView").classList.contains("hidden") || finished) return;
    inputEl.focus({ preventScroll: true });
    if (document.activeElement === inputEl)
      $("#typingArea").classList.add("focused");
  });
  inputEl.addEventListener("focus", () => {
    if (!$("#practiceView").classList.contains("hidden") && !finished)
      $("#typingArea").classList.add("focused");
    if (!roundRunning && !finished) $("#roundStatus").textContent = "Ready when you are";
  });
  inputEl.addEventListener("blur", (event) => {
    $("#typingArea").classList.remove("focused");
    if (roundRunning && event.relatedTarget?.closest?.("#goalControl")) return;
    if (roundRunning) pauseRound("Paused when you left the typing area");
  });
  inputEl.addEventListener("input", () => {
    if ($("#practiceView").classList.contains("hidden")) {
      inputEl.value = input;
      return;
    }
    if (finished) return;
    const next = inputEl.value.slice(0, target.length);
    let shared = 0;
    while (shared < input.length && shared < next.length && input[shared] === next[shared]) shared++;
    for (let i = shared; i < next.length; i++) {
      typedAttempts++;
      if (next[i] === target[i]) correctAttempts++;
    }
    input = next;
    inputEl.value = input;
    if (input.length && !roundRunning) beginRound();
    if (mode === "zen" && target.length - input.length < 50) target += ` ${makeWords(150)}`;
    renderText();
    updateTimerLabel();
    if (!finished) captureModeDraft();
  });
  inputEl.addEventListener("keydown", (event) => {
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey && !event.repeat) playTypingSound();
    if (event.key === "Escape") {
      event.preventDefault();
      if (mode === "zen" && input.length) completeRound();
      else if (roundRunning) pauseRound();
      else inputEl.blur();
    }
  });
  $("#goalControl").addEventListener("click", dailyControl);
  let tabArmed = false, tabShortcutTimer = null;
  document.addEventListener("keydown", (event) => {
    const practiceAvailable = !$("#practiceView").classList.contains("hidden") &&
      $("#settingsPanel").classList.contains("open") === false &&
      $("#authOverlay").classList.contains("hidden") &&
      $("#feedbackOverlay").classList.contains("hidden") &&
      !$("#streakCelebration").classList.contains("show") &&
      $("#resultOverlay").classList.contains("hidden");
    const editing =
      event.target instanceof HTMLElement &&
      event.target.matches(
        'input,textarea,select,button,a,[contenteditable="true"]',
      );
    if (
      !editing &&
      practiceAvailable &&
      !event.ctrlKey &&
      !event.metaKey &&
      !event.altKey &&
      event.key.length === 1
    ) {
      event.preventDefault();
      playTypingSound();
      inputEl.focus();
      inputEl.value += event.key;
      inputEl.dispatchEvent(new Event("input", { bubbles: true }));
    }
    const typingHasFocus = event.target === inputEl || event.target === $("#typingArea");
    if (event.key === "Tab" && practiceAvailable && typingHasFocus) {
      event.preventDefault();
      tabArmed = true;
      clearTimeout(tabShortcutTimer);
      tabShortcutTimer = setTimeout(() => (tabArmed = false), 1200);
    } else if (tabArmed && practiceAvailable && event.key === "Enter") {
      event.preventDefault();
      event.stopPropagation();
      tabArmed = false;
      clearTimeout(tabShortcutTimer);
      restart(true);
    } else if (tabArmed && event.key !== "Shift") {
      tabArmed = false;
      clearTimeout(tabShortcutTimer);
    }
    if (
      event.key === "Escape" &&
      $("#settingsPanel").classList.contains("open")
    )
      closeSettings();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && roundRunning)
      pauseRound("Paused while you were away");
  });
  window.addEventListener("storage", (event) => {
    if (event.key === storeKey && event.newValue) {
      try {
        const incoming = JSON.parse(event.newValue);
        Object.assign(data, incoming);
        document.body.dataset.palette = data.colorPalette || "garden";
        document.body.classList.toggle("dark", data.theme === "dark");
        $$(".palette-choice").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.palette === data.colorPalette)));
        updateDashboard();
        renderTextOptions();
      } catch {}
    }
  });
  $("#themeToggle").addEventListener("click", () => {
    document.body.classList.toggle("dark");
    data.theme = document.body.classList.contains("dark") ? "dark" : "light";
    persist();
  });
  $("#settingsToggle").addEventListener("click", openSettings);
  $("#closeSettings").addEventListener("click", closeSettings);
  $("#scrim").addEventListener("click", closeSettings);
  $("#paletteChoices").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-palette]");
    if (!button) return;
    data.colorPalette = button.dataset.palette;
    document.body.dataset.palette = data.colorPalette;
    $$(".palette-choice").forEach((item) => item.setAttribute("aria-pressed", String(item === button)));
    persist();
  });
  $("#soundSetting").checked = data.sound;
  $("#soundStyleSetting").value = data.soundStyle;
  $("#soundVolumeSetting").value = String(Math.round(data.soundVolume * 100));
  $("#soundVolumeValue").textContent = `${Math.round(data.soundVolume * 100)}%`;
  $("#musicSetting").checked = data.musicEnabled;
  $("#musicVolumeSetting").value = String(Math.round(data.musicVolume * 100));
  $("#musicVolumeValue").textContent = `${Math.round(data.musicVolume * 100)}%`;
  $("#soundSetting").addEventListener("change", (event) => {
    data.sound = event.target.checked;
    persist();
    notify(event.target.checked ? "Typing sounds are on" : "Sound effects are off");
  });
  $("#soundStyleSetting").addEventListener("change", (event) => {
    data.soundStyle = event.target.value;
    persist();
  });
  $("#previewSound").addEventListener("click", () => playTypingSound($("#soundStyleSetting").value, true));
  $("#soundVolumeSetting").addEventListener("input", (event) => {
    data.soundVolume = Math.min(1, Math.max(0, Number(event.target.value) / 100));
    for (const pool of Object.values(soundPlayers))
      for (const audio of pool) audio.volume = data.soundVolume;
    $("#soundVolumeValue").textContent = `${Math.round(data.soundVolume * 100)}%`;
    persist();
  });
  $("#soundVolumeSetting").addEventListener("change", () => playTypingSound(data.soundStyle, true));
  $("#musicSetting").addEventListener("change", (event) => {
    data.musicEnabled = event.target.checked;
    persist();
    if (data.musicEnabled) {
      backgroundMusic.volume = data.musicVolume;
      void backgroundMusic.play().catch(() => notify("Your browser could not start music yet."));
    } else backgroundMusic.pause();
  });
  $("#musicVolumeSetting").addEventListener("input", (event) => {
    data.musicVolume = Math.min(1, Math.max(0, Number(event.target.value) / 100));
    backgroundMusic.volume = data.musicVolume;
    $("#musicVolumeValue").textContent = `${Math.round(data.musicVolume * 100)}%`;
    persist();
  });
  $("#musicVolumeSetting").addEventListener("change", () => {
    if (data.musicEnabled && backgroundMusic.paused)
      void backgroundMusic.play().catch(() => notify("Your browser could not start music yet."));
  });
  $("#liveSetting").addEventListener("change", (event) => {
    data.showLive = event.target.checked;
    $("#liveStats").classList.toggle("hidden", !data.showLive);
    persist();
  });
  $("#fontSetting").addEventListener("change", (event) => {
    data.font = Number(event.target.value);
    syncPracticeFont();
    persist();
  });
  $("#dailyGoalChoices").addEventListener("click", (event) => {
    const button = event.target.closest("button[data-value]");
    if (!button) return;
    data.goalMinutes = Number(button.dataset.value);
    data.dailyGoals[todayKey()] = data.goalMinutes * 60000;
    $$("#dailyGoalChoices button").forEach((item) =>
      item.classList.toggle("selected", item === button),
    );
    updateStreak();
    persist();
    updateDashboard();
    void syncPreferences();
    void syncDailyPractice();
    notify(`Daily goal set to ${data.goalMinutes} minutes`);
  });
  $("#profileButton").addEventListener("click", openAuth);
  $("#feedbackButton").addEventListener("click", openFeedback);
  $("#closeFeedback").addEventListener("click", closeFeedback);
  $("#feedbackBackdrop").addEventListener("click", closeFeedback);
  $("#feedbackMessageInput").addEventListener("input", (event) => {
    $("#feedbackCount").textContent = `${event.currentTarget.value.length} / 2000`;
  });
  $("#feedbackForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = $("#feedbackMessageInput").value.trim();
    const category = $("#feedbackCategory").value;
    const contactEmail = $("#feedbackEmail").value.trim();
    const button = $("#feedbackSubmit");
    const status = $("#feedbackStatus");
    status.classList.remove("error");
    if ($("#feedbackWebsite").value.trim()) {
      form.reset();
      $("#feedbackCount").textContent = "0 / 2000";
      status.textContent = "Thanks for sharing your feedback.";
      return;
    }
    if (!supabase) {
      status.textContent = supabaseConfigError || "Feedback isn’t available right now. Please try again later.";
      status.classList.add("error");
      return;
    }
    button.disabled = true;
    button.textContent = "Sending…";
    status.textContent = "";
    let submissionError = null;
    try {
      const { error } = await supabase.from("user_feedback").insert({
        user_id: currentUser?.id || null,
        category,
        message,
        contact_email: contactEmail || null,
      });
      submissionError = error;
    } catch {
      submissionError = true;
    } finally {
      button.disabled = false;
      button.innerHTML = "Send feedback <span>→</span>";
    }
    if (submissionError) {
      console.warn("Feedback submission failed:", submissionError.code || "request_error");
      const errorText = String(submissionError.message || "").toLowerCase();
      status.textContent = errorText.includes("invalid api key")
        ? "Supabase rejected the API key. Check the matching Vercel URL and publishable/anon key, then redeploy."
        : submissionError.code === "PGRST205" || errorText.includes("user_feedback")
          ? "Feedback isn’t set up in Supabase yet. Run supabase/schema.sql in its SQL Editor."
          : "We couldn’t send that just now. Please check your connection and try again.";
      status.classList.add("error");
      return;
    }
    form.reset();
    $("#feedbackCount").textContent = "0 / 2000";
    status.textContent = "Thanks — your note was sent. We appreciate you taking the time.";
  });
  $("#feedbackOverlay").addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = [...$("#feedbackOverlay").querySelectorAll('button:not(:disabled),input:not([tabindex="-1"]),select,textarea')];
    if (!focusable.length) return;
    const first = focusable[0], last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
  $("#clearHistory").addEventListener("click", () => {
    data.history = [];
    persist();
    updateDashboard();
    notify("Round history cleared");
  });
  function showView(view, scroll = true) {
    const views = { practice: "#practiceView", learn: "#learnView", progress: "#progressView" };
    if (view !== "practice") {
      if (roundRunning) pauseRound("Paused when you left practice");
      inputEl.blur();
    }
    for (const [name, selector] of Object.entries(views)) $(selector).classList.toggle("hidden", name !== view);
    $$(".nav-link").forEach((nav) => {
      const active = nav.dataset.view === view;
      nav.classList.toggle("active", active);
      if (active) nav.setAttribute("aria-current", "page");
      else nav.removeAttribute("aria-current");
    });
    if (scroll) window.scrollTo({ top: 0, behavior: "smooth" });
  }
  $$(".nav-link").forEach((button) => button.addEventListener("click", () => showView(button.dataset.view)));
  $(".brand").addEventListener("click", (event) => {
    event.preventDefault();
    showView("practice");
  });
  $$(".lesson-step").forEach((button) =>
    button.addEventListener("click", () => selectLesson(button.dataset.lesson)),
  );
  $("#nextLesson").addEventListener("click", () => {
    const next = (lessonOrder.indexOf(activeLesson) + 1) % lessonOrder.length;
    selectLesson(lessonOrder[next]);
  });
  $("#lessonDrill").addEventListener("click", () => {
    data.focusLetters = lessons[activeLesson].keys.filter((key) => /^[a-z]$/i.test(key)).slice(0, 5).map((key) => key.toLowerCase());
    persist();
    renderTextOptions();
    if (mode === "quote") setMode("time");
    else applyNextPassageSettings();
    $('.nav-link[data-view="practice"]').click();
  });

  document.body.classList.toggle("dark", data.theme === "dark");
  document.body.dataset.palette = data.colorPalette;
  $$(".palette-choice").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.palette === data.colorPalette)));
  if (data.practiceDate !== todayKey()) {
    data.practiceDate = todayKey();
    if (!data.dailyTotals[todayKey()]) data.dailyTotals[todayKey()] = 0;
    persist();
  }
  if (!data.dailyGoals[todayKey()])
    data.dailyGoals[todayKey()] = data.goalMinutes * 60000;
  const today = new Date();
  $("#todayLabel").textContent = today.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
  $("#todayLabel").setAttribute("datetime", todayKey());
  $("#liveStats").classList.toggle("hidden", !data.showLive);
  syncPracticeFont();
  $$("#dailyGoalChoices button").forEach((button) =>
    button.classList.toggle(
      "selected",
      Number(button.dataset.value) === data.goalMinutes,
    ),
  );
  updateStreak();
  renderTextOptions();
  persist();
  updateDashboard();
  updateModeStartup();
  // A page load starts with a fresh passage for the selected mode instead of
  // reusing the last passage saved in local storage.
  const previousPassage = data.modeDrafts[mode]?.target || "";
  delete data.modeDrafts[mode];
  restart(false, true);
  for (let attempt = 0; target === previousPassage && attempt < 7; attempt++)
    restart(false, true);
  captureModeDraft();
  selectLesson("home");
  $$("#durationChoices .choice").forEach((button) =>
    button.classList.toggle("selected", Number(button.dataset.value) === duration),
  );
  $$("#wordChoices .choice").forEach((button) =>
    button.classList.toggle("selected", Number(button.dataset.value) === wordCount),
  );
  renderText();
  if (!$("#practiceView").classList.contains("hidden")) {
    inputEl.focus({ preventScroll: true });
    $("#typingArea").classList.add("focused");
  }
  if (supabase) {
    let lastSyncedUserId = null;
    let authEventReceived = false;
    const handleAuthSession = (user) => {
      updateAccountUI(user);
      if (!user) {
        lastSyncedUserId = null;
        activateUserStore(null);
        return;
      }
      activateUserStore(user);
      if (lastSyncedUserId === user.id) return;
      lastSyncedUserId = user.id;
      queueMicrotask(() => void syncLocalData(user));
    };
    supabase.auth.onAuthStateChange((_event, session) => {
      authEventReceived = true;
      handleAuthSession(session?.user || null);
    });
    supabase.auth.getSession().then(({ data: sessionData }) => {
      if (!authEventReceived) handleAuthSession(sessionData.session?.user || null);
    });
  } else updateAccountUI(null);
})();
