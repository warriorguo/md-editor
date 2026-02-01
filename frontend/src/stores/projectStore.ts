import { create } from 'zustand';
import type { Project, ProjectListResponse } from '../lib/api/projects';
import * as projectsApi from '../lib/api/projects';

interface ProjectState {
  projects: Project[];
  totalCount: number;
  page: number;
  pageSize: number;
  isLoading: boolean;
  error: string | null;

  fetchProjects: (page?: number, pageSize?: number) => Promise<void>;
  createProject: (name: string) => Promise<Project>;
  updateProject: (id: string, name: string) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setError: (error: string | null) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  totalCount: 0,
  page: 1,
  pageSize: 20,
  isLoading: false,
  error: null,

  fetchProjects: async (page = 1, pageSize = 20) => {
    set({ isLoading: true, error: null });

    try {
      const response: ProjectListResponse = await projectsApi.listProjects(page, pageSize);
      set({
        projects: response.projects,
        totalCount: response.totalCount,
        page: response.page,
        pageSize: response.pageSize,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to fetch projects',
        isLoading: false,
      });
    }
  },

  createProject: async (name: string) => {
    set({ isLoading: true, error: null });

    try {
      const project = await projectsApi.createProject({ name });
      const { projects } = get();
      set({
        projects: [project, ...projects],
        totalCount: get().totalCount + 1,
        isLoading: false,
      });
      return project;
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to create project',
        isLoading: false,
      });
      throw error;
    }
  },

  updateProject: async (id: string, name: string) => {
    set({ error: null });

    try {
      const updatedProject = await projectsApi.updateProject(id, { name });
      const { projects } = get();
      set({
        projects: projects.map((p) => (p.id === id ? updatedProject : p)),
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to update project',
      });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    set({ error: null });

    try {
      await projectsApi.deleteProject(id);
      const { projects, totalCount } = get();
      set({
        projects: projects.filter((p) => p.id !== id),
        totalCount: totalCount - 1,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to delete project',
      });
      throw error;
    }
  },

  setError: (error) => set({ error }),
}));
