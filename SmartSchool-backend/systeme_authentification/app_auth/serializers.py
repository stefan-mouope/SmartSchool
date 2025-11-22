from rest_framework import serializers
from .models import User

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('id', 'registrie_id','email', 'username', 'password', 'role')

        """
        le service d'enregistrement des utilisateurs reconnait deux type d'utilisateurs:
        - le diecteur d'école (role: directeur)
        - les enseignants (role: enseignant)

        pour un superuser, le user_id est a null car il n'est pas liere a une ecole particuliere
        pour les autres utilisateurs, le user_id est lie a l'id de l'ecole
        """

    def create(self, validated_data):
        password = validated_data.pop('password')

        # if validated_data.get("role") != "superuser":
        #     print('validate data',validated_data)
        #     validated_data['registrie_id'] = validated_data.get('registrie_id')

        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        return user
