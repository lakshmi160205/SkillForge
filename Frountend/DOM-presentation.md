# SkillForge Frontend Flowchart

This version is made for presentations, demos, and reports.

It shows how a user moves through the frontend and how the main pages connect.

## Simple User Flow

```mermaid
flowchart TD
    A[User Opens Website] --> B[Home Page]

    B --> C[Browse Courses]
    B --> D[Search Courses]
    B --> E[Open Course Details]
    B --> F[Go to Login]
    B --> G[Go to Register]

    G --> H[Create Account]
    H --> I{Choose Role}
    I --> I1[Student]
    I --> I2[Instructor]

    F --> J[Login Page]
    J --> K{Login Role}
    K --> L[Student Dashboard]
    K --> M[Instructor Dashboard]
    K --> N[Admin Dashboard]

    E --> O[Course Details Page]
    O --> P[View Lectures]
    O --> Q[View Reviews]
    O --> R[Enroll as Student]

    L --> S[See Enrolled Courses]
    L --> T[Track Progress]
    L --> U[See Review Count]

    M --> V[Create Course]
    V --> W[Upload Thumbnail]
    V --> X[Add Course Info]
    V --> Y[Add Lectures]
    M --> Z[View My Courses]

    N --> AA[View Platform Stats]
    N --> AB[Manage Users]
    N --> AC[Block or Activate Users]

    style A fill:#ecfdf5,stroke:#047857,color:#064e3b
    style B fill:#f0fdf4,stroke:#16a34a,color:#14532d
    style O fill:#eff6ff,stroke:#2563eb,color:#1e3a8a
    style L fill:#fefce8,stroke:#ca8a04,color:#713f12
    style M fill:#fff7ed,stroke:#ea580c,color:#7c2d12
    style N fill:#fdf2f8,stroke:#db2777,color:#831843
```

## Frontend Structure Summary

```text
Root
└── Router
    └── Auth Provider
        └── App
            └── Layout
                ├── Header
                ├── Main Page Content
                └── Footer
```

## Main Pages

### Home Page
- Shows the website introduction.
- Lets users search and browse courses.
- Opens course details.

### Course Details Page
- Shows course title, description, price, and thumbnail.
- Shows lecture list and student reviews.
- Lets a student enroll.

### Login and Register
- Register allows `Student` and `Instructor` only.
- Login supports `Student`, `Instructor`, and existing `Admin` users.

### Student Dashboard
- Shows enrolled courses.
- Shows progress and completion information.

### Instructor Dashboard
- Lets instructors create courses.
- Lets instructors upload thumbnails.
- Lets instructors add lectures before creating the course.
- Shows all courses created by the instructor.

### Admin Dashboard
- Shows total users, courses, and enrollments.
- Lets admin manage user status.

## Role-Based Access

```mermaid
flowchart LR
    A[Visitor] --> B[Public Pages]
    B --> C[Home]
    B --> D[Course Details]
    B --> E[Login]
    B --> F[Register]

    E --> G{Authenticated User}
    G --> H[Student Dashboard]
    G --> I[Instructor Dashboard]
    G --> J[Admin Dashboard]

    style H fill:#fef9c3,stroke:#ca8a04,color:#713f12
    style I fill:#ffedd5,stroke:#ea580c,color:#7c2d12
    style J fill:#fce7f3,stroke:#db2777,color:#831843
```

## Short Explanation for Report

SkillForge uses a shared layout with a header, main content area, and footer. Public users can browse courses, search, register, and log in. After login, each user is redirected to a dashboard based on role. Students manage learning progress, instructors create courses and lectures, and admins manage platform users and overall activity.

## How to View

1. Open this file in VS Code.
2. Press `Ctrl+Shift+V`.
3. Use the Mermaid diagrams directly in your report screenshots or presentation.