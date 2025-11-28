from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Note
from .serializers import NoteSerializer
from rest_framework.decorators import api_view
from .rabbitmq import rpc_client as rabbit_client


class SaveNote(APIView):
    def post(self, request, id_inscription, id_matiere):
        try:
            # Vérifier inscription
            verify_inscription = rabbit_client.call(
                "inscription.verify",
                {"event": "verify_inscription", "data": {"id_inscription": id_inscription}}
            )
            if not verify_inscription.get("status"):
                return Response({"success": False, "message": "Inscription introuvable"}, status=404)

            # Vérifier matière
            verify_matiere = rabbit_client.call(
                "matiere.verify",
                {"event": "verify_matiere", "data": {"id_matiere": id_matiere}}
            )
            if not verify_matiere.get("status"):
                return Response({"success": False, "message": "Matière introuvable"}, status=404)

            data = request.data.copy()
            data["id_inscription"] = id_inscription
            data["id_matiere"] = id_matiere

            note, created = Note.objects.update_or_create(
                id_inscription=id_inscription,
                id_matiere=id_matiere,
                defaults=data
            )

            serializer = NoteSerializer(note)

            return Response({
                "success": True,
                "created": created,
                "data": serializer.data
            }, status=200)

        except Exception as e:
            return Response({
                "success": False,
                "message": str(e)
            }, status=500)



# -----------------------
# NOTES BY INSCRIPTION
# -----------------------
class NotesByInscription(APIView):
    def get(self, request, id_inscription):
        notes = Note.objects.filter(id_inscription=id_inscription).values(
            'id_matiere',
            'sequence1', 'sequence2', 'sequence3',
            'sequence4', 'sequence5', 'sequence6'
        )

        result = []
        for note in notes:
            s1 = note['sequence1'] or 0
            s2 = note['sequence2'] or 0
            s3 = note['sequence3'] or 0
            s4 = note['sequence4'] or 0
            s5 = note['sequence5'] or 0
            s6 = note['sequence6'] or 0

            result.append({
                "id_matiere": note['id_matiere'],
                "sequences": {
                    "sequence1": note['sequence1'],
                    "sequence2": note['sequence2'],
                    "sequence3": note['sequence3'],
                    "sequence4": note['sequence4'],
                    "sequence5": note['sequence5'],
                    "sequence6": note['sequence6'],
                },
                "trimestres": {
                    "trimestre1": round((s1 + s2) / 2, 2),
                    "trimestre2": round((s3 + s4) / 2, 2),
                    "trimestre3": round((s5 + s6) / 2, 2),
                }
            })

        return Response(result)


# -----------------------
# NOTES BY MATIERE
# -----------------------
class NotesByMatiere(APIView):
    def get(self, request, id_matiere):
        notes = Note.objects.filter(id_matiere=id_matiere)
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)


# -----------------------
# MOYENNES PAR INSCRIPTION
# -----------------------
@api_view(['GET'])
def moyennes_par_inscription(request, id_inscription):
    notes = Note.objects.filter(id_inscription=id_inscription)
    if not notes.exists():
        return Response({"error": "Aucune note trouvée"}, status=404)

    result = []
    for note in notes:
        s = [getattr(note, f"sequence{i}", None) or 0 for i in range(1, 7)]
        result.append({
            "id_matiere": note.id_matiere,
            "sequences": {f"sequence{i}": getattr(note, f"sequence{i}") for i in range(1, 7)},
            "trimestres": {
                "trimestre1": round((s[0] + s[1]) / 2, 2),
                "trimestre2": round((s[2] + s[3]) / 2, 2),
                "trimestre3": round((s[4] + s[5]) / 2, 2),
            }
        })
    return Response(result)


# -----------------------
# FULL NOTES PAR CLASSE ET ANNEE
# -----------------------

class FullNotesByInscription(APIView):
    def get(self, request, id_inscription):
        notes = Note.objects.filter(id_inscription=id_inscription)

        if not notes.exists():
            return Response({"error": "Aucune note trouvée"}, status=404)

        result = []

        for note in notes:
            s = [getattr(note, f"sequence{i}", None) or 0 for i in range(1, 7)]

            result.append({
                "id_matiere": note.id_matiere,
                "sequences": {
                    f"sequence{i}": getattr(note, f"sequence{i}") for i in range(1, 7)
                },
                "trimestres": {
                    "trimestre1": round((s[0] + s[1]) / 2, 2),
                    "trimestre2": round((s[2] + s[3]) / 2, 2),
                    "trimestre3": round((s[4] + s[5]) / 2, 2),
                }
            })

        return Response({
            "id_inscription": id_inscription,
            "notes": result
        })


class GetSingleNote(APIView):
    def get(self, request, id_inscription, id_matiere):
        try:
            note = Note.objects.get(id_inscription=id_inscription,
                                    id_matiere=id_matiere)
            serializer = NoteSerializer(note)
            return Response({
                "success": True,
                "data": serializer.data
            }, status=200)
        except Note.DoesNotExist:
            return Response({
                "success": False,
                "message": "Note introuvable"
            }, status=404)
