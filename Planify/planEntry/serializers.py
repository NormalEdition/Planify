from rest_framework import serializers
from planEntry.models import AddTask

from .models import AddTask
class AddTaskSerializers(serializers.ModelSerializer):
    class Meta:
        model = AddTask
        fields = ('ids',
                'title',
                'desc',
                'date',
                'level',
                'delFlg',
                'compFlg')