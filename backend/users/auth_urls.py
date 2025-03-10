from django.urls import path
from . import auth_views

urlpatterns = [
    path('login/', auth_views.login, name='login'),
] 