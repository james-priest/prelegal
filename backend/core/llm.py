"""LLM access: LiteLLM via OpenRouter, with Cerebras as the inference provider."""

from litellm import completion
from pydantic import BaseModel

MODEL = "openrouter/openai/gpt-oss-120b"
EXTRA_BODY = {"provider": {"order": ["cerebras"]}}


def complete_structured[T: BaseModel](messages: list[dict], response_model: type[T]) -> T:
    """Run a chat completion with Structured Outputs and parse it into `response_model`."""
    response = completion(
        model=MODEL,
        messages=messages,
        response_format=response_model,
        reasoning_effort="medium",
        extra_body=EXTRA_BODY,
    )
    return response_model.model_validate_json(response.choices[0].message.content)
