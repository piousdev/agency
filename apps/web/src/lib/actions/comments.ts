'use server';

import { revalidatePath } from 'next/cache';
import {
  createComment as apiCreateComment,
  updateComment as apiUpdateComment,
  deleteComment as apiDeleteComment,
} from '@/lib/api/projects';

export async function createCommentAction(projectId: string, content: string, isInternal: boolean) {
  try {
    const result = await apiCreateComment(projectId, { content, isInternal });
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true, data: result };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create comment';
    console.error('Failed to create comment:', message, error);
    return { success: false, error: message };
  }
}

export async function updateCommentAction(projectId: string, commentId: string, content: string) {
  try {
    await apiUpdateComment(projectId, commentId, { content });
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to update comment:', error);
    return { success: false, error: 'Failed to update comment' };
  }
}

export async function deleteCommentAction(projectId: string, commentId: string) {
  try {
    await apiDeleteComment(projectId, commentId);
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete comment:', error);
    return { success: false, error: 'Failed to delete comment' };
  }
}

export async function deleteFileAction(projectId: string, fileId: string) {
  try {
    const { deleteFile } = await import('@/lib/api/projects');
    await deleteFile(projectId, fileId);
    revalidatePath(`/dashboard/projects/${projectId}`);
    return { success: true };
  } catch (error) {
    console.error('Failed to delete file:', error);
    return { success: false, error: 'Failed to delete file' };
  }
}
