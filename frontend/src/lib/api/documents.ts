import { apiClient, isApiError } from './client';

export interface Document {
  id: string;
  projectId: string;
  contentMd: string;
  version: number;
  updatedAt: string;
}

export interface UpdateDocumentRequest {
  contentMd: string;
}

export interface UpdateDocumentResult {
  document: Document | null;
  conflict: boolean;
}

export async function getDocument(projectId: string): Promise<Document> {
  const response = await apiClient.get<Document>(`/projects/${projectId}/document`);
  return response.data;
}

export async function updateDocument(
  documentId: string,
  data: UpdateDocumentRequest,
  version: number
): Promise<UpdateDocumentResult> {
  try {
    const response = await apiClient.put<Document>(`/documents/${documentId}`, data, {
      headers: {
        'X-Document-Version': version.toString(),
      },
    });
    return { document: response.data, conflict: false };
  } catch (error) {
    if (isApiError(error) && error.response?.status === 409) {
      return { document: null, conflict: true };
    }
    throw error;
  }
}
