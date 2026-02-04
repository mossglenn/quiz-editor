import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { Project, BankArtifact, QuestionArtifact } from '@/types'

interface AppState {
  // Current selections
  projects: Project[]
  currentProject: Project | null
  currentBank: BankArtifact | null
  questions: QuestionArtifact[]
  selectedQuestionId: string | null

  // Actions — projects
  setProjects: (projects: Project[]) => void
  setCurrentProject: (project: Project | null) => void

  // Actions — banks
  setCurrentBank: (bank: BankArtifact | null) => void

  // Actions — questions
  setQuestions: (questions: QuestionArtifact[]) => void
  setSelectedQuestionId: (id: string | null) => void
  updateQuestion: (id: string, updates: Partial<QuestionArtifact['data']>) => void
  addQuestion: (question: QuestionArtifact) => void
  deleteQuestion: (id: string) => void
}

export const useAppStore = create<AppState>()(
  immer((set) => ({
    projects: [],
    currentProject: null,
    currentBank: null,
    questions: [],
    selectedQuestionId: null,

    setProjects: (projects) =>
      set((state) => {
        state.projects = projects
      }),

    setCurrentProject: (project) =>
      set((state) => {
        state.currentProject = project
      }),

    setCurrentBank: (bank) =>
      set((state) => {
        state.currentBank = bank
      }),

    setQuestions: (questions) =>
      set((state) => {
        state.questions = questions
      }),

    setSelectedQuestionId: (id) =>
      set((state) => {
        state.selectedQuestionId = id
      }),

    updateQuestion: (id, updates) =>
      set((state) => {
        const question = state.questions.find((q) => q.id === id)
        if (question) {
          Object.assign(question.data, updates)
          question.metadata.modified_at = new Date().toISOString()
        }
      }),

    addQuestion: (question) =>
      set((state) => {
        state.questions.push(question)
      }),

    deleteQuestion: (id) =>
      set((state) => {
        state.questions = state.questions.filter((q) => q.id !== id)
        if (state.selectedQuestionId === id) {
          state.selectedQuestionId = null
        }
      }),
  }))
)
