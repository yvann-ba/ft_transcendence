from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, GameViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'games', GameViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
