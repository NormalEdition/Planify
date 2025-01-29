from django.db import models

# Create your models here.

class AddTask(models.Model):
    ids = models.AutoField(primary_key=True)
    title = models.CharField(max_length=200)
    desc = models.CharField(max_length=400)
    date = models.DateField()
    level = models.CharField(max_length=10)
    delFlg = models.CharField(max_length=10)
    compFlg = models.CharField(max_length=10)
