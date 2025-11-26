# views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status, viewsets
from .models import Bulletin, LigneBulletin
from .serializers import BulletinSerializer, LigneBulletinSerializer
from .factories import BulletinFactory
from .utils import exporter_bulletin_pdf

# ----------------------------
# ViewSets basiques
# ----------------------------
class BulletinViewSet(viewsets.ModelViewSet):
    queryset = Bulletin.objects.all()
    serializer_class = BulletinSerializer

class LigneBulletinViewSet(viewsets.ModelViewSet):
    queryset = LigneBulletin.objects.all()
    serializer_class = LigneBulletinSerializer


# ----------------------------
# Endpoint pour générer un bulletin
# ----------------------------
@api_view(['POST'])
def api_generer_bulletin(request):
    """
    body JSON attendu:
    {
      "inscription_id": 12,
      "classe_id": 5,        # obligatoire
      "trimestre": 1,        # optionnel si sequence fourni
      "sequence": 2          # optionnel
    }
    """
    inscription_id = request.data.get('inscription_id')
    classe_id = request.data.get('classe_id')
    trimestre = request.data.get('trimestre')
    sequence = request.data.get('sequence')

    if not inscription_id or not classe_id:
        return Response({"error": "inscription_id et classe_id requis"}, status=400)

    # Création du bulletin via la Factory
    bulletin, created = BulletinFactory.creer_bulletin(
        inscription_id=inscription_id,
        classe_id=classe_id,
        trimestre=trimestre,
        sequence=sequence
    )

    serializer = BulletinSerializer(bulletin)
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else 200)


# ----------------------------
# Endpoint pour exporter le bulletin en PDF
# ----------------------------
@api_view(['GET'])
def api_exporter_bulletin_pdf(request, bulletin_id):
    try:
        bulletin = Bulletin.objects.get(id=bulletin_id)
    except Bulletin.DoesNotExist:
        return Response({"error": "Bulletin non trouvé"}, status=404)

    return exporter_bulletin_pdf(bulletin)
