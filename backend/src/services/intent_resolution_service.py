from typing import Dict, Any, Tuple, Optional
from enum import Enum
from uuid import UUID
import re
from sqlmodel import Session
from ..models.intent import IntentType, Intent
from ..models.todo import Todo


class IntentResolutionService:
    """
    Service for parsing natural language input and mapping it to specific todo operations
    using deterministic rule-based matching without complex AI reasoning.
    """

    def __init__(self):
        # Define patterns for different intent types
        self.patterns = {
            IntentType.ADD: [
                r"(add|create|make|new)\s+(a\s+)?(todo|task|item|note)\s+(called|named|titled)\s+(.+)",
                r"(add|create|make|new)\s+(a\s+)?(.+)\s+(as\s+a\s+todo|as\s+todo|to\s+my\s+todos|to\s+my\s+list)",
                r"(add|create|make|new)\s+(.+?)\s*$",  # Improved: captures everything after add command
                r"(.+)\s+(add|create|make)\s+(this|it)",
            ],
            IntentType.LIST: [
                r"(show|display|list|get|see|view)\s+(my\s+)?(todos|tasks|items|list|notes)",
                r"(what|whats)\s+(are|is)\s+(my\s+)?(todos|tasks|items|list|notes)",
                r"(list|show)\s+(them|all)",
                r"(what|whats)\s+(on\s+)?(my\s+)?(todo\s+)?list",
            ],
            IntentType.COMPLETE: [
                r"(complete|finish|done|mark.*as.*done|check|tick)\s+(off\s+)?(.+?)\s*$",  # Improved: captures everything after the verb
                r"(complete|finish|done|marked.*as.*done|check|tick)\s+(the\s+)?(.+)\s+(todo|task|item)",
                r"(complete|finish|done|marked.*as.*done|check|tick)\s+(off\s+)?(the\s+)?(.+)",
                r"(mark|set)\s+(the\s+)?(.+)\s+(as\s+)?(complete|finished|done)",
                r"(complete|finish|done)\s+(.+?)\s*$",  # Added: captures everything after complete command
            ],
            IntentType.DELETE: [
                r"(delete|remove|eliminate|get rid of|erase)\s+(all\s+)?(todos|tasks|items|everything)\s*$",  # Handle "delete all todos"
                r"(delete|remove|eliminate|get rid of|erase)\s+(the\s+)?(.+?)\s*$",  # Improved: captures everything after the verb
                r"(delete|remove|eliminate|get rid of|erase)\s+(the\s+)?(.+)\s+(todo|task|item)",
                r"(remove|delete)\s+(it|that)",
                r"(\w+)\s+(delete|remove)",
                r"(delete|remove)\s+(.+?)\s*$",  # Added: captures everything after delete command
            ],
            IntentType.UPDATE: [
                r"(update|change|modify|edit)\s+(a\s+)?(todo|task)\s+(.+?)\s+(to|as|be)\s+(.+)",  # For "update todo X to Y" - Most specific pattern first
                r"(update|change|modify|edit)\s+(the\s+)?(.+)\s+(to|as|be)\s+(.+)",  # For "update X to Y"
                r"(change|update|modify|edit)\s+(.+\s+)(to|as|be)\s+(.+)",
                r"rename\s+(the\s+)?(.+)\s+(to|as)\s+(.+)",
                r"update\s+(.+)\s+with\s+(.+)",
                r"(update|change|modify|edit)\s+(.+?)\s*$",  # Added: captures everything after update command
            ]
        }

        # Define keywords for quick matching
        self.keywords = {
            IntentType.ADD: ['add', 'create', 'make', 'new', 'need to'],
            IntentType.LIST: ['show', 'list', 'get', 'see', 'what', 'whats', 'view'],
            IntentType.COMPLETE: ['complete', 'finish', 'done', 'check', 'tick', 'mark'],
            IntentType.DELETE: ['delete', 'remove', 'eliminate', 'get rid of', 'erase'],
            IntentType.UPDATE: ['update', 'change', 'modify', 'edit', 'rename']
        }

        # Define greeting patterns - making them more inclusive
        self.greeting_patterns = [
            r"hello|hi|hey|hy|greetings|good morning|good afternoon|good evening|good day|morning|afternoon|evening",
            r"how are you|how do you do|what's up|howdy|how is it going|how are you doing|how are things"
        ]

        # Define common question patterns that are not related to todo management
        self.unknown_question_patterns = [
            r"how are you|how is life|how is everything|how is going",
            r"what is your name|who created you|who made you|tell me about yourself",
            r"weather|temperature|news|sports|politics|joke|funny",
            r"what can you do|what are your abilities|what are your functions",
            r"thank you|thanks|appreciate|grateful",
            r"bye|goodbye|see you|farewell|take care",
            r"who are you|what are you|i need help|can you help me|who created you|who made you"
        ]

    def resolve_intent(self, user_input: str) -> Tuple[IntentType, Dict[str, Any], float]:
        """
        Resolve the user's natural language input to an intent and extract parameters

        Args:
            user_input: The raw natural language input from the user

        Returns:
            Tuple of (intent_type, parameters, confidence_score)
        """
        if not user_input or not isinstance(user_input, str):
            return IntentType.UNKNOWN, {}, 0.0

        # Normalize input
        normalized_input = user_input.lower().strip()

        # Check for common questions that are not related to todo management (including simple greetings)
        for pattern in self.unknown_question_patterns:
            if re.search(pattern, normalized_input):
                return IntentType.UNKNOWN_QUESTION, {"question": normalized_input}, 0.85

        # First try pattern matching for more specific intent detection
        for intent_type, patterns in self.patterns.items():
            for pattern in patterns:
                match = re.search(pattern, normalized_input)
                if match:
                    # Extract parameters based on the matched pattern
                    params = self._extract_parameters(intent_type, match, normalized_input)
                    # Higher confidence for pattern matches
                    return intent_type, params, 0.95

        # If no patterns match, try keyword matching
        for intent_type, keywords in self.keywords.items():
            for keyword in keywords:
                if keyword in normalized_input:
                    params = self._extract_basic_parameters(normalized_input, keyword)
                    # Lower confidence for keyword-only matches
                    return intent_type, params, 0.70

        # If nothing matches, return unknown
        return IntentType.UNKNOWN, {"original_input": user_input}, 0.0

    def _extract_parameters(self, intent_type: IntentType, match: re.Match, original_input: str) -> Dict[str, Any]:
        """Extract parameters from a regex match."""
        groups = match.groups()

        if intent_type == IntentType.ADD:
            # Extract todo title from the match groups
            # For simple patterns like "add (.+?)\s*$", we want the last captured group
            # which should be the actual content to add
            for i in range(len(groups)-1, -1, -1):  # Iterate backwards to get the most specific match
                group = groups[i]
                if group and group.strip():
                    title = group.strip()
                    # Remove common prefixes like 'called', 'named', etc.
                    title = re.sub(r'^(called|named|titled)\s+', '', title)
                    # Clean up extra whitespace
                    title = re.sub(r'\s+', ' ', title).strip()

                    # Special handling for simple commands like "add cooking"
                    # If we have a simple pattern like (verb) (noun), the noun should be the title
                    if len(title.split()) == 1 and len(original_input.split()) >= 2:
                        # Extract the word after the verb from the original input
                        words = original_input.split()
                        verb = match.group(1) if match.groups() else ""
                        if verb in ['add', 'create', 'make', 'new']:
                            # Find the verb and get the next word
                            try:
                                verb_idx = -1
                                for idx, word in enumerate(words):
                                    if word.lower() in ['add', 'create', 'make', 'new']:
                                        verb_idx = idx
                                        break
                                if verb_idx != -1 and verb_idx + 1 < len(words):
                                    extracted_title = words[verb_idx + 1]
                                    # Clean up the extracted title
                                    extracted_title = re.sub(r'[^\w\s-]', '', extracted_title)  # Remove punctuation
                                    return {"todo_title": extracted_title}
                            except:
                                pass

                    return {"todo_title": title}

        elif intent_type == IntentType.LIST:
            # List intent typically doesn't need specific parameters
            return {"action": "list"}

        elif intent_type == IntentType.COMPLETE:
            # Extract the todo title to complete
            for i in range(len(groups)-1, -1, -1):  # Iterate backwards to get the most specific match
                group = groups[i]
                if group and group.strip():
                    title = group.strip()
                    # Remove common prefixes
                    title = re.sub(r'^(off\s+)?(the\s+)?', '', title)
                    title = re.sub(r'\s+(todo|task|item)$', '', title)
                    # Clean up extra whitespace
                    title = re.sub(r'\s+', ' ', title).strip()

                    # Special handling for simple commands like "complete homework"
                    if len(title.split()) == 1 and len(original_input.split()) >= 2:
                        words = original_input.split()
                        verb = match.group(1) if match.groups() else ""
                        if verb in ['complete', 'finish', 'done', 'check', 'tick']:
                            try:
                                verb_idx = -1
                                for idx, word in enumerate(words):
                                    if word.lower() in ['complete', 'finish', 'done', 'check', 'tick']:
                                        verb_idx = idx
                                        break
                                if verb_idx != -1 and verb_idx + 1 < len(words):
                                    extracted_title = words[verb_idx + 1]
                                    extracted_title = re.sub(r'[^\w\s-]', '', extracted_title)
                                    return {"todo_title": extracted_title}
                            except:
                                pass

                    return {"todo_title": title}

        elif intent_type == IntentType.DELETE:
            # Check if this is a "delete all todos" command
            original_lower = original_input.lower()
            if "all" in original_lower and any(word in original_lower for word in ["todo", "task", "item", "everything"]):
                return {"todo_title": "all", "is_delete_all": True}

            # Extract the todo title to delete
            for i in range(len(groups)-1, -1, -1):  # Iterate backwards to get the most specific match
                group = groups[i]
                if group and group.strip():
                    title = group.strip()
                    # Remove common prefixes
                    title = re.sub(r'^(the\s+)?', '', title)
                    title = re.sub(r'\s+(todo|task|item)$', '', title)
                    # Clean up extra whitespace
                    title = re.sub(r'\s+', ' ', title).strip()

                    # Special handling for simple commands like "delete task"
                    if len(title.split()) == 1 and len(original_input.split()) >= 2:
                        words = original_input.split()
                        verb = match.group(1) if match.groups() else ""
                        if verb in ['delete', 'remove', 'eliminate', 'get rid of', 'erase']:
                            try:
                                verb_idx = -1
                                for idx, word in enumerate(words):
                                    if word.lower() in ['delete', 'remove', 'eliminate', 'get rid of', 'erase']:
                                        verb_idx = idx
                                        break
                                if verb_idx != -1 and verb_idx + 1 < len(words):
                                    extracted_title = words[verb_idx + 1]
                                    extracted_title = re.sub(r'[^\w\s-]', '', extracted_title)
                                    return {"todo_title": extracted_title}
                            except:
                                pass

                    return {"todo_title": title}

        elif intent_type == IntentType.UPDATE:
            # Handle different pattern formats for UPDATE
            # First check if this matches the "update todo X to Y" pattern specifically
            original_lower = original_input.lower()
            if "todo" in original_lower and (" to " in original_lower or " as " in original_lower or " be " in original_lower):
                # Pattern: "(update|change|modify|edit)\s+(a\s+)?(todo|task)\s+(.+?)\s+(to|as|be)\s+(.+)"
                # groups: (verb, article?, type, old_title, separator, new_title)
                if len(groups) >= 4:
                    # Find where the separator (to/as/be) is in the groups
                    for i, group in enumerate(groups):
                        if group and group.strip().lower() in ['to', 'as', 'be']:
                            # Everything before the separator (excluding verb, article, type) is the old title
                            old_title_parts = []
                            for j in range(i):
                                part = groups[j].strip() if groups[j] else ""
                                # Skip the verb and article/type words
                                if j > 0 and part and part.lower() not in ['a', 'the', 'todo', 'task']:
                                    old_title_parts.append(part)

                            old_title = ' '.join(old_title_parts).strip()

                            # Everything after the separator is the new title
                            new_title_parts = []
                            for j in range(i + 1, len(groups)):
                                part = groups[j].strip() if groups[j] else ""
                                if part:
                                    new_title_parts.append(part)

                            new_title = ' '.join(new_title_parts).strip()

                            # Clean up the titles
                            old_title = re.sub(r'^(\s+|\w+\s+)', '', old_title)  # Remove leading words
                            old_title = re.sub(r'(todo|task|item)\s*$', '', old_title, flags=re.IGNORECASE)  # Remove trailing type
                            new_title = re.sub(r'^(to\s+|as\s+|be\s+)', '', new_title, flags=re.IGNORECASE)  # Remove leading separator
                            new_title = re.sub(r'\s+(todo|task|item)$', '', new_title, flags=re.IGNORECASE)  # Remove trailing type

                            old_title = re.sub(r'\s+', ' ', old_title).strip()
                            new_title = re.sub(r'\s+', ' ', new_title).strip()

                            return {"old_todo_title": old_title, "new_todo_title": new_title}

            # Fallback to the original logic for other patterns
            if len(groups) >= 2:
                old_title = groups[0].strip() if groups[0] else ""
                new_title = groups[-1].strip() if groups[-1] else ""

                # Clean up titles
                old_title = re.sub(r'^(the\s+)?', '', old_title)
                old_title = re.sub(r'\s+(todo|task|item)$', '', old_title)
                new_title = re.sub(r'^(as\s+|to\s+|be\s+)', '', new_title)
                new_title = re.sub(r'\s+(todo|task|item)$', '', new_title)

                # Final cleanup
                old_title = re.sub(r'\s+', ' ', old_title).strip()
                new_title = re.sub(r'\s+', ' ', new_title).strip()

                return {"old_todo_title": old_title, "new_todo_title": new_title}

        return {}

    def _extract_basic_parameters(self, normalized_input: str, matched_keyword: str) -> Dict[str, Any]:
        """Extract basic parameters when only keywords are matched."""
        # Remove the matched keyword and clean up the rest
        remaining_text = re.sub(matched_keyword, '', normalized_input, flags=re.IGNORECASE).strip()
        remaining_text = re.sub(r'\s+', ' ', remaining_text)  # Normalize whitespace

        # Try to extract relevant text as a potential todo title
        if remaining_text and len(remaining_text) > 0:
            # Remove common filler words
            remaining_text = re.sub(r'^(the\s+|a\s+|an\s+|my\s+|this\s+|that\s+)', '', remaining_text).strip()

            if remaining_text:
                # For simple commands like "add cooking", the remaining text is the title
                return {"todo_title": remaining_text}

        # If there's no remaining text, try to get the next word after the keyword
        words = normalized_input.split()
        try:
            keyword_index = words.index(matched_keyword.split()[0])  # Get the first word of the matched keyword
            if keyword_index + 1 < len(words):
                next_word = words[keyword_index + 1]
                return {"todo_title": next_word}
        except ValueError:
            pass  # Keyword not found in the expected format

        return {}