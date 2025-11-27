'use client';

import { useState, useTransition } from 'react';

import { useRouter } from 'next/navigation';

import { IconMessage, IconPaperclip, IconActivity } from '@tabler/icons-react';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  createCommentAction,
  updateCommentAction,
  deleteCommentAction,
  deleteFileAction,
} from '@/lib/actions/comments';

import { ActivityFeed } from './activity-feed';
import { Attachments } from './attachments';
import { Comments } from './comments';

import type { Comment, ProjectFile, Activity as ActivityType } from '@/lib/api/projects';

interface ProjectDetailSectionsProps {
  projectId: string;
  currentUserId: string;
  comments: Comment[];
  files: ProjectFile[];
  activities: ActivityType[];
}

export function ProjectDetailSections({
  projectId,
  currentUserId,
  comments: initialComments,
  files: initialFiles,
  activities: initialActivities,
}: ProjectDetailSectionsProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [comments, setComments] = useState(initialComments);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [files, setFiles] = useState(initialFiles);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activities, setActivities] = useState(initialActivities);

  const handleAddComment = async (content: string, isInternal: boolean) => {
    const result = await createCommentAction(projectId, content, isInternal);
    if (!result.success) {
      throw new Error(result.error ?? 'Failed to add comment');
    }
    startTransition(() => {
      router.refresh();
    });
  };

  const handleUpdateComment = async (commentId: string, content: string) => {
    const result = await updateCommentAction(projectId, commentId, content);
    if (!result.success) {
      throw new Error(result.error ?? 'Failed to update comment');
    }
    startTransition(() => {
      router.refresh();
    });
  };

  const handleDeleteComment = async (commentId: string) => {
    const result = await deleteCommentAction(projectId, commentId);
    if (!result.success) {
      throw new Error(result.error ?? 'Failed to delete comment');
    }
    startTransition(() => {
      router.refresh();
    });
  };

  const handleDeleteFile = async (fileId: string) => {
    const result = await deleteFileAction(projectId, fileId);
    if (!result.success) {
      throw new Error(result.error ?? 'Failed to delete file');
    }
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className={isPending ? 'opacity-60 pointer-events-none' : ''}>
      <Tabs defaultValue="comments" className="w-full">
        <TabsList className="w-full justify-start h-auto p-1 bg-muted/30 rounded-lg">
          <TabsTrigger
            value="comments"
            className="flex items-center gap-2 data-[state=active]:bg-background"
          >
            <IconMessage className="h-4 w-4" />
            Comments
            {comments.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {comments.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="attachments"
            className="flex items-center gap-2 data-[state=active]:bg-background"
          >
            <IconPaperclip className="h-4 w-4" />
            Attachments
            {files.length > 0 && (
              <span className="ml-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {files.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="activity"
            className="flex items-center gap-2 data-[state=active]:bg-background"
          >
            <IconActivity className="h-4 w-4" />
            Activity
            {activities.length > 0 && (
              <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
                {activities.length}
              </span>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="comments" className="mt-6">
          <Comments
            comments={comments}
            currentUserId={currentUserId}
            projectId={projectId}
            onAddComment={handleAddComment}
            onUpdateComment={handleUpdateComment}
            onDeleteComment={handleDeleteComment}
          />
        </TabsContent>

        <TabsContent value="attachments" className="mt-6">
          <Attachments
            files={files}
            currentUserId={currentUserId}
            onDeleteFile={handleDeleteFile}
          />
        </TabsContent>

        <TabsContent value="activity" className="mt-6">
          <ActivityFeed activities={activities} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
