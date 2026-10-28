(() => {
  "use strict";

  const historiaDesktop = [
    {
      id: 0,
      x: 12,
      y: 78,
      titulo: "El despertar",
      mensaje:
        "Al amanecer, un conejito asomó las orejas entre el rocío. Hoy no era un día cualquiera: alguien muy especial cumplía años… ¡y tú eres esa persona!",
    },
    {
      id: 1,
      x: 32,
      y: 42,
      titulo: "El primer recuerdo",
      mensaje:
        "En la colina de los risas guardó un deseo: que este año te traiga abrazos inesperados, café caliente y momentos que merezcan foto.",
    },
    {
      id: 2,
      x: 55,
      y: 62,
      titulo: "El puente de deseos",
      mensaje:
        "Cruzó un puente hecho de luces suaves. Cada tablón era un deseo para ti: salud, calma, valentía… y muchas razones para sonreír.",
    },
    {
      id: 3,
      x: 72,
      y: 28,
      titulo: "El claro secreto",
      mensaje:
        "En un claro escondido encontró una carta invisible. Decía: «Gracias por existir. El mundo es más amable contigo en él.»",
    },
    {
      id: 4,
      x: 88,
      y: 55,
      titulo: "El gran destino",
      mensaje:
        "Al final del sendero, el conejo dejó un regalo brillante: ¡Feliz cumpleaños! Que este nuevo ciclo sea tan cálido y mágico como este viaje.",
    },
  ];

  const historiaMobile = [
    { ...historiaDesktop[0], x: 50, y: 10 },
    { ...historiaDesktop[1], x: 28, y: 28 },
    { ...historiaDesktop[2], x: 72, y: 46 },
    { ...historiaDesktop[3], x: 35, y: 64 },
    { ...historiaDesktop[4], x: 50, y: 84 },
  ];

  const mq = window.matchMedia("(max-width: 767px)");

  const nodesEl = document.getElementById("nodes");
  const rabbitEl = document.getElementById("rabbit");
  const trailPath = document.getElementById("trailPath");
  const bubbleEl = document.getElementById("bubble");
  const bubbleStep = document.getElementById("bubbleStep");
  const bubbleTitle = document.getElementById("bubbleTitle");
  const bubbleMessage = document.getElementById("bubbleMessage");
  const btnPrev = document.getElementById("btnPrev");
  const btnNext = document.getElementById("btnNext");
  const finaleEl = document.getElementById("finale");
  const finaleMessage = document.getElementById("finaleMessage");
  const btnRestart = document.getElementById("btnRestart");

  let currentIndex = 0;
  let maxReached = 0;
  let isMoving = false;
  let confettiFired = false;

  function getHistoria() {
    return mq.matches ? historiaMobile : historiaDesktop;
  }

  function buildNodes() {
    const historia = getHistoria();
    nodesEl.innerHTML = "";

    historia.forEach((punto, index) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "node";
      btn.dataset.index = String(index);
      btn.dataset.label = punto.titulo;
      btn.style.left = `${punto.x}%`;
      btn.style.top = `${punto.y}%`;
      btn.textContent = String(index + 1);
      btn.setAttribute("aria-label", `Ir a: ${punto.titulo}`);
      btn.addEventListener("click", () => onNodeClick(index));
      nodesEl.appendChild(btn);
    });

    drawTrail();
    updateNodeStates();
  }

  function drawTrail() {
    const historia = getHistoria();
    if (historia.length === 0) return;

    const coords = historia.map((p) => `${p.x},${p.y}`);
    let d = `M ${coords[0]}`;

    for (let i = 1; i < coords.length; i += 1) {
      const prev = historia[i - 1];
      const curr = historia[i];
      const mx = (prev.x + curr.x) / 2;
      const my = (prev.y + curr.y) / 2;
      const offset = mq.matches ? 6 : 8;
      const c1x = mx + (i % 2 === 0 ? offset : -offset) * 0.35;
      const c1y = my + (i % 2 === 0 ? -offset : offset) * 0.45;
      d += ` Q ${c1x},${c1y} ${curr.x},${curr.y}`;
    }

    trailPath.setAttribute("d", d);
  }

  function updateNodeStates() {
    const buttons = nodesEl.querySelectorAll(".node");
    buttons.forEach((btn) => {
      const index = Number(btn.dataset.index);
      btn.classList.toggle("current", index === currentIndex);
      btn.classList.toggle("visited", index < currentIndex);
      btn.classList.toggle("unlocked", index <= maxReached);
      btn.disabled = index > maxReached;
    });
  }

  function placeRabbit(index, { animate = true, fromIndex = null } = {}) {
    const historia = getHistoria();
    const punto = historia[index];
    if (!punto) return;

    if (!animate) {
      rabbitEl.style.transition = "none";
    } else {
      rabbitEl.style.transition =
        "left 0.8s cubic-bezier(0.4, 0, 0.2, 1), top 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
    }

    if (animate && fromIndex !== null && historia[fromIndex]) {
      rabbitEl.classList.toggle("facing-left", punto.x < historia[fromIndex].x);
    }

    rabbitEl.style.left = `${punto.x}%`;
    rabbitEl.style.top = `${punto.y}%`;

    if (!animate) {
      void rabbitEl.offsetWidth;
      rabbitEl.style.transition =
        "left 0.8s cubic-bezier(0.4, 0, 0.2, 1), top 0.8s cubic-bezier(0.4, 0, 0.2, 1)";
    }
  }

  function showMessage(index) {
    const historia = getHistoria();
    const punto = historia[index];
    if (!punto) return;

    bubbleEl.classList.remove("updating");
    void bubbleEl.offsetWidth;
    bubbleEl.classList.add("updating");

    bubbleStep.textContent = `Paso ${index + 1} de ${historia.length}`;
    bubbleTitle.textContent = punto.titulo;
    bubbleMessage.textContent = punto.mensaje;
  }

  function updateControls() {
    const historia = getHistoria();
    const isLast = currentIndex >= historia.length - 1;

    btnPrev.disabled = currentIndex <= 0 || isMoving;
    btnNext.disabled = isMoving;

    if (isLast) {
      btnNext.textContent = "🎉 Celebrar";
    } else {
      btnNext.textContent = "Siguiente ➔";
    }
  }

  function launchConfetti() {
    if (typeof confetti !== "function") return;

    const duration = 2800;
    const end = Date.now() + duration;
    const colors = ["#f6b26b", "#7ec8a3", "#f28b82", "#ffe8c8", "#9ad0f5"];

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    confetti({
      particleCount: 120,
      spread: 90,
      startVelocity: 38,
      origin: { y: 0.55 },
      colors,
    });
  }

  function openFinale() {
    const historia = getHistoria();
    const last = historia[historia.length - 1];
    finaleMessage.textContent =
      last.mensaje + " El conejo bailó de alegría… ¡y esperamos que tú también!";
    finaleEl.hidden = false;

    if (!confettiFired) {
      confettiFired = true;
      launchConfetti();
    }
  }

  function closeFinale() {
    finaleEl.hidden = true;
  }

  function goTo(index, { fromUser = false } = {}) {
    const historia = getHistoria();
    if (isMoving) return;
    if (index < 0 || index >= historia.length) return;
    if (fromUser && index > maxReached) return;
    if (index === currentIndex && fromUser) {
      showMessage(index);
      return;
    }

    const previous = currentIndex;
    isMoving = true;
    rabbitEl.classList.add("moving");
    updateControls();

    currentIndex = index;
    maxReached = Math.max(maxReached, index);

    placeRabbit(index, {
      animate: previous !== index,
      fromIndex: previous,
    });
    showMessage(index);
    updateNodeStates();
    updateControls();

    window.setTimeout(() => {
      isMoving = false;
      rabbitEl.classList.remove("moving");
      updateControls();

      if (currentIndex === historia.length - 1) {
        openFinale();
      }
    }, 850);
  }

  function onNodeClick(index) {
    if (index <= maxReached) {
      if (index === getHistoria().length - 1 && index === currentIndex) {
        openFinale();
        return;
      }
      goTo(index, { fromUser: true });
    }
  }

  function onNext() {
    const historia = getHistoria();
    if (currentIndex >= historia.length - 1) {
      openFinale();
      return;
    }
    goTo(currentIndex + 1);
  }

  function onPrev() {
    if (currentIndex <= 0) return;
    closeFinale();
    goTo(currentIndex - 1);
  }

  function restart() {
    confettiFired = false;
    closeFinale();
    currentIndex = 0;
    maxReached = 0;
    isMoving = false;
    rabbitEl.classList.remove("moving", "facing-left");
    placeRabbit(0, { animate: false });
    showMessage(0);
    updateNodeStates();
    updateControls();
  }

  function onLayoutChange() {
    buildNodes();
    placeRabbit(currentIndex, { animate: false });
    showMessage(currentIndex);
    updateControls();
  }

  btnNext.addEventListener("click", onNext);
  btnPrev.addEventListener("click", onPrev);
  btnRestart.addEventListener("click", restart);

  finaleEl.addEventListener("click", (event) => {
    if (event.target === finaleEl) {
      closeFinale();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !finaleEl.hidden) {
      closeFinale();
      return;
    }
    if (event.key === "ArrowRight") onNext();
    if (event.key === "ArrowLeft") onPrev();
  });

  if (typeof mq.addEventListener === "function") {
    mq.addEventListener("change", onLayoutChange);
  } else if (typeof mq.addListener === "function") {
    mq.addListener(onLayoutChange);
  }

  buildNodes();
  placeRabbit(0, { animate: false });
  showMessage(0);
  updateNodeStates();
  updateControls();
})();
