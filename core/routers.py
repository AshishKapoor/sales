from rest_framework.routers import DefaultRouter

from .views import (
    AccountViewSet,
    ContactViewSet,
    InteractionLogViewSet,
    LeadViewSet,
    OpportunityViewSet,
    OrganizationViewSet,
    ProductViewSet,
    QuoteLineItemViewSet,
    QuoteViewSet,
    TaskViewSet,
    UserViewSet,
)

router = DefaultRouter()

# Organization management
router.register('organizations', OrganizationViewSet, basename='organization')

# User management
router.register('users', UserViewSet, basename='user')

# Core sales entities
router.register('accounts', AccountViewSet, basename='account')
router.register('contacts', ContactViewSet, basename='contact')
router.register('leads', LeadViewSet, basename='lead')
router.register('opportunities', OpportunityViewSet, basename='opportunity')
router.register('tasks', TaskViewSet, basename='task')
router.register('interactions', InteractionLogViewSet, basename='interaction')

# Products and Quotes
router.register('products', ProductViewSet, basename='product')
router.register('quotes', QuoteViewSet, basename='quote')
router.register('quote-line-items', QuoteLineItemViewSet, basename='quote-line-item')

urlpatterns = router.urls
