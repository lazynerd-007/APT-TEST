"""
URL patterns for the assessments app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AssessmentViewSet,
    TestViewSet,
    QuestionViewSet,
    CandidateAssessmentViewSet,
    CandidateTestViewSet,
    CandidateSkillScoreViewSet
)

router = DefaultRouter()
router.register(r'assessments', AssessmentViewSet)
router.register(r'tests', TestViewSet)
router.register(r'questions', QuestionViewSet)
router.register(r'candidate-assessments', CandidateAssessmentViewSet)
router.register(r'candidate-tests', CandidateTestViewSet)
router.register(r'skill-scores', CandidateSkillScoreViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 