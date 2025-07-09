# Sales Cookbook - AI Agent Instructions

## Project Overview

This project is a **full-stack sales management system** with:

- A **Django REST Framework (DRF) backend** for CRM and sales pipeline management
- A **Next.js (React) web-ui frontend** for user interaction

The architecture follows Django best practices with modular settings, role-based permissions, and a complete sales pipeline from leads to closed deals. The frontend is API-driven and lives in the `web-ui/` directory.

## Core Architecture

### Django Backend Structure

- **Settings**: Modular configuration in `app/settings/` (base.py, dev.py, prod.py) with environment-based loading
- **Custom User Model**: `core.User` with role-based permissions (`admin`, `manager`, `sales_rep`)
- **Single App Design**: All sales entities live in the `core` app for simplicity
- **API-First**: Pure DRF implementation with no frontend templates

### Sales Entity Relationships (Backend)

```
Lead → (conversion) → Account + Contact + Opportunity
Account ← has many → Contacts, Opportunities
Opportunity → has many → Quotes → QuoteLineItems (Products)
Tasks/InteractionLogs → relate to → Leads, Contacts, Opportunities
```

### Permission Model (Backend)

- **Sales Reps**: See only their assigned leads/opportunities/tasks
- **Managers/Admins**: See all data across the organization
- Implemented via `get_queryset()` filtering in ViewSets

## Development Workflow

### Backend (Django) Environment Setup

```bash
# Local development (recommended)
make install    # Uses uv for dependency management
make migrate
make run

# Docker alternative
docker compose build
docker compose run migrate
docker compose up
```

#### Essential Backend Commands

- `make shell` - Django shell with extensions (shell_plus)
- `make app name=myapp` - Creates new app with proper test structure
- `make command app=core name=seed_data` - Creates management commands
- `make test` - Runs test suite
- `make lint` / `make format` - Ruff linting/formatting

### Frontend (web-ui) Environment Setup

The frontend lives in `web-ui/` and is a Next.js (React) app using pnpm for package management.

```bash
# Install dependencies
cd web-ui
pnpm install

# Run the development server
pnpm dev

# Build for production
pnpm build
```

#### Essential Frontend Commands

- `pnpm dev` - Start local dev server (usually http://localhost:3000)
- `pnpm build` - Build for production
- `pnpm lint` / `pnpm format` - Linting/formatting (see `web-ui/package.json`)

## Code Patterns

### Backend: ViewSet Conventions

All ViewSets follow this pattern:

1. **Role-based filtering** in `get_queryset()`
2. **Custom actions** using `@action` decorator for business logic
3. **Query parameter filtering** (status, account, etc.)
4. **Automatic ownership assignment** in `perform_create()`

Example from `LeadViewSet`:

```python
def get_queryset(self):
    queryset = Lead.objects.all().order_by('-created_at')
    if self.request.user.role == 'sales_rep':
        queryset = queryset.filter(assigned_to=self.request.user)
    return queryset

@action(detail=True, methods=['post'])
def convert_to_opportunity(self, request, pk=None):
    # Business logic for lead conversion
```

### Backend: Model Relationships

- **Always use** `related_name` for reverse relationships
- **Choice fields** use uppercase constants with human-readable labels
- **Soft deletes** via `SET_NULL` for critical business relationships
- **Timestamps** with `auto_now_add=True` and `auto_now=True`

### Backend: API Router Pattern

- Central router in `core/routers.py`
- Consistent endpoint naming: `/api/v1/leads/`, `/api/v1/opportunities/`
- Custom actions accessible via: `/api/v1/leads/{id}/convert_to_opportunity/`

## Key Business Logic

### Lead Conversion Flow (Backend)

1. Lead must have `status='qualified'`
2. Creates/finds Account by company name
3. Creates Contact from lead data
4. Creates Opportunity linking Account + Contact
5. Updates lead status to 'converted'

### Quote Management (Backend)

- QuoteLineItems automatically update Quote.total_price
- Products have currency support (default USD)
- Unit prices can override product prices in quotes

### Role-Based Data Access (Backend)

- **ViewSet filtering**: Filter querysets by user role in `get_queryset()`
- **Assignment logic**: Leads/Opportunities assigned to users for ownership
- **Escalation paths**: Managers can reassign across sales reps

## Environment & Configuration

### Backend: Settings Pattern

- `app/settings/base.py` - Common settings
- `app/settings/dev.py` - Development overrides
- Environment variables via `.env.dev` file
- Database connection via PostgreSQL (required)

### Docker vs Local

- **Docker**: Full isolation, slower feedback loop
- **Local**: Faster development with `uv` package management
- Both support the same Makefile commands

## Testing & Quality

### Backend: Code Quality

- **Ruff** for linting/formatting (configured in pyproject.toml)
- **Pre-commit hooks** enforce style on commits
- Test structure: `app/tests/` directories (not single test.py files)

### Backend: API Documentation

- **drf-spectacular** auto-generates OpenAPI schema
- **Swagger UI** at `/api/docs/`
- **Schema endpoint** at `/api/schema/`

## Common Operations

### Adding New Entities (Backend)

1. Add model to `core/models.py` with proper relationships
2. Create serializer in `core/serializers.py`
3. Add ViewSet to `core/views.py` with role-based filtering
4. Register in `core/routers.py`
5. Run `make migrations` and `make migrate`

### Database Operations (Backend)

- **Always** create migrations for model changes
- Use `make shell` for data exploration with shell_plus
- Database operations through Django ORM (no raw SQL)

### Debugging (Backend)

- Use VS Code debugger configurations (already set up)
- Django shell_plus for interactive debugging
- DRF browsable API for testing endpoints

## External Integrations

- **PostgreSQL** database (required, no SQLite fallback)
- **drf-spectacular** for API documentation
- **django-extensions** for enhanced shell and utilities
- Ready for **authentication** (JWT structure in place)

---

## Frontend (web-ui) Architecture & Conventions

- **Framework**: Next.js (React, TypeScript)
- **Directory**: All frontend code is in `web-ui/`
- **API-First**: All data is fetched from the Django backend via REST API endpoints (see `/api/v1/`)
- **Component Structure**: Organized by feature (e.g., `leads/`, `opportunities/`, `products/`)
- **Reusable UI**: Shared components in `web-ui/components/ui/` and `web-ui/components/layout/`
- **API Client**: Use `web-ui/client/http-sales-client.ts` for backend API calls
- **Types**: Centralized in `web-ui/types/`
- **OpenAPI**: API types and clients can be generated from `web-ui/schema/sales-cookbook-api.yaml` (see Orval config)
- **Styling**: Tailwind CSS, with global styles in `web-ui/styles/`
- **Authentication**: Handled via JWT tokens; see `web-ui/lib/auth.ts`
- **Testing**: Add tests in `web-ui/` as needed (Jest/React Testing Library recommended)

### Frontend-Backend Integration

- **Endpoints**: All frontend data comes from `/api/v1/` endpoints exposed by Django
- **CORS**: Ensure CORS is enabled in Django for local frontend dev
- **Auth**: Login via `/api/v1/token/` (JWT); store token in frontend and attach to API requests
- **Docs**: API docs available at `/api/docs/` (Swagger UI)

### Adding/Modifying Frontend Features

1. Add or update components/pages in the relevant `web-ui/` subfolder
2. Use the API client for backend data
3. Update types as needed in `web-ui/types/`
4. Keep UI consistent with Tailwind and shared components
5. Test new features locally with the backend running

### Frontend Code Quality

- Use TypeScript for all new code
- Lint/format with `pnpm lint` and `pnpm format`
- Prefer functional components and React hooks
- Keep business logic in hooks or utility files, not in UI components

---

## Full-Stack Best Practices

- **Keep API contracts in sync**: Update OpenAPI schema and regenerate types/clients as needed
- **Role-based access**: Enforce permissions in backend; reflect in frontend UI (e.g., hide actions for sales reps)
- **Consistent naming**: Use the same entity names in backend and frontend
- **Testing**: Test both backend and frontend before merging changes

---

## Quick Reference

- **Backend**: Django/DRF in `app/` and `core/`
- **Frontend**: Next.js in `web-ui/`
- **API**: `/api/v1/` (see routers and OpenAPI schema)
- **Docs**: `/api/docs/` (Swagger UI)
- **Dev**: Use Makefile for backend, pnpm for frontend

When modifying this codebase, maintain the role-based permission patterns, follow the established ViewSet conventions, and ensure all business logic maintains the sales workflow integrity.
