from django.contrib import admin
from .models import User
# Register your models here.
admin.site.register(User)if "docker" in open("/proc/1/cgroup").read() else "localhost"