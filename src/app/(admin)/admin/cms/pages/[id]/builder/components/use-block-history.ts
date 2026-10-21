"use client"

import { useCallback, useReducer } from "react"
import type { Block } from "@/lib/page-builder/document"

const HISTORY_LIMIT = 100
// Các thay đổi liên tiếp cùng một field (vd: gõ chữ) trong khoảng này được gộp thành một bước undo
const MERGE_WINDOW_MS = 1200

interface HistoryState {
  past: Block[][]
  present: Block[]
  future: Block[][]
  mergeKey: string | null
  mergedAt: number
}

type HistoryAction =
  | { type: "set"; update: Block[] | ((current: Block[]) => Block[]); mergeKey?: string; at: number }
  | { type: "undo" }
  | { type: "redo" }

function reducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case "set": {
      const blocks = typeof action.update === "function" ? action.update(state.present) : action.update
      if (blocks === state.present) return state
      const canMerge =
        action.mergeKey !== undefined &&
        action.mergeKey === state.mergeKey &&
        action.at - state.mergedAt < MERGE_WINDOW_MS &&
        state.past.length > 0
      return {
        past: canMerge ? state.past : [...state.past, state.present].slice(-HISTORY_LIMIT),
        present: blocks,
        future: [],
        mergeKey: action.mergeKey ?? null,
        mergedAt: action.at,
      }
    }
    case "undo": {
      if (state.past.length === 0) return state
      const previous = state.past[state.past.length - 1]
      return {
        past: state.past.slice(0, -1),
        present: previous,
        future: [state.present, ...state.future].slice(0, HISTORY_LIMIT),
        mergeKey: null,
        mergedAt: 0,
      }
    }
    case "redo": {
      if (state.future.length === 0) return state
      const [next, ...rest] = state.future
      return {
        past: [...state.past, state.present].slice(-HISTORY_LIMIT),
        present: next,
        future: rest,
        mergeKey: null,
        mergedAt: 0,
      }
    }
  }
}

export function useBlockHistory(initial: Block[]) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    past: [],
    present: initial,
    future: [],
    mergeKey: null,
    mergedAt: 0,
  }))

  /** Cập nhật danh sách block (hàm cập nhật phải thuần vì reducer có thể chạy hai lần ở StrictMode) */
  const setBlocks = useCallback((update: Block[] | ((current: Block[]) => Block[]), mergeKey?: string) => {
    dispatch({ type: "set", update, mergeKey, at: Date.now() })
  }, [])
  const undo = useCallback(() => dispatch({ type: "undo" }), [])
  const redo = useCallback(() => dispatch({ type: "redo" }), [])

  return {
    blocks: state.present,
    setBlocks,
    undo,
    redo,
    canUndo: state.past.length > 0,
    canRedo: state.future.length > 0,
  }
}
