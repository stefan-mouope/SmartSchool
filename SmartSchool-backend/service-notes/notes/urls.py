from django.urls import path
from .views import (
    SaveNote,
    NotesByInscription,
    NotesByMatiere,
    FullNotesByInscription,
    GetSingleNote
)
from .views import moyennes_par_inscription

urlpatterns = [
    # # CREATE
    # path("create/<int:id_inscription>/<int:id_matiere>/", CreateNote.as_view()),

    # # UPDATE
    # path("update/<int:id_inscription>/<int:id_matiere>/", UpdateNote.as_view()),
    
    path("save/<int:id_inscription>/<int:id_matiere>/", SaveNote.as_view()),


    # GET by inscription
    path("inscription/<int:id_inscription>/", NotesByInscription.as_view()),

    # GET by matiere
    path("matiere/<int:id_matiere>/", NotesByMatiere.as_view()),

    # Moyennes
    path("moyennes/<int:id_inscription>/", moyennes_par_inscription),

    # ✅ GET full notes par classe et année
    path("full/<id_inscription>/", FullNotesByInscription.as_view()),
    
    path("notes/<int:id_inscription>/<int:id_matiere>/", GetSingleNote.as_view()),


]
