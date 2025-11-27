'use client';

import { useState } from 'react';

import {
  IconMessage,
  IconSend,
  IconDotsVertical,
  IconPencil,
  IconTrash,
  IconLock,
} from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import type { Comment } from '@/lib/api/projects';

interface CommentsProps {
  comments: Comment[];
  currentUserId: string;
  projectId: string;
  onAddComment: (content: string, isInternal: boolean) => Promise<void>;
  onUpdateComment: (commentId: string, content: string) => Promise<void>;
  onDeleteComment: (commentId: string) => Promise<void>;
}

function getInitials(name: string | null) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function Comments({
  comments,
  currentUserId,
  onAddComment,
  onUpdateComment,
  onDeleteComment,
}: CommentsProps) {
  const [newComment, setNewComment] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');

  const handleSubmit = async () => {
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment.trim(), isInternal);
      setNewComment('');
      setIsInternal(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (commentId: string) => {
    if (!editContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onUpdateComment(commentId, editContent.trim());
      setEditingId(null);
      setEditContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onDeleteComment(commentId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (comment: Comment) => {
    setEditingId(comment.id);
    setEditContent(comment.content);
  };

  return (
    <div className="space-y-6">
      {/* Comment Input */}
      <div className="space-y-3">
        <Textarea
          placeholder="Add a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[100px] resize-none bg-background/50"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && e.metaKey) {
              void handleSubmit();
            }
          }}
        />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Checkbox
              id="internal"
              checked={isInternal}
              onCheckedChange={(checked) => setIsInternal(checked === true)}
            />
            <label
              htmlFor="internal"
              className="flex items-center gap-1.5 text-sm text-muted-foreground cursor-pointer"
            >
              <IconLock className="h-3.5 w-3.5" />
              Internal only
            </label>
          </div>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!newComment.trim() || isSubmitting}
            className="gap-1.5"
          >
            <IconSend className="h-3.5 w-3.5" />
            Post
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <IconMessage className="h-10 w-10 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">No comments yet</p>
            <p className="text-xs text-muted-foreground/70">Start the discussion</p>
          </div>
        ) : (
          comments.map((comment) => (
            <div
              key={comment.id}
              className={cn(
                'group relative rounded-lg border p-4 transition-colors',
                comment.isInternal
                  ? 'border-amber-500/20 bg-amber-500/5'
                  : 'border-border/60 bg-card/30 hover:bg-card/50'
              )}
            >
              {/* Internal Badge */}
              {comment.isInternal && (
                <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-amber-500/80">
                  <IconLock className="h-3 w-3" />
                  Internal
                </div>
              )}

              <div className="flex gap-3">
                <Avatar className="h-9 w-9 shrink-0 border border-border/40">
                  <AvatarImage src={comment.author.image ?? undefined} />
                  <AvatarFallback className="text-xs font-medium bg-muted">
                    {getInitials(comment.author.name)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">{comment.author.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  {editingId === comment.id ? (
                    <div className="space-y-2">
                      <Textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="min-h-20 resize-none"
                      />
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => handleUpdate(comment.id)}
                          disabled={!editContent.trim() || isSubmitting}
                        >
                          Save
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingId(null);
                            setEditContent('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
                      {comment.content}
                    </p>
                  )}
                </div>

                {/* Actions */}
                {comment.authorId === currentUserId && editingId !== comment.id && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <IconDotsVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => startEditing(comment)}>
                        <IconPencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(comment.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <IconTrash className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
