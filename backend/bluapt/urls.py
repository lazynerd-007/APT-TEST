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
    # User management
    path('users/', include('users.urls')),
    
    # Other API endpoints
    path('auth/', include('users.auth_urls')),
    # path('organizations/', include('users.urls.organizations')),
    path('skills/', include('skills.urls')),
    path('assessments/', include('assessments.urls')),
    # path('execution/', include('execution.urls')),
    # path('analytics/', include('analytics.urls')),
]

urlpatterns = [
    # Admin site
    path('admin/', admin.site.urls),
    
    # API v1
    path('api/v1/', include(api_v1_patterns)),
    
    # Direct API routes for backward compatibility
    path('api/users/', include('users.urls')),
    path('api/skills/', include('skills.urls')),
    path('api/assessments/', include('assessments.urls')),
    
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