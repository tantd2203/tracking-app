import type { Database } from './database.types'

type Tables = Database['public']['Tables']

/** Kiểu dữ liệu ứng dụng, lấy từ schema DB đã sinh. */
export type Board = Tables['boards']['Row']
export type List = Tables['lists']['Row']
export type Card = Tables['cards']['Row']
export type Label = Tables['labels']['Row']
export type ChecklistItem = Tables['checklist_items']['Row']
export type Activity = Tables['activities']['Row']
export type Profile = Tables['profiles']['Row']

export type ListKey = 'todo' | 'doing' | 'done'
export type Priority = 'none' | 'low' | 'med' | 'high'
