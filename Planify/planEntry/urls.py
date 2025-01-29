from django.urls import re_path
from planEntry import views

from django.conf.urls.static import static
from django.conf import settings

urlpatterns=[
    re_path(r'^$',views.addTaskApi),
    re_path(r'^(?P<id>\w+)$', views.addTaskApi)

] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)