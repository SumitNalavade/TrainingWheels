import string
import nltk
nltk.download('stopwords')
nltk.download('wordnet')  
nltk.download('omw-1.4')  
from nltk.corpus import stopwords
from nltk.stem.wordnet import WordNetLemmatizer
from gensim import corpora
from gensim.models import LsiModel, LdaModel

def predict(corpus, num_words = 3, num_topics = 3, model = 'lda'):
    '''
    Given a corpus of a user's text, this function will predict a top number of relevant topics. 
    This can be done using either the Latent Semantic Analysis (LSA) or Latent Dirichlet Allocation (LDA) algorithms.
    By default, the lda algorithm will be chosen. The result will be the top n key topics.
    '''

    # remove stopwords, punctuation, and normalize the corpus
    stop = set(stopwords.words('english'))
    exclude = set(string.punctuation)
    lemma = WordNetLemmatizer()

    def clean(doc):
        stop_free = " ".join([i for i in doc.lower().split() if i not in stop])
        punc_free = "".join(ch for ch in stop_free if ch not in exclude)
        normalized = " ".join(lemma.lemmatize(word) for word in punc_free.split())
        return normalized

    clean_corpus = [clean(doc).split() for doc in corpus]

    # Creating document-term matrix 
    dictionary = corpora.Dictionary(clean_corpus)
    doc_term_matrix = [dictionary.doc2bow(doc) for doc in clean_corpus]

    #LDA Algorithm
    if(model == 'lda'):
        lda = LdaModel(doc_term_matrix, num_topics=num_topics, id2word = dictionary)
        ldamodel = lda.print_topics(num_topics=num_topics, num_words=num_words)
        return ldamodel
    
    #LSA Algorithm
    else:
        lsa = LsiModel(doc_term_matrix, num_topics=num_topics, id2word = dictionary)
        lsamodel = lsa.print_topics(num_topics=num_topics, num_words=num_words)
        return lsamodel