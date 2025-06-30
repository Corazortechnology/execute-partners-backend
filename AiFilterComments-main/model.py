from transformers import AutoModel, AutoConfig
from transformers.modeling_outputs import SequenceClassifierOutput
import torch
import torch.nn as nn

class OffensiveClassifier(nn.Module):
    def __init__(self, model_name="unitary/toxic-bert"):
        super().__init__()
        self.base_model = AutoModel.from_pretrained(model_name)
        self.dropout = nn.Dropout(0.3)

        hidden_size = self.base_model.config.hidden_size
        self.offensive_head = nn.Linear(hidden_size, 1)
        self.toxicity_head = nn.Linear(hidden_size, 6)
        self.toxicity_head.requires_grad_(False)

    def forward(self, input_ids, attention_mask, token_type_ids=None, labels=None):
        # Pass token_type_ids to the base model
        outputs = self.base_model(input_ids=input_ids, attention_mask=attention_mask, token_type_ids=token_type_ids)

        cls_output = self.dropout(outputs.last_hidden_state[:, 0])  # CLS token
        offensive_logits = self.offensive_head(cls_output)

        loss = None
        if labels is not None:
            loss_fn = nn.BCEWithLogitsLoss()
            loss = loss_fn(offensive_logits, labels.float().unsqueeze(1))

        return SequenceClassifierOutput(
            loss=loss,
            logits=offensive_logits,
            hidden_states=None,
            attentions=None
        )
