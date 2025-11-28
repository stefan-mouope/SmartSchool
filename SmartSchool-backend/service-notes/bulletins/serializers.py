from rest_framework import serializers
from .models import Bulletin, LigneBulletin

class LigneBulletinSerializer(serializers.ModelSerializer):
    class Meta:
        model = LigneBulletin
        fields = "__all__"
        read_only_fields = ("bulletin",)

class BulletinSerializer(serializers.ModelSerializer):
    lignes = LigneBulletinSerializer(many=True, read_only=True)

    class Meta:
        model = Bulletin
        fields = ("id", "inscription_id", "trimestre", "moyenne_generale", "moyenne_classe", "rang", "date_creation", "lignes")
