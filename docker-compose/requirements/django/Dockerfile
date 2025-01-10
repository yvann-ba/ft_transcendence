FROM python:3.10-slim

WORKDIR /app

# Copier uniquement requirements.txt d'abord
COPY requirements.txt /app/ 
RUN pip install --no-cache-dir -r requirements.txt

# Copier tous les autres fichiers ensuite
COPY . /app/

EXPOSE 8000

CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
