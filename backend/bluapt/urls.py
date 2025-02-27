"""
URL configuration for bluapt project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# API documentation schema
schema_view = get_schema_view(
    openapi.Info(
        title="BLUAPT API",
        default_version='v1',
        description="API for BLUAPT skills-based hiring platform",
        terms_of_service="https://www.bluapt.com/terms/",
        contact=openapi.Contact(email="contact@bluapt.com"),
        license=openapi.License(name="Proprietary"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

# API URL patterns
api_v1_patterns = [
    path('auth/', include('users.urls.auth')),
    path('users/', include('users.urls.users')),
    path('organizations/', include('users.urls.organizations')),
    path('tests/', include('assessments.urls.tests')),
    path('assessments/', include('assessments.urls.assessments')),
    path('candidate/', include('assessments.urls.candidate')),
    path('employer/', include('assessments.urls.employer')),
    path('execution/', include('execution.urls')),
    path('analytics/', include('analytics.urls')),
]

urlpatterns = [
    # Admin site
    path('admin/', admin.site.urls),
    
    # API v1
    path('api/v1/', include(api_v1_patterns)),
    
    # OAuth2
    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    
    # API documentation
    path('swagger<format>/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) 