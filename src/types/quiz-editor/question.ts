/**
 * Quiz Editor specific question types.
 *
 * NOTE: Quiz Editor specific - keep in tool namespace
 * TODO: When building tool #2, these patterns inform what becomes framework-level
 */

import type { UUID, Artifact, TiptapJSON } from '../core/';

/**
 * Available question formats for Quiz Editor.
 * Derived from single source of truth for type safety.
 */
export const QUESTION_FORMS = [
    'multiple_choice',
    'multiple_response',
    'true_false',
] as const;

/**
 * Question format type - one of: multiple_choice, multiple_response, true_false
 *
 * @example
 * const format: QuestionForm = 'multiple_choice'
 */
export type QuestionForm = (typeof QUESTION_FORMS)[number];

export interface QuizQuestionAnswer {
    id: UUID;
    text: TiptapJSON;
    is_correct: boolean;
}

export interface QuizQuestionFeedback {
    correct: TiptapJSON;
    incorrect: TiptapJSON;
}

export interface QuizQuestionSettings {
    points?: number;
    attempts?: number;
    randomize?: boolean;
}

export interface QuizQuestionData {
    question_type: QuestionForm;
    prompt: TiptapJSON;
    answers: QuizQuestionAnswer[];
    feedback: QuizQuestionFeedback;
    settings: QuizQuestionSettings;
}

export interface QuizQuestion extends Artifact {
    type: 'quiz-question';
    data: QuizQuestionData;
}

/**
 * Type guard to check if an artifact is a QuizQuestion
 *
 * @example
 * const artifact: Artifact = ...;
 * if (isQuizQuestion(artifact)) {
 *     // artifact is now typed as QuizQuestion
 *     console.log(artifact.data.prompt);
 * }
 */
export function isQuizQuestion(artifact: Artifact): artifact is QuizQuestion {
    return artifact.type === 'quiz-question';
}
