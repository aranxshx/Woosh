export type EvaluationLevel = "easy" | "medium" | "hard";

export type Subject = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
};

export type StudyItemProgress = {
  lastSeen: string | null;
  lastResult: EvaluationLevel | null;
  timesSeen: number;
  easyCount: number;
  mediumCount: number;
  hardCount: number;
  nextDue: string | null;
};

export type StudyItem = {
  id: string;
  subjectId: string;
  term: string;
  definition: string;
  question: string | null;
  choices: string[];
  answerIndex: number | null;
  createdAt: string;
  updatedAt: string;
};

export type ItemWithProgress = StudyItem & {
  progress: StudyItemProgress;
};

export type SubjectDetail = {
  subject: Subject;
  items: ItemWithProgress[];
};
