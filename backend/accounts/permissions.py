from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allow access only to admin users."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.user_type == 'admin' or request.user.is_superuser)
        )


class IsAdminOrReadOnly(BasePermission):
    """Allow read access to all authenticated users, write access only to admins."""
    def has_permission(self, request, view):
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return request.user and request.user.is_authenticated
        return (
            request.user
            and request.user.is_authenticated
            and (request.user.user_type == 'admin' or request.user.is_superuser)
        )
