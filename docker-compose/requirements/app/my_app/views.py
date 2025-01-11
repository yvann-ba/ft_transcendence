from django.shortcuts import render

def ma_vue(request):
    return render(request, 'ma_page.html')

def nouvelle_page(request):
    return render(request, 'nouvelle_page.html')