# Generated by Django 4.2.7 on 2025-03-10 12:31

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('skills', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='skill',
            name='tags',
        ),
    ]
