from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import BulletinViewSet, LigneBulletinViewSet, api_generer_bulletin, api_exporter_bulletin_pdf

router = DefaultRouter()
router.register(r'bulletins', BulletinViewSet, basename='bulletin')
router.register(r'lignes-bulletin', LigneBulletinViewSet, basename='lignebulletin')

urlpatterns = [
    path('', include(router.urls)),
    path('generer/', api_generer_bulletin, name='generer-bulletin'),
    path('<int:bulletin_id>/export/', api_exporter_bulletin_pdf, name='export-bulletin-pdf'),
]
