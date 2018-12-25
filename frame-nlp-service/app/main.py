from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app)

from abstractive_summarizer import abstractive_summarizer
from question_answer_model import question_answer_model

QAModel = question_answer_model.QuestionAnswerModel()
ABSummarizer = abstractive_summarizer.AbstractiveSummarizer()

@app.route("/")
def hello():
    return "Frame NLP Python backend"

@app.route("/api/abstractive_summarize", methods=['GET', 'POST'])
def abstract():
    passage = request.form['text_input_passage_for_summary']
    res = ABSummarizer.summarize(passage)
    return res

@app.route("/api/make_predict", methods=['GET', 'POST'])
def ask():
    print("\n\nREQUEST: ", request.get_json())
#     passage = request.form['passage']
    passage = request.get_json()['passage']
    question = request.get_json()['question']
#     question = request.form['question']
    res = QAModel.make_predict(passage, question)
    print("\n\n\n\t\tRESULT: ", res)
    return jsonify(res)

if __name__ == "__main__":
    # Only for debugging while developing
    app.run(host='0.0.0.0', debug=True, port=80)
