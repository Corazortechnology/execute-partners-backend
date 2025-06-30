from fastapi import FastAPI, Request
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from huggingface_hub import login

app = FastAPI()

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

# Login once on startup (consider environment variable for token in prod)
login("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", add_to_git_credential=False)

model = AutoModelForSequenceClassification.from_pretrained("unitary/toxic-bert").to(device)
tokenizer = AutoTokenizer.from_pretrained("unitary/toxic-bert")


class TextInput(BaseModel):
    text: str


@app.post("/filtercomment")
async def filter_comment(data: TextInput):
    inputs = tokenizer(data.text, return_tensors="pt", padding=True, truncation=True)
    inputs = {k: v.to(device) for k, v in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)
    logits = outputs.logits
    probs = torch.sigmoid(logits)

    labels = model.config.id2label
    results = {labels.get(i, f"Label {i}"): float(prob) for i, prob in enumerate(probs[0])}
    if results['toxic']<0.5 and results['severe_toxic']<0.5 and results['obscene']<0.5 and results['insult']<0.5 and results['identity_hate']<0.5:
        results['safe'] = True
    else:
        results['safe'] = False
    return results

