// ============ Cookie consent ============
(function cookieConsent(){
  const KEY = "krampon_cookie_consent_v1";
  const el = document.getElementById("cookieBanner");
  if(!el) return;

  const accepted = localStorage.getItem(KEY);
  if(!accepted){
    el.style.display = "block";
    document.getElementById("cookieAccept").addEventListener("click", ()=>{
      localStorage.setItem(KEY, "accepted");
      el.style.display = "none";
      // AdSense kodu eklendiğinde istersen burada reklam scriptlerini yükleyebiliriz.
    });
    document.getElementById("cookieReject").addEventListener("click", ()=>{
      localStorage.setItem(KEY, "rejected");
      el.style.display = "none";
    });
  }
})();

// ============ Quiz (only on quiz.html) ============
(function quizApp(){
  const root = document.getElementById("quizRoot");
  if(!root) return;

  const PRIZES = [0,100,200,300,500,1000,2000,3000,5000,7500,10000,15000,20000,30000,50000,100000];

  const $ = (s) => document.querySelector(s);
  const answersEl = $("#answers");
  const lvlEl = $("#lvl");
  const scoreEl = $("#score");
  const progressEl = $("#progress");
  const catEl = $("#cat");
  const diffEl = $("#diff");
  const modeEl = $("#mode");
  const qEl = $("#question");

  const difficultySelect = $("#difficultySelect");
  const repeatSelect = $("#repeatSelect");

  const life5050 = $("#life5050");
  const lifeAudience = $("#lifeAudience");
  const lifeHint = $("#lifeHint");

  const startBtn = $("#startBtn");
  const clearHistoryBtn = $("#clearHistoryBtn");

  const modalBack = $("#modalBack");
  const modalTitle = $("#modalTitle");
  const modalText = $("#modalText");
  const modalOk = $("#modalOk");

  function openModal(title, text){
    modalTitle.textContent = title;
    modalText.textContent = text;
    modalBack.style.display = "flex";
  }
  function closeModal(){ modalBack.style.display = "none"; }
  modalOk.addEventListener("click", closeModal);
  modalBack.addEventListener("click", (e)=>{ if(e.target===modalBack) closeModal(); });

  function shuffle(arr){
    const a = arr.slice();
    for(let i=a.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      [a[i],a[j]]=[a[j],a[i]];
    }
    return a;
  }
  function escapeHtml(str){
    return String(str).replaceAll("&","&amp;").replaceAll("<","&lt;")
      .replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");
  }

  // ---------- 200/200/200 bank generator (stable rules/terms/measurements) ----------
  function makeQuestion(id, difficulty, category, q, options, correctIndex, explanation){
    return { id, difficulty, category, q, options, correctIndex, explanation };
  }
  const FACTS = [
    {cat:"Ölçüler", q:"Futbolda kale ölçüleri yaklaşık kaç metredir?", correct:"7,32 m x 2,44 m",
      wrongs:["6,32 m x 2,44 m","7,00 m x 2,50 m","8,32 m x 2,44 m"], exp:"Kale: 7,32 m genişlik, 2,44 m yükseklik."},
    {cat:"Ölçüler", q:"Penaltı noktası kale çizgisine kaç metre uzaklıktadır?", correct:"11 m",
      wrongs:["9,15 m","12 m","16,5 m"], exp:"Penaltı noktası 11 metredir."},
    {cat:"Ölçüler", q:"Ceza sahası çizgisi kale çizgisinden kaç metrede başlar?", correct:"16,5 m",
      wrongs:["11 m","18 m","14 m"], exp:"Ceza sahası 16,5 m ölçüsüyle tanımlanır."},
    {cat:"Kurallar", q:"Maç başında oyunu başlatan işaret genellikle nedir?", correct:"Hakem düdüğü",
      wrongs:["Taç işareti","Korner işareti","Sarı kart"], exp:"Oyun hakemin düdüğüyle başlar."},
    {cat:"Kurallar", q:"Bir takım sahaya kaç oyuncu ile çıkar?", correct:"11",
      wrongs:["10","9","12"], exp:"Futbolda sahada 11 oyuncu vardır."},
    {cat:"Kurallar", q:"Kırmızı kart gören oyuncu için doğru olan hangisidir?", correct:"Takım 10 kişi devam eder",
      wrongs:["Oyuncu 5 dk sonra döner","Takım 11 kişi devam eder","Sadece bir sonraki maç ceza olur"], exp:"Kırmızı kart oyundan atılmadır."},
    {cat:"Kurallar", q:"Kaleci topu elinde genellikle en fazla kaç saniye tutabilir?", correct:"6 saniye",
      wrongs:["3 saniye","10 saniye","15 saniye"], exp:"Genelde 6 saniye kuralı bilinir."},
    {cat:"Kurallar", q:"Taç atışında doğru olan hangisidir?", correct:"Top iki elle ve baş üstünden atılır",
      wrongs:["Top tek elle atılır","Top yerden yuvarlanır","Top diz üstünden atılır"], exp:"Taç: iki el, baş üstü."},
    {cat:"Terimler", q:"Hat-trick ne demektir?", correct:"Bir maçta 3 gol",
      wrongs:["3 asist","3 sarı kart","3 korner"], exp:"Hat-trick: 3 gol."},
    {cat:"Terimler", q:"Derbi neyi ifade eder?", correct:"Aynı şehir/bölge takımlarının maçı",
      wrongs:["Final maçı","Hazırlık maçı","Kupanın ilk turu"], exp:"Derbi yerel rekabet maçı."},
    {cat:"Taktik", q:"‘4-4-2’ ifadesi genellikle neyi anlatır?", correct:"Diziliş (formasyon)",
      wrongs:["Hakem sayısı","Oyuncu yaşı","Top sayısı"], exp:"4-4-2 bir formasyondur."},
    {cat:"Taktik", q:"Pres ne demektir?", correct:"Top rakipteyken baskı yapmak",
      wrongs:["Sadece geri çekilmek","Sürekli uzun top atmak","Taç kullanmak"], exp:"Pres: baskı."},
    {cat:"Kurallar", q:"Topun gol sayılması için ne gerekir?", correct:"Kale çizgisini tamamen geçmesi",
      wrongs:["Direğe değmesi","Kaleciye değmesi","Yerden gitmesi"], exp:"Top çizgiyi tamamen geçmeli."},
    {cat:"Kurallar", q:"Santra ne zaman yapılır?", correct:"Gol sonrası ve devre başlangıcında",
      wrongs:["Her taçtan sonra","Her kornerden sonra","Her faulden sonra"], exp:"Santra: başlama vuruşu."},
  ];

  function addVariants(bank, difficulty, count, prefix){
    let i = 0;
    while(i < count){
      const base = FACTS[i % FACTS.length];
      const variantNo = Math.floor(i / FACTS.length) + 1;

      const qText =
        variantNo % 3 === 0 ? base.q :
        variantNo % 3 === 1 ? base.q.replace("hangisidir", "nedir") :
        "Aşağıdakilerden hangisi doğrudur? " + base.q;

      const options = shuffle([base.correct, ...base.wrongs]);
      const correctIndex = options.indexOf(base.correct);

      bank.push(makeQuestion(
        `${prefix}${String(i+1).padStart(3,"0")}`,
        difficulty,
        base.cat,
        qText,
        options,
        correctIndex,
        base.exp
      ));
      i++;
    }
  }

  function generateBank(){
    const bank = [];
    addVariants(bank, "easy", 200, "E");
    addVariants(bank, "medium", 200, "M");
    addVariants(bank, "hard", 200, "H");
    return bank;
  }
  const QUESTION_BANK = generateBank();

  // ---------- Seen storage ----------
  function storageKey(diff){ return `kramponQuiz_seen_${diff}`; }
  function loadSeenSet(diff){
    try{ return new Set(JSON.parse(localStorage.getItem(storageKey(diff)) || "[]")); }
    catch{ return new Set(); }
  }
  function saveSeenSet(diff, set){
    try{ localStorage.setItem(storageKey(diff), JSON.stringify([...set])); }catch{}
  }
  function clearAllSeen(){
    ["easy","medium","hard","mixed"].forEach(d => localStorage.removeItem(storageKey(d)));
  }

  // ---------- State ----------
  let state = null;

  function initState(){
    const diff = difficultySelect.value;
    const repeatMode = repeatSelect.value;

    state = {
      started:false,
      level:1,
      locked:false,
      removed:new Set(),
      used5050:false,
      usedAudience:false,
      usedHint:false,

      diff, repeatMode,
      seen: loadSeenSet(diff),
      current:null,
      currentOptions:[],
      correctPos:-1,
      usedThisGame: new Set(),
    };

    modeEl.textContent =
      diff === "mixed" ? "Karışık" :
      diff === "easy" ? "Kolay" :
      diff === "medium" ? "Orta" : "Zor";

    qEl.textContent = "Zorluğu seç, sonra “Oyunu Başlat”a bas.";
    catEl.textContent = "Kategori: —";
    diffEl.textContent = "Zorluk: —";
    answersEl.innerHTML = "";
    lvlEl.textContent = "1";
    scoreEl.textContent = "0";
    progressEl.style.width = "0%";

    [life5050, lifeAudience, lifeHint].forEach(b=>b.classList.remove("used"));
    startBtn.textContent = "Oyunu Başlat";
  }

  function getPoolForCurrentMode(){
    if(state.diff === "mixed") return QUESTION_BANK;
    return QUESTION_BANK.filter(q => q.difficulty === state.diff);
  }

  function pickNextQuestion(){
    const poolAll = getPoolForCurrentMode();
    const fresh = poolAll.filter(q => !state.seen.has(q.id) && !state.usedThisGame.has(q.id));
    let candidateList = fresh;

    if(candidateList.length === 0){
      if(state.repeatMode === "strict"){
        state.seen = new Set();
        saveSeenSet(state.diff, state.seen);
        candidateList = poolAll.filter(q => !state.usedThisGame.has(q.id));
      }else{
        candidateList = poolAll.filter(q => !state.usedThisGame.has(q.id));
      }
    }
    if(candidateList.length === 0){
      state.usedThisGame = new Set();
      candidateList = poolAll.slice();
    }
    return candidateList[Math.floor(Math.random()*candidateList.length)];
  }

  function renderQuestion(){
    const q = pickNextQuestion();
    state.current = q;
    state.locked = false;
    state.removed = new Set();

    state.seen.add(q.id);
    saveSeenSet(state.diff, state.seen);
    state.usedThisGame.add(q.id);

    catEl.textContent = `Kategori: ${q.category}`;
    diffEl.textContent = `Zorluk: ${q.difficulty}`;
    qEl.textContent = q.q;

    const indexed = q.options.map((txt, idx)=>({txt, idx}));
    const shuffled = shuffle(indexed);
    state.currentOptions = shuffled;
    state.correctPos = shuffled.findIndex(o => o.idx === q.correctIndex);

    answersEl.innerHTML = "";
    const keys = ["A","B","C","D"];
    shuffled.forEach((opt, pos)=>{
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = `opt_${pos}`;
      btn.innerHTML = `
        <div class="ans">
          <div class="key">${keys[pos]}</div>
          <div class="txt">${escapeHtml(opt.txt)}</div>
        </div>`;
      btn.addEventListener("click", ()=> choose(pos));
      answersEl.appendChild(btn);
    });

    updateTop();
  }

  function lockAnswers(lock=true){
    state.locked = lock;
    [...answersEl.querySelectorAll("button")].forEach(b=>{
      if(lock) b.classList.add("disabled");
      else b.classList.remove("disabled");
    });
  }
  function markOption(pos, cls){
    const btn = document.querySelector(`#opt_${pos}`);
    if(btn) btn.classList.add(cls);
  }
  function updateTop(){
    lvlEl.textContent = String(state.level);
    scoreEl.textContent = PRIZES[state.level-1].toLocaleString("tr-TR");
    progressEl.style.width = `${(state.level-1)/15*100}%`;
  }

  function choose(pos){
    if(!state.started || state.locked) return;
    if(state.removed.has(pos)) return;

    lockAnswers(true);

    const correct = state.correctPos;
    const ok = pos === correct;

    if(ok){
      markOption(pos, "correct");
      setTimeout(()=>{
        if(state.level === 15){
          progressEl.style.width = "100%";
          openModal("Tebrikler! 🏆",
            `15/15 yaptın!\nKazandığın ödül: ${PRIZES[15].toLocaleString("tr-TR")} ₺\n\nYeniden başlatınca sorular/şıklar değişir.`);
          state.started = false;
          startBtn.textContent = "Yeniden Başlat";
        }else{
          state.level += 1;
          renderQuestion();
        }
      }, 600);
    }else{
      markOption(pos, "wrong");
      markOption(correct, "correct");
      setTimeout(()=>{
        openModal("Yanlış cevap ❌",
          `Doğru cevap: ${["A","B","C","D"][correct]}.\n\nKazandığın ödül: ${PRIZES[state.level-1].toLocaleString("tr-TR")} ₺`);
        state.started = false;
        startBtn.textContent = "Yeniden Başlat";
      }, 600);
    }
    updateTop();
  }

  function use5050(){
    if(!state.started || state.used5050 || state.locked) return;
    state.used5050 = true; life5050.classList.add("used");

    const correct = state.correctPos;
    const candidates = [0,1,2,3].filter(p => p !== correct);
    const toRemove = shuffle(candidates).slice(0,2);

    toRemove.forEach(p=>{
      state.removed.add(p);
      const btn = document.querySelector(`#opt_${p}`);
      if(btn){
        btn.classList.add("disabled");
        btn.style.opacity = ".25";
      }
    });
    openModal("50:50", "İki yanlış şık elendi.");
  }
  function useAudience(){
    if(!state.started || state.usedAudience || state.locked) return;
    state.usedAudience = true; lifeAudience.classList.add("used");

    const correct = state.correctPos;
    const available = [0,1,2,3].filter(p => !state.removed.has(p));
    const weights = available.map(p => ({p, w: p===correct ? 60 : 14}));
    const sum = weights.reduce((a,b)=>a+b.w,0);

    let perc = weights.map(o => ({p:o.p, v: Math.round(o.w/sum*100)}));
    let fix = 100 - perc.reduce((a,b)=>a+b.v,0);
    if(fix !== 0) perc[0].v += fix;

    const lines = perc.sort((a,b)=>a.p-b.p)
      .map(o => `${["A","B","C","D"][o.p]}: %${o.v}`).join("\n");
    openModal("Seyirci oylaması 📣", lines);
  }
  function useHint(){
    if(!state.started || state.usedHint || state.locked) return;
    state.usedHint = true; lifeHint.classList.add("used");
    const exp = (state.current.explanation || "").trim();
    openModal("İpucu 💡", exp ? exp : "Bu soru için ipucu eklenmemiş.");
  }

  life5050.addEventListener("click", use5050);
  lifeAudience.addEventListener("click", useAudience);
  lifeHint.addEventListener("click", useHint);

  startBtn.addEventListener("click", ()=>{
    if(!state) initState();

    if(startBtn.textContent.includes("Yeniden")){
      initState();
      state.started = true;
      startBtn.textContent = "Oyun Devam Ediyor";
      renderQuestion();
      return;
    }
    if(!state.started){
      state.started = true;
      startBtn.textContent = "Oyun Devam Ediyor";
      renderQuestion();
    }
  });

  difficultySelect.addEventListener("change", ()=> initState());
  repeatSelect.addEventListener("change", ()=> initState());

  clearHistoryBtn.addEventListener("click", ()=>{
    clearAllSeen();
    openModal("Tamam", "Soru hafızası sıfırlandı. Artık eski sorular tekrar gelebilir.");
    initState();
  });

  initState();
})();
// ===== Custom dropdown wiring (quiz.html) =====
(function customDropdown(){
  const diffHidden = document.getElementById("difficultySelect");
  const repHidden  = document.getElementById("repeatSelect");
  const diffBtn    = document.getElementById("difficultyBtn");
  const repBtn     = document.getElementById("repeatBtn");

  // Quiz sayfasında değilsek çık
  if(!diffHidden || !repHidden || !diffBtn || !repBtn) return;

  function closeAll(){
    document.querySelectorAll(".dd.open").forEach(d=>d.classList.remove("open"));
  }

  // dışarı tıklayınca kapat
  document.addEventListener("click", (e)=>{
    const dd = e.target.closest(".dd");
    if(!dd) closeAll();
  });

  // butona basınca aç/kapat
  document.querySelectorAll(".dd-btn").forEach(btn=>{
    btn.addEventListener("click", (e)=>{
      const wrap = e.target.closest(".dd");
      const isOpen = wrap.classList.contains("open");
      closeAll();
      if(!isOpen) wrap.classList.add("open");
    });
  });

  // seçim (zorluk)
  document.getElementById("difficultyMenu").addEventListener("click", (e)=>{
    const b = e.target.closest("button[data-value]");
    if(!b) return;
    diffHidden.value = b.dataset.value;
    diffBtn.textContent = b.textContent;
    closeAll();
    diffHidden.dispatchEvent(new Event("change"));
  });

  // seçim (tekrar)
  document.getElementById("repeatMenu").addEventListener("click", (e)=>{
    const b = e.target.closest("button[data-value]");
    if(!b) return;
    repHidden.value = b.dataset.value;
    repBtn.textContent = b.textContent;
    closeAll();
    repHidden.dispatchEvent(new Event("change"));
  });
})();

