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
    print("THIS IS REQUEST: ", request.get_json())
    passage = request.get_json()
    res = ABSummarizer.summarize(passage)
    print("\n\t", jsonify(res))
    return jsonify(res)

@app.route("/api/abstractive_summarize_paragraphs", methods=['GET', 'POST'])
def abstract_paragraphs():
    print("THIS IS REQUEST: ", request.get_json())
    paragraphs = request.get_json()
    results = []
    for passage in paragraphs:
        res = ABSummarizer.summarize(passage)
        results.append(res)
    print("\n\t", jsonify(results))
    return jsonify(results)

@app.route("/api/make_predict", methods=['GET', 'POST'])
def ask():
    print("\n\nREQUEST: ", request.get_json())
#     passage = request.form['passage']
    passage = request.get_json()['passage']
    question = request.get_json()['question']
#     question = request.form['question']
    res = QAModel.make_predict(passage, question)
    print("\n\t", jsonify(res))
    return jsonify(res)

if __name__ == "__main__":
    # Only for debugging while developing
    app.run(host=HOST, debug=True, port=PORT)