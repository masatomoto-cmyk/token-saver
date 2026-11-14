import type { Register } from 'claude-code'

// これより長い出力だけ縮める（文字数）。短い出力には一切触らない
const LIMIT = 6000
// 縮めるとき、頭と終わりに残す文字数
const KEEP = 2500

function shrink(text: string): string {
  if (text.length <= LIMIT) return text
  const omitted = text.length - KEEP * 2
  return (
    text.slice(0, KEEP) +
    `\n…[token-saver: 途中の ${omitted} 文字を省略。全部見たいときは grep・head・tail・sed -n で絞って再実行]…\n` +
    text.slice(-KEEP)
  )
}

export const register: Register = on => {
  // 節約した文字数のこの回の合計（再読み込みで 0 に戻る）
  let saved = 0

  on('tool.call', { tool: 'Bash' }, async ($, e, next) => {
    const ran = await next(e)
    // エラー（終了コードが 0 以外）・拒否・結果なしはそのまま通す。原因を探すときに全文が要るため
    if (ran.deny !== undefined || ran.isError === true) return ran
    const r = ran.result as { stdout?: string; stderr?: string } | undefined
    if (!r || typeof r.stdout !== 'string') return ran

    const out = shrink(r.stdout)
    const err = typeof r.stderr === 'string' ? shrink(r.stderr) : r.stderr
    const cut = r.stdout.length - out.length + ((r.stderr?.length ?? 0) - (err?.length ?? 0))
    if (cut <= 0) return ran

    saved += cut
    // 日本語混じりのおおまかな目安として 1 トークン ≒ 2 文字
    $.ui.status(`token-saver: 約 ${Math.round(saved / 2).toLocaleString()} トークン節約`)
    return { ...ran, result: { ...r, stdout: out, stderr: err } } as typeof ran
  })
}
