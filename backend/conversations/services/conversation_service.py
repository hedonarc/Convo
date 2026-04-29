from conversations.models import Conversation, Participant


def get_or_create_direct_conversation(user1, user2):
    # find existing conversation with both users
    conversations = (
        Conversation.objects.filter(participant__user=user1)
        .filter(participant__user=user2)
        .distinct()
    )

    if conversations.exists():
        return conversations.first()

    convo = Conversation.objects.create(created_by=user1)

    Participant.objects.bulk_create(
        [
            Participant(user=user1, conversation=convo),
            Participant(user=user2, conversation=convo),
        ]
    )

    return convo
