# Generated by Django 5.1.6 on 2025-03-09 00:48

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_student_courses_delete_studentcourse'),
    ]

    operations = [
        migrations.AlterField(
            model_name='student',
            name='courses',
            field=models.ManyToManyField(to='api.course'),
        ),
    ]
