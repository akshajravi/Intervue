import type { Problem, Question } from '../types/interview';
import problemsData from '../data/problems.json';

export class ProblemService {
  private static problems: Problem[] = problemsData.problems as Problem[];

  /**
   * Get all available problems
   */
  static getAllProblems(): Problem[] {
    return this.problems;
  }

  /**
   * Get a problem by ID
   */
  static getProblemById(id: string): Problem | undefined {
    return this.problems.find(problem => problem.id === id);
  }

  /**
   * Get problems by difficulty
   */
  static getProblemsByDifficulty(difficulty: 'Easy' | 'Medium' | 'Hard'): Problem[] {
    return this.problems.filter(problem => problem.difficulty === difficulty);
  }

  /**
   * Get problems by category
   */
  static getProblemsByCategory(category: string): Problem[] {
    return this.problems.filter(problem => problem.category === category);
  }

  /**
   * Get a random set of problems for an interview
   */
  static getRandomProblems(count: number = 5, difficulty?: 'Easy' | 'Medium' | 'Hard'): Problem[] {
    let availableProblems = difficulty 
      ? this.getProblemsByDifficulty(difficulty)
      : this.problems;

    // Shuffle and take the requested count
    const shuffled = [...availableProblems].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  /**
   * Convert a Problem to a Question for the interview interface
   */
  static problemToQuestion(problem: Problem, questionNumber: number): Question {
    return {
      id: problem.id,
      number: questionNumber,
      type: 'Coding Challenge', // Most problems are coding challenges
      difficulty: problem.difficulty,
      title: problem.title,
      description: this.formatProblemDescription(problem),
      template: problem.starter_code.python, // Default to Python
      problem: problem // Keep reference to full problem data
    };
  }

  /**
   * Format the problem description with examples and constraints
   */
  private static formatProblemDescription(problem: Problem): string {
    let description = problem.description;

    if (problem.examples.length > 0) {
      description += '\n\n**Examples:**\n';
      problem.examples.forEach((example, index) => {
        description += `\nExample ${index + 1}:\n`;
        description += `Input: ${example.input}\n`;
        description += `Output: ${example.output}\n`;
        if (example.explanation) {
          description += `Explanation: ${example.explanation}\n`;
        }
      });
    }

    if (problem.constraints.length > 0) {
      description += '\n\n**Constraints:**\n';
      problem.constraints.forEach(constraint => {
        description += `- ${constraint}\n`;
      });
    }

    return description;
  }

  /**
   * Get starter code for a specific language
   */
  static getStarterCode(problemId: string, language: 'python' | 'javascript' | 'java' | 'cpp'): string {
    const problem = this.getProblemById(problemId);
    if (!problem) {
      return `// Problem not found: ${problemId}`;
    }

    return problem.starter_code[language] || problem.starter_code.python;
  }

  /**
   * Get hints for a problem
   */
  static getHints(problemId: string): string[] {
    const problem = this.getProblemById(problemId);
    return problem?.hints || [];
  }

  /**
   * Generate a curated interview set (mix of difficulties)
   */
  static generateInterviewSet(totalQuestions: number = 5): Question[] {
    const easyCount = Math.ceil(totalQuestions * 0.4); // 40% easy
    const mediumCount = Math.ceil(totalQuestions * 0.4); // 40% medium  
    const hardCount = totalQuestions - easyCount - mediumCount; // 20% hard

    const easyProblems = this.getRandomProblems(easyCount, 'Easy');
    const mediumProblems = this.getRandomProblems(mediumCount, 'Medium');
    const hardProblems = this.getRandomProblems(hardCount, 'Hard');

    const allProblems = [...easyProblems, ...mediumProblems, ...hardProblems];
    
    // Convert to questions and shuffle
    const questions = allProblems.map((problem, index) => 
      this.problemToQuestion(problem, index + 1)
    );

    return questions.sort(() => Math.random() - 0.5);
  }
}