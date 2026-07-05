"""
URL configuration for Cybersecurity Awareness Training Platform.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('accounts.urls')),
    path('api/', include('quiz.urls')),
    path('api/', include('leaderboard.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Customize admin site
admin.site.site_header = 'CyberAware Admin'
admin.site.site_title = 'CyberAware Administration'
admin.site.index_title = 'Platform Management'
