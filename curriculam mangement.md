Based on the provided codebase and requirements, I'll outline a detailed implementation plan for revamping the curriculum management in subjects using Approach 1. Let's break this down into steps:

1. First, Update Prisma Schema
```prisma
// prisma/schema.prisma

enum NodeType {
  CHAPTER
  TOPIC
  SUBTOPIC
}

enum ResourceType {
  READING
  VIDEO
  URL
  DOCUMENT
}

enum ActivityType {
  QUIZ
  ASSIGNMENT
  DISCUSSION
  PROJECT
}

model CurriculumNode {
  id          String   @id @default(cuid())
  title       String
  description String?
  type        NodeType
  parentId    String?
  order       Int
  subjectId   String
  subject     Subject  @relation(fields: [subjectId], references: [id])
  resources   CurriculumResource[]
  activities  CurriculumActivity[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model CurriculumResource {
  id          String       @id @default(cuid())
  title       String
  type        ResourceType
  content     String
  nodeId      String
  node        CurriculumNode @relation(fields: [nodeId], references: [id])
  fileInfo    Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model CurriculumActivity {
  id          String       @id @default(cuid())
  title       String
  type        ActivityType
  content     Json
  isGraded    Boolean      @default(false)
  nodeId      String
  node        CurriculumNode @relation(fields: [nodeId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

2. Create New Components for Curriculum Management

```typescript
// src/components/dashboard/roles/super-admin/subject/curriculum/CurriculumManager.tsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CurriculumTree } from "./CurriculumTree";
import { NodeEditor } from "./NodeEditor";
import { ResourceManager } from "./ResourceManager";
import { ActivityManager } from "./ActivityManager";

export const CurriculumManager: React.FC<{subjectId: string}> = ({subjectId}) => {
  const [selectedNode, setSelectedNode] = useState<CurriculumNode | null>(null);
  
  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-3 border-r">
        <CurriculumTree 
          subjectId={subjectId}
          onNodeSelect={setSelectedNode}
        />
      </div>
      
      <div className="col-span-9">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="activities">Activities</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content">
            <NodeEditor node={selectedNode} />
          </TabsContent>
          
          <TabsContent value="resources">
            <ResourceManager nodeId={selectedNode?.id} />
          </TabsContent>
          
          <TabsContent value="activities">
            <ActivityManager nodeId={selectedNode?.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
```

3. Implement Curriculum Tree Component

```typescript
// src/components/dashboard/roles/super-admin/subject/curriculum/CurriculumTree.tsx

export const CurriculumTree: React.FC<{
  subjectId: string;
  onNodeSelect: (node: CurriculumNode) => void;
}> = ({subjectId, onNodeSelect}) => {
  const {data: nodes} = api.curriculum.getNodes.useQuery({subjectId});
  
  const buildTreeNodes = (nodes: CurriculumNode[]) => {
    const nodeMap = new Map<string | null, CurriculumNode[]>();
    
    // Group nodes by parentId
    nodes.forEach(node => {
      const parentNodes = nodeMap.get(node.parentId) || [];
      parentNodes.push(node);
      nodeMap.set(node.parentId, parentNodes);
    });

    // Recursive function to build tree
    const buildTree = (parentId: string | null): ReactNode => {
      const children = nodeMap.get(parentId) || [];
      return children.map(node => (
        <TreeItem
          key={node.id}
          id={node.id}
          label={node.title}
          icon={getNodeIcon(node.type)}
          onClick={() => onNodeSelect(node)}
        >
          {buildTree(node.id)}
        </TreeItem>
      ));
    };

    return buildTree(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center p-2">
        <h3 className="font-semibold">Curriculum Structure</h3>
        <Button variant="outline" size="sm" onClick={handleAddNode}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Add Node
        </Button>
      </div>
      
      <Tree>
        {buildTreeNodes(nodes || [])}
      </Tree>
    </div>
  );
};
```

4. Create Resource Manager Component

```typescript
// src/components/dashboard/roles/super-admin/subject/curriculum/ResourceManager.tsx

export const ResourceManager: React.FC<{nodeId?: string}> = ({nodeId}) => {
  const {data: resources} = api.curriculum.getResources.useQuery({nodeId});
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Learning Resources</h3>
        <Button onClick={handleAddResource}>Add Resource</Button>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {resources?.map(resource => (
          <ResourceCard
            key={resource.id}
            resource={resource}
            onEdit={handleEditResource}
            onDelete={handleDeleteResource}
          />
        ))}
      </div>
      
      <ResourceForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        nodeId={nodeId}
        resource={selectedResource}
      />
    </div>
  );
};
```

// NodeEditor Component
export const NodeEditor: React.FC<{node: CurriculumNode | null}> = ({node}) => {
  const [isEditing, setIsEditing] = useState(false);
  const utils = api.useContext();
  const updateNode = api.curriculum.updateNode.useMutation({
    onSuccess: () => {
      utils.curriculum.getNodes.invalidate();
      setIsEditing(false);
    }
  });

  if (!node) return <div>Select a node to edit</div>;

  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{node.title}</h3>
        <Button onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : 'Edit'}
        </Button>
      </div>
      
      {isEditing ? (
        <Form
          defaultValues={node}
          onSubmit={async (data) => {
            await updateNode.mutateAsync({
              id: node.id,
              ...data
            });
          }}
        >
          <FormField name="title" label="Title" />
          <FormField name="description" label="Description" type="textarea" />
          <FormField 
            name="type" 
            label="Type" 
            type="select"
            options={[
              { value: 'CHAPTER', label: 'Chapter' },
              { value: 'TOPIC', label: 'Topic' },
              { value: 'SUBTOPIC', label: 'Subtopic' }
            ]}
          />
          <Button type="submit" loading={updateNode.isLoading}>
            Save Changes
          </Button>
        </Form>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">{node.description}</p>
          <Badge>{node.type}</Badge>
        </div>
      )}
    </div>
  );
};

// ActivityManager Component
export const ActivityManager: React.FC<{nodeId?: string}> = ({nodeId}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const {data: activities} = api.curriculum.getActivities.useQuery(
    {nodeId: nodeId!},
    {enabled: !!nodeId}
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">Activities</h3>
        <Button onClick={() => setIsFormOpen(true)}>Add Activity</Button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {activities?.map(activity => (
          <ActivityCard
            key={activity.id}
            activity={activity}
            onEdit={() => {/* Handle edit */}}
            onDelete={() => {/* Handle delete */}}
          />
        ))}
      </div>

      <ActivityForm
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        nodeId={nodeId}
      />
    </div>
  );
};

// ResourceCard Component
export const ResourceCard: React.FC<{
  resource: CurriculumResource;
  onEdit: (resource: CurriculumResource) => void;
  onDelete: (id: string) => void;
}> = ({resource, onEdit, onDelete}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{resource.title}</CardTitle>
            <Badge>{resource.type}</Badge>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onEdit(resource)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(resource.id)}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <ResourcePreview resource={resource} />
      </CardContent>
    </Card>
  );
};

// ResourceForm Component
export const ResourceForm: React.FC<{
  open: boolean;
  onClose: () => void;
  nodeId?: string;
  resource?: CurriculumResource;
}> = ({open, onClose, nodeId, resource}) => {
  const utils = api.useContext();
  const createResource = api.curriculum.createResource.useMutation({
    onSuccess: () => {
      utils.curriculum.getResources.invalidate();
      onClose();
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {resource ? 'Edit Resource' : 'Add Resource'}
          </DialogTitle>
        </DialogHeader>
        
        <Form
          defaultValues={resource}
          onSubmit={async (data) => {
            await createResource.mutateAsync({
              ...data,
              nodeId: nodeId!
            });
          }}
        >
          <FormField name="title" label="Title" />
          <FormField 
            name="type" 
            label="Type" 
            type="select"
            options={[
              { value: 'READING', label: 'Reading' },
              { value: 'VIDEO', label: 'Video' },
              { value: 'URL', label: 'URL' },
              { value: 'DOCUMENT', label: 'Document' }
            ]}
          />
          <FormField name="content" label="Content" type="textarea" />
          <Button type="submit" loading={createResource.isLoading}>
            {resource ? 'Save Changes' : 'Create Resource'}
          </Button>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// ActivityCard Component
export const ActivityCard: React.FC<{
  activity: CurriculumActivity;
  onEdit: (activity: CurriculumActivity) => void;
  onDelete: (id: string) => void;
}> = ({activity, onEdit, onDelete}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{activity.title}</CardTitle>
            <div className="flex gap-2">
              <Badge>{activity.type}</Badge>
              {activity.isGraded && (
                <Badge variant="secondary">Graded</Badge>
              )}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreVerticalIcon className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => onEdit(activity)}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(activity.id)}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <ActivityPreview activity={activity} />
      </CardContent>
    </Card>
  );
};

// ActivityForm Component
export const ActivityForm: React.FC<{
  open: boolean;
  onClose: () => void;
  nodeId?: string;
  activity?: CurriculumActivity;
}> = ({open, onClose, nodeId, activity}) => {
  const utils = api.useContext();
  const createActivity = api.curriculum.createActivity.useMutation({
    onSuccess: () => {
      utils.curriculum.getActivities.invalidate();
      onClose();
    }
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {activity ? 'Edit Activity' : 'Add Activity'}
          </DialogTitle>
        </DialogHeader>
        
        <Form
          defaultValues={activity}
          onSubmit={async (data) => {
            await createActivity.mutateAsync({
              ...data,
              nodeId: nodeId!
            });
          }}
        >
          <FormField name="title" label="Title" />
          <FormField 
            name="type" 
            label="Type" 
            type="select"
            options={[
              { value: 'QUIZ', label: 'Quiz' },
              { value: 'ASSIGNMENT', label: 'Assignment' },
              { value: 'DISCUSSION', label: 'Discussion' },
              { value: 'PROJECT', label: 'Project' }
            ]}
          />
          <FormField name="content" label="Content" type="textarea" />
          <FormField 
            name="isGraded" 
            label="Graded Activity" 
            type="checkbox"
          />
          <Button type="submit" loading={createActivity.isLoading}>
            {activity ? 'Save Changes' : 'Create Activity'}
          </Button>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

// Preview Components
const ResourcePreview: React.FC<{resource: CurriculumResource}> = ({resource}) => {
  switch (resource.type) {
    case 'VIDEO':
      return <VideoPreview url={resource.content} />;
    case 'URL':
      return <LinkPreview url={resource.content} />;
    case 'DOCUMENT':
      return <DocumentPreview fileInfo={resource.fileInfo} />;
    default:
      return <div className="prose">{resource.content}</div>;
  }
};

const ActivityPreview: React.FC<{activity: CurriculumActivity}> = ({activity}) => {
  switch (activity.type) {
    case 'QUIZ':
      return <QuizPreview content={activity.content} />;
    case 'ASSIGNMENT':
      return <AssignmentPreview content={activity.content} />;
    case 'DISCUSSION':
      return <DiscussionPreview content={activity.content} />;
    case 'PROJECT':
      return <ProjectPreview content={activity.content} />;
    default:
      return <div className="prose">{JSON.stringify(activity.content)}</div>;
  }
};

5. Update SubjectManagement Component

```typescript
// src/components/dashboard/roles/super-admin/subject/SubjectManagement.tsx

export const SubjectManagement = () => {
  const [activeTab, setActiveTab] = useState<'list' | 'curriculum'>('list');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Subject Management</CardTitle>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'list' | 'curriculum')}>
            <TabsList>
              <TabsTrigger value="list">Subjects</TabsTrigger>
              <TabsTrigger value="curriculum">Curriculum</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>
      
      <CardContent>
        {activeTab === 'list' ? (
          <SubjectList
            subjects={subjects}
            onSelect={(id) => {
              setSelectedSubject(id);
              setActiveTab('curriculum');
            }}
          />
        ) : (
          selectedSubject && (
            <CurriculumManager subjectId={selectedSubject} />
          )
        )}
      </CardContent>
    </Card>
  );
};
```

6. Add API Routes

```typescript
// src/server/api/routers/curriculum.ts

export const curriculumRouter = createTRPCRouter({
  getNodes: protectedProcedure
    .input(z.object({ subjectId: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.prisma.curriculumNode.findMany({
        where: { subjectId: input.subjectId },
        orderBy: { order: 'asc' }
      });
    }),

  createNode: protectedProcedure
    .input(z.object({
      title: z.string(),
      description: z.string().optional(),
      type: z.enum(['CHAPTER', 'TOPIC', 'SUBTOPIC']),
      parentId: z.string().optional(),
      subjectId: z.string(),
      order: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.prisma.curriculumNode.create({
        data: input
      });
    }),

  // Error handling and validation for nodes
  createNode: protectedProcedure
    .input(z.object({
      title: z.string().min(1, "Title is required"),
      description: z.string().optional(),
      type: z.enum(["CHAPTER", "TOPIC", "SUBTOPIC"]),
      parentId: z.string().optional(),
      subjectId: z.string(),
      order: z.number().min(0)
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        // Validate parent exists if parentId is provided
        if (input.parentId) {
          const parent = await ctx.prisma.curriculumNode.findUnique({
            where: { id: input.parentId }
          });
          if (!parent) throw new Error("Parent node not found");
        }

        return await ctx.prisma.curriculumNode.create({
          data: input
        });
      } catch (error) {
        throw new Error(`Failed to create node: ${error.message}`);
      }
    }),

  // Resource operations with validation
  createResource: protectedProcedure
    .input(z.object({
      title: z.string().min(1, "Title is required"),
      type: z.enum(["READING", "VIDEO", "URL", "DOCUMENT"]),
      content: z.string().min(1, "Content is required"),
      nodeId: z.string(),
      fileInfo: z.object({}).optional()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const node = await ctx.prisma.curriculumNode.findUnique({
          where: { id: input.nodeId }
        });
        if (!node) throw new Error("Node not found");

        return await ctx.prisma.curriculumResource.create({
          data: input
        });
      } catch (error) {
        throw new Error(`Failed to create resource: ${error.message}`);
      }
    }),

  // Activity operations with validation
  createActivity: protectedProcedure
    .input(z.object({
      title: z.string().min(1, "Title is required"),
      type: z.enum(["QUIZ", "ASSIGNMENT", "DISCUSSION", "PROJECT"]),
      content: z.object({}),
      isGraded: z.boolean(),
      nodeId: z.string()
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const node = await ctx.prisma.curriculumNode.findUnique({
          where: { id: input.nodeId }
        });
        if (!node) throw new Error("Node not found");

        return await ctx.prisma.curriculumActivity.create({
          data: input
        });
      } catch (error) {
        throw new Error(`Failed to create activity: ${error.message}`);
      }
    })
});
```

7. Update Navigation

```typescript
// src/components/dashboard/roles/super-admin/subject/SubjectNavigation.tsx

export const SubjectNavigation = () => {
  return (
    <nav className="space-x-2">
      <Link href="/dashboard/super-admin/subject">
        <Button variant="ghost">Subjects</Button>
      </Link>
      <Link href="/dashboard/super-admin/subject/curriculum">
        <Button variant="ghost">Curriculum</Button>
      </Link>
    </nav>
  );
};
```

This implementation:
1. Maintains consistency with existing UI components and patterns
2. Provides a clear hierarchy for curriculum management
3. Separates concerns between different aspects (content, resources, activities)
4. Uses familiar UI patterns (trees, cards, tabs) for intuitive navigation
5. Integrates with existing subject management functionality
6. Supports graded and non-graded activities
7. Allows for resource management and organization

The UI/UX follows best practices by:
- Using a familiar tree structure for curriculum hierarchy
- Providing clear visual feedback for selected items
- Using tabs to organize different types of content
- Maintaining consistent styling with existing components
- Including proper loading states and error handling
- Supporting drag-and-drop for reordering (can be added)
- Providing clear actions for adding/editing content

This implementation can be extended further with features like:
- Drag-and-drop reordering of nodes
- Rich text editing for content
- Preview modes for resources
- Bulk operations for resources/activities
- Import/export functionality
- Version control for curriculum content