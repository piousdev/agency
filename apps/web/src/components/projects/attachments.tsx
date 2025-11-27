'use client';

import { useState } from 'react';

import {
  IconPaperclip,
  IconDownload,
  IconTrash,
  IconFileText,
  IconPhoto,
  IconVideo,
  IconMusic,
  IconFile,
  IconDotsVertical,
} from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { ProjectFile } from '@/lib/api/projects';

interface AttachmentsProps {
  files: ProjectFile[];
  currentUserId: string;
  onDeleteFile: (fileId: string) => Promise<void>;
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

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${String(parseFloat((bytes / Math.pow(k, i)).toFixed(1)))} ${String(sizes[i])}`;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return IconPhoto;
  if (mimeType.startsWith('video/')) return IconVideo;
  if (mimeType.startsWith('audio/')) return IconMusic;
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text'))
    return IconFileText;
  return IconFile;
}

export function Attachments({ files, currentUserId, onDeleteFile }: AttachmentsProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (fileId: string) => {
    setDeletingId(fileId);
    try {
      await onDeleteFile(fileId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <IconPaperclip className="h-10 w-10 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">No attachments yet</p>
          <p className="text-xs text-muted-foreground/70">Files will appear here when uploaded</p>
        </div>
      ) : (
        <div className="divide-y divide-border/60 rounded-lg border border-border/60 overflow-hidden">
          {files.map((file) => {
            const FileIcon = getFileIcon(file.mimeType);
            const isDeleting = deletingId === file.id;

            return (
              <div
                key={file.id}
                className="group flex items-center gap-4 p-4 bg-card/30 hover:bg-card/50 transition-colors"
              >
                {/* File Icon */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <FileIcon className="h-5 w-5 text-muted-foreground" />
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                    <span className="text-muted-foreground/50">·</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(file.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Uploader Avatar */}
                <div className="hidden sm:flex items-center gap-2">
                  <Avatar className="h-6 w-6 border border-border/40">
                    <AvatarImage src={file.uploadedBy.image ?? undefined} />
                    <AvatarFallback className="text-[10px] font-medium bg-muted">
                      {getInitials(file.uploadedBy.name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-muted-foreground max-w-[100px] truncate">
                    {file.uploadedBy.name}
                  </span>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                    <a
                      href={file.url}
                      download={file.name}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <IconDownload className="h-4 w-4" />
                    </a>
                  </Button>

                  {file.uploadedById === currentUserId && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          disabled={isDeleting}
                        >
                          <IconDotsVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleDelete(file.id)}
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
            );
          })}
        </div>
      )}
    </div>
  );
}
