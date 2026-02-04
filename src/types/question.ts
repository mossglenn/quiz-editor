/**
 * Question-specific types for the Quiz Editor plugin.
 * These extend the base Artifact types with question-specific data shapes.
 */

import type { Artifact, TiptapJSON } from './artifact'

// --- Question Types ---

export type QuestionType = 'multiple_choice' | 'multiple_response' | 'true_false'

export interface Answer {
  id: string
  text: TiptapJSON
  is_correct: boolean
}

export interface QuestionFeedback {
  correct: TiptapJSON
  incorrect: TiptapJSON
}

export interface QuestionSettings {
  points?: number
  attempts?: number
  randomize?: boolean
}

export interface QuestionData {
  question_type: QuestionType
  prompt: TiptapJSON
  answers: Answer[]
  feedback: QuestionFeedback
  settings: QuestionSettings
}

export interface QuestionArtifact extends Artifact {
  type: 'question'
  data: QuestionData
}

// --- Question Bank ---

export interface BankSettings {
  passing_grade?: number
  attempts_allowed?: number
}

export interface BankData {
  title: string
  description?: string
  question_ids: string[]
  settings: BankSettings
}

export interface BankArtifact extends Artifact {
  type: 'question-bank'
  data: BankData
}

// --- Project ---

export interface Project {
  id: string
  name: string
  description?: string
  owner_id: string
  created_at: string
  updated_at: string
}
