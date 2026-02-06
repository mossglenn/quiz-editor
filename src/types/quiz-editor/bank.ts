/**
 * Question bank type for the Quiz Editor plugin.
 */

import type { UUID, Artifact } from '../idide/';

export interface QuizBankSettings {
    passing_grade?: number;
    attempts_allowed?: number;
}

export interface QuizBankData {
    title: string;
    description?: string;
    question_ids: UUID[];
    settings: QuizBankSettings;
}

export interface QuizBank extends Artifact {
    type: 'question-bank';
    data: QuizBankData;
}

/**
 * Type guard to check if an artifact is a QuizBank
 *
 * @example
 * const artifact: Artifact = ...;
 * if (isQuizBank(artifact)) {
 *     // artifact is now typed as QuizBank
 *     console.log(artifact.data.title);
 * }
 */
export function isQuizBank(artifact: Artifact): artifact is QuizBank {
    return artifact.type === 'question-bank';
}
