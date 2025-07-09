# InteractionLog Signals Implementation

This document describes the automatic InteractionLog generation system implemented through Django signals for the Sales Cookbook application.

## Overview

The InteractionLog model serves as an activity feed for the sales dashboard, automatically capturing important sales activities and manual interactions. The system uses Django signals to automatically create InteractionLog entries when specific events occur in the sales process.

## Architecture

### Components

1. **Signals (`core/signals.py`)** - Django signal receivers that automatically generate InteractionLogs
2. **Views (`core/views.py`)** - Enhanced viewsets with manual interaction logging capabilities
3. **Models (`core/models.py`)** - InteractionLog model for storing activity data
4. **Apps (`core/apps.py`)** - Signal registration

## Automatic InteractionLog Generation

### 1. Lead Activities

#### Lead Creation

- **Trigger**: When a new Lead is created
- **Log Type**: `note`
- **Summary**: "New lead created: {name} from {company}"
- **User**: The assigned user or creator

#### Lead Status Changes

- **Trigger**: When a Lead's status field changes
- **Log Type**: `note`
- **Summary**: Contextual message based on new status:
  - `new`: "marked as new"
  - `contacted`: "contacted for the first time"
  - `qualified`: "qualified as a potential customer"
  - `converted`: "successfully converted to opportunity"
  - `disqualified`: "disqualified from sales process"

### 2. Opportunity Activities

#### Opportunity Creation

- **Trigger**: When a new Opportunity is created
- **Log Type**: `note`
- **Summary**: "New opportunity created: {name} worth ${amount}"
- **User**: The opportunity owner

#### Opportunity Stage Changes

- **Trigger**: When an Opportunity's stage field changes
- **Log Type**: `note`
- **Summary**: Contextual message based on new stage:
  - `qualification`: "moved to qualification stage"
  - `proposal`: "moved to proposal stage - preparing quote"
  - `negotiation`: "entered negotiation phase"
  - `won`: "WON! 🎉 Deal closed successfully"
  - `lost`: "marked as lost - opportunity closed"

### 3. Quote Activities

#### Quote Creation

- **Trigger**: When a new Quote is created
- **Log Type**: `note`
- **Summary**: "Quote created: {title} for ${total_price}"
- **User**: The quote creator

## Manual InteractionLog Creation

### API Endpoints

#### For Leads

```
POST /api/leads/{id}/log_interaction/
{
  "type": "call|email|meeting|note",
  "summary": "Description of the interaction"
}
```

#### For Opportunities

```
POST /api/opportunities/{id}/log_interaction/
{
  "type": "call|email|meeting|note",
  "summary": "Description of the interaction"
}
```

#### For Contacts

```
POST /api/contacts/{id}/log_interaction/
{
  "type": "call|email|meeting|note",
  "summary": "Description of the interaction"
}
```

### Task Completion Logging

When a task is marked as completed via the API:

```
POST /api/tasks/{id}/mark_completed/
```

The system automatically creates an InteractionLog with:

- **Type**: Based on task type (`call`, `email`, `meeting`, or `note`)
- **Summary**: "Task completed: {action} {target} - Notes: {notes}"
- **Relations**: Links to related Lead/Opportunity/Contact

## Helper Functions

### `create_task_completion_log(task, user)`

Creates an InteractionLog when a task is completed.

### `create_lead_conversion_log(lead, opportunity, user)`

Creates an InteractionLog when a lead is converted to an opportunity.

### `create_manual_interaction_log(user, type, summary, lead=None, contact=None, opportunity=None)`

Creates a custom InteractionLog entry.

## Usage Examples

### Automatic Logging (via Signals)

```python
# Creating a lead automatically generates an InteractionLog
lead = Lead.objects.create(
    name="John Doe",
    email="john@example.com",
    company="ACME Corp",
    assigned_to=user
)
# Signal creates: "New lead created: John Doe from ACME Corp"

# Changing lead status automatically generates an InteractionLog
lead.status = 'qualified'
lead.save()
# Signal creates: "Lead John Doe qualified as a potential customer"
```

### Manual Logging (via API)

```python
# From a view
InteractionLog.objects.create(
    user=request.user,
    lead=lead,
    type='call',
    summary='Had a great conversation about their requirements'
)
```

### Task Completion Logging

```python
# From the TaskViewSet.mark_completed action
task.status = 'completed'
task.save()
create_task_completion_log(task, request.user)
```

## Dashboard Integration

The InteractionLog entries are designed to be displayed on the sales dashboard as an activity feed. Each log contains:

- **Timestamp**: When the activity occurred
- **User**: Who performed the activity
- **Type**: The type of interaction (call, email, meeting, note)
- **Summary**: Human-readable description
- **Relations**: Links to Lead, Contact, and/or Opportunity

### Query Examples

```python
# Get all activities for a specific lead
activities = InteractionLog.objects.filter(lead=lead).order_by('-timestamp')

# Get all activities for a sales rep
activities = InteractionLog.objects.filter(user=sales_rep).order_by('-timestamp')

# Get recent activities across all entities
recent_activities = InteractionLog.objects.all().order_by('-timestamp')[:20]

# Get activities for an opportunity and its related contact
activities = InteractionLog.objects.filter(
    Q(opportunity=opportunity) | Q(contact=opportunity.contact)
).order_by('-timestamp')
```

## Benefits

1. **Automatic Activity Tracking**: Key sales milestones are automatically logged
2. **Complete Audit Trail**: Full history of all interactions and status changes
3. **Dashboard Ready**: Structured data perfect for activity feeds
4. **Flexible**: Supports both automatic and manual logging
5. **Contextual**: Links activities to specific leads, contacts, and opportunities
6. **User-Friendly**: Human-readable summaries for easy understanding

## Testing

Run the test script to see the signals in action:

```bash
python test_interaction_signals.py
```

This will demonstrate all the automatic InteractionLog generation features with sample data.
