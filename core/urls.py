from django.urls import include, path

from .routers import router
from .views import CreateOrganizationForUserView, NoOrganizationView

app_name = "core"

urlpatterns = [
    path("no-organization/", NoOrganizationView.as_view(), name="no-organization"),
    path("create-organization/", CreateOrganizationForUserView.as_view(), name="create-organization"),
    path("", include(router.urls)),
]

