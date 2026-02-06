/**
 * Quiz Editor Type Exports
 * 
 * Re-exports types specific to the Quiz Editor tool/plugin.
 * Import from here rather than individual files for consistency.
 * 
 * Categories:
 * - Questions: QuizQuestion, QuestionForm, QuizQuestionData
 * - Banks: QuizBank, QuizBankData
 * - Supporting: Answer, Feedback, Settings types
 * 
 * @module types/quiz-editor
 * @category Quiz Editor Plugin
 * 
 * @example
 * // Recommended: Import from quiz-editor index
 * import type { QuizQuestion, QuizBank } from '@/types/quiz-editor';
 * 
 * @example
 * // Avoid: Importing from individual files
 * import type { QuizQuestion } from '@/types/quiz-editor/question';
 * import type { QuizBank } from '@/types/quiz-editor/bank';
 */

// Question types
export type {
    QuestionForm,
    QuizQuestionAnswer,
    QuizQuestionFeedback,
    QuizQuestionSettings,
    QuizQuestionData,
    QuizQuestion,
} from './question';

// Bank types
export type { QuizBankSettings, QuizBankData, QuizBank } from './bank';
