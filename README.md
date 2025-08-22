# Avencia Project Management Platform

A comprehensive project management platform built with Next.js, TypeScript, PostgreSQL, and Shadcn UI.

## Features

### 🎯 Core Features
- **Project Management**: Create, track, and manage projects with progress monitoring
- **Task Management**: Comprehensive task creation, assignment, and tracking
- **Team Collaboration**: User roles, team management, and communication
- **Dashboard & Analytics**: Real-time insights and performance metrics
- **Calendar Integration**: Schedule events, deadlines, and milestones
- **File Management**: Upload, organize, and share project files

### 🔐 Authentication & Security
- JWT-based authentication system
- Role-based access control (Admin, Manager, Member)
- Secure password hashing with bcrypt
- Protected API routes with middleware

### 📊 Analytics & Reporting
- Project progress tracking
- Task completion trends
- Team performance metrics
- Workload distribution analysis

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Framework**: Shadcn UI with Tailwind CSS
- **Database**: PostgreSQL with connection pooling
- **Authentication**: JWT tokens
- **Validation**: Zod schemas
- **Charts**: Recharts for data visualization

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- PostgreSQL 12+ database server

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd avencia-project-management
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   ```
   Update the database credentials and other configuration in `.env.local`

4. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb avencia_pm
   
   # Initialize database schema and seed data
   node scripts/init-db.js
   ```

5. **Run the development server**
   ```bash
   pnpm dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

### Default Login Credentials

After running the database initialization script, you can log in with:

- **Admin**: alex@avencia.com / password123
- **Manager**: sarah@avencia.com / password123
- **Member**: mike@avencia.com / password123

## Project Structure

```
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Shadcn UI components
│   ├── Dashboard.tsx     # Main dashboard
│   ├── ProjectsView.tsx  # Projects management
│   ├── TasksView.tsx     # Tasks management
│   └── ...
├── lib/                  # Utilities and services
│   ├── models/           # TypeScript interfaces
│   ├── repositories/     # Data access layer
│   ├── services/         # Business logic
│   ├── validation/       # Zod schemas
│   ├── middleware/       # Auth middleware
│   └── database.ts       # Database configuration
├── public/               # Static assets
├── scripts/              # Database and utility scripts
└── styles/               # Additional styles
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Projects
- `GET /api/projects` - List projects with filters
- `POST /api/projects` - Create new project
- `GET /api/projects/[id]` - Get project details
- `PUT /api/projects/[id]` - Update project
- `DELETE /api/projects/[id]` - Delete project

### Tasks
- `GET /api/tasks` - List tasks with filters
- `POST /api/tasks` - Create new task
- `GET /api/tasks/[id]` - Get task details
- `PUT /api/tasks/[id]` - Update task
- `DELETE /api/tasks/[id]` - Delete task

### Analytics
- `GET /api/dashboard` - Dashboard data
- `GET /api/analytics` - Analytics and metrics
- `GET /api/users` - Team members data

## Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User accounts and profiles
- **projects**: Project information and metadata
- **project_members**: Many-to-many project-user relationships
- **tasks**: Task details and assignments
- **task_tags**: Task tagging system
- **calendar_events**: Schedule and event management
- **files**: File upload and organization
- **activity_logs**: System activity tracking
- **notifications**: User notification system
- **user_settings**: User preferences and configuration

## Development

### Running Tests
```bash
pnpm test
```

### Code Linting
```bash
pnpm lint
```

### Building for Production
```bash
pnpm build
pnpm start
```

### Database Management
```bash
# Reset database
node scripts/init-db.js

# Backup database
pg_dump avencia_pm > backup.sql

# Restore database
psql avencia_pm < backup.sql
```

## Features Overview

### Project Management
- Create and manage multiple projects
- Set project status, priority, and deadlines
- Track project progress with visual indicators
- Assign team members with different roles

### Task Management
- Create tasks within projects
- Assign tasks to team members
- Set task priorities and due dates
- Track task progress and completion
- Add tags for better organization
- Comment system for collaboration

### Team Collaboration
- User role management (Admin, Manager, Member)
- Team member profiles and status
- Real-time notifications
- Activity logging and tracking

### Dashboard & Analytics
- Project and task overview
- Performance metrics and trends
- Team workload distribution
- Upcoming deadlines and milestones

### Calendar & Events
- Schedule meetings and events
- Set project milestones and deadlines
- View team availability
- Event notifications and reminders

## Troubleshooting

### Database Connection Issues
1. Ensure PostgreSQL is running: `sudo systemctl start postgresql`
2. Check database credentials in `.env.local`
3. Verify database exists: `psql -l | grep avencia_pm`
4. Test connection: `psql -h localhost -U postgres -d avencia_pm`

### Authentication Issues
1. Check JWT_SECRET is set in `.env.local`
2. Ensure JWT_SECRET is sufficiently long and random
3. Clear browser cookies and localStorage
4. Check API route authentication middleware

### Performance Issues
1. Check database indexes are created
2. Monitor database connection pool
3. Review API query efficiency
4. Check for memory leaks in React components

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.