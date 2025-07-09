from django.urls import include, path

from .routers import router

app_name = "core"

urlpatterns = [
    path("", include(router.urls)),
]

