// src/utils/abacusSimulation.js

// ---------- Core bead simulation for ones rod (0-9) ----------
function addOnes(current, delta) {
  if (delta === 0) return { newVal: current, carry: 0, formula: null };
  const upper = current >= 5 ? 1 : 0;
  const lower = current - upper * 5;

  if (delta === 5) {
    if (upper === 0) return { newVal: 5 + lower, carry: 0, formula: null };
    return null;
  }
  if (delta >= 1 && delta <= 4) {
    if (lower + delta <= 4) {
      return { newVal: upper * 5 + (lower + delta), carry: 0, formula: null };
    } else if (upper === 0) {
      return { newVal: 5 + (lower + delta - 5), carry: 0, formula: '+' + delta };
    } else {
      return null;
    }
  }
  if (delta >= 6 && delta <= 9) {
    const complement = 10 - delta;
    const sub = subtractOnes(current, complement);
    if (!sub || sub.borrow !== 0) return null;
    return { newVal: sub.newVal, carry: 1, formula: '+' + delta };
  }
  return null;
}

function subtractOnes(current, delta) {
  if (delta === 0) return { newVal: current, borrow: 0, formula: null };
  const upper = current >= 5 ? 1 : 0;
  const lower = current - upper * 5;

  if (delta === 5) {
    if (upper === 1) return { newVal: lower, borrow: 0, formula: null };
    return null;
  }
  if (delta >= 1 && delta <= 4) {
    if (lower >= delta) {
      return { newVal: upper * 5 + (lower - delta), borrow: 0, formula: null };
    } else if (upper === 1) {
      return { newVal: lower + (5 - delta), borrow: 0, formula: '-' + delta };
    } else {
      return null;
    }
  }
  if (delta >= 6 && delta <= 9) {
    const complement = 10 - delta;
    const add = addOnes(current, complement);
    if (!add || add.carry !== 0) return null;
    return { newVal: add.newVal, borrow: 1, formula: '-' + delta };
  }
  return null;
}

export function simulateSingleDigitStep(current, num, op) {
  if (current < 0 || current > 9 || num < 0 || num > 9) return null;

  let result;
  if (op === '+') {
    result = addOnes(current, num);
    if (!result || result.carry !== 0 || result.newVal > 9) return null;
  } else {
    result = subtractOnes(current, num);
    if (!result || result.borrow !== 0 || result.newVal < 0) return null;
  }
  return { newValue: result.newVal, formula: result.formula };
}

// Pre‑compute all valid single‑digit moves
function buildValidMoves() {
  const validMoves = {};
  for (let current = 0; current <= 9; current++) {
    validMoves[current] = { '+': [], '-': [] };
    for (let num = 1; num <= 9; num++) {
      const addSim = simulateSingleDigitStep(current, num, '+');
      if (addSim) {
        validMoves[current]['+'].push({ num, newValue: addSim.newValue, formula: addSim.formula });
      }
      const subSim = simulateSingleDigitStep(current, num, '-');
      if (subSim) {
        validMoves[current]['-'].push({ num, newValue: subSim.newValue, formula: subSim.formula });
      }
    }
  }
  return validMoves;
}

const VALID_MOVES = buildValidMoves();

function buildSingleDigitProblem(requiredFormula = null) {
  const numbers = [];
  const ops = [];
  let current = Math.floor(Math.random() * 9) + 1; // 1‑9
  numbers.push(current);
  let usedFormula = false;

  for (let step = 0; step < 5; step++) {
    const op = Math.random() < 0.5 ? '+' : '-';
    const moves = VALID_MOVES[current]?.[op] || [];
    
    // IMPORTANT: For direct‑only, we must reject any move that uses a formula
    let validMoves = moves.filter(m => m.formula === null);

    if (validMoves.length === 0) {
      // No valid direct move with this op; try the opposite operation
      const otherOp = op === '+' ? '-' : '+';
      const otherMoves = VALID_MOVES[current]?.[otherOp] || [];
      const otherValid = otherMoves.filter(m => m.formula === null);
      if (otherValid.length === 0) return null;
      const choice = otherValid[Math.floor(Math.random() * otherValid.length)];
      current = choice.newValue;
      numbers.push(choice.num);
      ops.push(otherOp);
    } else {
      const choice = validMoves[Math.floor(Math.random() * validMoves.length)];
      current = choice.newValue;
      numbers.push(choice.num);
      ops.push(op);
    }
  }

  let answer = numbers[0];
  for (let i = 0; i < ops.length; i++) {
    answer = ops[i] === '+' ? answer + numbers[i+1] : answer - numbers[i+1];
  }
  return { numbers, ops, answer };
}

export function generateWorksheet(requiredFormula = null, count = 25) {
  const problems = [];
  for (let i = 0; i < count; i++) {
    let prob = null;
    for (let attempt = 0; attempt < 500; attempt++) {
      prob = buildSingleDigitProblem(requiredFormula);
      if (prob) break;
    }
    if (!prob) {
      // Ultimate fallback – guaranteed direct moves only
      prob = {
        numbers: [5, 2, 3, 1, 4, 2],
        ops: ['+', '-', '+', '-', '+'],
        answer: 5+2-3+1-4+2
      };
    }
    problems.push(prob);
  }
  return problems;
}

// ---------- Two‑digit direct simulation (no formulas) ----------
function simulateTwoDigitStep(current, num, op) {
  let CT = Math.floor(current / 10);
  let CO = current % 10;
  let NT = Math.floor(num / 10);
  let NO = num % 10;

  if (op === '+') {
    let ones = addOnes(CO, NO);
    if (!ones || ones.formula !== null) return null; // reject any formula
    let newCO = ones.newVal;
    let carry = ones.carry;

    let tens = addOnes(CT, NT + carry);
    if (!tens || tens.carry !== 0 || tens.formula !== null) return null;
    let newCT = tens.newVal;
    let newValue = newCT * 10 + newCO;
    if (newValue < 0 || newValue > 99) return null;
    return { newValue };
  } else {
    let ones = subtractOnes(CO, NO);
    if (!ones || ones.formula !== null) return null;
    let newCO = ones.newVal;
    let borrow = ones.borrow;

    let tens = subtractOnes(CT, NT + borrow);
    if (!tens || tens.borrow !== 0 || tens.formula !== null) return null;
    let newCT = tens.newVal;
    let newValue = newCT * 10 + newCO;
    if (newValue < 0 || newValue > 99) return null;
    return { newValue };
  }
}

function buildTwoDigitProblem() {
  const numbers = [];
  const ops = [];
  let current = Math.floor(Math.random() * 90) + 10; // 10‑99
  numbers.push(current);

  for (let step = 0; step < 5; step++) {
    const op = Math.random() < 0.5 ? '+' : '-';
    let num;
    let sim = null;
    let attempts = 0;
    do {
      num = Math.floor(Math.random() * 90) + 10;
      sim = simulateTwoDigitStep(current, num, op);
      attempts++;
      if (attempts > 200) return null;
    } while (!sim);
    
    current = sim.newValue;
    numbers.push(num);
    ops.push(op);
  }

  let answer = numbers[0];
  for (let i = 0; i < ops.length; i++) {
    answer = ops[i] === '+' ? answer + numbers[i+1] : answer - numbers[i+1];
  }
  return { numbers, ops, answer };
}

export function generateTwoDigitWorksheet(count = 25) {
  const problems = [];
  for (let i = 0; i < count; i++) {
    let prob = null;
    for (let attempt = 0; attempt < 500; attempt++) {
      prob = buildTwoDigitProblem();
      if (prob) break;
    }
    if (!prob) {
      prob = {
        numbers: [45, 12, 23, 34, 11, 22],
        ops: ['+', '-', '+', '-', '+'],
        answer: 45+12-23+34-11+22
      };
    }
    problems.push(prob);
  }
  return problems;
}