from allennlp.predictors.predictor import Predictor

class Question_Answer_Model:

  def __init__(self):
    predictor = Predictor.from_path("./bidaf-model-2017.09.15-charpad.tar.gz")
    self.predictor = predictor
    pass

  def make_predict(self, passage: str, question: str):
    # predictor = Predictor.from_path("https://s3-us-west-2.amazonaws.com/allennlp/models/bidaf-model-2017.09.15-charpad.tar.gz")
    ans = self.predictor.predict(
      passage=passage,
      question=question
    )
    print(ans['best_span_str']);
    return ans

if __name__ != 'main':
  qa_model = Question_Answer_Model()
  ans = qa_model.make_predict(
  passage="",
  question=""
  )
  print(ans['best_span_str'])
else:
  qa_model = Question_Answer_Model()

