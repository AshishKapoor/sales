"""
Utility functions for InteractionLog dashboard integration.
"""

from datetime import timedelta

from django.db.models import Count, Q
from django.utils import timezone

from .models import InteractionLog


def get_recent_activities(user=None, days=7, limit=20):
    """
    Get recent activities for dashboard display.
    
    Args:
        user: Filter by specific user (None for all users)
        days: Number of days to look back
        limit: Maximum number of activities to return
    
    Returns:
        QuerySet of InteractionLog entries
    """
    since_date = timezone.now() - timedelta(days=days)
    queryset = InteractionLog.objects.filter(timestamp__gte=since_date)
    
    if user:
        queryset = queryset.filter(user=user)
    
    return queryset.select_related(
        'user', 'lead', 'contact', 'opportunity'
    ).order_by('-timestamp')[:limit]


def get_lead_activity_timeline(lead):
    """
    Get complete activity timeline for a specific lead.
    
    Args:
        lead: Lead instance
    
    Returns:
        QuerySet of InteractionLog entries for the lead
    """
    return InteractionLog.objects.filter(
        lead=lead
    ).select_related('user').order_by('-timestamp')


def get_opportunity_activity_timeline(opportunity):
    """
    Get complete activity timeline for a specific opportunity.
    Includes activities on the opportunity itself and its related contact.
    
    Args:
        opportunity: Opportunity instance
    
    Returns:
        QuerySet of InteractionLog entries
    """
    return InteractionLog.objects.filter(
        Q(opportunity=opportunity) | 
        Q(contact=opportunity.contact)
    ).select_related('user').order_by('-timestamp')


def get_contact_activity_timeline(contact):
    """
    Get complete activity timeline for a specific contact.
    Includes direct contact activities and related opportunities.
    
    Args:
        contact: Contact instance
    
    Returns:
        QuerySet of InteractionLog entries
    """
    return InteractionLog.objects.filter(
        Q(contact=contact) |
        Q(opportunity__contact=contact)
    ).select_related('user').order_by('-timestamp')


def get_user_activity_summary(user, days=30):
    """
    Get activity summary for a specific user.
    
    Args:
        user: User instance
        days: Number of days to analyze
    
    Returns:
        Dictionary with activity statistics
    """
    since_date = timezone.now() - timedelta(days=days)
    activities = InteractionLog.objects.filter(
        user=user,
        timestamp__gte=since_date
    )
    
    # Count by type
    type_counts = {}
    for activity in activities:
        type_counts[activity.type] = type_counts.get(activity.type, 0) + 1
    
    # Count by entity type
    entity_counts = {
        'leads': activities.filter(lead__isnull=False).count(),
        'contacts': activities.filter(contact__isnull=False).count(),
        'opportunities': activities.filter(opportunity__isnull=False).count(),
    }
    
    return {
        'total_activities': activities.count(),
        'by_type': type_counts,
        'by_entity': entity_counts,
        'period_days': days
    }


def get_top_active_entities(days=30, limit=10):
    """
    Get entities with the most activity in the specified period.
    
    Args:
        days: Number of days to analyze
        limit: Maximum number of entities per type
    
    Returns:
        Dictionary with top active leads, contacts, and opportunities
    """
    since_date = timezone.now() - timedelta(days=days)
    
    # Top leads by activity count
    top_leads = (
        InteractionLog.objects
        .filter(timestamp__gte=since_date, lead__isnull=False)
        .values('lead__id', 'lead__name', 'lead__company')
        .annotate(activity_count=Count('id'))
        .order_by('-activity_count')[:limit]
    )
    
    # Top opportunities by activity count
    top_opportunities = (
        InteractionLog.objects
        .filter(timestamp__gte=since_date, opportunity__isnull=False)
        .values('opportunity__id', 'opportunity__name', 'opportunity__amount')
        .annotate(activity_count=Count('id'))
        .order_by('-activity_count')[:limit]
    )
    
    # Top contacts by activity count
    top_contacts = (
        InteractionLog.objects
        .filter(timestamp__gte=since_date, contact__isnull=False)
        .values('contact__id', 'contact__name', 'contact__account__name')
        .annotate(activity_count=Count('id'))
        .order_by('-activity_count')[:limit]
    )
    
    return {
        'leads': list(top_leads),
        'opportunities': list(top_opportunities),
        'contacts': list(top_contacts)
    }


def format_activity_for_dashboard(activity):
    """
    Format an InteractionLog entry for dashboard display.
    
    Args:
        activity: InteractionLog instance
    
    Returns:
        Dictionary with formatted activity data
    """
    # Determine the primary entity and create a descriptive title
    if activity.lead:
        entity_type = 'lead'
        entity_name = activity.lead.name
        entity_id = activity.lead.id
        entity_subtitle = activity.lead.company or "No Company"
    elif activity.opportunity:
        entity_type = 'opportunity'
        entity_name = activity.opportunity.name
        entity_id = activity.opportunity.id
        entity_subtitle = f"${activity.opportunity.amount:,.2f}"
    elif activity.contact:
        entity_type = 'contact'
        entity_name = activity.contact.name
        entity_id = activity.contact.id
        entity_subtitle = activity.contact.account.name
    else:
        entity_type = 'unknown'
        entity_name = "Unknown Entity"
        entity_id = None
        entity_subtitle = ""
    
    return {
        'id': activity.id,
        'timestamp': activity.timestamp,
        'user': {
            'id': activity.user.id,
            'name': activity.user.get_full_name() or activity.user.username,
            'email': activity.user.email
        },
        'type': activity.type,
        'type_display': activity.get_type_display(),
        'summary': activity.summary,
        'entity': {
            'type': entity_type,
            'id': entity_id,
            'name': entity_name,
            'subtitle': entity_subtitle
        }
    }


def get_dashboard_activity_feed(user=None, days=7, limit=20):
    """
    Get formatted activity feed for dashboard display.
    
    Args:
        user: Filter by specific user (None for all users)
        days: Number of days to look back
        limit: Maximum number of activities to return
    
    Returns:
        List of formatted activity dictionaries
    """
    activities = get_recent_activities(user=user, days=days, limit=limit)
    return [format_activity_for_dashboard(activity) for activity in activities]
