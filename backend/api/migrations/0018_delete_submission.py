# Generated by Django 5.1.6 on 2025-03-10 20:06

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0017_alter_submission_status'),
    ]

    operations = [
        migrations.DeleteModel(
            name='submission',
        ),
    ]
