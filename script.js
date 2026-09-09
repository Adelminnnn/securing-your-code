const input = document.querySelector("#lyrics-input");
const output = document.querySelector("#guide-output");
const count = document.querySelector("#word-count");
const generateButton = document.querySelector("#generate-button");
const clearButton = document.querySelector("#clear-button");

const pronunciationMap = {
  a: "ei", and: "and", are: "ar", baby: "bei-bi", be: "bi", beautiful: "biu-ti-ful",
  can: "ken", do: "du", for: "for", get: "guet", girl: "guerl", good: "gud",
  have: "jav", he: "ji", i: "ai", in: "in", is: "is", it: "it", just: "yast",
  know: "nou", love: "lov", me: "mi", my: "mai", never: "ne-ver", no: "nou",
  of: "ov", on: "on", one: "uan", really: "ri-li", say: "sei", she: "shi",
  so: "sou", that: "dat", the: "de", there: "der", to: "tu", want: "uant",
  we: "ui", what: "uat", when: "uen", with: "uid", you: "iu", your: "ior"
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

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = .78;
  window.speechSynthesis.speak(utterance);
}

function renderGuide() {
  const text = input.value.trim();
  if (!text) {
    output.className = "guide-output empty-state";
    output.innerHTML = '<div class="empty-icon">♪</div><p>Escribe una frase para empezar.</p><span>La guía se generará palabra por palabra.</span>';
    return;
  }

  output.className = "guide-output";
  output.innerHTML = "";
  text.split(/\s+/).forEach((token) => {
    const word = token.replace(/[.,!?;:"]/g, "");
    if (!word) return;
    const card = document.createElement("div");
    const speakButton = document.createElement("button");
    const wordElement = document.createElement("span");
    const phoneticElement = document.createElement("span");
    card.className = "word-card";
    speakButton.className = "speak-button";
    speakButton.type = "button";
    speakButton.setAttribute("aria-label", `Escuchar ${word}`);
    speakButton.textContent = "▶";
    wordElement.className = "word";
    wordElement.textContent = word;
    phoneticElement.className = "phonetic";
    phoneticElement.textContent = approximate(word);
    card.append(speakButton, wordElement, phoneticElement);
    speakButton.addEventListener("click", () => speak(word));
    output.appendChild(card);
  });
}

input.addEventListener("input", updateCount);
generateButton.addEventListener("click", renderGuide);
clearButton.addEventListener("click", () => {
  input.value = "";
  updateCount();
  renderGuide();
});
