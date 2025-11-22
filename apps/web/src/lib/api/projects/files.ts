/**
 * Files API client for project management
 * Handles file operations for projects
 */

import { getAuthHeaders, buildApiUrl } from './api-utils';

export interface FileUploader {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
  uploadedById: string;
  createdAt: string;
  uploadedBy: FileUploader;
}

export interface FilesResponse {
  success: boolean;
  data: ProjectFile[];
}

/**
 * Get all files for a project
 */
export async function getProjectFiles(projectId: string): Promise<FilesResponse> {
  const url = buildApiUrl(`/api/projects/${projectId}/files`);
  const headers = await getAuthHeaders();

  const response = await fetch(url, {
    method: 'GET',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch files: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Delete a file from a project
 */
export async function deleteFile(
  projectId: string,
  fileId: string
): Promise<{ success: boolean; message: string }> {
  const url = buildApiUrl(`/api/projects/${projectId}/files/${fileId}`);
  const headers = await getAuthHeaders();

  const response = await fetch(url, {
    method: 'DELETE',
    headers,
  });

  if (!response.ok) {
    throw new Error(`Failed to delete file: ${response.statusText}`);
  }

  return response.json();
}
