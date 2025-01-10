from django.shortcuts import render
from django.http import HttpResponse


def index(request):
    return HttpResponse("TA MERE, world. You're at the polls index.")