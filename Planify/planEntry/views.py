from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from django.http.response import JsonResponse
from planEntry.models import AddTask
from planEntry.serializers import AddTaskSerializers

# Helper function to get task by ID
def get_task_by_id(task_id):
    try:
        return AddTask.objects.get(ids=task_id)
    except AddTask.DoesNotExist:
        return None

# Helper function for JSON responses
def response_message(message, status=200):
    return JsonResponse({"message": message}, safe=False, status=status)

# Main API function
@csrf_exempt
def addTaskApi(request, id=None):
    if request.method == 'GET':
        return handle_get_request(request, id)
    elif request.method == 'POST':
        return handle_post_request(request)
    elif request.method == 'PUT':
        return handle_put_request(request, id)
    elif request.method == 'DELETE':
        return handle_delete_request(id)
    else:
        return response_message("Method not allowed.", status=405)

# Handle GET requests
def handle_get_request(request, id):
    if id is None:
        # Fetch all tasks
        tasks = AddTask.objects.all()
        serializer = AddTaskSerializers(tasks, many=True)
        return JsonResponse(serializer.data, safe=False)
    else:
        # Fetch tasks by level
        tasks = AddTask.objects.filter(level=id)
        if tasks.exists():
            serializer = AddTaskSerializers(tasks, many=True)
            return JsonResponse(serializer.data, safe=False)
        return response_message(f"No tasks found with Level {id}.", status=404)

# Handle POST requests
def handle_post_request(request):
    try:
        task_data = JSONParser().parse(request)
        serializer = AddTaskSerializers(data=task_data)
        if serializer.is_valid():
            serializer.save()
            return response_message("Task added successfully!")
        return response_message("Failed to add task. Invalid data.", status=400)
    except Exception as e:
        return response_message(f"An error occurred: {str(e)}", status=500)

# Handle PUT requests
def handle_put_request(request, id):
    try:
        task_data = JSONParser().parse(request)
        task = get_task_by_id(id)

        if task is None:
            return response_message(f"Task with ID {id} not found.", status=404)

        # Handle specific flag updates
        if 'delFlg' in task_data and task_data['delFlg'] == 'Y':
            task.delFlg = 'Y'
            task.save()
            return response_message("delFlg set to Y successfully!")
        elif 'compFlg' in task_data and task_data['compFlg'] == 'Y':
            task.compFlg = 'Y'
            task.save()
            return response_message("compFlg set to Y successfully!")

        # Handle full update
        serializer = AddTaskSerializers(task, data=task_data)
        if serializer.is_valid():
            serializer.save()
            return response_message("Task updated successfully!")
        return response_message("Failed to update task. Invalid data.", status=400)
    except Exception as e:
        return response_message(f"An error occurred: {str(e)}", status=500)

# Handle DELETE requests
def handle_delete_request(id):
    task = get_task_by_id(id)
    if task is None:
        return response_message(f"Task with ID {id} not found.", status=404)
    task.delete()
    return response_message("Task deleted successfully!")
