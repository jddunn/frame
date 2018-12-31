from pysummarization.nlpbase.auto_abstractor import AutoAbstractor
from pysummarization.tokenizabledoc.simple_tokenizer import SimpleTokenizer
from pysummarization.abstractabledoc.top_n_rank_abstractor import TopNRankAbstractor

class AbstractiveSummarizer:

  def __init__(self):
    # Object of automatic summarization.
    self.auto_abstractor = AutoAbstractor()
    # Set tokenizer.
    self.auto_abstractor.tokenizable_doc = SimpleTokenizer()
    # Set delimiter for making a list of sentence.
    self.auto_abstractor.delimiter_list = [".", "\n", "\r\n", "!", "?"]
    self.abstractable_doc = TopNRankAbstractor()
    return

  def summarize(self, document: str):
    result_dict = self.auto_abstractor.summarize(document, self.abstractable_doc)
    # print(result_dict)
    # for sentence in result_dict["summarize_result"]:
        # print(sentence)
    return result_dict

if __name__ != 'main':
    abstractive_summarizer = AbstractiveSummarizer()
else:
    abstractive_summarizer = AbstractiveSummarizer()

