# Generated by Django 3.2.8 on 2022-09-03 22:29

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0004_player_client_id'),
    ]

    operations = [
        migrations.AddField(
            model_name='player',
            name='score',
            field=models.IntegerField(default=1500),
        ),
    ]
