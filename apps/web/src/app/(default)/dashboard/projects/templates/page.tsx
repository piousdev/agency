

import { IconCopy, IconFileText, IconFolder, IconDots, IconPlus } from '@tabler/icons-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { requireUser } from '@/lib/auth/session';

// Placeholder templates - in a real app these would come from an API
const projectTemplates = [
  {
    id: 'web-app',
    name: 'Web Application',
    description: 'Standard web application project with frontend and backend setup',
    category: 'Development',
    tasks: 24,
    duration: '8-12 weeks',
  },
  {
    id: 'mobile-app',
    name: 'Mobile App',
    description: 'Native or cross-platform mobile application project',
    category: 'Development',
    tasks: 32,
    duration: '10-16 weeks',
  },
  {
    id: 'brand-identity',
    name: 'Brand Identity',
    description: 'Complete brand identity design including logo, colors, and guidelines',
    category: 'Design',
    tasks: 18,
    duration: '4-6 weeks',
  },
  {
    id: 'marketing-campaign',
    name: 'Marketing Campaign',
    description: 'Full marketing campaign with digital and print assets',
    category: 'Marketing',
    tasks: 28,
    duration: '6-8 weeks',
  },
  {
    id: 'website-redesign',
    name: 'Website Redesign',
    description: 'Complete website redesign with UX research and implementation',
    category: 'Design',
    tasks: 20,
    duration: '6-10 weeks',
  },
  {
    id: 'seo-audit',
    name: 'SEO Audit & Optimization',
    description: 'Comprehensive SEO audit with implementation roadmap',
    category: 'Marketing',
    tasks: 15,
    duration: '2-4 weeks',
  },
];

const categoryColors: Record<string, string> = {
  Development: 'bg-blue-100 text-blue-800',
  Design: 'bg-purple-100 text-purple-800',
  Marketing: 'bg-green-100 text-green-800',
};

export default async function ProjectTemplatesPage() {
  await requireUser();

  const categories = [...new Set(projectTemplates.map((t) => t.category))];

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-full overflow-hidden px-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Project Templates</h1>
          <p className="text-muted-foreground mt-2">
            Reusable project templates to kickstart your work
          </p>
        </div>
        <Button className="gap-2" disabled>
          <IconPlus className="h-4 w-4" />
          Create Template
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total Templates</p>
              <p className="text-2xl font-bold">{projectTemplates.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Categories</p>
              <p className="text-2xl font-bold">{categories.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Avg Tasks/Template</p>
              <p className="text-2xl font-bold">
                {Math.round(
                  projectTemplates.reduce((sum, t) => sum + t.tasks, 0) / projectTemplates.length
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projectTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <IconFolder className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <Badge className={categoryColors[template.category] ?? 'bg-gray-100'}>
                      {template.category}
                    </Badge>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <IconDots className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled>
                      <IconCopy className="h-4 w-4 mr-2" />
                      Use Template
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <IconFileText className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <CardDescription>{template.description}</CardDescription>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Tasks</p>
                  <p className="font-semibold">{template.tasks} tasks</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Duration</p>
                  <p className="font-semibold">{template.duration}</p>
                </div>
              </div>

              <Button className="w-full" variant="outline" disabled>
                <IconCopy className="h-4 w-4 mr-2" />
                Use This Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed">
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <IconPlus className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Create Custom Template</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Save your project setup as a reusable template
              </p>
            </div>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
