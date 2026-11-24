// 簡報筆與鍵盤統一監聽（與滑鼠盲按完全獨立、可同時並存）
const START_STOP_KEYS = new Set(["KeyS", "ArrowLeft", "ArrowUp", "PageUp"]);
const LAP_RESET_KEYS  = new Set(["KeyD", "ArrowRight", "ArrowDown", "PageDown"]);

window.addEventListener("keydown", (e) => {
  if (e.repeat || !canTriggerRemoteControl()) return;

  const code = e.code || "";
  const key  = e.key || "";
  const keyLower = key.toLowerCase();

  // 無論是否命中，先在底部狀態列顯示收到的原始鍵碼方便驗證
  logSignal(`外接鍵 [${key || code}]`);

  if (LAP_RESET_KEYS.has(code) || LAP_RESET_KEYS.has(key) || keyLower === "d") {
    e.preventDefault();
    e.stopPropagation();
    triggerLapResetSafe(`簡報筆/鍵盤(${key || code})`);
  } else if (START_STOP_KEYS.has(code) || START_STOP_KEYS.has(key) || keyLower === "s") {
    e.preventDefault();
    e.stopPropagation();
    triggerStartStopSafe(`簡報筆/鍵盤(${key || code})`, 0);
  }
}, true);
