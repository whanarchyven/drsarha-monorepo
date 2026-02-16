export interface TaskGroup {
  _id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  reward: {
    items: Array<{
      type: 'stars' | 'exp' | 'prize' | 'lootbox';
      amount: number;
      title: string;
      objectId?: string;
    }>;
  };
  level: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  timeType: 'daily' | 'weekly' | 'level';
  tasks?: Task[];
}

export interface TaskGroupsByDateResponse {
  daily: TaskGroup[];
  weekly: TaskGroup[];
  level: TaskGroup[];
}

export type TaskActionType =
  | 'create_pin'
  | 'like_pin'
  | 'create_comment'
  | 'create_folder'
  | 'complete_knowledge'
  | 'invite_user'
  | 'create_story'
  | 'listen_podcast';

export const validKnowledgeTypes = [
  'lection',
  'clinic_task',
  'clinic_atlas',
  'interactive_task',
  'brochure',
  'interactive_match',
  'interactive_quiz',
] as const;

export type KnowledgeType = (typeof validKnowledgeTypes)[number];

export interface Task {
  _id: string;
  title: string;
  description: string;
  groupId: string;
  actionType: TaskActionType;
  config: {
    targetAmount: number;
    knowledgeRef: string | null;
    knowledgeType: KnowledgeType | null;
  };
  reward: {
    stars: number;
    exp: number;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
