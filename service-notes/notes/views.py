from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Note
from .serializsers import NoteSerializer
from rest_framework.decorators import api_view
from .rabbitmq import rpc_client as rabbit_client



class CreateNote(APIView):
    def post(self, request, id_inscription, id_matiere):

        # 🔍 Vérifier inscription via RabbitMQ
        verify_inscription = rabbit_client.call(
            "note.verify.inscription",
            {
                "event": "verify_inscription",
                "data": { "id_inscription": id_inscription }
            }
        )

        if not verify_inscription.get("status"):
            return Response(
                {"error": "Inscription introuvable"},
                status=status.HTTP_404_NOT_FOUND
            )

        # 🔍 Vérifier matière via RabbitMQ
        verify_matiere = rabbit_client.call(
            "note.verify.matiere",
            {
                "event": "verify_matiere",
                "data": { "id_matiere": id_matiere }
            }
        )

        if not verify_matiere.get("status"):
            return Response(
                {"error": "Matière introuvable"},
                status=status.HTTP_404_NOT_FOUND
            )

        # 🔵 Si OK → créer la note
        data = request.data.copy()
        data["id_inscription"] = id_inscription
        data["id_matiere"] = id_matiere

        serializer = NoteSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
# 🔄 Mettre à jour une note existante
class UpdateNote(APIView):
    def put(self, request, id_inscription, id_matiere):
        try:
            note = Note.objects.get(id_inscription=id_inscription, id_matiere=id_matiere)
        except Note.DoesNotExist:
            return Response({"error": "Note introuvable"}, status=404)

        serializer = NoteSerializer(note, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)


# 📥 Récupérer les notes d'une inscription avec trimestres calculés
class NotesByInscription(APIView):
    def get(self, request, id_inscription):
        notes = Note.objects.filter(id_inscription=id_inscription)
        result = []

        for note in notes:
            sequences = {
                f"sequence{i}": getattr(note, f"sequence{i}")
                for i in range(1, 7)
            }

            # Calcul automatique des trimestres
            trimestres = {
                "trimestre1": (
                    (sequences["sequence1"] or 0) + (sequences["sequence2"] or 0)
                ) / 2,
                "trimestre2": (
                    (sequences["sequence3"] or 0) + (sequences["sequence4"] or 0)
                ) / 2,
                "trimestre3": (
                    (sequences["sequence5"] or 0) + (sequences["sequence6"] or 0)
                ) / 2,
            }

            result.append({
                "id_inscription":note.id_inscription,
                "id_matiere": note.id_matiere,
                "id_enseignant": note.id_enseignant,   # <-- ajouté ici
                "sequences": sequences,
                "trimestres": trimestres,
                
            })

        return Response(result)

# 📥 Récupérer les notes d'une matière
class NotesByMatiere(APIView):
    def get(self, request, id_matiere):
        notes = Note.objects.filter(id_matiere=id_matiere)
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)


# GET moyennes par inscription (séquences et trimestres)
@api_view(['GET'])
def moyennes_par_inscription(request, id_inscription):
    notes = Note.objects.filter(id_inscription=id_inscription)
    if not notes.exists():
        return Response({"error": "Aucune note trouvée pour cette inscription"}, status=404)
    
    result = []
    for note in notes:
        sequences = {f"sequence{i}": getattr(note, f"sequence{i}") for i in range(1, 7)}
        trimestres = {
            "trimestre1": ((sequences["sequence1"] or 0) + (sequences["sequence2"] or 0)) / 2,
            "trimestre2": ((sequences["sequence3"] or 0) + (sequences["sequence4"] or 0)) / 2,
            "trimestre3": ((sequences["sequence5"] or 0) + (sequences["sequence6"] or 0)) / 2,
        }
        result.append({
            "id_matiere": note.id_matiere,
            "sequences": sequences,
            "trimestres": trimestres
        })
    
    return Response(result)
