// src/store/quiz-editor-store.ts (TOOL-SPECIFIC)
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { QuizBank, QuizQuestion } from '@/types/quiz-editor';

interface QuizEditorState {
    /**
     * Currently active quiz bank being edited.
     * Null when no bank is selected.
     */
    currentBank: QuizBank | null;

    /**
     * Questions belonging to the current bank.
     * Empty array when no bank is selected.
     */
    questions: QuizQuestion[];

    /**
     * ID of the currently selected question for editing.
     * Null when no question is selected.
     */
    selectedQuestionId: string | null;

    /**
     * Set the current bank and load its questions.
     * Clears selectedQuestionId when bank changes.
     *
     * @param bank - Bank to activate, or null to deselect
     */
    setCurrentBank: (bank: QuizBank | null) => void;
    setQuestions: (questions: QuizQuestion[]) => void;
    setSelectedQuestionId: (id: string | null) => void;
    updateQuestion: (
        id: string,
        updates: Partial<QuizQuestion['data']>
    ) => void;
    addQuestion: (question: QuizQuestion) => void;
    deleteQuestion: (id: string) => void;
}

export const useQuizEditorStore = create<QuizEditorState>()(
    immer((set) => ({
        currentBank: null,
        questions: [],
        selectedQuestionId: null,

        setCurrentBank: (bank) =>
            set((state) => {
                state.currentBank = bank;
            }),

        setQuestions: (questions) =>
            set((state) => {
                state.questions = questions;
            }),

        setSelectedQuestionId: (id) =>
            set((state) => {
                state.selectedQuestionId = id;
            }),

        updateQuestion: (id, updates) =>
            set((state) => {
                const question = state.questions.find((q) => q.id === id);
                if (question) {
                    Object.assign(question.data, updates);
                    question.metadata.modified_at = new Date().toISOString();
                }
            }),

        addQuestion: (question) =>
            set((state) => {
                state.questions.push(question);
            }),

        deleteQuestion: (id) =>
            set((state) => {
                state.questions = state.questions.filter((q) => q.id !== id);
                if (state.selectedQuestionId === id) {
                    state.selectedQuestionId = null;
                }
            }),
    }))
);
