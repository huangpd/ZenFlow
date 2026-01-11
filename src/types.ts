
export type TaskType = 'normal' | 'counter' | 'sutra';

export interface Task {
  id: string | number;
  text: string;
  type: TaskType;
  completed: boolean;
  current?: number;
  target?: number;
  step?: number;
  sutraId?: string;
  iconId?: string; // Stored as string ID for database compatibility
  dateCreated?: string;
}

export interface DiaryEntry {
  id: string | number;
  category: string;
  content: string;
  date: string;
  imageUrl?: string;
}

export interface DayStats {
  day: number;
  dateStr: string;
  fullDate: string;
  value: number; // 0-4
  meditationMins: number;
  dailyTasks: Partial<Task>[];
  dailyLogs: DiaryEntry[];
}

export interface Sutra {
  id: string;
  title: string;
  content: string;
}
