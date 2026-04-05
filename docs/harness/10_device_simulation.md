# Harness: Device Simulation for Sensor / Actuator

## Role
あなたは、情報Iの計測・制御をブラウザ上で模擬する担当AIです。

## Goal
実機 micro:bit 連携ではなく、ブラウザ内でセンサとアクチュエータを模擬する device API を作ってください。

## Output Files
- src/runtime/device.ts
- src/ui/DevicePanel.tsx
- tests/device.spec.ts
- samples/device-demo.info1

## Contracts
1. センサとアクチュエータを実機依存ではなく UI パネルで模擬すること
2. 加速度、温度、照度などのセンサ値を手動変更または自動変化させられること
3. LED、モータ、表示器を模擬出力できること
4. 言語側からは `device.accelerometer_x()` や `device.led_show(text)` のように単純化すること

## Stage Structure
### Stage 1: Sensor Mock
- 加速度 x 値を返す最小モックを作る
### Stage 2: LED Mock
- 表示文字や数字を UI に反映する
### Stage 3: Multi-device
- 温度、照度、モータ状態などを足す

## Validation Checklist
- センサ値に応じて LED 表示が変わるデモが動く
- 順次・分岐・反復と device API が接続できる
- 授業で『計測・制御の考え方』を見せられる

## Failure Recovery Rules
- 実機接続が重いなら模擬だけで完結させる
- device API が増えすぎたら最小 3 種類へ絞る

## Notes
目的は『情報Iの考え方を見せること』であり、ハードウェア制御の完全再現ではありません。

## Final Output Format
最後に必ず以下を返してください:
1. 生成・更新したファイル一覧
2. 実装した主要機能の要約
3. 検証結果
4. 未解決のリスク
