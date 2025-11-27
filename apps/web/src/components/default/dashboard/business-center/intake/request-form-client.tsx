'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { IconArrowLeft, IconArrowRight, IconLoader2 } from '@tabler/icons-react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createRequest } from '@/lib/actions/business-center/requests';
import {
  createRequestSchema,
  REQUEST_TYPE_OPTIONS,
  PRIORITY_OPTIONS,
  type CreateRequestInput,
} from '@/lib/schemas/request';
import { useIntakeStore } from '@/lib/stores/intake-store';

const STEPS = [
  { id: 'basic', title: 'Basic Info', description: 'Title, type, and priority' },
  { id: 'details', title: 'Details', description: 'Description and justification' },
  { id: 'context', title: 'Context', description: 'Related projects and dependencies' },
  { id: 'timeline', title: 'Timeline', description: 'Delivery expectations' },
] as const;

export function RequestFormClient() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { draft, saveDraft, clearDraft, draftStep: _draftStep } = useIntakeStore();

  const form = useForm<CreateRequestInput>({
    resolver: zodResolver(createRequestSchema),
    mode: 'onBlur',
    defaultValues: draft ?? {
      title: '',
      type: 'feature',
      priority: 'medium',
      description: '',
      businessJustification: '',
      stepsToReproduce: '',
      dependencies: '',
      additionalNotes: '',
      tags: [],
    },
  });

  const watchType = form.watch('type');
  const currentStepData = STEPS[currentStep];
  if (!currentStepData) {
    throw new Error(`Invalid step index: ${String(currentStep)}`);
  }
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const goToStep = (step: number) => {
    if (step >= 0 && step < STEPS.length) {
      // Save current form data to draft
      saveDraft(form.getValues(), currentStep);
      setCurrentStep(step);
    }
  };

  const validateCurrentStep = async (): Promise<boolean> => {
    let fieldsToValidate: (keyof CreateRequestInput)[] = [];

    switch (currentStep) {
      case 0: // Basic Info
        fieldsToValidate = ['title', 'type', 'priority'];
        break;
      case 1: // Details
        fieldsToValidate = ['description'];
        if (watchType === 'bug') {
          fieldsToValidate.push('stepsToReproduce');
        }
        break;
      case 2: // Context
        // No required fields in context step
        break;
      case 3: // Timeline
        // No required fields in timeline step
        break;
    }

    if (fieldsToValidate.length === 0) return true;

    const result = await form.trigger(fieldsToValidate);
    return result;
  };

  const handleNext = async () => {
    const isValid = await validateCurrentStep();
    if (isValid) {
      saveDraft(form.getValues(), currentStep + 1);
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    saveDraft(form.getValues(), currentStep - 1);
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const onSubmit = async (data: CreateRequestInput) => {
    setIsSubmitting(true);
    try {
      const result = await createRequest(data);
      if (result.success) {
        clearDraft();
        toast.success('Request submitted successfully');
        router.push(`/dashboard/business-center/intake/${result.data.id}`);
      } else {
        toast.error(result.error || 'Failed to create request');
      }
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button
          variant="ghost"
          onClick={() => router.push('/dashboard/business-center/intake')}
          className="mb-4"
        >
          <IconArrowLeft className="mr-2 h-4 w-4" />
          Back to Intake
        </Button>
        <h1 className="text-2xl font-bold">Submit New Request</h1>
        <p className="text-muted-foreground">Fill out the form to submit a new work request</p>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">{currentStepData.title}</span>
          <span className="text-muted-foreground">
            Step {currentStep + 1} of {STEPS.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step indicators */}
      <div className="flex justify-between">
        {STEPS.map((step, index) => (
          <button
            key={step.id}
            onClick={() => goToStep(index)}
            className={`flex flex-col items-center gap-1 text-xs ${
              index <= currentStep ? 'text-primary' : 'text-muted-foreground'
            }`}
            disabled={index > currentStep + 1}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium transition-colors ${
                index === currentStep
                  ? 'border-primary bg-primary text-primary-foreground'
                  : index < currentStep
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-muted-foreground/30'
              }`}
            >
              {index + 1}
            </div>
            <span className="hidden sm:inline">{step.title}</span>
          </button>
        ))}
      </div>

      {/* Form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle>{currentStepData.title}</CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1: Basic Info */}
              {currentStep === 0 && (
                <>
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title *</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief description of the request" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Request Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {REQUEST_TYPE_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Priority *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PRIORITY_OPTIONS.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Step 2: Details */}
              {currentStep === 1 && (
                <>
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Detailed description of the request"
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="businessJustification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Justification</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Why is this request important?" {...field} />
                        </FormControl>
                        <FormDescription>
                          Explain the business value or urgency of this request
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {watchType === 'bug' && (
                    <FormField
                      control={form.control}
                      name="stepsToReproduce"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Steps to Reproduce</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="1. Go to...&#10;2. Click on...&#10;3. See error"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}
                </>
              )}

              {/* Step 3: Context */}
              {currentStep === 2 && (
                <>
                  <FormField
                    control={form.control}
                    name="dependencies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dependencies</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any dependencies on other work or systems?"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="additionalNotes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Notes</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Any other relevant information" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}

              {/* Step 4: Timeline */}
              {currentStep === 3 && (
                <>
                  <FormField
                    control={form.control}
                    name="desiredDeliveryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Desired Delivery Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} value={field.value} />
                        </FormControl>
                        <FormDescription>When do you need this work completed?</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Summary */}
                  <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                    <h4 className="font-medium">Request Summary</h4>
                    <dl className="grid grid-cols-2 gap-2 text-sm">
                      <dt className="text-muted-foreground">Title:</dt>
                      <dd>{form.getValues('title') || '-'}</dd>
                      <dt className="text-muted-foreground">Type:</dt>
                      <dd className="capitalize">{form.getValues('type').replace('_', ' ')}</dd>
                      <dt className="text-muted-foreground">Priority:</dt>
                      <dd className="capitalize">{form.getValues('priority')}</dd>
                    </dl>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 0}
            >
              <IconArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>

            {currentStep < STEPS.length - 1 ? (
              <Button type="button" onClick={handleNext}>
                Next
                <IconArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Request
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
