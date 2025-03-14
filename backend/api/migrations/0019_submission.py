# Generated by Django 5.1.6 on 2025-03-10 20:10

import django.db.models.deletion
import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0018_delete_submission'),
    ]

    operations = [
        migrations.CreateModel(
            name='Submission',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('content', models.TextField(blank=True, null=True)),
                ('files', models.TextField(blank=True, null=True)),
                ('submitted_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('updated_at', models.DateTimeField(auto_now=True, null=True)),
                ('score', models.IntegerField(blank=True, null=True)),
                ('score_at', models.DateTimeField(auto_now_add=True, null=True)),
                ('status', models.CharField(choices=[('not_due_yet', 'Not due yet(Not turned in)'), ('turned_in', 'Turned in(Ready for grading)'), ('missing', 'Missing'), ('late', 'Late(Graded)')], default='not_due_yet', max_length=11)),
                ('assignment_id', models.ForeignKey(default=uuid.UUID('00000000-0000-0000-0000-000000000000'), on_delete=django.db.models.deletion.PROTECT, related_name='submissions', to='api.assignment')),
                ('student_id', models.ForeignKey(default=uuid.UUID('00000000-0000-0000-0000-000000000000'), on_delete=django.db.models.deletion.PROTECT, related_name='submissions', to='api.student')),
            ],
            options={
                'unique_together': {('student_id', 'assignment_id')},
            },
        ),
    ]
