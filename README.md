# token-saver

Claude Code の mod。Claude が実行したコマンド（Bash）の出力が長いとき（6,000 文字を超えたとき）、頭と終わりの 2,500 文字ずつだけ残して、真ん中を省略する。Claude が読む量が減るので、トークンの節約になる。

- 正常に終わったコマンドだけが対象。エラーで終わったコマンドの出力は、原因を探すのに全文が要るので縮めない
- 省略した所には `…[token-saver: 途中の ○○ 文字を省略 …]…` という印が入る。Claude は必要なら grep・head・tail で絞って再実行する
- 節約した量の目安を、ステータス行に「token-saver: 約 ○○ トークン節約」と出す
- 基準の文字数は `hooks/register.ts` の `LIMIT` と `KEEP` で変えられる

## 入れ方

ターミナルの Claude Code で:

```
/plugin install token-saver --marketplace masatomoto-cmyk/token-saver
```

マーケットプレイスを追加するか聞かれたら `y`、そのあと入れる範囲を選ぶ。
