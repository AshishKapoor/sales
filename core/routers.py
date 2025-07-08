from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, AccountViewSet, LeadViewSet, OpportunityViewSet,
    TaskViewSet, InteractionLogViewSet, CookbookViewSet,
    CookbookActivityViewSet, CookbookAssignmentViewSet, ActivityProgressViewSet
)

router = DefaultRouter()

# User management
router.register('users', UserViewSet, basename='user')

# Core sales entities
router.register('accounts', AccountViewSet, basename='account')
router.register('leads', LeadViewSet, basename='lead')
router.register('opportunities', OpportunityViewSet, basename='opportunity')
router.register('tasks', TaskViewSet, basename='task')
router.register('interactions', InteractionLogViewSet, basename='interaction')

# Sales cookbook
router.register('cookbooks', CookbookViewSet, basename='cookbook')
router.register('cookbook-activities', CookbookActivityViewSet, basename='cookbook-activity')
router.register('cookbook-assignments', CookbookAssignmentViewSet, basename='cookbook-assignment')
router.register('activity-progress', ActivityProgressViewSet, basename='activity-progress')

urlpatterns = router.urls
