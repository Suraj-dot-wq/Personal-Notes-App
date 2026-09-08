from rest_framework.serializers import ModelSerializer
from .models import Note


class NoteSerializer(ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'body', 'created', 'updated']
        read_only_fields = ['id', 'created', 'updated']