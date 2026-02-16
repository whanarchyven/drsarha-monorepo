import { API } from '../api';
import { axiosInstance } from '../axios';
import type {
  TaskGroup,
  Task,
  TaskGroupsByDateResponse,
} from '@/shared/models/TaskGroup';

export const taskGroupsApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get<TaskGroup[]>(API.getAllTaskGroups);
    return data;
  },
  create: async (
    groupData: Omit<TaskGroup, '_id' | 'createdAt' | 'updatedAt' | 'tasks'>
  ) => {
    const { data } = await axiosInstance.post<TaskGroup>(
      API.createTaskGroup,
      groupData
    );
    return data;
  },
  update: async (
    id: string,
    groupData: Partial<
      Omit<TaskGroup, '_id' | 'createdAt' | 'updatedAt' | 'tasks'>
    >
  ) => {
    const { data } = await axiosInstance.put<TaskGroup>(
      API.updateTaskGroup(id),
      groupData
    );
    return data;
  },
  delete: async (id: string) => {
    await axiosInstance.delete(API.deleteTaskGroup(id));
  },
  addTask: async (
    groupId: string,
    taskData: Omit<Task, '_id' | 'createdAt' | 'updatedAt' | 'groupId'>
  ) => {
    const { data } = await axiosInstance.post<Task>(
      API.addTaskToGroup(groupId),
      taskData
    );
    return data;
  },
  getById: async (id: string) => {
    const { data } = await axiosInstance.get<{
      success: boolean;
      data: TaskGroup;
      message: string;
    }>(API.getTaskGroupById(id));
    return data.data;
  },
  getByDate: async (date: string) => {
    const { data } = await axiosInstance.get<{
      success: boolean;
      data: TaskGroupsByDateResponse;
    }>(API.getTaskGroupsByDate, { params: { date } });
    return data.data;
  },
  getTasksInGroup: async (groupId: string) => {
    const { data } = await axiosInstance.get<{
      success: boolean;
      data: Task[];
    }>(API.getTasksInGroup(groupId));
    return data.data;
  },
  deleteTaskFromGroup: async (groupId: string, taskId: string) => {
    await axiosInstance.delete(API.deleteTaskFromGroup(groupId, taskId));
  },
  updateTaskInGroup: async (
    groupId: string,
    taskId: string,
    taskData: Partial<Omit<Task, '_id' | 'createdAt' | 'updatedAt' | 'groupId'>>
  ) => {
    const { data } = await axiosInstance.put<Task>(
      API.updateTaskInGroup(groupId, taskId),
      taskData
    );
    return data;
  },
};
