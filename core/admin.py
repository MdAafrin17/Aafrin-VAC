from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, College, Event, Registration

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('email', 'name', 'role', 'college_display_name', 'phone', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_active')
    search_fields = ('email', 'name', 'college__name', 'phone')
    ordering = ('email',)

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('name', 'phone', 'avatar', 'avatar_url')}),
        ('College & Role', {'fields': ('role', 'college', 'college_name_other')}),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
        ('Important dates', {'fields': ('last_login', 'date_joined')}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'name', 'role', 'college', 'password'),
        }),
    )


@admin.register(College)
class CollegeAdmin(admin.ModelAdmin):
    list_display = ('name', 'city', 'state', 'website', 'active_events_count')
    list_filter = ('city', 'state')
    search_fields = ('name', 'city', 'state')


@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ('title', 'college', 'category', 'date', 'city', 'registration_fee', 'registered_count', 'max_participants')
    list_filter = ('category', 'city', 'state', 'date', 'is_published')
    search_fields = ('title', 'college__name', 'city', 'description')
    date_hierarchy = 'date'


@admin.register(Registration)
class RegistrationAdmin(admin.ModelAdmin):
    list_display = ('registration_id', 'student', 'event', 'status', 'registered_at')
    list_filter = ('status', 'registered_at')
    search_fields = ('registration_id', 'student__email', 'student__name', 'event__title')
    readonly_fields = ('registration_id', 'registered_at')
