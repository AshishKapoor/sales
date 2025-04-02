from django.urls import path, include
from .routers import router

app_name = "core"

urlpatterns = [
    path("", include(router.urls)),
]
