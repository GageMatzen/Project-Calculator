# Calculator — Pseudocode

## Data / State
```
currentInput  ← ""        // what the user is currently typing
previousInput ← ""        // the left-hand operand
operator      ← null      // pending operator (+, −, ×, ÷, %)
justEvaluated ← false     // true right after "=" is pressed
```

---

## UI Elements
- Display panel (shows currentInput or result)
- Digit buttons: 0–9, decimal point "."
- Operator buttons: +  −  ×  ÷  %
- Action buttons: AC (all clear), ± (toggle sign), = (evaluate)

---

## Core Functions

### appendDigit(digit)
```
IF justEvaluated THEN
    currentInput  ← ""
    justEvaluated ← false
END IF

IF digit == "." AND currentInput contains "." THEN
    RETURN   // prevent duplicate decimal
END IF

IF currentInput == "0" AND digit != "." THEN
    currentInput ← digit          // replace leading zero
ELSE
    currentInput ← currentInput + digit
END IF

updateDisplay(currentInput)
```

### setOperator(op)
```
IF currentInput == "" AND previousInput != "" THEN
    operator ← op     // allow changing operator mid-chain
    RETURN
END IF

IF previousInput != "" AND currentInput != "" THEN
    evaluate()        // chain calculation: 3 + 4 × ...
END IF

previousInput ← currentInput
currentInput  ← ""
operator      ← op

updateDisplay(previousInput + " " + op)
```

### evaluate()
```
IF previousInput == "" OR currentInput == "" THEN RETURN END IF
IF operator == null THEN RETURN END IF

a ← toNumber(previousInput)
b ← toNumber(currentInput)

SWITCH operator
    CASE "+"  → result ← add(a, b)
    CASE "−"  → result ← subtract(a, b)
    CASE "×"  → result ← multiply(a, b)
    CASE "÷"  → IF b == 0 THEN result ← "Error: ÷ 0"
                ELSE result ← divide(a, b)
    CASE "%"  → result ← modulo(a, b)
END SWITCH

currentInput  ← formatResult(result)
previousInput ← ""
operator      ← null
justEvaluated ← true

updateDisplay(currentInput)
```

### toggleSign()
```
IF currentInput != "" AND currentInput != "0" THEN
    IF currentInput starts with "−" THEN
        currentInput ← remove leading "−"
    ELSE
        currentInput ← "−" + currentInput
    END IF
    updateDisplay(currentInput)
END IF
```

### allClear()
```
currentInput  ← "0"
previousInput ← ""
operator      ← null
justEvaluated ← false
updateDisplay("0")
```

---

## Math Primitives

### add(a, b)        → RETURN a + b
### subtract(a, b)   → RETURN a − b
### multiply(a, b)   → RETURN a × b
### divide(a, b)     → RETURN a / b
### modulo(a, b)     → RETURN a mod b

---

## Helper Functions

### updateDisplay(value)
```
trim value to max 12 characters (scientific notation if needed)
render value inside display element
```

### formatResult(number)
```
IF number is integer THEN RETURN number as string
ELSE RETURN number rounded to 10 decimal places, trailing zeros stripped
END IF
```

---

## Event Flow

```
User clicks "7"    → appendDigit("7")
User clicks "+"    → setOperator("+")
User clicks "3"    → appendDigit("3")
User clicks "="    → evaluate()          → display shows "10"
User clicks "AC"   → allClear()          → display shows "0"
```
