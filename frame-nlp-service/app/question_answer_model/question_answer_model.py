from allennlp.predictors.predictor import Predictor
import os
import sys

from pathlib import Path
data = Path("bidaf-model-2017.09.15-charpad.tar.gz")

scriptPath = os.path.realpath(os.path.dirname(sys.argv[0]))

class QuestionAnswerModel:

  def __init__(self):
    pass

  def make_predict(self, passage: str, question: str):
    # For some reason setting Predictor into a class var was returning bad data from the model,
    # so let's make it every time I guess
    predictor = Predictor.from_path(data)
    # predictor = Predictor.from_path("https://s3-us-west-2.amazonaws.com/allennlp/models/bidaf-model-2017.09.15-charpad.tar.gz")
    ans = predictor.predict(passage=passage,question=question)
    # print(ans['best_span_str'])
    return ans['best_span_str']

if __name__ != 'main':
  qa_model = QuestionAnswerModel()
else:
  qa_model = QuestionAnswerModel()

