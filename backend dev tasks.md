Based on the provided codebase and requirements, I'll suggest a more aligned implementation that minimizes conflicts with the existing code. Here's a refined approach:

1. First, let's extend the existing CurriculumNode interface in `/src/types/curriculum.ts`:

```typescript
// Add new interfaces for context types
export interface NodeLearningContext {
  objectives?: string[];
  duration?: string;
  prerequisites?: string[];
  keyTerms?: string[];
  outcomes?: string[];
}

export interface NodeResourceContext {
  materials?: {
    primary?: string[];
    supplementary?: string[];
  };
  references?: string[];
}

export interface NodeAssessmentContext {
  methods?: string[];
  criteria?: string[];
  weightage?: number;
}

// Update CurriculumNode interface
export interface CurriculumNode {
  id: string;
  title: string;
  description?: string;
  type: NodeType;
  parentId?: string;
  order: number;
  subjectId: string;
  
  // Add new optional context fields
  learningContext?: NodeLearningContext;
  resourceContext?: NodeResourceContext;
  assessmentContext?: NodeAssessmentContext;
  
  // Existing fields
  resources: CurriculumResource[];
  activities: CurriculumActivity[];
  children?: CurriculumNode[];
  createdAt: Date;
  updatedAt: Date;
}
```

2. Update the NodeEditor component to include the new fields while maintaining compatibility:

```typescript
// /src/components/dashboard/roles/super-admin/subject/curriculum/NodeEditor.tsx

export const NodeEditor: React.FC<NodeEditorProps> = ({ node, onClose }) => {
  // Existing state
  const [title, setTitle] = useState(node.title);
  const [description, setDescription] = useState(node.description || "");
  const [type, setType] = useState<NodeType>(node.type);
  const [parentId, setParentId] = useState<string | undefined>(node.parentId);

  // New state for contexts
  const [learningContext, setLearningContext] = useState<NodeLearningContext>(
    node.learningContext || {}
  );
  const [resourceContext, setResourceContext] = useState<NodeResourceContext>(
    node.resourceContext || {}
  );
  const [assessmentContext, setAssessmentContext] = useState<NodeAssessmentContext>(
    node.assessmentContext || {}
  );

  // Update mutation to include new fields
  const updateNode = api.curriculum.updateNode.useMutation({
    onSuccess: () => {
      utils.curriculum.getNodes.invalidate();
      onClose?.();
    }
  });

  const handleSave = async () => {
    try {
      await updateNode.mutateAsync({
        id: node.id,
        title,
        description,
        type,
        parentId,
        learningContext,
        resourceContext,
        assessmentContext
      });
    } catch (error) {
      console.error("Failed to update node:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Existing fields */}
      <div className="space-y-4">
        {/* Basic Information */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Title</label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter node title"
          />
        </div>

        {/* Learning Context Section */}
        <Card>
          <CardHeader>
            <CardTitle>Learning Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Learning Objectives</label>
              <Textarea
                value={learningContext.objectives?.join('\n') || ''}
                onChange={(e) => setLearningContext({
                  ...learningContext,
                  objectives: e.target.value.split('\n').filter(Boolean)
                })}
                placeholder="Enter objectives (one per line)"
              />
            </div>
            {/* Add similar fields for other learning context items */}
          </CardContent>
        </Card>

        {/* Resource Context Section */}
        <Card>
          <CardHeader>
            <CardTitle>Resources</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add resource context fields */}
          </CardContent>
        </Card>

        {/* Assessment Context Section */}
        <Card>
          <CardHeader>
            <CardTitle>Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add assessment context fields */}
          </CardContent>
        </Card>
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 pt-4">
        <Button 
          variant="outline"
          onClick={handleCancel}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={updateNode.status === 'pending'}
          className="flex-1"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
};
```

3. Update the API endpoint schema (if using tRPC):

```typescript
// /src/server/api/routers/curriculum.ts

export const curriculumRouter = createTRPCRouter({
  updateNode: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string(),
      description: z.string().optional(),
      type: z.enum(['CHAPTER', 'TOPIC', 'SUBTOPIC']),
      parentId: z.string().optional(),
      learningContext: z.object({
        objectives: z.array(z.string()).optional(),
        duration: z.string().optional(),
        prerequisites: z.array(z.string()).optional(),
        keyTerms: z.array(z.string()).optional(),
        outcomes: z.array(z.string()).optional(),
      }).optional(),
      resourceContext: z.object({
        materials: z.object({
          primary: z.array(z.string()).optional(),
          supplementary: z.array(z.string()).optional(),
        }).optional(),
        references: z.array(z.string()).optional(),
      }).optional(),
      assessmentContext: z.object({
        methods: z.array(z.string()).optional(),
        criteria: z.array(z.string()).optional(),
        weightage: z.number().optional(),
      }).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Implementation
    }),
});
```

This implementation:
- Maintains backward compatibility with existing code
- Adds new fields as optional properties
- Uses existing UI components and patterns
- Follows the established type system
- Keeps the existing tree structure intact
- Allows gradual adoption of new fields

The changes are modular and don't affect the existing functionality while providing the foundation for enhanced curriculum content management.