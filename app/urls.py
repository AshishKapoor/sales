from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from core.views import (
    ChangePasswordView,
    MeView,
    RegisterUserAPIView,
    UpdateProfileView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/schema/", SpectacularAPIView.as_view(), name="schema"),
    path(
        "api/docs/",
        SpectacularSwaggerView.as_view(url_name="schema"),
        name="swagger-ui",
    ),
    path("api/v1/", include("core.urls"), name="core"),
    path("api/v1/register/", RegisterUserAPIView.as_view(), name="register"),
    path("api/v1/me/", MeView.as_view(), name="me"),
    path("api/v1/profile/update/", UpdateProfileView.as_view(), name="profile-update"),
    path("api/v1/change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
]

# Serve static files in development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
