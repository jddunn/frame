from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app)

from abstractive_summarizer import abstractive_summarizer
from question_answer_model import question_answer_model

QAModel = question_answer_model.QuestionAnswerModel()
ABSummarizer = abstractive_summarizer.AbstractiveSummarizer()

HOST = '0.0.0.0'
PORT = '80'

@app.route("/")
def hello():
    return("Frame NLP Python backend running at " + HOST + ':' + PORT)

@app.route("/api/abstractive_summarize", methods=['GET', 'POST'])
def abstract():
    # Gets and returs jsonified string
    # Builds an abstractive summary of a text
    passage = request.get_json()
    res = ABSummarizer.summarize(passage)
    return jsonify(res)

@app.route("/api/abstractive_summarize_paragraphs", methods=['GET', 'POST'])
def abstract_paragraphs():
    # Builds abstractive summaries of texts by paragraphs
    # Gets and returns jsonified array
    paragraphs = request.get_json()
    results = []
    for passage in paragraphs:
        res = ABSummarizer.summarize(passage)
        results.append(res)
    return jsonify(results)

@app.route("/api/make_predict", methods=['GET', 'POST'])
def ask():
    # Gets answer to question in context of a passage of text
    # Gets and returns jsonified strings
    passage = request.get_json()['passage']
    question = request.get_json()['question']
    res = QAModel.make_predict(passage, question)
    return jsonify(res)

if __name__ == "__main__":
    # Only for debugging while developing
    app.run(host=HOST, debug=True, port=PORT)