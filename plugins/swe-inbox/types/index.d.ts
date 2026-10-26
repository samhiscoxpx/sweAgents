export type InboxKind = 'decision' | 'approval'

export type InboxStatus = 'open' | 'answered' | 'withdrawn'

export type InboxOption = {
  letter: string
  text: string
  cost?: string
  isRec?: boolean
}

export type InboxAnswer = {
  letter?: string
  text?: string
  at: number
  // The session the human principal answered in.
  sessionId: string
  // 'terminal' is the standalone inbox, tui/inbox.py.
  via: 'pane' | 'prompt' | 'terminal'
}

export type InboxItem = {
  id: string
  kind: InboxKind
  title: string
  context: string
  options: InboxOption[]
  from: string
  // The session that raised the item and acts on the answer.
  sessionId: string
  createdAt: number
  status: InboxStatus
  answer?: InboxAnswer
  withdrawnReason?: string
  deliveredAt?: number
}

declare module 'claude-code' {
  interface PluginState {
    'swe-inbox': {
      items: Shaped<InboxItem[]>
      selected: string | null
      note: string
      isShowingAnswered: boolean
    }
  }
}
