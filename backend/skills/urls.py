"""
URL patterns for the skills app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import SkillViewSet, SkillCategoryViewSet

router = DefaultRouter()
router.register(r'categories', SkillCategoryViewSet)
router.register(r'', SkillViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 