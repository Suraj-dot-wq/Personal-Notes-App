from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from .serializers import NoteSerializer
from .models import Note


@api_view(['GET'])
def getRoutes(request):
    routes = [
        {
            'Endpoint': '/notes/',
            'method': 'GET',
            'body': None,
            'description': 'Returns notes belonging to the logged-in user'
        },
        {
            'Endpoint': '/notes/id/',
            'method': 'GET',
            'body': None,
            'description': 'Returns one note belonging to the logged-in user'
        },
        {
            'Endpoint': '/notes/create/',
            'method': 'POST',
            'body': {'body': ""},
            'description': 'Creates a note for the logged-in user'
        },
        {
            'Endpoint': '/notes/id/update/',
            'method': 'PUT',
            'body': {'body': ""},
            'description': 'Updates a note belonging to the logged-in user'
        },
        {
            'Endpoint': '/notes/id/delete/',
            'method': 'DELETE',
            'body': None,
            'description': 'Deletes a note belonging to the logged-in user'
        },
    ]

    return Response(routes)


@api_view(['GET'])
def getNotes(request):
    notes = Note.objects.filter(
        user=request.user
    ).order_by('-created')

    serializer = NoteSerializer(notes, many=True)

    return Response(serializer.data)


@api_view(['GET'])
def getNote(request, pk):
    note = get_object_or_404(
        Note,
        id=pk,
        user=request.user
    )

    serializer = NoteSerializer(note)

    return Response(serializer.data)


@api_view(['POST'])
def createNote(request):
    serializer = NoteSerializer(data=request.data)

    if serializer.is_valid():
        note = serializer.save(user=request.user)

        return Response(
            NoteSerializer(note).data,
            status=status.HTTP_201_CREATED
        )

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['PUT', 'PATCH'])
def updateNote(request, pk):
    note = get_object_or_404(
        Note,
        id=pk,
        user=request.user
    )

    serializer = NoteSerializer(
        instance=note,
        data=request.data,
        partial=True
    )

    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)

    return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['DELETE'])
def deleteNote(request, pk):
    note = get_object_or_404(
        Note,
        id=pk,
        user=request.user
    )

    note.delete()

    return Response(
        {'message': 'Note was deleted successfully.'},
        status=status.HTTP_200_OK
    )