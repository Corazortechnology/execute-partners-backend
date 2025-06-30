🚫 Toxic Comment Filter API
A simple FastAPI application that uses the unitary/toxic-bert model from Hugging Face to classify text input for toxic content. This project leverages Hugging Face Transformers, PyTorch, and FastAPI to provide a lightweight web API for content moderation.

🔧 Features
Predicts probabilities of toxicity types such as toxic, severe toxic, obscene, threat, insult, and identity hate

Utilizes unitary/toxic-bert from Hugging Face

FastAPI-powered web server with a single POST endpoint

CUDA support for GPU acceleration (if available)

🚀 Quick Start
1. Clone the repository
```bash
git clone https://github.com/your-username/toxic-comment-filter.git
cd toxic-comment-filter
```
2. Install dependencies
It’s recommended to use a virtual environment.

```bash
pip install -r requirements.txt
```
If you don't have a requirements.txt yet, you can use:

```bash
pip install fastapi uvicorn torch transformers huggingface_hub
```
3. Set your Hugging Face token
Set your Hugging Face token as an environment variable:

```bash
export HUGGINGFACE_TOKEN=your_hf_token_here
```
Note: Do not hardcode your token in the code in production. Use .env or secret managers.

4. Run the server
```bash
uvicorn api:app --host 0.0.0.0 --port 3000
```
📡 API Usage
Endpoint
```bash
POST /filtercomment
```
Request Body
```bash
{
  "text": "Your input text here"
}
```
Response

```bash
{
  "toxic": 0.015,
  "severe_toxic": 0.002,
  "obscene": 0.020,
  "threat": 0.001,
  "insult": 0.010,
  "identity_hate": 0.005
}
```
Each score is a probability (0 to 1) that the input text contains a specific type of toxicity.

🧠 Model Info
Model: unitary/toxic-bert

Framework: PyTorch

Labels: toxic, severe toxic, obscene, threat, insult, identity hate

🛡️ Disclaimer
This project is for educational and prototyping purposes. Model predictions are not always accurate. Use caution before deploying it in production, especially for sensitive applications.

📄 License
MIT License

🙌 Acknowledgments
Unitary for the toxic-bert model

Hugging Face for hosting models and the Transformers library

FastAPI for the clean and fast web framework
