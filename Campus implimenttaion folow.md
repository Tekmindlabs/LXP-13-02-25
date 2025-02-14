You're absolutely right - let me outline a clearer structure that shows how class groups and subjects at the institute level, along with their associated curriculum, are inherited by classes at the campus level:

# Revised Hierarchical Structure

```
Institute Level
└── Programs
    └── Class Groups
        ├── Subjects
        │   ├── Curriculum
        │   │   ├── Nodes (Chapters/Topics)
        │   │   ├── Resources
        │   │   └── Activities
        │   └── Assessment Configuration
        └── Term Structure

Campus Level
└── Classes (Inherits from Institute Class Groups)
    ├── Inherited Components:
    │   ├── Subjects with Curriculum
    │   ├── Assessment Systems
    │   └── Term Structures
    └── Campus-specific:
        ├── Students
        ├── Teachers
        └── Gradebooks
```

# Implementation Flow

## 1. Institute Level Configuration

### A. Class Group Setup
```
Class Group Creation
├── Basic Details
│   ├── Name
│   ├── Description
│   └── Program Association
└── Subject Assignment
    ├── Subject List
    └── Teacher Templates
```

### B. Subject Configuration
```
Subject Setup
├── Basic Information
│   ├── Name
│   ├── Code
│   └── Description
├── Curriculum Structure
│   ├── Chapters/Topics
│   ├── Resources
│   └── Activities (Including H5P)
└── Assessment Configuration
    ├── Grading Schema
    └── Evaluation Criteria
```

## 2. Campus Level Implementation

### A. Class Creation
```
Class Setup
├── Select Program & Class Group
│   └── Automatic Inheritance of:
      ├── Subjects
      ├── Curriculum
      └── Assessment Configuration
├── Local Configuration
├── ├── campus 
│   ├── Class Name/Section
│   ├── Capacity
│   └── Schedule
└── Resource Assignment
    ├── Teachers
    └── Students
```

### B. Inheritance Management
```
Inherited Components
├── Subjects
│   ├── Complete Curriculum
│   ├── Resources
│   └── Activities
├── Assessment Systems
│   ├── Grading Schemas
│   └── Evaluation Criteria
└── Term Structures
    └── Academic Calendar
```

## 3. Data Structure

### A. Class Group Schema
```typescript
interface ClassGroup {
  id: string;
  name: string;
  programId: string;
  subjects: Subject[];
  assessmentConfig: AssessmentConfig;
  termStructure: TermStructure;
}
```

### B. Class Schema
```typescript
interface Class {
  id: string;
  name: string;
  classGroupId: string;  // Reference to institute level class group
  campusId: string;
  subjects: InheritedSubject[];
  teachers: TeacherAssignment[];
  students: StudentEnrollment[];
  gradebook: Gradebook;
}
```

## 4. Key Considerations

1. **Inheritance Flow**
   - Class groups and subjects are defined at institute level
   - Classes at campus level inherit complete structure
   - Local modifications are tracked separately

2. **Curriculum Management**
   - Central curriculum management at institute level
   - Consistent delivery across all campuses
   - Campus-specific tracking of progress

3. **Assessment Structure**
   - Standardized assessment criteria from institute
   - Campus-level implementation and grading
   - Unified reporting structure

4. **Teacher Assignment**
   - Template from institute level
   - Actual assignment at campus level
   - Subject-specific permissions

## 5. Implementation Benefits

1. **Standardization**
   - Consistent curriculum across campuses
   - Unified assessment approach
   - Standardized quality control

2. **Efficient Management**
   - Centralized updates
   - Reduced redundancy
   - Simplified administration

3. **Flexibility**
   - Campus-specific implementations
   - Local resource management
   - Customized scheduling

I'll outline how timetable and attendance management should be structured at the campus level while maintaining inheritance from the institute level.

# Updated Campus Management Structure

## 1. Core Hierarchy
```
Institute Level
└── Programs
    └── Class Groups
        ├── Subjects
        │   ├── Curriculum
        │   └── Assessment Configuration
        └── Term Structure

Campus Level
└── Classes (Inherits from Institute Class Groups)
    ├── Timetable Management
    │   ├── Period Configuration
    │   ├── Break Times
    │   └── Teacher Assignments
    └── Attendance Management
        ├── Daily Attendance
        ├── Subject-wise Attendance
        └── Reports Generation
```

## 2. Timetable Management at Campus Level

### A. Structure
```typescript
interface CampusTimetable {
  classId: string;
  classGroupId: string;  // Reference to institute level
  academicCalendarId: string;
  termId: string;
  schedule: {
    startTime: string;
    endTime: string;
    breakTimes: BreakTime[];
    periods: Period[];
  }
}

interface Period {
  startTime: string;
  endTime: string;
  subjectId: string;  // Reference to institute level subject
  teacherId: string;  // Campus level teacher
  daysOfWeek: number[];
  classroomId: string;
}
```

### B. Key Features
1. **Class-Specific Timetables**
   ```typescript
   - Inherit subjects from institute class groups
   - Configure periods for each class
   - Assign campus teachers to subjects
   - Manage break times
   ```

2. **Conflict Management**
   ```typescript
   - Teacher availability checks
   - Classroom allocation
   - Break time coordination
   - Period overlap prevention
   ```

## 3. Attendance Management at Campus Level

### A. Structure
```typescript
interface CampusAttendance {
  classId: string;
  date: Date;
  type: AttendanceType;  // DAILY | SUBJECT_WISE
  records: AttendanceRecord[];
}

interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  subjectId?: string;  // For subject-wise attendance
  notes?: string;
}
```

### B. Key Features
1. **Attendance Tracking Modes**
   ```typescript
   - Daily class attendance
   - Subject-wise attendance
   - Multiple status options (PRESENT, ABSENT, LATE, EXCUSED)
   ```

2. **Teacher Access Levels**
   ```typescript
   - Class teachers: Full class attendance management
   - Subject teachers: Subject-specific attendance
   ```

## 4. Implementation Flow

### A. Timetable Creation
```typescript
1. Select Class Group (Institute Level)
   └── Inherit:
       ├── Subjects
       └── Term Structure

2. Configure Campus Timetable
   ├── Set daily schedule
   ├── Define break times
   ├── Create periods
   └── Assign teachers

3. Validate Schedule
   ├── Check teacher conflicts
   ├── Verify classroom availability
   └── Ensure subject coverage
```

### B. Attendance Management
```typescript
1. Class Setup
   ├── Inherit class structure from institute
   └── Configure attendance tracking mode

2. Daily Operations
   ├── Record attendance
   │   ├── Class-level (Class teacher)
   │   └── Subject-level (Subject teacher)
   └── Generate reports
```

## 5. Access Control

```typescript
interface CampusAccess {
  campusId: string;
  roles: {
    CAMPUS_ADMIN: {
      permissions: ['MANAGE_TIMETABLE', 'VIEW_ALL_ATTENDANCE']
    },
    CLASS_TEACHER: {
      permissions: ['MANAGE_CLASS_ATTENDANCE', 'VIEW_TIMETABLE']
    },
    SUBJECT_TEACHER: {
      permissions: ['MANAGE_SUBJECT_ATTENDANCE', 'VIEW_SUBJECT_TIMETABLE']
    }
  }
}
```

## 6. Data Management

### A. Timetable Data
```typescript
- Store campus-specific timetables
- Maintain teacher assignments
- Track classroom allocations
```

### B. Attendance Data
```typescript
- Daily attendance records
- Subject-wise attendance
- Attendance reports and analytics
```

This structure ensures that:
1. Timetables are managed efficiently at the campus level
2. Attendance tracking is flexible and role-appropriate
3. Data inheritance from institute level is maintained
4. Campus-specific customizations are supported
5. Clear access control is implemented

The system maintains centralized control at the institute level while allowing for efficient campus-level operations in timetable and attendance management.