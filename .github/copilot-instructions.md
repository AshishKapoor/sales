# Sales Cookbook - AI Agent Instructions

## Project Overview

This is a **Django REST Framework (DRF) sales management system** with a comprehensive CRM workflow. The architecture follows Django best practices with modular settings, role-based permissions, and a complete sales pipeline from leads to closed deals.

## Core Architecture

### Django Structure

- **Settings**: Modular configuration in `app/settings/` (base.py, dev.py, prod.py) with environment-based loading
- **Custom User Model**: `core.User` with role-based permissions (`admin`, `manager`, `sales_rep`)
- **Single App Design**: All sales entities live in the `core` app for simplicity
- **API-First**: Pure DRF implementation with no frontend templates

### Sales Entity Relationships

```
Lead → (conversion) → Account + Contact + Opportunity
Account ← has many → Contacts, Opportunities
Opportunity → has many → Quotes → QuoteLineItems (Products)
Tasks/InteractionLogs → relate to → Leads, Contacts, Opportunities
```

### Permission Model

- **Sales Reps**: See only their assigned leads/opportunities/tasks
- **Managers/Admins**: See all data across the organization
- Implemented via `get_queryset()` filtering in ViewSets

## Development Workflow

### Environment Setup

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

### Essential Commands

- `make shell` - Django shell with extensions (shell_plus)
- `make app name=myapp` - Creates new app with proper test structure
- `make command app=core name=seed_data` - Creates management commands
- `make test` - Runs test suite
- `make lint` / `make format` - Ruff linting/formatting

## Code Patterns

### ViewSet Conventions

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

### Model Relationships

- **Always use** `related_name` for reverse relationships
- **Choice fields** use uppercase constants with human-readable labels
- **Soft deletes** via `SET_NULL` for critical business relationships
- **Timestamps** with `auto_now_add=True` and `auto_now=True`

### API Router Pattern

- Central router in `core/routers.py`
- Consistent endpoint naming: `/api/v1/leads/`, `/api/v1/opportunities/`
- Custom actions accessible via: `/api/v1/leads/{id}/convert_to_opportunity/`

## Key Business Logic

### Lead Conversion Flow

1. Lead must have `status='qualified'`
2. Creates/finds Account by company name
3. Creates Contact from lead data
4. Creates Opportunity linking Account + Contact
5. Updates lead status to 'converted'

### Quote Management

- QuoteLineItems automatically update Quote.total_price
- Products have currency support (default USD)
- Unit prices can override product prices in quotes

### Role-Based Data Access

- **ViewSet filtering**: Filter querysets by user role in `get_queryset()`
- **Assignment logic**: Leads/Opportunities assigned to users for ownership
- **Escalation paths**: Managers can reassign across sales reps

## Environment & Configuration

### Settings Pattern

- `app/settings/base.py` - Common settings
- `app/settings/dev.py` - Development overrides
- Environment variables via `.env.dev` file
- Database connection via PostgreSQL (required)

### Docker vs Local

- **Docker**: Full isolation, slower feedback loop
- **Local**: Faster development with `uv` package management
- Both support the same Makefile commands

## Testing & Quality

### Code Quality

- **Ruff** for linting/formatting (configured in pyproject.toml)
- **Pre-commit hooks** enforce style on commits
- Test structure: `app/tests/` directories (not single test.py files)

### API Documentation

- **drf-spectacular** auto-generates OpenAPI schema
- **Swagger UI** at `/api/docs/`
- **Schema endpoint** at `/api/schema/`

## Common Operations

### Adding New Entities

1. Add model to `core/models.py` with proper relationships
2. Create serializer in `core/serializers.py`
3. Add ViewSet to `core/views.py` with role-based filtering
4. Register in `core/routers.py`
5. Run `make migrations` and `make migrate`

### Database Operations

- **Always** create migrations for model changes
- Use `make shell` for data exploration with shell_plus
- Database operations through Django ORM (no raw SQL)

### Debugging

- Use VS Code debugger configurations (already set up)
- Django shell_plus for interactive debugging
- DRF browsable API for testing endpoints

## External Integrations

- **PostgreSQL** database (required, no SQLite fallback)
- **drf-spectacular** for API documentation
- **django-extensions** for enhanced shell and utilities
- Ready for **authentication** (JWT structure in place)

When modifying this codebase, maintain the role-based permission patterns, follow the established ViewSet conventions, and ensure all business logic maintains the sales workflow integrity.
