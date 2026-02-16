export type Error = {
  message: string;
  code: number;
  customData: any;
};

export type TRequestStatuses = 'init' | 'pending' | 'fulfilled' | 'rejected';

export interface IResponse<D = any> {
  status: 'success' | 'error';
  data: D;
  errors: Error[];
}

export const API = {
  //Категории
  getCategories: '/categories',
  getCategoryById: (id: string) => `/categories/${id}`,
  createCategory: '/categories',
  updateCategory: (id: string) => `/categories/${id}`,
  deleteCategory: (id: string) => `/categories/${id}`,
  getNozologiesByCategoryId: (id: string) => `/categories/${id}/nozologies`,

  // Нозологии
  getNozologies: '/nozologies',
  getNozologyById: (id: string) => `/nozologies/${id}`,
  createNozology: '/nozologies',
  updateNozology: (id: string) => `/nozologies/${id}`,
  deleteNozology: (id: string) => `/nozologies/${id}`,

  // Брошюры
  getBrochures: '/brochures',
  getBrochureById: (id: string) => `/brochures/${id}`,
  createBrochure: '/brochures',
  updateBrochure: (id: string) => `/brochures/${id}`,
  deleteBrochure: (id: string) => `/brochures/${id}`,

  // Лекции
  getLections: '/lections',
  getLectionById: (id: string) => `/lections/${id}`,
  createLection: '/lections',
  updateLection: (id: string) => `/lections/${id}`,
  deleteLection: (id: string) => `/lections/${id}`,
  getLectionStats: (id: string) => `/lections/${id}/statistics`,
  // Клинические задачи
  getClinicTasks: '/clinic-tasks',
  getClinicTaskById: (id: string) => `/clinic-tasks/${id}`,
  createClinicTask: '/clinic-tasks',
  updateClinicTask: (id: string) => `/clinic-tasks/${id}`,
  deleteClinicTask: (id: string) => `/clinic-tasks/${id}`,
  getClinicTaskStats: (id: string) => `/clinic-tasks/${id}/statistics`,
  // Клинические атласы
  getClinicAtlases: '/clinic-atlases',
  getClinicAtlasById: (id: string) => `/clinic-atlases/${id}`,
  createClinicAtlas: '/clinic-atlases',
  updateClinicAtlas: (id: string) => `/clinic-atlases/${id}`,
  deleteClinicAtlas: (id: string) => `/clinic-atlases/${id}`,
  likeClinicAtlas: (id: string) => `/clinic-atlases/${id}/like`,
  unlikeClinicAtlas: (id: string) => `/clinic-atlases/${id}/unlike`,
  addClinicAtlasComment: (id: string) => `/clinic-atlases/${id}/comments`,
  removeClinicAtlasComment: (id: string, commentId: string) =>
    `/clinic-atlases/${id}/comments/${commentId}`,

  // Интерактивные задачи
  getInteractiveTasks: '/interactive-tasks',
  getInteractiveTaskById: (id: string) => `/interactive-tasks/${id}`,
  createInteractiveTask: '/interactive-tasks',
  updateInteractiveTask: (id: string) => `/interactive-tasks/${id}`,
  deleteInteractiveTask: (id: string) => `/interactive-tasks/${id}`,

  // Курсы
  getCourses: '/courses',
  getCourseById: (id: string) => `/courses/${id}`,
  createCourse: '/courses',
  updateCourse: (id: string) => `/courses/${id}`,
  deleteCourse: (id: string) => `/courses/${id}`,

  // Интерактивные викторины
  getInteractiveQuizzes: '/interactive-quizzes',
  getInteractiveQuizById: (id: string) => `/interactive-quizzes/${id}`,
  createInteractiveQuiz: '/interactive-quizzes',
  updateInteractiveQuiz: (id: string) => `/interactive-quizzes/${id}`,
  deleteInteractiveQuiz: (id: string) => `/interactive-quizzes/${id}`,
  getInteractiveQuizStats: (id: string) =>
    `/interactive-quizzes/${id}/statistics`,

  // Интерактивные соединения
  getInteractiveMatches: '/interactive-matches',
  getInteractiveMatchById: (id: string) => `/interactive-matches/${id}`,
  createInteractiveMatch: '/interactive-matches',
  updateInteractiveMatch: (id: string) => `/interactive-matches/${id}`,
  deleteInteractiveMatch: (id: string) => `/interactive-matches/${id}`,
  getInteractiveMatchStats: (id: string) =>
    `/interactive-matches/${id}/statistics`,

  // Компании
  getCompanies: '/companies',
  getCompanyById: (id: string) => `/companies/${id}`,
  createCompany: '/companies',
  updateCompany: (id: string) => `/companies/${id}`,
  deleteCompany: (id: string) => `/companies/${id}`,

  // Теги (клинический атлас)
  getTags: '/tags',
  getTagById: (id: string) => `/tags/${id}`,
  createTag: '/tags',
  updateTag: (id: string) => `/tags/${id}`,
  deleteTag: (id: string) => `/tags/${id}`,
  getPopularTags: '/tags/popular',

  // Призы (клинический атлас)
  getPrizes: '/prizes',
  getPrizeById: (id: string) => `/prizes/${id}`,
  createPrize: '/prizes',
  updatePrize: (id: string) => `/prizes/${id}`,
  deletePrize: (id: string) => `/prizes/${id}`,
  getPrizesByLevel: (level: number) => `/prizes/level/${level}`,

  // Auth
  adminLogin: '/admin/login',
  createAdminUser: '/admin/users',
  getAdminUsers: '/admin/users',
  getAdminUserById: (id: string) => `/admin/users/${id}`,
  updateAdminUser: (id: string) => `/admin/users/${id}`,
  deleteAdminUser: (id: string) => `/admin/users/${id}`,

  //Rating
  getRatings: '/ratings',
  getRatingById: (id: string) => `/ratings/${id}`,
  manageStars: (userId: string) => `/manage-stars/${userId}`,
  // Лутбоксы
  getLootboxes: '/lootboxes',
  getLootboxById: (id: string) => `/lootboxes/${id}`,
  createLootbox: '/lootboxes',
  updateLootbox: (id: string) => `/lootboxes/${id}`,
  deleteLootbox: (id: string) => `/lootboxes/${id}`,

  // Task Groups
  createTaskGroup: '/task-groups/',
  getAllTaskGroups: '/task-groups/admin/all',
  getTaskGroupById: (id: string) => `/task-groups/${id}`,
  updateTaskGroup: (id: string) => `/task-groups/${id}`,
  deleteTaskGroup: (id: string) => `/task-groups/${id}`,
  addTaskToGroup: (groupId: string) => `/task-groups/${groupId}/tasks`,
  getTaskGroupsByDate: '/task-groups/get-by-date',
  getTasksInGroup: (groupId: string) => `/task-groups/${groupId}/tasks`,
  deleteTaskFromGroup: (groupId: string, taskId: string) =>
    `/task-groups/${groupId}/tasks/${taskId}`,
  updateTaskInGroup: (groupId: string, taskId: string) =>
    `/task-groups/${groupId}/tasks/${taskId}`,

  completeTaskDirectly: '/tasks/complete-directly',

  // Admin Tasks
  createAdminTask: '/admin/tasks/',
  getAllAdminTasks: '/admin/tasks/',
  getAdminTaskById: (id: string) => `/admin/tasks/${id}`,
  updateAdminTask: (id: string) => `/admin/tasks/${id}`,
  deleteAdminTask: (id: string) => `/admin/tasks/${id}`,

  // Prize Claims
  getPrizeClaims: '/prize-claims',
  getPrizeClaimById: (id: string) => `/prize-claims/${id}`,
  updatePrizeClaimStatus: (id: string) => `/prize-claims/${id}/status`,
  approvePrizeClaimRefund: (id: string) => `/prize-claims/${id}/approve-refund`,
  deletePrizeClaim: (id: string) => `/prize-claims/${id}`,
} as const;
