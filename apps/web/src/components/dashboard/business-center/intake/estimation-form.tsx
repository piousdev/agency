'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { IconArrowLeft, IconLoader2 } from '@tabler/icons-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { estimateRequest } from '@/lib/actions/business-center/requests';
import type { RequestWithRelations } from '@/lib/api/requests/types';
import { CONFIDENCE_OPTIONS, type Confidence } from '@/lib/schemas/request';

const STORY_POINTS = [1, 2, 3, 5, 8, 13] as const;

const estimationSchema = z.object({
  storyPoints: z.number().min(1).max(13),
  confidence: z.enum(['high', 'medium', 'low'] as const),
  estimationNotes: z.string().optional(),
});

type EstimationInput = z.infer<typeof estimationSchema>;

interface EstimationFormProps {
  request: RequestWithRelations;
}

export function EstimationForm({ request }: EstimationFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EstimationInput>({
    resolver: zodResolver(estimationSchema),
    defaultValues: {
      storyPoints: request.storyPoints ?? undefined,
      confidence: (request.confidence as Confidence) ?? 'medium',
      estimationNotes: request.estimationNotes ?? '',
    },
  });

  const onSubmit = async (data: EstimationInput) => {
    setIsSubmitting(true);
    try {
      const result = await estimateRequest(request.id, {
        storyPoints: data.storyPoints,
        confidence: data.confidence,
        estimationNotes: data.estimationNotes,
      });

      if (result.success) {
        toast.success('Estimation submitted successfully');
        router.push(`/dashboard/business-center/intake/${request.id}`);
      } else {
        toast.error(result.error || 'Failed to submit estimation');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push(`/dashboard/business-center/intake/${request.id}`)}
          className="mb-4"
        >
          <IconArrowLeft className="mr-2 h-4 w-4" />
          Back to Request
        </Button>
        <h1 className="text-2xl font-bold">Submit Estimation</h1>
        <p className="text-muted-foreground">Estimate story points for: {request.title}</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estimation Details</CardTitle>
          <CardDescription>
            Provide your estimation for this request. It will be moved to Ready stage after
            submission.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="storyPoints"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Story Points *</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select story points" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {STORY_POINTS.map((points) => (
                          <SelectItem key={points} value={points.toString()}>
                            {points} {points === 1 ? 'point' : 'points'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Use Fibonacci sequence for relative sizing</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confidence"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confidence Level *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select confidence level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONFIDENCE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>How confident are you in this estimation?</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimationNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any assumptions or notes about this estimation..."
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/dashboard/business-center/intake/${request.id}`)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Submit Estimation
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
