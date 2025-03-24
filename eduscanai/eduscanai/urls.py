"""
URL configuration for eduscanai project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.1/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
import grading.views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', grading.views.index , name='index'),
    path("evaluate/", grading.views.evaluate, name="evaluate"),
    path("send-feedback/", grading.views.send_feedback, name="send_feedback"),
    path('send-otp/', grading.views.send_otp, name='send_otp'),
    path('verify-otp/', grading.views.verify_otp, name='verify_otp'),
]
