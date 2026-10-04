from pydantic import BaseModel

from core import llm


class Answer(BaseModel):
    text: str


def test_complete_structured_uses_cerebras_and_parses_response(stub_llm):
    calls = stub_llm({"text": "hello"})
    answer = llm.complete_structured([{"role": "user", "content": "hi"}], Answer)
    kwargs = calls[0]
    assert kwargs["model"] == "openrouter/openai/gpt-oss-120b"
    assert kwargs["response_format"] is Answer
    assert kwargs["extra_body"] == {"provider": {"order": ["cerebras"]}}
    assert answer == Answer(text="hello")
