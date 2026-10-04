from core import llm
from models.nda import ChatTurn


def test_complete_structured_uses_cerebras_and_parses_response(llm_calls):
    turn = llm.complete_structured([{"role": "user", "content": "hi"}], ChatTurn)
    kwargs = llm_calls[0]
    assert kwargs["model"] == "openrouter/openai/gpt-oss-120b"
    assert kwargs["response_format"] is ChatTurn
    assert kwargs["extra_body"] == {"provider": {"order": ["cerebras"]}}
    assert isinstance(turn, ChatTurn)
    assert turn.fields.party1.company == "Acme Inc"
