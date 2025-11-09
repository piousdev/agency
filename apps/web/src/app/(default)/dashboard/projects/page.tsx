import {
  AlertCircle,
  ArrowUpDown,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  MoreHorizontal,
  Pause,
  Plus,
  Search,
  Users,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { requireUser } from '@/lib/auth/session';

/**
 * Projects Page - JIRA/Rally Style
 *
 * Features:
 * - Comprehensive project table with all relevant information
 * - Search and filter functionality
 * - Sort options
 * - Status indicators and progress tracking
 * - Team member visualization
 */

// Mock data - Replace with actual API calls
const mockProjects = [
  {
    id: 'PROJ-001',
    name: 'Brand Redesign for TechCorp',
    client: 'TechCorp Inc.',
    status: 'in-progress',
    priority: 'high',
    progress: 65,
    startDate: '2024-01-15',
    dueDate: '2024-03-30',
    budget: '$125,000',
    spent: '$81,250',
    team: [
      { name: 'John Doe', avatar: null },
      { name: 'Jane Smith', avatar: null },
      { name: 'Mike Johnson', avatar: null },
    ],
    tasksCompleted: 24,
    tasksTotal: 37,
  },
  {
    id: 'PROJ-002',
    name: 'E-commerce Platform Development',
    client: 'RetailHub LLC',
    status: 'in-progress',
    priority: 'critical',
    progress: 42,
    startDate: '2024-02-01',
    dueDate: '2024-04-15',
    budget: '$250,000',
    spent: '$105,000',
    team: [
      { name: 'Sarah Williams', avatar: null },
      { name: 'Tom Brown', avatar: null },
      { name: 'Lisa Davis', avatar: null },
      { name: 'Chris Wilson', avatar: null },
    ],
    tasksCompleted: 18,
    tasksTotal: 43,
  },
  {
    id: 'PROJ-003',
    name: 'Mobile App UI/UX Redesign',
    client: 'FinanceApp Co.',
    status: 'planning',
    priority: 'medium',
    progress: 15,
    startDate: '2024-03-01',
    dueDate: '2024-05-20',
    budget: '$85,000',
    spent: '$12,750',
    team: [
      { name: 'Emma Taylor', avatar: null },
      { name: 'David Martinez', avatar: null },
    ],
    tasksCompleted: 5,
    tasksTotal: 32,
  },
  {
    id: 'PROJ-004',
    name: 'Marketing Campaign Q2',
    client: 'GlobalBrand Corp',
    status: 'completed',
    priority: 'low',
    progress: 100,
    startDate: '2023-12-01',
    dueDate: '2024-02-28',
    budget: '$65,000',
    spent: '$62,500',
    team: [
      { name: 'Rachel Green', avatar: null },
      { name: 'Monica Geller', avatar: null },
    ],
    tasksCompleted: 28,
    tasksTotal: 28,
  },
  {
    id: 'PROJ-005',
    name: 'API Integration & Backend Optimization',
    client: 'DataTech Solutions',
    status: 'on-hold',
    priority: 'medium',
    progress: 55,
    startDate: '2024-01-20',
    dueDate: '2024-03-15',
    budget: '$95,000',
    spent: '$52,250',
    team: [
      { name: 'Alex Chen', avatar: null },
      { name: 'Jordan Lee', avatar: null },
      { name: 'Sam Taylor', avatar: null },
    ],
    tasksCompleted: 16,
    tasksTotal: 29,
  },
  {
    id: 'PROJ-006',
    name: 'Content Management System Build',
    client: 'MediaGroup Inc.',
    status: 'in-progress',
    priority: 'high',
    progress: 78,
    startDate: '2023-11-15',
    dueDate: '2024-03-10',
    budget: '$180,000',
    spent: '$140,400',
    team: [
      { name: 'Casey Morgan', avatar: null },
      { name: 'Taylor Swift', avatar: null },
      { name: 'Jamie Fox', avatar: null },
      { name: 'Morgan Freeman', avatar: null },
    ],
    tasksCompleted: 35,
    tasksTotal: 45,
  },
];

const statusConfig = {
  'in-progress': {
    label: 'In Progress',
    variant: 'default' as const,
    icon: Clock,
    color: 'bg-blue-500',
  },
  planning: {
    label: 'Planning',
    variant: 'secondary' as const,
    icon: AlertCircle,
    color: 'bg-yellow-500',
  },
  completed: {
    label: 'Completed',
    variant: 'outline' as const,
    icon: CheckCircle2,
    color: 'bg-green-500',
  },
  'on-hold': {
    label: 'On Hold',
    variant: 'destructive' as const,
    icon: Pause,
    color: 'bg-red-500',
  },
};

const priorityConfig = {
  critical: { label: 'Critical', color: 'text-red-600 bg-red-50' },
  high: { label: 'High', color: 'text-orange-600 bg-orange-50' },
  medium: { label: 'Medium', color: 'text-yellow-600 bg-yellow-50' },
  low: { label: 'Low', color: 'text-green-600 bg-green-50' },
};

export default async function ProjectsPage() {
  // Server-side authentication
  const user = await requireUser();

  return (
    <div className="container mx-auto py-8 space-y-6 max-w-full overflow-hidden px-4">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold">Projects</h1>
          <p className="text-gray-600 mt-2">Manage and track all your projects in one place</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Filters and Search Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input placeholder="Search projects, clients, or team members..." className="pl-10" />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2">
              <Select defaultValue="all-status">
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-status">All Status</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="planning">Planning</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="on-hold">On Hold</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all-priority">
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-priority">All Priority</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="all-clients">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Client" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-clients">All Clients</SelectItem>
                  <SelectItem value="techcorp">TechCorp Inc.</SelectItem>
                  <SelectItem value="retailhub">RetailHub LLC</SelectItem>
                  <SelectItem value="financeapp">FinanceApp Co.</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="due-date">
                <SelectTrigger className="w-[140px]">
                  <ArrowUpDown className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="due-date">Due Date</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="budget">Budget</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats Summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Total Projects</p>
              <p className="text-2xl font-bold">{mockProjects.length}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {mockProjects.filter((p) => p.status === 'in-progress').length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {mockProjects.filter((p) => p.status === 'completed').length}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-500">On Hold</p>
              <p className="text-2xl font-bold text-red-600">
                {mockProjects.filter((p) => p.status === 'on-hold').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Project</TableHead>
                  <TableHead className="hidden md:table-cell">Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden lg:table-cell">Priority</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="hidden xl:table-cell">Team</TableHead>
                  <TableHead className="hidden lg:table-cell">Timeline</TableHead>
                  <TableHead className="hidden xl:table-cell">Budget</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockProjects.map((project) => {
                  const StatusIcon = statusConfig[project.status].icon;
                  return (
                    <TableRow key={project.id} className="cursor-pointer hover:bg-gray-50">
                      <TableCell className="font-medium">
                        <div className="space-y-1">
                          <div className="font-semibold">{project.name}</div>
                          <div className="text-xs text-gray-500">{project.id}</div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm">{project.client}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusConfig[project.status].variant} className="gap-1">
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig[project.status].label}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <Badge variant="outline" className={priorityConfig[project.priority].color}>
                          {priorityConfig[project.priority].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-2 min-w-[150px]">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-600">
                              {project.tasksCompleted}/{project.tasksTotal} tasks
                            </span>
                            <span className="font-medium">{project.progress}%</span>
                          </div>
                          <Progress value={project.progress} className="h-2" />
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="flex -space-x-2">
                          {project.team.slice(0, 3).map((member, idx) => (
                            <Avatar key={idx} className="h-8 w-8 border-2 border-white">
                              <AvatarImage src={member.avatar || undefined} />
                              <AvatarFallback className="text-xs bg-gradient-to-br from-purple-400 to-pink-400 text-white">
                                {member.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                          {project.team.length > 3 && (
                            <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium">
                              +{project.team.length - 3}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="h-3 w-3" />
                            <span>Start: {new Date(project.startDate).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <Calendar className="h-3 w-3" />
                            <span>Due: {new Date(project.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden xl:table-cell">
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center gap-1 text-gray-600">
                            <DollarSign className="h-3 w-3" />
                            <span>Budget: {project.budget}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-600">
                            <DollarSign className="h-3 w-3" />
                            <span>Spent: {project.spent}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium">{mockProjects.length}</span> of{' '}
          <span className="font-medium">{mockProjects.length}</span> projects
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
