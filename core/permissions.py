from rest_framework import permissions

class IsCollegeAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission: Read-only for safe methods.
    Create only for COLLEGE_ADMIN users.
    Update/Delete only for the creator or the college admin associated with that event.
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user.is_authenticated and (request.user.is_college_admin or request.user.is_superuser)

    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        # Check if user created the event or belongs to the same college
        if hasattr(obj, 'created_by') and obj.created_by == request.user:
            return True
        if hasattr(obj, 'college') and request.user.college and obj.college == request.user.college:
            return True
        return False


class IsStudentUser(permissions.BasePermission):
    """Permission allowing only registered student users."""
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_student


class IsOwnerOrAdmin(permissions.BasePermission):
    """Allows student owner of registration or admin of the event college to access."""
    def has_object_permission(self, request, view, obj):
        if not request.user.is_authenticated:
            return False
        if request.user.is_superuser:
            return True
        if hasattr(obj, 'student') and obj.student == request.user:
            return True
        if hasattr(obj, 'event') and request.user.college and obj.event.college == request.user.college:
            return True
        return False
