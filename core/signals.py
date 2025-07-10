"""
Django signals for automatic InteractionLog generation.

This module handles the automatic creation of InteractionLog entries
for key sales activities that should be visible on the sales dashboard.
"""

from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver

from .models import InteractionLog, Lead, Opportunity, Quote, Task


@receiver(post_save, sender=Lead)
def log_lead_creation(sender, instance, created, **kwargs):
    """Log when a new lead is created."""
    if created:
        # Get the user who created the lead - should always be assigned_to now
        user = instance.assigned_to
        
        # Only create log if we have a valid user (safety check)
        if user:
            InteractionLog.objects.create(
                user=user,
                lead=instance,
                type='note',
                summary=f"New lead created: {instance.name} from {instance.company or 'Unknown Company'}"
            )


@receiver(pre_save, sender=Lead)
def log_lead_status_change(sender, instance, **kwargs):
    """Log when a lead's status changes."""
    if instance.pk:  # Only for existing leads
        try:
            old_lead = Lead.objects.get(pk=instance.pk)
            if old_lead.status != instance.status:
                # Store the status change info for post_save signal
                instance._status_changed = True
                instance._old_status = old_lead.status
                instance._new_status = instance.status
        except Lead.DoesNotExist:
            pass


@receiver(post_save, sender=Lead)
def log_lead_status_change_post_save(sender, instance, created, **kwargs):
    """Log the status change after save."""
    if not created and hasattr(instance, '_status_changed') and instance._status_changed:
        status_messages = {
            'new': 'marked as new',
            'contacted': 'contacted for the first time',
            'qualified': 'qualified as a potential customer',
            'converted': 'successfully converted to opportunity',
            'disqualified': 'disqualified from sales process'
        }
        
        action = status_messages.get(instance._new_status, f'status changed to {instance.get_status_display()}')
        
        InteractionLog.objects.create(
            user=instance.assigned_to,
            lead=instance,
            type='note',
            summary=f"Lead {instance.name} {action}"
        )


@receiver(post_save, sender=Opportunity)
def log_opportunity_creation(sender, instance, created, **kwargs):
    """Log when a new opportunity is created."""
    if created:
        InteractionLog.objects.create(
            user=instance.owner,
            opportunity=instance,
            contact=instance.contact,
            type='note',
            summary=f"New opportunity created: {instance.name} worth ${instance.amount:,.2f}"
        )


@receiver(pre_save, sender=Opportunity)
def log_opportunity_stage_change(sender, instance, **kwargs):
    """Log when an opportunity's stage changes."""
    if instance.pk:  # Only for existing opportunities
        try:
            old_opportunity = Opportunity.objects.get(pk=instance.pk)
            if old_opportunity.stage != instance.stage:
                # Store the stage change info for post_save signal
                instance._stage_changed = True
                instance._old_stage = old_opportunity.stage
                instance._new_stage = instance.stage
        except Opportunity.DoesNotExist:
            pass


@receiver(post_save, sender=Opportunity)
def log_opportunity_stage_change_post_save(sender, instance, created, **kwargs):
    """Log the stage change after save."""
    if not created and hasattr(instance, '_stage_changed') and instance._stage_changed:
        stage_messages = {
            'qualification': 'moved to qualification stage',
            'proposal': 'moved to proposal stage - preparing quote',
            'negotiation': 'entered negotiation phase',
            'won': 'WON! 🎉 Deal closed successfully',
            'lost': 'marked as lost - opportunity closed'
        }
        
        action = stage_messages.get(instance._new_stage, f'stage changed to {instance.get_stage_display()}')
        
        InteractionLog.objects.create(
            user=instance.owner,
            opportunity=instance,
            contact=instance.contact,
            type='note',
            summary=f"Opportunity {instance.name} {action}"
        )


@receiver(pre_save, sender=Opportunity)
def log_opportunity_amount_change(sender, instance, **kwargs):
    """Log when an opportunity's amount changes significantly."""
    if instance.pk:  # Only for existing opportunities
        try:
            old_opportunity = Opportunity.objects.get(pk=instance.pk)
            old_amount = old_opportunity.amount
            new_amount = instance.amount
            
            # Log if amount changes by more than 10% and at least $1000
            if old_amount and new_amount:
                change_percent = abs(new_amount - old_amount) / old_amount
                change_amount = abs(new_amount - old_amount)
                
                if change_percent > 0.10 and change_amount >= 1000:
                    instance._amount_changed = True
                    instance._old_amount = old_amount
                    instance._new_amount = new_amount
        except Opportunity.DoesNotExist:
            pass


@receiver(post_save, sender=Opportunity)
def log_opportunity_amount_change_post_save(sender, instance, created, **kwargs):
    """Log the amount change after save."""
    if not created and hasattr(instance, '_amount_changed') and instance._amount_changed:
        change = instance._new_amount - instance._old_amount
        direction = "increased" if change > 0 else "decreased"
        
        InteractionLog.objects.create(
            user=instance.owner,
            opportunity=instance,
            contact=instance.contact,
            type='note',
            summary=f"Opportunity value {direction} from ${instance._old_amount:,.2f} to ${instance._new_amount:,.2f}"
        )


@receiver(post_save, sender=Task)
def log_task_completion(sender, instance, created, **kwargs):
    """Log when a task is marked as completed."""
    if not created:  # Only for existing tasks
        # Task completion logging is handled by the view
        # when marking tasks as complete using create_task_completion_log()
        pass


@receiver(post_save, sender=Quote)
def log_quote_creation(sender, instance, created, **kwargs):
    """Log when a new quote is created."""
    if created:
        InteractionLog.objects.create(
            user=instance.created_by,
            opportunity=instance.opportunity,
            contact=instance.opportunity.contact,
            type='note',
            summary=f"Quote created: {instance.title} for ${instance.total_price:,.2f}"
        )


def create_task_completion_log(task, user):
    """
    Helper function to create interaction log for task completion.
    This should be called from the view when a task is marked as completed.
    """
    task_type_actions = {
        'call': 'completed call with',
        'email': 'sent email to',
        'meeting': 'held meeting with',
        'demo': 'conducted demo for'
    }
    
    action = task_type_actions.get(task.type, f'completed {task.get_type_display().lower()} task for')
    
    # Determine the target of the interaction
    target = None
    if task.related_lead:
        target = task.related_lead.name
        log_lead = task.related_lead
        log_contact = None
        log_opportunity = None
    elif task.related_opportunity:
        target = task.related_opportunity.name
        log_lead = None
        log_contact = task.related_opportunity.contact
        log_opportunity = task.related_opportunity
    else:
        target = "unknown contact"
        log_lead = None
        log_contact = None
        log_opportunity = None
    
    summary = f"Task completed: {action} {target}"
    if task.notes:
        summary += f" - Notes: {task.notes[:100]}{'...' if len(task.notes) > 100 else ''}"
    
    InteractionLog.objects.create(
        user=user,
        lead=log_lead,
        contact=log_contact,
        opportunity=log_opportunity,
        type=task.type if task.type in ['call', 'email', 'meeting'] else 'note',
        summary=summary
    )


def create_manual_interaction_log(user, interaction_type, summary, lead=None, contact=None, opportunity=None):
    """
    Helper function to create manual interaction logs.
    This can be used from views for custom interactions.
    """
    InteractionLog.objects.create(
        user=user,
        lead=lead,
        contact=contact,
        opportunity=opportunity,
        type=interaction_type,
        summary=summary
    )


def create_lead_conversion_log(lead, opportunity, user):
    """
    Helper function to create interaction log for lead conversion.
    This should be called from the lead conversion view.
    """
    InteractionLog.objects.create(
        user=user,
        lead=lead,
        opportunity=opportunity,
        contact=opportunity.contact,
        type='note',
        summary=f"Lead {lead.name} successfully converted to opportunity: {opportunity.name}"
    )
