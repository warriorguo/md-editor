import { apiClient } from './client';

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectListResponse {
  projects: Project[];
  totalCount: number;
  page: number;
  pageSize: number;
}

export interface CreateProjectRequest {
  name: string;
}

export interface UpdateProjectRequest {
  name: string;
}

export async function getProject(id: string): Promise<Project> {
  const response = await apiClient.get<Project>(`/projects/${id}`);
  return response.data;
}

export async function createProject(data: CreateProjectRequest): Promise<Project> {
  const response = await apiClient.post<Project>('/projects', data);
  return response.data;
}

export async function listProjects(page = 1, pageSize = 20): Promise<ProjectListResponse> {
  const response = await apiClient.get<ProjectListResponse>('/projects', {
    params: { page, pageSize },
  });
  return response.data;
}

export async function updateProject(id: string, data: UpdateProjectRequest): Promise<Project> {
  const response = await apiClient.patch<Project>(`/projects/${id}`, data);
  return response.data;
}

export async function deleteProject(id: string): Promise<void> {
  await apiClient.delete(`/projects/${id}`);
}
