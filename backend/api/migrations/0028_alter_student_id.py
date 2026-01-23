import uuid
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0027_rename_files_assignment_file_urls'),
    ]

    operations = [
        migrations.AlterField(
            model_name='student',
            name='id',
            field=models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False),
        ),
    ]
