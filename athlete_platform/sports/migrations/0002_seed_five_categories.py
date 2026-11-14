from django.db import migrations


FIVE_CATEGORIES = [
    ('Cricket (Batting and bowling)', False),
    ('Fitness', True),
    ('Physiotherapy', True),
    ('Dietician', True),
    ('Yoga and Meditation', True),
]


def seed_categories(apps, schema_editor):
    Sport = apps.get_model('sports', 'Sport')
    Specialty = apps.get_model('sports', 'Specialty')
    cricket, _ = Sport.objects.get_or_create(name='Cricket')

    for name, is_cross in FIVE_CATEGORIES:
        Specialty.objects.get_or_create(
            name=name,
            defaults={
                'sport': None if is_cross else cricket,
                'is_cross_sport': is_cross,
            },
        )


def reverse_noop(apps, schema_editor):
    pass


class Migration(migrations.Migration):
    dependencies = [
        ('sports', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(seed_categories, reverse_noop),
    ]

