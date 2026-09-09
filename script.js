const input = document.querySelector("#lyrics-input");
const output = document.querySelector("#guide-output");
const count = document.querySelector("#word-count");
const generateButton = document.querySelector("#generate-button");
const clearButton = document.querySelector("#clear-button");
const themeToggle = document.querySelector("#theme-toggle");
let selectedRate = .8;
let voices = [];

const pronunciationMap = {
  a: "ei", and: "and", are: "ar", baby: "bei-bi", be: "bi", beautiful: "biu-ti-ful",
  can: "ken", do: "du", for: "for", get: "guet", girl: "guerl", good: "gud",
  have: "jav", he: "ji", i: "ai", in: "in", is: "is", it: "it", just: "yast",
  know: "nou", love: "lov", me: "mi", my: "mai", never: "ne-ver", no: "nou",
  of: "ov", on: "on", one: "uan", really: "ri-li", say: "sei", she: "shi",
  so: "sou", that: "dat", the: "de", there: "der", to: "tu", want: "uant",
  we: "ui", what: "uat", when: "uen", with: "uid", you: "iu", your: "ior"
};

const meanings = {
  a: "un / una", and: "y", are: "son / están", baby: "bebé", be: "ser / estar",
  beautiful: "hermoso/a", can: "poder", do: "hacer", for: "para / por", get: "obtener",
  good: "bueno/a", have: "tener", he: "él", i: "yo", in: "en / dentro de",
  is: "es / está", it: "eso / ello", just: "solo / justo", know: "saber / conocer",
  love: "amor / amar", me: "me / a mí", my: "mi", never: "nunca", no: "no",
  of: "de", on: "en / sobre", one: "uno", really: "realmente", say: "decir",
  she: "ella", so: "así que / tan", that: "eso / que", the: "el / la / los / las",
  there: "allí / ahí", to: "a / para", want: "querer", we: "nosotros/as",
  what: "qué / lo que", when: "cuándo / cuando", with: "con", you: "tú / usted",
  your: "tu / su"
};

function approximate(word) {
  const clean = word.toLowerCase().replace(/[^a-z']/g, "");
  if (pronunciationMap[clean]) return pronunciationMap[clean];
  return clean
    .replace(/tion\b/g, "shon")
    .replace(/th/g, "d")
    .replace(/sh/g, "sh")
    .replace(/ch/g, "ch")
    .replace(/ee|ea/g, "i")
    .replace(/oo/g, "u")
    .replace(/e\b/g, "")
    .replace(/a\b/g, "ei")
    .replace(/i\b/g, "ai")
    .replace(/o\b/g, "ou")
    .replace(/u\b/g, "iu");
}

function updateCount() {
  const words = input.value.trim() ? input.value.trim().split(/\s+/).length : 0;
  count.textContent = `${words} ${words === 1 ? "palabra" : "palabras"}`;
}

function populateVoices() {
  voices = window.speechSynthesis.getVoices().filter((voice) => voice.lang.startsWith("en"));
}

function speak(text, voiceName = "") {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = selectedRate;
  utterance.voice = voices.find((voice) => voice.name === voiceName) || voices[0] || null;
  window.speechSynthesis.speak(utterance);
}

function voiceOptions() {
  if (!voices.length) return '<option value="">Voz del navegador</option>';
  return `<option value="">Voz predeterminada</option>${voices.map((voice) => `<option value="${voice.name}">${voice.name} (${voice.lang})</option>`).join("")}`;
}

function meaning(word) {
  return meanings[word.toLowerCase().replace(/[^a-z']/g, "")] || "Significado según el contexto";
}

function renderGuide() {
  const text = input.value.trim();
  if (!text) {
    output.className = "guide-output empty-state";
    output.innerHTML = '<div class="empty-icon">Aa</div><p>Escribe una palabra para empezar.</p><span>La guía se generará palabra por palabra.</span>';
    return;
  }

  output.className = "guide-output";
  output.innerHTML = '<div class="speed-panel" aria-label="Velocidad de pronunciación"><strong>Velocidad</strong><button class="speed-button" data-rate="0.5">x0.5</button><button class="speed-button active" data-rate="0.8">x0.8</button><button class="speed-button" data-rate="1">x1</button><button class="speed-button" data-rate="1.2">x1.2</button></div>';
  output.querySelectorAll(".speed-button").forEach((button) => button.addEventListener("click", () => {
    selectedRate = Number(button.dataset.rate);
    output.querySelectorAll(".speed-button").forEach((item) => item.classList.toggle("active", item === button));
  }));
  text.split(/\s+/).forEach((token) => {
    const word = token.replace(/[.,!?;:"]/g, "");
    if (!word) return;
    const card = document.createElement("div");
    const speakButton = document.createElement("button");
    const wordElement = document.createElement("span");
    const phoneticElement = document.createElement("span");
    const meaningElement = document.createElement("span");
    const voiceSelect = document.createElement("select");
    card.className = "word-card";
    speakButton.className = "speak-button";
    speakButton.type = "button";
    speakButton.setAttribute("aria-label", `Escuchar ${word}`);
    speakButton.textContent = "▶";
    wordElement.className = "word";
    wordElement.textContent = word;
    phoneticElement.className = "phonetic";
    phoneticElement.textContent = approximate(word);
    meaningElement.className = "meaning";
    meaningElement.textContent = `Significa: ${meaning(word)}`;
    voiceSelect.className = "voice-select";
    voiceSelect.innerHTML = voiceOptions();
    card.append(speakButton, wordElement, phoneticElement, meaningElement, voiceSelect);
    speakButton.addEventListener("click", () => speak(word, voiceSelect.value));
    output.appendChild(card);
  });
}

input.addEventListener("input", updateCount);
generateButton.addEventListener("click", renderGuide);
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const dark = document.body.classList.contains("dark");
  themeToggle.setAttribute("aria-label", dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro");
  themeToggle.querySelector("span").textContent = dark ? "Claro" : "Oscuro";
});
clearButton.addEventListener("click", () => {
  input.value = "";
  updateCount();
  renderGuide();
});

if ("speechSynthesis" in window) {
  populateVoices();
  window.speechSynthesis.addEventListener("voiceschanged", populateVoices);
}
