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
  a: ["un / una (artículo indefinido)", "por (frecuencia: twice a day = dos veces al día)"],
  and: ["y (conjunción)", "además / también (en expresiones)"],
  are: ["son / están (you, we, they)", "eres / estás (you)"],
  baby: ["bebé", "cariño / persona querida (informal)"],
  be: ["ser", "estar", "existir", "portarse o comportarse (be good = pórtate bien)"],
  beautiful: ["hermoso/a", "precioso/a", "excelente o agradable (a beautiful idea = una idea excelente)"],
  even: ["incluso / hasta (para enfatizar algo inesperado)", "incluso si / aunque (even if)", "par (número divisible entre dos)", "igualado o nivelado (an even surface)", "uniforme o equilibrado", "alisar / nivelar (verbo: even out)"],
  girl: ["niña", "chica / muchacha", "hija (informal, según el contexto)", "mujer joven"],
  can: ["poder (capacidad)", "poder (permiso)", "lata / recipiente (sustantivo)"],
  do: ["hacer", "realizar (una actividad)", "auxiliar para preguntas y énfasis"],
  for: ["para (destinatario o propósito)", "por (causa o intercambio)", "durante (periodo de tiempo)"],
  get: ["obtener / conseguir", "recibir", "llegar (get home = llegar a casa)", "ponerse o volverse (get tired = cansarse)", "entender (I get it = lo entiendo)"],
  good: ["bueno/a", "bien (después de be: I am good)", "hábil (good at = bueno en)", "amable o correcto"],
  have: ["tener / poseer", "haber (have eaten = haber comido)", "tomar o experimentar (have lunch = almorzar)"],
  he: ["él (pronombre masculino)"],
  i: ["yo (pronombre personal)"],
  in: ["en / dentro de (lugar)", "en (meses, años o periodos)", "de moda (in style = de moda)"],
  is: ["es / está (he, she, it)", "existe (there is = hay)"],
  it: ["eso / ello", "lo / la (objeto o situación)", "pronombre para animales, objetos o clima"],
  just: ["solo / solamente", "justo / equitativo", "acabar de (just arrived = acaba de llegar)", "exactamente"],
  know: ["saber (información)", "conocer (persona o lugar)", "reconocer o distinguir"],
  love: ["amor (sustantivo)", "amar / encantar (verbo)", "cariño o afecto"],
  me: ["me / a mí (objeto)", "yo (después de preposición, informal)"],
  my: ["mi / mis (posesivo)"],
  never: ["nunca", "jamás"],
  no: ["no (respuesta negativa)", "ningún / ninguna (no problem = ningún problema)", "opuesto de yes"],
  of: ["de (posesión o relación)", "de (cantidad o parte)", "sobre / acerca de"],
  on: ["en / sobre (superficie)", "encendido (the light is on)", "el (día o fecha)", "sobre un tema (a book on art)"],
  one: ["uno / una", "uno (persona o cosa)", "único (the one = el indicado)", "se usa para no repetir un sustantivo"],
  really: ["realmente", "de verdad", "muy (informal, como intensificador)"],
  say: ["decir", "expresar una idea", "indicar o mostrar (the sign says...)"],
  she: ["ella (pronombre femenino)"],
  so: ["así que / por eso", "tan (so beautiful = tan hermoso)", "así / de esa manera", "entonces (para continuar una conversación)"],
  that: ["eso / aquello", "que (conjunción)", "ese / esa", "tan ... que (so ... that)"],
  the: ["el / la / los / las (artículo definido)", "señala algo específico o ya mencionado"],
  there: ["allí / ahí (lugar)", "hay (there is / there are)", "en ese punto o situación"],
  to: ["a / hacia (dirección)", "para (propósito)", "marca del infinitivo (to learn = aprender)", "hasta (from Monday to Friday)"],
  want: ["querer / desear", "necesitar o hacer falta (informal)", "buscar o solicitar"],
  we: ["nosotros / nosotras"],
  what: ["qué (pregunta)", "lo que / aquello que", "qué ... (sorpresa o énfasis)"],
  when: ["cuándo (pregunta)", "cuando (momento)", "en el momento en que"],
  with: ["con (compañía)", "con (herramienta o manera)", "de acuerdo con"],
  you: ["tú / usted", "ustedes / vosotros (plural)", "uno / cualquiera (uso general)"],
  your: ["tu / tus", "su / sus (de usted o ustedes)"]
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
  const key = word.toLowerCase().replace(/[^a-z']/g, "");
  return meanings[key] || ["Esta palabra no tiene significados guardados todavía en la guía."];
}

async function lookupMeanings(word) {
  const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
  if (!response.ok) throw new Error("No dictionary entry");
  const entries = await response.json();
  const results = [];
  entries.forEach((entry) => {
    entry.meanings?.forEach((part) => {
      part.definitions?.forEach((definition) => {
        results.push({
          type: part.partOfSpeech || "uso general",
          definition: definition.definition,
          example: definition.example || ""
        });
      });
    });
  });
  return results;
}

function renderMeanings(list, items) {
  list.replaceChildren();
  if (!items.length) {
    const item = document.createElement("li");
    item.textContent = "No se encontraron acepciones para esta palabra.";
    list.appendChild(item);
    return;
  }
  items.forEach((meaningItem) => {
    const item = document.createElement("li");
    item.textContent = `${meaningItem.type}: ${meaningItem.definition}`;
    if (meaningItem.example) {
      const example = document.createElement("span");
      example.className = "usage-example";
      example.textContent = `Uso: “${meaningItem.example}”`;
      item.appendChild(example);
    }
    list.appendChild(item);
  });
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
    const card = document.createElement("details");
    const summary = document.createElement("summary");
    const speakButton = document.createElement("button");
    const wordElement = document.createElement("span");
    const phoneticElement = document.createElement("span");
    const details = document.createElement("div");
    const meaningsElement = document.createElement("ul");
    const voiceSelect = document.createElement("select");
    card.className = "word-card";
    summary.className = "word-summary";
    speakButton.className = "speak-button";
    speakButton.type = "button";
    speakButton.setAttribute("aria-label", `Escuchar ${word}`);
    speakButton.textContent = "▶";
    wordElement.className = "word";
    wordElement.textContent = word;
    phoneticElement.className = "phonetic";
    phoneticElement.textContent = approximate(word);
    details.className = "word-details";
    meaningsElement.className = "meaning-list";
    const loadingItem = document.createElement("li");
    loadingItem.className = "loading-meaning";
    loadingItem.textContent = "Consultando acepciones y usos…";
    meaningsElement.appendChild(loadingItem);
    meaning(word).forEach((item) => {
      const meaningItem = document.createElement("li");
      meaningItem.textContent = item;
      meaningsElement.appendChild(meaningItem);
    });
    voiceSelect.className = "voice-select";
    voiceSelect.innerHTML = voiceOptions();
    summary.append(speakButton, wordElement, phoneticElement);
    details.append(meaningsElement, voiceSelect);
    card.append(summary, details);
    speakButton.addEventListener("click", (event) => {
      event.preventDefault();
      speak(word, voiceSelect.value);
    });
    output.appendChild(card);
    lookupMeanings(word).then((items) => {
      renderMeanings(meaningsElement, items);
    }).catch(() => {
      const localItems = meaning(word).map((text) => ({
        type: "guía local",
        definition: text,
        example: ""
      }));
      renderMeanings(meaningsElement, localItems);
    });
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
