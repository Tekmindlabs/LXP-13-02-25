Based on the current codebase and requirements, here's the updated implementation plan aligned with the existing gradebook system:

### Phase 1: Database Schema & Core Infrastructure

1. **Update Schema Models**
```prisma
// prisma/schema.prisma

model Class {
  id                String    @id @default(cuid())
  name              String
  classGroupId      String
  classGroup        ClassGroup @relation(fields: [classGroupId], references: [id])
  gradeBook         GradeBook? // One-to-one relation
  termStructureId   String?
  status            Status    @default(ACTIVE)
}

model GradeBook {
  id                String    @id @default(cuid())
  classId           String    @unique
  class             Class     @relation(fields: [classId], references: [id])
  assessmentSystemId String
  assessmentSystem  AssessmentSystem @relation(fields: [assessmentSystemId], references: [id])
  termStructureId   String
  termStructure     TermStructure @relation(fields: [termStructureId], references: [id])
  subjectRecords    SubjectGradeRecord[]
  createdAt         DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

model SubjectGradeRecord {
  id                    String    @id @default(cuid())
  gradeBookId           String
  gradeBook             GradeBook @relation(fields: [gradeBookId], references: [id])
  subjectId             String
  subject               Subject   @relation(fields: [subjectId], references: [id])
  termGrades            Json?     // Stores term-wise grades
  assessmentPeriodGrades Json?    // Stores assessment period grades
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt
}
```

2. **Service Layer Updates**
```typescript
// Update GradeBookService
class GradeBookService {
  async initializeGradeBook(classId: string): Promise<void> {
    // Updated to use existing assessment system inheritance
    const classData = await this.fetchClassWithInheritedSettings(classId);
    await this.createGradeBookWithSubjects(classData);
  }

  async calculateSubjectTermGrade(
    subjectId: string,
    termId: string,
    studentId: string,
    assessmentSystemId: string
  ): Promise<SubjectTermGrade> {
    // Implement using existing SubjectGradeManager logic
  }
}

// Update SubjectGradeManager
class SubjectGradeManager {
  async initializeSubjectGrades(
    gradeBookId: string,
    subject: any,
    termStructure: any
  ): Promise<void> {
    // Use existing initialization logic with updated schema
  }
}
```

### Phase 2: Feature Implementation

1. **Class Creation Flow**
```typescript
async function createClassWithInheritance(data: CreateClassInput) {
  return await db.$transaction(async (tx) => {
    // Create class
    const newClass = await tx.class.create({
      data: {
        name: data.name,
        classGroupId: data.classGroupId
      }
    });

    // Initialize gradebook with inherited settings
    await gradeBookService.initializeGradeBook(newClass.id);

    // Set up calendar
    await calendarService.inheritClassGroupCalendar(
      data.classGroupId, 
      newClass.id
    );

    return newClass;
  });
}
```

2. **Activity & Assessment Integration**
```typescript
interface ActivityGrade {
  activityId: string;
  studentId: string;
  grade: number;
  assessmentPeriodId: string;
}

async function recordActivityGrade(data: ActivityGrade) {
  // Record grade and update gradebook
  await gradeBookService.updateActivityGrade(data);
  // Recalculate assessment period grade
  await subjectGradeManager.calculateAssessmentPeriodGrade(
    data.subjectId,
    data.assessmentPeriodId,
    data.studentId
  );
}
```

### Phase 3: UI Implementation

1. **Updated Gradebook Component**
```tsx
function GradebookView({ classId }: { classId: string }) {
  const [activeTermId, setActiveTermId] = useState<string>();
  const [activeSubjectId, setActiveSubjectId] = useState<string>();

  return (
    <div className="gradebook-container">
      <TermSelector 
        termId={activeTermId}
        onTermChange={setActiveTermId}
      />
      <SubjectGradesView
        classId={classId}
        termId={activeTermId}
        subjectId={activeSubjectId}
      />
      <AssessmentPeriodsView
        termId={activeTermId}
        subjectId={activeSubjectId}
      />
    </div>
  );
}
```

2. **Grade Input Component**
```tsx
function GradeInput({ 
  activityId, 
  studentId,
  assessmentSystem 
}: GradeInputProps) {
  const [grade, setGrade] = useState<number>();
  
  const handleGradeSubmit = async () => {
    await recordActivityGrade({
      activityId,
      studentId,
      grade,
      assessmentPeriodId
    });
  };

  return (
    <div className="grade-input">
      <input 
        type="number"
        value={grade}
        onChange={(e) => setGrade(Number(e.target.value))}
      />
      <button onClick={handleGradeSubmit}>Save Grade</button>
    </div>
  );
}
```

### Implementation Notes:

1. **Data Flow**
- Class creation triggers gradebook initialization
- Activities automatically create gradebook entries
- Grades update both activity and assessment period records
- Term grades are calculated from assessment period grades

2. **Inheritance Handling**
- Assessment system inherited from class group
- Term structure inherited from class group
- Subjects inherited and linked to gradebook
- Calendar events inherited and maintained

3. **Performance Optimizations**
- Batch grade calculations
- Cache frequently accessed data
- Use transactions for data integrity
- Implement proper indexing

4. **Security Considerations**
- Role-based access control
- Grade modification audit logs
- Input validation
- Error handling

This updated implementation aligns with the existing gradebook system while adding the required inheritance features and maintaining data consistency across the platform.

The changes align with the existing codebase structure while adding the necessary gradebook-related functionality.


Looking at the actual codebase more closely, here are the specific updates needed for the class management UI components:

1. **Update ClassForm.tsx**:
```typescript
// src/components/dashboard/roles/super-admin/class/ClassForm.tsx

export const ClassForm = ({ isOpen, onClose, selectedClass, classGroups, teachers }: ClassFormProps) => {
  // Add gradebook-related fields to form schema
  const formSchema = z.object({
    // Existing fields
    name: z.string().min(1, "Name is required"),
    classGroupId: z.string().min(1, "Class Group is required"),
    capacity: z.number().min(1, "Capacity must be at least 1"),
    status: z.enum([Status.ACTIVE, Status.INACTIVE, Status.ARCHIVED]),
    // No need to add gradebook fields as they're inherited
  });

  // Update form display to show inherited settings
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <Tabs defaultValue="basic">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">Basic Information</TabsTrigger>
                <TabsTrigger value="teachers">Teachers</TabsTrigger>
                <TabsTrigger value="settings">Inherited Settings</TabsTrigger>
              </TabsList>

              {/* Add new tab for inherited settings */}
              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Inherited Settings from Class Group</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <Label>Assessment System</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedClass?.classGroup?.assessmentSystem?.name || "Will inherit from class group"}
                        </p>
                      </div>
                      <div>
                        <Label>Term Structure</Label>
                        <p className="text-sm text-muted-foreground">
                          {selectedClass?.classGroup?.termStructure?.name || "Will inherit from class group"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Existing tabs remain unchanged */}
            </Tabs>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
```

2. **Update ClassList.tsx**:
```typescript
// src/components/dashboard/roles/super-admin/class/ClassList.tsx

export const ClassList = ({ classes, onSelect }: ClassListProps) => {
  return (
    <ScrollArea className="rounded-md border h-[600px]">
      <Table>
        <TableHeader>
          <TableRow>
            {/* Add new column for gradebook status */}
            <TableHead className="w-[200px]">Name</TableHead>
            <TableHead className="w-[200px]">Program</TableHead>
            <TableHead className="w-[200px]">Class Group</TableHead>
            <TableHead className="w-[150px]">Gradebook Status</TableHead>
            <TableHead className="w-[100px] text-center">Capacity</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[150px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {classes.map((cls) => (
            <TableRow key={cls.id}>
              <TableCell className="font-medium">{cls.name}</TableCell>
              <TableCell>{cls.classGroup.program.name}</TableCell>
              <TableCell>{cls.classGroup.name}</TableCell>
              <TableCell>
                <Badge variant={cls.gradeBook ? "default" : "secondary"}>
                  {cls.gradeBook ? "Initialized" : "Pending"}
                </Badge>
              </TableCell>
              <TableCell className="text-center">{cls.capacity}</TableCell>
              <TableCell>
                <Badge variant={cls.status === "ACTIVE" ? "default" : "secondary"}>
                  {cls.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onSelect(cls.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleView(cls.id)}
                  >
                    View
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  );
};
```

3. **Update ClassDetailsView.tsx**:
```typescript
// src/components/dashboard/roles/super-admin/class/ClassDetailsView.tsx

export const ClassDetailsView = ({ classId }: ClassDetailsViewProps) => {
  // Add gradebook tab to existing tabs
  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="gradebook">Gradebook</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
        </TabsList>

        {/* Add new gradebook tab content */}
        <TabsContent value="gradebook">
          <Card>
            <CardHeader>
              <CardTitle>Gradebook</CardTitle>
            </CardHeader>
            <CardContent>
              <GradebookComponent 
                classId={classDetails.id}
                type="teacher"
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Existing tab contents remain unchanged */}
      </Tabs>
    </div>
  );
};
```

These updates:
1. Maintain the existing UI patterns and components
2. Add gradebook status display in the class list
3. Show inherited settings in the class form
4. Integrate the gradebook component in class details view
5. Use existing dialog and notification patterns
6. Keep consistent with the current table and card layouts

The changes align with the existing codebase structure while adding the necessary gradebook-related functionality.