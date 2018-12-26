# Frame (NLP Service Python Backend)

Frame's abstractive summarization and answer prediction features are done in a Python environment running PyTorch, with an API exposed (by default to all traffic). Frame is still fully functional without the Python backend, and most of the analysis and all visualizations are rendered in the UI files.

By default, the API will be exposed to port 80, and if run through Docker, served with Nginx.

# Installation / Running

## Virtualenv 

(Virtualenv)

To install all the packages run:
```sh
$ pip3 install -r requirements.txt
```
You may need to install PyTorch and AllenNLP and a few other dependencies manually (depending on the OS).

To run Flask API (not recommended unless for testing):
```sh
$ cd app
$ python3 main.py
```

## Docker

The Docker image is configured to automatically serve the Flask API through Nginx. 

To build the Docker image:

```sh
$ docker build -t imgname .
```

To run:

```sh
$ docker run -d --name mycontainer -p 80:80 imgname
```

# API docs

Creates abstractive summary of text (str). Returns str.

```
/api/abstractive_summarize
```

Creates abstractive summary of array of texts (items are individually summarized). Returns array.

```
/api/abstractive_summarize_paragraphs
```

Gets an answer to a question asked in natural language. Takes two args, both strs (first is passage text, second is question). Returns str. 

```
/api/make_predict
```