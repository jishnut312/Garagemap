from django.contrib import admin
from .models import  Workshop,UserProfile,ServiceRequest
# Register your models here.
admin.site.register(Workshop)
admin.site.register(UserProfile)
admin.site.register(ServiceRequest)
