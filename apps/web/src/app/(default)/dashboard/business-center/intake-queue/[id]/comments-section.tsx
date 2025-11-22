'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Loader2, MessageSquare, Lock } from 'lucide-react';
import { toast } from 'sonner';
import type { TicketComment } from '@/lib/api/tickets/types';
import { addTicketCommentAction } from '@/lib/actions/business-center/tickets';

interface CommentsSectionProps {
  ticketId: string;
  comments: TicketComment[];
}

function CommentItem({ comment }: { comment: TicketComment }) {
  return (
    <div className="flex gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.author.image || undefined} />
        <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm">{comment.author.name}</span>
          {comment.isInternal && (
            <Badge variant="secondary" className="text-xs flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Internal
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
          </span>
        </div>
        <div className="text-sm whitespace-pre-wrap text-muted-foreground bg-muted p-3 rounded-lg">
          {comment.content}
        </div>
      </div>
    </div>
  );
}

export function CommentsSection({ ticketId, comments }: CommentsSectionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [content, setContent] = useState('');
  const [isInternal, setIsInternal] = useState(false);

  const handleSubmit = () => {
    if (!content.trim()) return;

    startTransition(async () => {
      const result = await addTicketCommentAction(ticketId, content, isInternal);
      if (result.success) {
        toast.success('Comment added');
        setContent('');
        setIsInternal(false);
        router.refresh();
      } else {
        toast.error(result.error || 'Failed to add comment');
      }
    });
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-6">
        {/* Comment List */}
        {comments.length > 0 ? (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        ) : (
          <div className="text-center text-muted-foreground py-4">
            <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No comments yet</p>
          </div>
        )}

        {/* Add Comment Form */}
        <div className="border-t pt-4 space-y-4">
          <Textarea
            placeholder="Add a comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            disabled={isPending}
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                id="internal"
                checked={isInternal}
                onCheckedChange={setIsInternal}
                disabled={isPending}
              />
              <Label htmlFor="internal" className="text-sm flex items-center gap-1">
                <Lock className="h-3 w-3" />
                Internal note (hidden from client)
              </Label>
            </div>
            <Button onClick={handleSubmit} disabled={isPending || !content.trim()}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                'Add Comment'
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
