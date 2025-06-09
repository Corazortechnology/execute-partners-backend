from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
class ModelLoader:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self._load_models()

    def _load_models(self):
        self.hf_model = AutoModelForSequenceClassification.from_pretrained("unitary/toxic-bert").to(self.device)
        self.hf_tokenizer = AutoTokenizer.from_pretrained("unitary/toxic-bert")

        self.identity_model = AutoModelForSequenceClassification.from_pretrained(
            "Mridul2003/identity-hate-detector"
        ).to(self.device)

        try:
            self.identity_tokenizer = AutoTokenizer.from_pretrained("Mridul2003/identity-hate-detector")
        except Exception:
            self.identity_tokenizer = self.hf_tokenizer
