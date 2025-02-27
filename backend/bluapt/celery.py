"""
Celery configuration for bluapt project.
"""
import os
from celery import Celery
from django.conf import settings

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'bluapt.settings')

# Create the Celery app
app = Celery('bluapt')

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

# Configure task routes
app.conf.task_routes = {
    'execution.tasks.*': {'queue': 'execution'},
    'assessments.tasks.*': {'queue': 'assessments'},
    'analytics.tasks.*': {'queue': 'analytics'},
}

# Configure task time limits
app.conf.task_time_limit = 300  # 5 minutes
app.conf.task_soft_time_limit = 240  # 4 minutes

# Configure task rate limits
app.conf.task_annotations = {
    'execution.tasks.execute_code': {'rate_limit': '10/m'},
    'execution.tasks.check_plagiarism': {'rate_limit': '5/m'},
}

@app.task(bind=True)
def debug_task(self):
    """Task to debug Celery worker."""
    print(f'Request: {self.request!r}') 