from rest_framework import serializers
from .models import Note

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = '__all__'
        extra_kwargs = {
            'sequence1': {'required': False, 'allow_null': True},
            'sequence2': {'required': False, 'allow_null': True},
            'sequence3': {'required': False, 'allow_null': True},
            'sequence4': {'required': False, 'allow_null': True},
            'sequence5': {'required': False, 'allow_null': True},
            'sequence6': {'required': False, 'allow_null': True},
        }
