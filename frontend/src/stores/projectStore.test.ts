import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useProjectStore } from './projectStore';

// Mock the API
vi.mock('../lib/api/projects', () => ({
  listProjects: vi.fn(),
  createProject: vi.fn(),
  updateProject: vi.fn(),
  deleteProject: vi.fn(),
}));

import * as projectsApi from '../lib/api/projects';

describe('projectStore', () => {
  beforeEach(() => {
    // Reset store state
    useProjectStore.setState({
      projects: [],
      totalCount: 0,
      page: 1,
      pageSize: 20,
      isLoading: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useProjectStore.getState();

      expect(state.projects).toEqual([]);
      expect(state.totalCount).toBe(0);
      expect(state.page).toBe(1);
      expect(state.pageSize).toBe(20);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchProjects', () => {
    it('should set isLoading during fetch', async () => {
      vi.mocked(projectsApi.listProjects).mockResolvedValue({
        projects: [],
        totalCount: 0,
        page: 1,
        pageSize: 20,
      });

      const promise = useProjectStore.getState().fetchProjects();
      expect(useProjectStore.getState().isLoading).toBe(true);

      await promise;
      expect(useProjectStore.getState().isLoading).toBe(false);
    });

    it('should update projects on successful fetch', async () => {
      const mockProjects = [
        { id: '1', name: 'Project 1', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: '2', name: 'Project 2', createdAt: '2024-01-02', updatedAt: '2024-01-02' },
      ];

      vi.mocked(projectsApi.listProjects).mockResolvedValue({
        projects: mockProjects,
        totalCount: 2,
        page: 1,
        pageSize: 20,
      });

      await useProjectStore.getState().fetchProjects();

      const state = useProjectStore.getState();
      expect(state.projects).toEqual(mockProjects);
      expect(state.totalCount).toBe(2);
    });

    it('should set error on fetch failure', async () => {
      vi.mocked(projectsApi.listProjects).mockRejectedValue(new Error('Network error'));

      await useProjectStore.getState().fetchProjects();

      expect(useProjectStore.getState().error).toBe('Network error');
    });
  });

  describe('createProject', () => {
    it('should add new project to the list', async () => {
      const newProject = { id: '1', name: 'New Project', createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      vi.mocked(projectsApi.createProject).mockResolvedValue(newProject);

      const result = await useProjectStore.getState().createProject('New Project');

      expect(result).toEqual(newProject);
      expect(useProjectStore.getState().projects[0]).toEqual(newProject);
      expect(useProjectStore.getState().totalCount).toBe(1);
    });

    it('should set error on create failure', async () => {
      vi.mocked(projectsApi.createProject).mockRejectedValue(new Error('Create failed'));

      await expect(useProjectStore.getState().createProject('Test')).rejects.toThrow();
      expect(useProjectStore.getState().error).toBe('Create failed');
    });
  });

  describe('updateProject', () => {
    it('should update project in the list', async () => {
      const originalProject = { id: '1', name: 'Original', createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      const updatedProject = { id: '1', name: 'Updated', createdAt: '2024-01-01', updatedAt: '2024-01-02' };

      useProjectStore.setState({ projects: [originalProject] });
      vi.mocked(projectsApi.updateProject).mockResolvedValue(updatedProject);

      await useProjectStore.getState().updateProject('1', 'Updated');

      expect(useProjectStore.getState().projects[0].name).toBe('Updated');
    });

    it('should set error on update failure', async () => {
      vi.mocked(projectsApi.updateProject).mockRejectedValue(new Error('Update failed'));

      await expect(useProjectStore.getState().updateProject('1', 'Test')).rejects.toThrow();
      expect(useProjectStore.getState().error).toBe('Update failed');
    });
  });

  describe('deleteProject', () => {
    it('should remove project from the list', async () => {
      const project = { id: '1', name: 'Project', createdAt: '2024-01-01', updatedAt: '2024-01-01' };
      useProjectStore.setState({ projects: [project], totalCount: 1 });
      vi.mocked(projectsApi.deleteProject).mockResolvedValue(undefined);

      await useProjectStore.getState().deleteProject('1');

      expect(useProjectStore.getState().projects).toHaveLength(0);
      expect(useProjectStore.getState().totalCount).toBe(0);
    });

    it('should set error on delete failure', async () => {
      vi.mocked(projectsApi.deleteProject).mockRejectedValue(new Error('Delete failed'));

      await expect(useProjectStore.getState().deleteProject('1')).rejects.toThrow();
      expect(useProjectStore.getState().error).toBe('Delete failed');
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      useProjectStore.getState().setError('Test error');
      expect(useProjectStore.getState().error).toBe('Test error');
    });

    it('should clear error when set to null', () => {
      useProjectStore.setState({ error: 'Some error' });
      useProjectStore.getState().setError(null);
      expect(useProjectStore.getState().error).toBeNull();
    });
  });
});
