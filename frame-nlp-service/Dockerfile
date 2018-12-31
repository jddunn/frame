FROM tiangolo/uwsgi-nginx-flask:python3.7

ENV STATIC_INDEX 1

# Set the working directory to /app
WORKDIR /app

COPY ./app /app

# Dependencies
RUN pip install --upgrade pip && pip install --trusted-host pypi.python.org -r requirements.txt && python -m spacy download en

# Make port 80 available to the world outside this container
EXPOSE 80

# Define environment variable
ENV NAME World

# Run app.py when the container launches
CMD ["python", "main.py"]