# Test Matrix

| Category | Example | Covered by |
| --- | --- | --- |
| Sequential / Assignment | `x = 10`, `print(x)` | `tests/evaluator.spec.ts` |
| Branch | `if score >= 60` | `tests/evaluator.spec.ts` |
| Loop | `for range`, `while` | `tests/evaluator.spec.ts`, `tests/control-flow.spec.ts` |
| Lists / Functions | `len`, list index, `def/return` | `tests/evaluator.spec.ts`, `tests/lists-random-functions.spec.ts` |
| Random | `random.randrange` | `tests/evaluator.spec.ts`, `tests/lists-random-functions.spec.ts` |
| WebAPI | `webapi.get_json` | `tests/webapi.spec.ts` |
| Device | `device.temperature`, `device.led_show` | `tests/device.spec.ts` |
| Parser | syntax, member call, indentation | `tests/parser.spec.ts` |
