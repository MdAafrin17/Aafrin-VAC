from rest_framework import serializers
from .models import User, College, Event, Registration

class CollegeSerializer(serializers.ModelSerializer):
    active_events_count = serializers.ReadOnlyField()
    display_logo = serializers.ReadOnlyField()

    class Meta:
        model = College
        fields = [
            'id', 'name', 'logo', 'logo_url', 'display_logo',
            'description', 'address', 'city', 'state', 'website',
            'active_events_count', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class EventSerializer(serializers.ModelSerializer):
    college_name = serializers.CharField(source='college.name', read_only=True)
    college_city = serializers.CharField(source='college.city', read_only=True)
    college_logo = serializers.CharField(source='college.display_logo', read_only=True)
    display_poster = serializers.ReadOnlyField()
    display_fee = serializers.ReadOnlyField()
    is_free = serializers.ReadOnlyField()
    registered_count = serializers.ReadOnlyField()
    spots_left = serializers.ReadOnlyField()
    is_full = serializers.ReadOnlyField()
    is_past = serializers.ReadOnlyField()
    is_registration_closed = serializers.ReadOnlyField()
    fill_percentage = serializers.ReadOnlyField()

    class Meta:
        model = Event
        fields = [
            'id', 'college', 'college_name', 'college_city', 'college_logo',
            'created_by', 'title', 'description', 'category',
            'poster', 'poster_url', 'display_poster', 'date',
            'start_time', 'end_time', 'venue', 'city', 'state',
            'registration_fee', 'display_fee', 'is_free',
            'max_participants', 'rules', 'registration_deadline',
            'registered_count', 'spots_left', 'is_full', 'is_past',
            'is_registration_closed', 'fill_percentage',
            'is_published', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['created_by'] = user
        # If user has an associated college and none was passed, use user's college
        if not validated_data.get('college') and user.college:
            validated_data['college'] = user.college
        return super().create(validated_data)


class RegistrationSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.name', read_only=True)
    student_email = serializers.CharField(source='student.email', read_only=True)
    student_college = serializers.CharField(source='student.college_display_name', read_only=True)
    student_phone = serializers.CharField(source='student.phone', read_only=True)
    
    event_id = serializers.IntegerField(source='event.id', read_only=True)
    event_title = serializers.CharField(source='event.title', read_only=True)
    event_category = serializers.CharField(source='event.category', read_only=True)
    event_date = serializers.DateField(source='event.date', read_only=True)
    event_start_time = serializers.TimeField(source='event.start_time', read_only=True)
    event_end_time = serializers.TimeField(source='event.end_time', read_only=True)
    event_venue = serializers.CharField(source='event.venue', read_only=True)
    event_city = serializers.CharField(source='event.city', read_only=True)
    event_state = serializers.CharField(source='event.state', read_only=True)
    event_fee = serializers.CharField(source='event.display_fee', read_only=True)
    event_poster = serializers.CharField(source='event.display_poster', read_only=True)
    college_name = serializers.CharField(source='event.college.name', read_only=True)
    college_logo = serializers.CharField(source='event.college.display_logo', read_only=True)

    class Meta:
        model = Registration
        fields = [
            'id', 'registration_id', 'status', 'registered_at', 'notes',
            'student', 'student_name', 'student_email', 'student_college', 'student_phone',
            'event', 'event_id', 'event_title', 'event_category', 'event_date',
            'event_start_time', 'event_end_time', 'event_venue', 'event_city',
            'event_state', 'event_fee', 'event_poster', 'college_name', 'college_logo'
        ]
        read_only_fields = ['id', 'registration_id', 'student', 'registered_at']


class UserSerializer(serializers.ModelSerializer):
    college_name = serializers.CharField(source='college_display_name', read_only=True)
    display_avatar = serializers.ReadOnlyField()

    class Meta:
        model = User
        fields = [
            'id', 'name', 'email', 'role', 'college', 'college_name',
            'college_name_other', 'phone', 'display_avatar', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
