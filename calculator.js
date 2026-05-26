/* ===========================
   calculator.js — Core Logic
   =========================== */

const calc = (() => {

  /* ── State ── */
  let currentInput  = "0";
  let previousInput = "";
  let operator      = null;
  let justEvaluated = false;

  /* ── DOM refs ── */
  const mainDisplay = document.getElementById("display-main");
  const subDisplay  = document.getElementById("display-sub");

  /* ── Math primitives ── */
  const add      = (a, b) => a + b;
  const subtract = (a, b) => a - b;
  const multiply = (a, b) => a * b;
  const divide   = (a, b) => a / b;
  const modulo   = (a, b) => a % b;

  /* ── Display helpers ── */
  function formatNumber(raw) {
    const n = parseFloat(raw);
    if (isNaN(n)) return raw;                // pass errors through
    if (!isFinite(n)) return "Error";
    // round to avoid floating-point noise, strip trailing zeros
    const rounded = parseFloat(n.toPrecision(10));
    // add thousand separators only for the integer part
    const parts = String(rounded).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  }

  function shrinkIfNeeded(text) {
    // trim display font if result is long
    const len = text.replace(/[^0-9.]/g, "").length;
    if (len > 9)  mainDisplay.style.fontSize = "2.2rem";
    else if (len > 6) mainDisplay.style.fontSize = "2.8rem";
    else          mainDisplay.style.fontSize = "3.4rem";
  }

  function updateDisplay() {
    const formatted = formatNumber(currentInput);
    mainDisplay.textContent = formatted;
    shrinkIfNeeded(formatted);

    if (previousInput !== "" && operator) {
      subDisplay.textContent = formatNumber(previousInput) + " " + operatorSymbol(operator);
    } else {
      subDisplay.textContent = "";
    }
  }

  function operatorSymbol(op) {
    return { "+": "+", "-": "−", "*": "×", "/": "÷", "%": "%" }[op] || op;
  }

  /* ── Button animations ── */
  function flashButton(el) {
    el.classList.add("pressed");
    setTimeout(() => el.classList.remove("pressed"), 120);
  }

  /* ── Core actions ── */
  function appendDigit(digit) {
    if (justEvaluated) {
      currentInput  = "";
      justEvaluated = false;
    }

    if (digit === "." && currentInput.includes(".")) return;

    if (currentInput === "0" && digit !== ".") {
      currentInput = digit;
    } else {
      if (currentInput.replace("-", "").length >= 12) return; // max digits
      currentInput += digit;
    }

    updateDisplay();
  }

  function setOperator(op) {
    justEvaluated = false;

    // allow swapping operator before entering second operand
    if (currentInput === "" && previousInput !== "") {
      operator = op;
      updateDisplay();
      return;
    }

    // chain: 3 + 4 [×] → calculate 3+4 first
    if (previousInput !== "" && currentInput !== "") {
      evaluate(true); // silent: don't set justEvaluated
    }

    previousInput = currentInput;
    currentInput  = "";
    operator      = op;
    updateDisplay();
  }

  function evaluate(chained = false) {
    if (previousInput === "" || currentInput === "" || operator === null) return;

    const a = parseFloat(previousInput);
    const b = parseFloat(currentInput);
    let result;

    switch (operator) {
      case "+": result = add(a, b);      break;
      case "-": result = subtract(a, b); break;
      case "*": result = multiply(a, b); break;
      case "/":
        result = b === 0 ? "Error" : divide(a, b);
        break;
      case "%": result = modulo(a, b);   break;
      default:  return;
    }

    currentInput  = String(result);
    previousInput = "";
    operator      = null;
    if (!chained) justEvaluated = true;
    updateDisplay();
  }

  function toggleSign() {
    if (currentInput === "" || currentInput === "0" || currentInput === "Error") return;
    currentInput = currentInput.startsWith("-")
      ? currentInput.slice(1)
      : "-" + currentInput;
    updateDisplay();
  }

  function allClear() {
    currentInput  = "0";
    previousInput = "";
    operator      = null;
    justEvaluated = false;
    mainDisplay.style.fontSize = "3.4rem";
    updateDisplay();
  }

  function backspace() {
    if (justEvaluated || currentInput === "0" || currentInput === "Error") {
      allClear();
      return;
    }
    currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : "0";
    updateDisplay();
  }

  /* ── Keyboard support ── */
  document.addEventListener("keydown", (e) => {
    const key = e.key;
    if (/^[0-9]$/.test(key))       { appendDigit(key); highlightKey(key); }
    else if (key === ".")           { appendDigit("."); highlightKey("."); }
    else if (key === "+")           { setOperator("+"); highlightKey("+"); }
    else if (key === "-")           { setOperator("-"); highlightKey("-"); }
    else if (key === "*")           { setOperator("*"); highlightKey("*"); }
    else if (key === "/")           { e.preventDefault(); setOperator("/"); highlightKey("/"); }
    else if (key === "%")           { setOperator("%"); highlightKey("%"); }
    else if (key === "Enter" || key === "=") { evaluate(); highlightKey("="); }
    else if (key === "Backspace")   { backspace(); }
    else if (key === "Escape")      { allClear(); }
  });

  function highlightKey(char) {
    const map = {
      "+": "btn-plus", "-": "btn-minus", "*": "btn-mul",
      "/": "btn-div",  "%": "btn-mod",   "=": "btn-eq",
      "Escape": "btn-ac"
    };
    const id = map[char];
    if (id) {
      const el = document.getElementById(id);
      if (el) flashButton(el);
    }
  }

  /* ── Public API ── */
  return { appendDigit, setOperator, evaluate, toggleSign, allClear, backspace, flashButton };
})();
