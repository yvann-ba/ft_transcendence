# Utiliser une image de base officielle de Python
FROM python:3.10-slim

# Définir des variables d'environnement pour éviter les avertissements de dépréciation
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Définir le répertoire de travail à l'intérieur du conteneur
WORKDIR /app

# Copier les fichiers requirements.txt et requirements-dev.txt dans le conteneur
COPY requirements.txt requirements-dev.txt ./

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste de l'application dans le conteneur
COPY . .

# Installer les dépendances de développement
RUN pip install --no-cache-dir -r requirements-dev.txt

# Exposer le port sur lequel l'application Django fonctionnera
EXPOSE 8000

COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

ENTRYPOINT ["/app/entrypoint.sh"]

# Commande pour démarrer le serveur de développement Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]