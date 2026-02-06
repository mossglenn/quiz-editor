/**
 * Quiz Editor State Store
 * 
 * Manages state specific to the Quiz Editor tool/plugin.
 * Handles banks, questions, and question editing workflow.
 * 
 * @module store/quiz-editor-store
 * @category Quiz Editor Plugin
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { QuizBank, QuizQuestion } from '@/types/quiz-editor';

/**
 * Quiz Editor state interface.
 * 
 * NOTE: This is tool-specific state. Do not add framework-level
 * concerns here - those belong in core-store.ts
 */
interface QuizEditorState {
    /**
     * Currently active quiz bank being edited.
     * Null when no bank is selected (e.g., on bank list page).
     * 
     * When a bank is selected:
     * - questions[] should contain that bank's questions
     * - Tools operate within this bank's scope
     */
    currentBank: QuizBank | null;

    /**
     * Questions belonging to the current bank.
     * Empty array when no bank is selected.
     * 
     * Updates to questions are tracked via metadata.modified_at
     * for auto-save and conflict detection.
     */
    questions: QuizQuestion[];

    /**
     * ID of the currently selected question for editing.
     * Null when no question is selected.
     * 
     * Used by the question editor to know which question to display
     * in the editing panel. Changes when user clicks different questions
     * in the question list sidebar.
     */
    selectedQuestionId: string | null;

    /**
     * Set the current bank and load its questions.
     * 
     * When changing banks:
     * - Previous bank's questions should be saved first
     * - New bank's questions should be loaded
     * - Selected question ID is preserved if it exists in new bank
     * 
     * @param bank - Bank to activate, or null to deselect
     * 
     * @example
     * // Open a bank for editing
     * const { setCurrentBank, setQuestions } = useQuizEditorStore();
     * const bank = await storageAdapter.getArtifact(bankId);
     * const questions = await storageAdapter.getArtifacts(projectId, 'quiz-question');
     * setCurrentBank(bank);
     * setQuestions(questions);
     * 
     * @example
     * // Exit bank (return to bank list)
     * setCurrentBank(null);
     * setQuestions([]);
     */
    setCurrentBank: (bank: QuizBank | null) => void;

    /**
     * Replace the entire questions list.
     * Used when loading questions from backend for the current bank.
     * 
     * @param questions - Complete list of questions for current bank
     * 
     * @example
     * const { setQuestions } = useQuizEditorStore();
     * const questions = await storageAdapter.getArtifacts(projectId, 'quiz-question');
     * setQuestions(questions);
     */
    setQuestions: (questions: QuizQuestion[]) => void;

    /**
     * Set which question is selected for editing.
     * Changes the question displayed in the editor panel.
     * 
     * @param id - Question ID to select, or null to deselect
     * 
     * @example
     * // Select a question for editing
     * const { setSelectedQuestionId } = useQuizEditorStore();
     * setSelectedQuestionId(question.id);
     * 
     * @example
     * // Deselect (maybe after deleting current question)
     * setSelectedQuestionId(null);
     */
    setSelectedQuestionId: (id: string | null) => void;

    /**
     * Update a question's data fields.
     * Automatically updates metadata.modified_at timestamp.
     * 
     * This is for in-memory updates during editing.
     * Caller is responsible for persisting to storage adapter.
     * 
     * @param id - ID of question to update
     * @param updates - Partial question data to merge
     * 
     * @example
     * // Update question prompt
     * const { updateQuestion } = useQuizEditorStore();
     * updateQuestion(questionId, {
     *   prompt: newTiptapJSON
     * });
     * 
     * @example
     * // Update answer correctness
     * updateQuestion(questionId, {
     *   answers: updatedAnswersArray
     * });
     */
    updateQuestion: (
        id: string,
        updates: Partial<QuizQuestion['data']>
    ) => void;

    /**
     * Add a new question to the current bank.
     * 
     * Question should be created with proper structure before adding:
     * - Unique ID
     * - Correct type ('quiz-question')
     * - Valid metadata with timestamps
     * - Empty/default data fields
     * 
     * Caller is responsible for persisting to storage adapter
     * and updating the bank's question_ids list.
     * 
     * @param question - New question to add
     * 
     * @example
     * const { addQuestion, currentBank } = useQuizEditorStore();
     * const newQuestion: QuizQuestion = {
     *   id: crypto.randomUUID(),
     *   project_id: currentBank.project_id,
     *   type: 'quiz-question',
     *   schema_version: '1.0.0',
     *   metadata: {
     *     created_by: userId,
     *     created_at: new Date().toISOString(),
     *     modified_at: new Date().toISOString(),
     *     modified_by: userId,
     *   },
     *   data: {
     *     question_type: 'multiple_choice',
     *     prompt: emptyTiptapJSON,
     *     answers: [],
     *     feedback: { correct: emptyTiptapJSON, incorrect: emptyTiptapJSON },
     *     settings: {}
     *   }
     * };
     * addQuestion(newQuestion);
     * await storageAdapter.saveArtifact(newQuestion);
     */
    addQuestion: (question: QuizQuestion) => void;

    /**
     * Delete a question from the current bank.
     * 
     * If the deleted question was selected, clears the selection.
     * Caller is responsible for:
     * - Persisting deletion to storage adapter
     * - Updating the bank's question_ids list
     * - Confirming deletion with user (if needed)
     * 
     * @param id - ID of question to delete
     * 
     * @example
     * const { deleteQuestion } = useQuizEditorStore();
     * if (confirm('Delete this question?')) {
     *   deleteQuestion(questionId);
     *   await storageAdapter.deleteArtifact(questionId);
     * }
     */
    deleteQuestion: (id: string) => void;
}

/**
 * Quiz Editor state store hook.
 * 
 * Uses Zustand with Immer middleware for immutable state updates.
 * This store only contains Quiz Editor-specific state.
 * For framework-level state (projects, artifacts), use useCoreStore.
 * 
 * @returns QuizEditorState store instance with state and actions
 * 
 * @example
 * // In a component - get full state
 * function QuestionEditor() {
 *   const { questions, selectedQuestionId, updateQuestion } = useQuizEditorStore();
 *   const selectedQuestion = questions.find(q => q.id === selectedQuestionId);
 *   
 *   return (
 *     <Editor 
 *       question={selectedQuestion}
 *       onChange={(updates) => updateQuestion(selectedQuestionId, updates)}
 *     />
 *   );
 * }
 * 
 * @example
 * // Optimized selector - only re-render when questions change
 * function QuestionList() {
 *   const questions = useQuizEditorStore(state => state.questions);
 *   return questions.map(q => <QuestionCard key={q.id} question={q} />);
 * }
 * 
 * @example
 * // Multiple selectors
 * function BankHeader() {
 *   const currentBank = useQuizEditorStore(state => state.currentBank);
 *   const questionCount = useQuizEditorStore(state => state.questions.length);
 *   return <h2>{currentBank?.data.title} ({questionCount} questions)</h2>;
 * }
 */
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
