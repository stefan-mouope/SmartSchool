from django.contrib import admin
from .models import Bulletin, LigneBulletin

class BulletinAdmin(admin.ModelAdmin):
    list_display = ('id', 'inscription_id', 'trimestre', 'moyenne_generale', 'moyenne_classe', 'rang')

class LigneBulletinAdmin(admin.ModelAdmin):
    list_display = ('id', 'bulletin', 'matiere', 'moyenne', 'appreciation')

admin.site.register(Bulletin, BulletinAdmin)
admin.site.register(LigneBulletin, LigneBulletinAdmin)
