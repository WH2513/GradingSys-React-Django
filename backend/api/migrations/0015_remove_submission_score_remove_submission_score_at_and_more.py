# Generated by Django 5.1.6 on 2025-03-10 06:21

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0014_submission_submitted_at_submission_updated_at_and_more'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='submission',
            name='score',
        ),
        migrations.RemoveField(
            model_name='submission',
            name='score_at',
        ),
        migrations.RemoveField(
            model_name='submission',
            name='submitted_at',
        ),
        migrations.RemoveField(
            model_name='submission',
            name='updated_at',
        ),
        migrations.AlterField(
            model_name='submission',
            name='id',
            field=models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID'),
        ),
    ]
