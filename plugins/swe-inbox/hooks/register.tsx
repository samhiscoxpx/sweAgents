import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { InboxAnswer, InboxItem, InboxKind, InboxOption } from '../types'

// The inbox is one JSON file per item under <main worktree>/.swe/inbox/, so
// every session of the repository (the Co-CTO and each lead's worktree) reads
// and writes the same items. Nothing else is shared between sessions.

const PANE = 'swe-inbox'
const POLL_MS = 3000
const LETTERS = 'ABCDEFGH'
const TOOL_ASK = 'mcp__swe-inbox__ask'
const TOOL_REVISE = 'mcp__swe-inbox__revise'
const TOOL_LIST = 'mcp__swe-inbox__list'

// Change the tag when an item's fields change: it declines what an earlier
// version stored, which outlives a reload.
const items = atom({ plugin: 'swe-inbox', key: 'items' } as const, [], {
  shape: 'items-1',
})
const selected = atom({ plugin: 'swe-inbox', key: 'selected' } as const, null)
const note = atom({ plugin: 'swe-inbox', key: 'note' } as const, '')
const isShowingAnswered = atom(
  { plugin: 'swe-inbox', key: 'isShowingAnswered' } as const,
  false,
)

const GUIDE = `The swe-inbox plugin is on. Its inbox is the home of the decision batch: every question or decision for the human principal (each "Waiting on" item) is filed there.
- Before you put a question to the human principal, file it with ${TOOL_ASK}. It returns the item's W-number. Use that number in the chat; never pick a W-number yourself. Keep the lettered prose in the chat as the core requires.
- Make the context self-contained: the principal reads it in the inbox, away from the chat.
- Use kind "approval" for a merge approval and for a change requiring human approval. The principal gives those in the session that raised them, by typing the answer there; the inbox does not relay them.
- File each item once, in the session that acts on the answer. A Co-CTO filing for a lead names the lead in "from".
- An answer given in the inbox arrives as a prompt that starts "Inbox answer". Act on a decision at once, as for a relayed decision.
- Use ${TOOL_REVISE} to add an option, move [REC], change the context or withdraw an item. Use ${TOOL_LIST} for a status update or a walk-through.`

type Store = { root: string; dir: string; sessionId: string }

// Module variables start over on a reload, and session.start sets them again.
let store: Store | undefined
// Toast only for items that arrive after the first read of the inbox.
let isSeeded = false

function fileOf(id: string) {
  return `${store!.dir}/${id}.json`
}

async function write($: EngineInterface, item: InboxItem) {
  await $.fs.write(fileOf(item.id), JSON.stringify(item, null, 2) + '\n')
}

async function loadAll($: EngineInterface): Promise<InboxItem[]> {
  if (!(await $.fs.exists(store!.dir))) return []
  const found: InboxItem[] = []
  for (const entry of await $.fs.list(store!.dir)) {
    if (entry.kind !== 'file' || !/^W\d+\.json$/.test(entry.name)) continue
    try {
      found.push(cleanItem(JSON.parse(await $.fs.read(`${store!.dir}/${entry.name}`))))
    } catch {
      // A file another session is writing now; the next poll reads it.
    }
  }

  return found.sort((a, b) => numberOf(a.id) - numberOf(b.id))
}

async function loadOne($: EngineInterface, id: string) {
  const all = await loadAll($)

  return all.find(item => item.id === id)
}

async function refresh($: EngineInterface) {
  if (store === undefined) return
  const all = await loadAll($)
  const before = await read($, items)
  const known = new Set(before.map(item => item.id))
  const arrived = all.filter(item => item.status === 'open' && !known.has(item.id))

  if (JSON.stringify(all) !== JSON.stringify(before)) {
    await update($, items, () => all)
  }
  if (isSeeded) {
    for (const item of arrived) {
      $.ui.toast(`Inbox ${item.id} from ${item.from}: ${item.title}`)
    }
    if (arrived.length > 0) void $.ui.open({ id: PANE, title: 'Inbox' })
  }
  isSeeded = true

  const open = all.filter(item => item.status === 'open')
  const approvals = open.filter(item => item.kind === 'approval').length
  $.ui.status(
    open.length === 0
      ? undefined
      : `Inbox: ${open.length} open${approvals > 0 ? `, ${approvals} approval` : ''} · /inbox`,
  )

  await deliver($, all)
}

// An answer given in the pane of any session reaches the session that
// raised the item as a prompt, once.
async function deliver($: EngineInterface, all: InboxItem[]) {
  for (const item of all) {
    const isOwed =
      item.sessionId === store!.sessionId &&
      item.status === 'answered' &&
      item.deliveredAt === undefined
    if (!isOwed) continue
    await write($, { ...item, deliveredAt: await $.clock.now() })
    void $.prompt.submit({ text: deliveryText(item, store!.sessionId) })
  }
}

async function answer(
  $: EngineInterface,
  id: string,
  given: Omit<InboxAnswer, 'at' | 'sessionId'>,
) {
  const item = await loadOne($, id)
  if (item === undefined || item.status !== 'open') {
    $.ui.toast(`${id} is no longer open.`)
    return
  }
  const now = await $.clock.now()
  const isSeenAlready = given.via === 'prompt' && item.sessionId === store!.sessionId
  await write($, {
    ...item,
    status: 'answered',
    answer: { ...given, at: now, sessionId: store!.sessionId },
    ...(isSeenAlready ? { deliveredAt: now } : {}),
  })
  await update($, note, () => '')
  await refresh($)
}

async function nextId($: EngineInterface) {
  const all = await loadAll($)
  let next = all.reduce((most, item) => Math.max(most, numberOf(item.id)), 0) + 1
  while (await $.fs.exists(fileOf(`W${next}`))) next += 1

  return `W${next}`
}

// Opens tui/inbox.py in a terminal window of its own: a tmux split inside
// tmux, else a new window of the terminal this session runs in.
async function launch($: EngineInterface) {
  const running = await runningPid($)
  if (running !== undefined) return `The inbox terminal is already open (process ${running}).`

  const argv = ['/usr/bin/env', 'python3', `${$.plugin.root}/tui/inbox.py`, store!.dir]
  const line = argv.map(shellQuote).join(' ')
  const program = await $.env.get('TERM_PROGRAM')
  const plans: string[][] = []
  if (await $.env.get('TMUX')) plans.push(['tmux', 'split-window', '-h', '-l', '45%', ...argv])
  if (program === 'ghostty') {
    // A window of the Ghostty that runs: `open -na` starts another Ghostty.
    plans.push([
      'osascript',
      '-e',
      'tell application "Ghostty"',
      '-e',
      'set config to new surface configuration',
      '-e',
      `set command of config to ${appleQuote(line)}`,
      '-e',
      'new window with configuration config',
      '-e',
      'activate',
      '-e',
      'end tell',
    ])
  }
  if (program === 'iTerm.app') {
    plans.push([
      'osascript',
      '-e',
      `tell application "iTerm2" to create window with default profile command ${appleQuote(line)}`,
    ])
  }
  if (program === 'Apple_Terminal') {
    plans.push([
      'osascript',
      '-e',
      `tell application "Terminal" to do script ${appleQuote(line)}`,
      '-e',
      'tell application "Terminal" to activate',
    ])
  }
  if (program === 'WezTerm') plans.push(['wezterm', 'cli', 'spawn', '--new-window', '--', ...argv])

  for (const plan of plans) {
    try {
      const ran = await $.process.run(plan, { timeoutMs: 10000 })
      if (ran.exitCode === 0) return `Inbox terminal opened (${plan[0]}).`
    } catch {
      // Not installed here; try the next way.
    }
  }
  const copied = await $.ui.copy({ text: line })

  return `No terminal could be opened from here. Run this in one${copied.isCopied ? ' (copied)' : ''}:\n${line}`
}

// tui/inbox.py writes its process id there while it runs.
async function runningPid($: EngineInterface) {
  const path = `${store!.dir}/terminal.pid`
  if (!(await $.fs.exists(path))) return undefined
  const pid = (await $.fs.read(path)).trim()
  if (!/^\d+$/.test(pid)) return undefined
  const probe = await $.process.run(['/bin/kill', '-0', pid], { timeoutMs: 5000 })

  return probe.exitCode === 0 ? pid : undefined
}

// The file system has no exclusive create, so two sessions can take the same
// number at once. Read the file back and take the next number if it is not ours.
async function file($: EngineInterface, draft: InboxItem) {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const item = { ...draft, id: await nextId($) }
    await write($, item)
    const stored = await loadOne($, item.id)
    if (stored?.sessionId === item.sessionId && stored.createdAt === item.createdAt) return item
  }

  return undefined
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const repo = await $.session.repo()
    const root = repo?.root ?? (await $.session.root())
    store = { root, dir: `${root}/.swe/inbox`, sessionId: await $.session.id() }
    if (!(await $.fs.exists(`${root}/.swe/.gitignore`))) {
      await $.fs.write(`${root}/.swe/.gitignore`, '*\n')
    }

    await $.command.register({
      name: 'inbox',
      description:
        'Open or close the inbox of questions and decisions waiting on you; "terminal" opens it in a terminal window of its own',
      argumentHint: '[terminal]',
    })
    await $.tool.register({
      name: 'ask',
      // The guide rides on the tool description too: a managed plugin may
      // pass prompt.compose by, and the model always reads this.
      description: `File a question or decision for the human principal in the shared inbox and get its W-number.\n\n${GUIDE}`,
      isDeferred: false,
      inputSchema: {
        type: 'object',
        properties: {
          kind: {
            type: 'string',
            enum: ['decision', 'approval'],
            description:
              '"approval" for a merge approval or a change requiring human approval; else "decision"',
          },
          title: { type: 'string', description: 'The question in one line' },
          context: {
            type: 'string',
            description:
              'Self-contained context: what the subject is, what happened, why a decision is needed, what is blocked',
          },
          from: {
            type: 'string',
            description: 'Who raises it, as the principal knows them: "Co-CTO", "lead phase 3"',
          },
          options: {
            type: 'array',
            minItems: 1,
            maxItems: LETTERS.length,
            items: {
              type: 'object',
              properties: {
                text: { type: 'string' },
                cost: { type: 'string', description: 'Its cost, delay and benefit' },
                isRec: { type: 'boolean', description: 'The recommended option; at most one' },
              },
              required: ['text'],
            },
          },
        },
        required: ['kind', 'title', 'context', 'from', 'options'],
      },
    })
    await $.tool.register({
      name: 'revise',
      description:
        'Change an open inbox item: add options (they take the next letters), move [REC], replace the context, or withdraw it. Letters and the W-number never change.',
      isDeferred: false,
      inputSchema: {
        type: 'object',
        properties: {
          id: { type: 'string', description: 'The W-number' },
          addOptions: {
            type: 'array',
            items: {
              type: 'object',
              properties: { text: { type: 'string' }, cost: { type: 'string' } },
              required: ['text'],
            },
          },
          rec: { type: 'string', description: 'The letter to mark [REC]' },
          context: { type: 'string' },
          withdraw: { type: 'string', description: 'Why the item is withdrawn' },
        },
        required: ['id'],
      },
    })
    await $.tool.register({
      name: 'list',
      description:
        'List inbox items with their answers: for a status update, a walk-through, or to check what the principal answered.',
      isDeferred: false,
      inputSchema: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['open', 'answered', 'withdrawn', 'all'] },
        },
      },
    })

    await refresh($)
    $.clock.every(POLL_MS, () => void refresh($))
    if ((await read($, items)).some(item => item.status === 'open')) {
      void $.ui.open({ id: PANE, title: 'Inbox' })
    }

    return next(e)
  })

  // /inbox toggles the pane; Esc closes it while it holds the keyboard.
  on('command.run', { command: 'inbox' }, async ($, e) => {
    if (e.args.trim() === 'terminal') return { text: await launch($) }
    const panes = await $.ui.panes()
    if (panes.some(pane => pane.id === PANE)) {
      await $.ui.close({ id: PANE })
      return { text: 'Inbox closed.' }
    }
    await refresh($)
    await $.ui.open({ id: PANE, title: 'Inbox', focus: true, closeOnEscape: true })

    return { text: 'Inbox opened. Esc or /inbox closes it.' }
  })

  on('prompt.compose', async ($, e, next) => {
    const composed = await next(e)

    return {
      sections: [
        ...composed.sections,
        { id: 'swe-inbox:guide', text: GUIDE, scope: 'session' as const },
      ],
    }
  })

  // "W7: B" typed by the principal answers W7, so the chat and the inbox
  // agree. An approval is answered this way only in the session that raised it.
  on('prompt.submit', async ($, e, next) => {
    const isPerson = e.origin.kind === 'composer' || e.origin.kind === 'bridge'
    if (store === undefined || e.command !== undefined || !isPerson) return next(e)

    for (const [, id = '', letter = ''] of e.text.matchAll(/\b(W\d+)\s*:\s*([A-H])\b/g)) {
      const item = await loadOne($, id)
      const isAnswerable =
        item !== undefined &&
        item.status === 'open' &&
        item.options.some(option => option.letter === letter) &&
        (item.kind === 'decision' || item.sessionId === store.sessionId)
      if (isAnswerable) {
        await answer($, id, { letter, text: e.text.slice(0, 2000), via: 'prompt' })
      }
    }

    return next(e)
  })

  on('tool.call', { tool: TOOL_ASK }, async ($, e) => {
    const options = (e.options as Omit<InboxOption, 'letter'>[] | undefined) ?? []
    if (options.length === 0 || options.length > LETTERS.length) {
      return { deny: `Give between 1 and ${LETTERS.length} options.` }
    }
    if (options.filter(option => option.isRec).length > 1) {
      return { deny: 'Mark at most one option isRec.' }
    }
    const draft: InboxItem = {
      id: '',
      kind: (e.kind as InboxKind) === 'approval' ? 'approval' : 'decision',
      title: String(e.title),
      context: String(e.context),
      from: String(e.from),
      options: options.map((option, i) => ({ ...option, letter: LETTERS.charAt(i) })),
      sessionId: store!.sessionId,
      createdAt: await $.clock.now(),
      status: 'open',
    }
    const item = await file($, draft)
    if (item === undefined) return { deny: 'Another session kept taking the next W-number; try again.' }
    await refresh($)

    return { result: `Filed ${item.id}. Refer to it as ${item.id} in the chat.\n\n${describe(item)}` }
  })

  on('tool.call', { tool: TOOL_REVISE }, async ($, e) => {
    const item = await loadOne($, String(e.id))
    if (item === undefined) return { deny: `No inbox item ${String(e.id)}.` }
    if (item.status !== 'open') return { deny: `${item.id} is ${item.status}.` }

    let options = item.options
    const added = (e.addOptions as Omit<InboxOption, 'letter'>[] | undefined) ?? []
    if (options.length + added.length > LETTERS.length) {
      return { deny: `An item holds at most ${LETTERS.length} options.` }
    }
    options = [
      ...options,
      ...added.map((option, i) => ({ ...option, letter: LETTERS.charAt(options.length + i) })),
    ]
    if (e.rec !== undefined) {
      if (!options.some(option => option.letter === e.rec)) {
        return { deny: `${item.id} has no option ${String(e.rec)}.` }
      }
      options = options.map(option => ({ ...option, isRec: option.letter === e.rec }))
    }
    const revised: InboxItem = {
      ...item,
      options,
      ...(e.context !== undefined ? { context: String(e.context) } : {}),
      ...(e.withdraw !== undefined
        ? { status: 'withdrawn' as const, withdrawnReason: String(e.withdraw) }
        : {}),
    }
    await write($, revised)
    await refresh($)

    return { result: describe(revised) }
  })

  on('tool.call', { tool: TOOL_LIST }, async ($, e) => {
    const status = (e.status as string | undefined) ?? 'all'
    const all = await loadAll($)
    const chosen = status === 'all' ? all : all.filter(item => item.status === status)

    return {
      result:
        chosen.length === 0 ? `No ${status} inbox items.` : chosen.map(describe).join('\n\n'),
    }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const elements = $.ui.resolve(e)
    const { Box, Text, Button } = elements
    const Input = 'Input' in elements ? elements.Input : undefined
    const all = await read($, items)
    const open = all.filter(item => item.status === 'open')
    const closed = all.filter(item => item.status !== 'open')
    const chosenId = await read($, selected)
    // Any item can be read; an answered or withdrawn one is read-only.
    const current = all.find(item => item.id === chosenId) ?? open[0]
    const draft = await read($, note)
    const isShowingClosed = await read($, isShowingAnswered)
    const mine = store?.sessionId
    const isFocused = e.props.isFocused

    const frame = isFocused ? { borderColor: 'claude' } : { borderDimColor: true }

    const record = (item: InboxItem) => {
      const given = item.answer
      const where =
        given?.via === 'terminal'
          ? 'in the inbox terminal'
          : given?.sessionId === mine
            ? 'in this session'
            : 'in another session'

      return (
        <Box flexDirection="column" borderStyle="round" paddingX={1} {...frame}>
          <Text bold>
            {item.id} · {item.title}
          </Text>
          <Text dimColor>
            {item.kind} · from {item.from} · {clock(item.createdAt)} · {item.status}
          </Text>
          <Text>{item.context}</Text>
          {item.options.map(option => (
            <Text
              {...(option.letter === given?.letter ? { color: 'success', bold: true } : { dimColor: true })}
            >
              {option.letter === given?.letter ? '✓ ' : '  '}
              {option.letter}
              {option.isRec ? ' [REC]' : ''} {option.text}
              {option.cost ? ` (${option.cost})` : ''}
            </Text>
          ))}
          {given && (
            <Text color="success">
              Answered {clock(given.at)} {where}
              {given.letter ? `: ${given.letter}` : ', with no option'}
              {item.deliveredAt === undefined ? ' · not yet delivered' : ' · delivered'}
            </Text>
          )}
          {given?.text && given.via !== 'prompt' && <Text>Your note: {given.text}</Text>}
          {given?.text && given.via === 'prompt' && <Text dimColor>You typed: {given.text}</Text>}
          {item.status === 'withdrawn' && (
            <Text color="warning">Withdrawn: {item.withdrawnReason ?? 'no reason given'}</Text>
          )}
        </Box>
      )
    }

    const detail = (item: InboxItem) => {
      if (item.status !== 'open') return record(item)
      const isElsewhereApproval = item.kind === 'approval' && item.sessionId !== mine
      const press = (option: InboxOption) => async () => {
        if (item.kind === 'approval') {
          // The approval has to be the principal's own word in this session,
          // so the pane fills the prompt and the principal sends it.
          await $.prompt.fill({ text: `${item.id}: ${option.letter} `, mode: 'replace' })
          $.ui.toast('Press Esc, then Enter, to give this approval.')
          return
        }
        await answer($, item.id, {
          letter: option.letter,
          ...(draft.trim() === '' ? {} : { text: draft.trim() }),
          via: 'pane',
        })
      }

      return (
        <Box flexDirection="column" borderStyle="round" paddingX={1} {...frame}>
          <Text bold>
            {item.id} · {item.title}
          </Text>
          <Text dimColor>
            {item.kind} · from {item.from} · {clock(item.createdAt)}
          </Text>
          <Text>{item.context}</Text>
          {item.options.map(option =>
            isElsewhereApproval ? (
              <Text>
                {option.letter}
                {option.isRec ? ' [REC]' : ''} {option.text}
              </Text>
            ) : (
              <Button
                key={`option-${item.id}-${option.letter}`}
                plain
                hotkey={option.letter.toLowerCase()}
                onPress={press(option)}
              >
                {option.letter}
                {option.isRec ? ' [REC]' : ''} {option.text}
                {option.cost ? <Text dimColor> ({option.cost})</Text> : ''}
              </Button>
            ),
          )}
          {isElsewhereApproval && (
            <Text color="warning">
              Answer this in the session of {item.from}: an approval must be your own word in the
              session that acts.
            </Text>
          )}
          {item.kind === 'decision' && Input && (
            <Input
              key={`note-${item.id}`}
              label="Note "
              rows={3}
              placeholder="optional; sent with your pick, or Enter sends it alone"
              value={draft}
              onInput={value => void update($, note, () => value)}
              onSubmit={value => {
                if (value.trim() !== '') void answer($, item.id, { text: value.trim(), via: 'pane' })
              }}
            />
          )}
        </Box>
      )
    }

    const row = (item: InboxItem, hotkey: string | undefined) => {
      const isCurrent = item.id === current?.id
      const label =
        item.status === 'open' ? (
          <Text color={item.kind === 'approval' ? 'warning' : 'subtle'}>{item.kind}</Text>
        ) : (
          <Text color={item.status === 'answered' ? 'success' : 'warning'}>
            {item.status === 'answered' ? `✓ ${item.answer?.letter ?? 'note'}` : 'withdrawn'}
          </Text>
        )

      return (
        <Button
          key={`row-${item.id}`}
          plain
          {...(hotkey === undefined ? {} : { hotkey })}
          onPress={() => void update($, selected, () => item.id)}
        >
          {isCurrent ? '› ' : '  '}
          {isCurrent && isFocused ? (
            <Text color="claude" bold>
              {item.id}
            </Text>
          ) : (
            item.id
          )}{' '}
          {label} {item.title} <Text dimColor>{item.from}</Text>
        </Button>
      )
    }

    return (
      <Box flexDirection="column" gap={1}>
        {isFocused ? (
          <Text color="claude" bold>
            ● Keys go to the inbox: 1-9 item · a-h answer · 0 answered · Esc close
          </Text>
        ) : (
          <Text dimColor>○ ctrl+x tab to answer here</Text>
        )}
        <Box flexDirection="column">
          <Text bold>Waiting on you ({open.length})</Text>
          {open.length === 0 && <Text dimColor>Nothing is waiting on you.</Text>}
          {open.map((item, i) => row(item, i < 9 ? String(i + 1) : undefined))}
        </Box>
        {closed.length > 0 && (
          <Box flexDirection="column">
            <Button
              key="toggle-closed"
              plain
              hotkey="0"
              onPress={() => void update($, isShowingAnswered, shown => !shown)}
            >
              {isShowingClosed ? '▾' : '▸'} Answered or withdrawn ({closed.length})
            </Button>
            {isShowingClosed &&
              closed
                .slice()
                .reverse()
                .map(item => row(item, undefined))}
          </Box>
        )}
        {current && detail(current)}
      </Box>
    )
  })
}

// Item text comes from files agents write: a control character in it, ESC
// above all, would drive the terminal the pane draws in. Newlines stay.
function clean(text: string) {
  return text.replace(/[\u0000-\u0009\u000b-\u001f\u007f-\u009f]/g, '\ufffd')
}

function cleanItem(item: InboxItem): InboxItem {
  return {
    ...item,
    title: clean(item.title),
    context: clean(item.context),
    from: clean(item.from),
    options: item.options.map(option => ({
      ...option,
      text: clean(option.text),
      ...(option.cost === undefined ? {} : { cost: clean(option.cost) }),
    })),
    ...(item.answer?.text === undefined ? {} : { answer: { ...item.answer, text: clean(item.answer.text) } }),
    ...(item.withdrawnReason === undefined ? {} : { withdrawnReason: clean(item.withdrawnReason) }),
  }
}

function numberOf(id: string) {
  return Number(id.slice(1)) || 0
}

function clock(ms: number) {
  const at = new Date(ms)

  return `${String(at.getHours()).padStart(2, '0')}:${String(at.getMinutes()).padStart(2, '0')}`
}

function summary(item: InboxItem) {
  if (item.status === 'withdrawn') return `withdrawn (${item.withdrawnReason ?? 'no reason'})`
  const given = item.answer
  if (given === undefined) return 'open'
  const option = item.options.find(one => one.letter === given.letter)
  const pick = option ? `${option.letter}, ${option.text}` : 'no option'
  const words = given.via !== 'prompt' && given.text ? `; note: "${given.text}"` : ''

  return `${pick}${words}${item.deliveredAt === undefined ? ' (not yet delivered)' : ''}`
}

function describe(item: InboxItem) {
  const options = item.options
    .map(
      option =>
        `  ${option.letter}${option.isRec ? ' [REC]' : ''} ${option.text}${option.cost ? ` (${option.cost})` : ''}`,
    )
    .join('\n')

  return `${item.id} [${item.kind}, ${item.status}] ${item.title}\nfrom ${item.from}\n${item.context}\n${options}\nanswer: ${summary(item)}`
}

function deliveryText(item: InboxItem, sessionId: string) {
  const given = item.answer!
  const option = item.options.find(one => one.letter === given.letter)
  const pick = option
    ? `the human principal chose ${option.letter} (${option.text}).`
    : 'the human principal replied without choosing an option.'
  const words = given.text ? ` Their note: "${given.text}".` : ''
  const where =
    given.via === 'terminal'
      ? 'in the inbox terminal, relayed'
      : given.sessionId === sessionId
        ? 'in the inbox pane of this session'
        : 'in the inbox of another session, relayed'

  return `Inbox answer for ${item.id}, "${item.title}": ${pick}${words} Given ${where}.`
}

function shellQuote(word: string) {
  return /^[\w@%+=:,./-]+$/.test(word) ? word : `'${word.replace(/'/g, `'\\''`)}'`
}

function appleQuote(text: string) {
  return `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}
