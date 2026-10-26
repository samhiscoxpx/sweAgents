import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

const ROOT = '/repo'
const DIR = `${ROOT}/.swe/inbox`

const PANE = {
  plugin: 'swe-inbox',
  component: 'Pane',
  requestId: 'swe-inbox',
  props: {
    title: 'Inbox',
    isFocused: false,
    bodyColumns: 60,
    placement: 'dock',
    scroll: { offset: 0, bodyRows: 30 },
    view: {},
  },
} as const

const ASK = {
  tool: 'mcp__swe-inbox__ask',
  kind: 'decision',
  title: 'Cache layer: Redis or in-memory?',
  context: 'Phase 3 needs a cache. Redis adds a container; in-memory loses data on restart.',
  from: 'lead phase 3',
  options: [{ text: 'In-memory', cost: 'half a day', isRec: true }, { text: 'Redis', cost: 'two days' }],
} as const

// Each hook stands for the engine: files live in a map, prompts are recorded.
function engine(on: On, sessionId: string, files: Map<string, string>, prompts: string[]) {
  const isDir = (path: string) => [...files.keys()].some(name => name.startsWith(`${path}/`))
  on('session.start', (_, e) => ({ cwd: e.cwd }))
  on('session.id', () => ({ value: sessionId }))
  on('session.repo', () => ({ value: { root: ROOT, remote: null, internal: false, name: null } }))
  on('session.root', () => ({ value: ROOT }))
  on('command.register', () => ({ value: { command: 'inbox' } }))
  on('tool.register', (_, e) => ({ value: { tool: `mcp__swe-inbox__${e.name}` } }))
  on('ui.open', () => ({ value: { isPlaced: true } }))
  on('ui.status', () => ({ value: undefined }))
  on('ui.toast', () => ({ value: undefined }))
  on('fs.exists', (_, e) => ({ value: files.has(e.path) || isDir(e.path) }))
  on('fs.read', (_, e) => ({ value: files.get(e.path) ?? '' }))
  on('fs.write', (_, e) => {
    files.set(e.path, e.text)
    return { value: undefined }
  })
  on('fs.list', (_, e) => ({
    value: [...files.keys()]
      .filter(name => name.startsWith(`${e.path}/`))
      .map(name => ({ name: name.slice(e.path.length + 1), kind: 'file' as const, size: 1, mtimeMs: 0, isLink: false })),
  }))
  on('prompt.submit', (_, e) => {
    prompts.push(e.text)
    return { text: e.text }
  })
}

test('an answer given in the pane reaches the session that asked', async ($, on) => {
  const files = new Map<string, string>()
  const prompts: string[] = []
  mock.clock(on, { now: 1000 })
  engine(on, 'session-lead', files, prompts)

  await $.session.start({ cwd: ROOT, surface: 'terminal', isInteractive: true })
  const filed = await $.tool.call(ASK)
  expect(String(filed.result)).toContain('Filed W1')
  expect(JSON.parse(files.get(`${DIR}/W1.json`)!).options[0]).toMatchObject({ letter: 'A', isRec: true })
  expect(files.get(`${ROOT}/.swe/.gitignore`)).toBe('*\n')

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect((await ui.find({ type: 'Text', text: /Redis adds a container/ }))?.text).toBeDefined()
  await ui.press({ key: 'option-W1-A' })
  await ui.unmount()

  const item = JSON.parse(files.get(`${DIR}/W1.json`)!)
  expect(item.status).toBe('answered')
  expect(item.answer.letter).toBe('A')
  expect(item.deliveredAt).toBeDefined()
  expect(prompts).toHaveLength(1)
  expect(prompts[0]).toContain('Inbox answer for W1')
})

test('a typed "W1: B" answers the item without a second delivery', async ($, on) => {
  const files = new Map<string, string>()
  const prompts: string[] = []
  mock.clock(on, { now: 1000 })
  engine(on, 'session-lead', files, prompts)

  await $.session.start({ cwd: ROOT, surface: 'terminal', isInteractive: true })
  await $.tool.call(ASK)
  await $.prompt.submit({ text: 'W1: B, Redis is already in staging.', origin: { kind: 'composer' }, wait: false })

  const item = JSON.parse(files.get(`${DIR}/W1.json`)!)
  expect(item.answer).toMatchObject({ letter: 'B', via: 'prompt' })
  expect(prompts.filter(text => text.startsWith('Inbox answer'))).toHaveLength(0)
})

test('an approval raised by another session cannot be answered here', async ($, on) => {
  const files = new Map<string, string>()
  const prompts: string[] = []
  mock.clock(on, { now: 1000 })
  engine(on, 'session-co-cto', files, prompts)
  files.set(
    `${DIR}/W4.json`,
    JSON.stringify({
      id: 'W4',
      kind: 'approval',
      title: 'Merge phase 3 chunk 2?',
      context: 'All required checks pass.',
      options: [{ letter: 'A', text: 'Merge' }, { letter: 'B', text: 'Hold' }],
      from: 'lead phase 3',
      sessionId: 'session-lead',
      createdAt: 0,
      status: 'open',
    }),
  )

  await $.session.start({ cwd: ROOT, surface: 'terminal', isInteractive: true })
  await $.prompt.submit({ text: 'W4: A', origin: { kind: 'composer' }, wait: false })
  expect(JSON.parse(files.get(`${DIR}/W4.json`)!).status).toBe('open')

  const ui = await $.ui.mount({ ...PANE, surface: 'desktop' })
  expect(await ui.find({ type: 'Button', key: 'option-W4-A' })).toBeUndefined()
  expect((await ui.find({ type: 'Text', text: /Answer this in the session of lead phase 3/ }))?.text).toBeDefined()
  await ui.unmount()
})

test('the pane says whether it holds the keyboard', async ($, on) => {
  mock.clock(on, { now: 1000 })
  engine(on, 'session-lead', new Map(), [])
  await $.session.start({ cwd: ROOT, surface: 'terminal', isInteractive: true })

  const focused = await $.ui.mount({ ...PANE, props: { ...PANE.props, isFocused: true }, surface: 'terminal' })
  expect(await focused.find({ type: 'Text', text: /Keys go to the inbox/ })).toBeDefined()
  await focused.unmount()

  const unfocused = await $.ui.mount({ ...PANE, surface: 'terminal' })
  expect(await unfocused.find({ type: 'Text', text: /ctrl\+x tab to answer here/ })).toBeDefined()
  await unfocused.unmount()
})

test('an answered item can be opened and read again', async ($, on) => {
  const files = new Map<string, string>()
  mock.clock(on, { now: 1000 })
  engine(on, 'session-lead', files, [])
  await $.session.start({ cwd: ROOT, surface: 'terminal', isInteractive: true })
  await $.tool.call(ASK)
  await $.tool.call({ ...ASK, title: 'Second question' })

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  await ui.input({ key: 'note-W1', text: 'keep it simple', kind: 'change' })
  await ui.press({ key: 'option-W1-A' })
  await ui.press({ key: 'row-W2' })
  expect(await ui.find({ type: 'Text', text: /Your note/ })).toBeUndefined()

  await ui.press({ key: 'toggle-closed' })
  await ui.press({ key: 'row-W1' })
  expect(await ui.find({ type: 'Text', text: /Redis adds a container/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /✓ A/ })).toBeDefined()
  expect(await ui.find({ type: 'Text', text: /Your note: keep it simple/ })).toBeDefined()
  expect(await ui.find({ type: 'Button', key: 'option-W1-B' })).toBeUndefined()
  await ui.unmount()
})

test('control characters in an item are not drawn', async ($, on) => {
  const files = new Map<string, string>()
  mock.clock(on, { now: 1000 })
  engine(on, 'session-lead', files, [])
  files.set(
    `${DIR}/W1.json`,
    JSON.stringify({
      id: 'W1',
      kind: 'decision',
      title: 'Evil\u001b]52;c;aGk=\u0007 title',
      context: 'line one\nline two\u001b[2J',
      options: [{ letter: 'A', text: 'ok\u009b' }],
      from: 'lead',
      sessionId: 'session-lead',
      createdAt: 0,
      status: 'open',
    }),
  )
  await $.session.start({ cwd: ROOT, surface: 'terminal', isInteractive: true })

  const ui = await $.ui.mount({ ...PANE, surface: 'terminal' })
  const texts = (await ui.findAll({})).map(found => found.text ?? '').join('\n')
  expect(texts).not.toMatch(/[\u001b\u0007\u009b]/)
  expect(texts).toContain('Evil�]52;c;aGk=� title')
  expect(texts).toContain('line one\nline two�[2J')
  await ui.unmount()
})
