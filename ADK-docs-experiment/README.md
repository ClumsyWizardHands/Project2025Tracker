# Agent Development Kit (ADK) Documentation

This directory contains documentation about Google's Agent Development Kit (ADK), gathered using Context7 and FireCrawl.

## What is ADK?

The Agent Development Kit (ADK) is an open-source, code-first Python toolkit for building, evaluating, and deploying sophisticated AI agents with flexibility and control. It provides a structured framework for creating agents that can interact with users, use tools, and manage complex workflows.

## Core Concepts

### Events

Events are the fundamental unit of communication in ADK. They represent messages, tool calls, tool results, state updates, or control signals.

```python
# Conceptual Structure of an Event
# from google.adk.events import Event, EventActions
# from google.genai import types

# class Event(LlmResponse): # Simplified view
#     # --- LlmResponse fields ---
#     content: Optional[types.Content]
#     partial: Optional[bool]
#     # ... other response fields ...

#     # --- ADK specific additions ---
#     author: str          # 'user' or agent name
#     invocation_id: str   # ID for the whole interaction run
#     id: str              # Unique ID for this specific event
#     timestamp: float     # Creation time
#     actions: EventActions # Important for side-effects & control
#     branch: Optional[str] # Hierarchy path
#     # ...
```

#### Event Identification

```python
# Pseudocode: Basic event identification
# async for event in runner.run_async(...):
#     print(f"Event from: {event.author}")
#
#     if event.content and event.content.parts:
#         if event.get_function_calls():
#             print("  Type: Tool Call Request")
#         elif event.get_function_responses():
#             print("  Type: Tool Result")
#         elif event.content.parts[0].text:
#             if event.partial:
#                 print("  Type: Streaming Text Chunk")
#             else:
#                 print("  Type: Complete Text Message")
#         else:
#             print("  Type: Other Content (e.g., code result)")
#     elif event.actions and (event.actions.state_delta or event.actions.artifact_delta):
#         print("  Type: State/Artifact Update")
#     else:
#         print("  Type: Control Signal or Other")
```

#### Error Events

```json
{
  "author": "LLMAgent",
  "invocation_id": "e-err...",
  "content": null,
  "error_code": "SAFETY_FILTER_TRIGGERED",
  "error_message": "Response blocked due to safety settings.",
  "actions": {}
}
```

### Function Calls and Responses

#### Extracting Function Calls

```python
calls = event.get_function_calls()
if calls:
    for call in calls:
        tool_name = call.name
        arguments = call.args # This is usually a dictionary
        print(f"  Tool: {tool_name}, Args: {arguments}")
        # Application might dispatch execution based on this
```

#### Extracting Function Responses

```python
responses = event.get_function_responses()
if responses:
    for response in responses:
        tool_name = response.name
        result_dict = response.response # The dictionary returned by the tool
        print(f"  Tool Result: {tool_name} -> {result_dict}")
```

### State Management

#### Detecting State Changes

```python
if event.actions and event.actions.state_delta:
    print(f"  State changes: {event.actions.state_delta}")
    # Update local UI or application state if necessary
```

### Artifact Management

#### Detecting Artifact Saves

```python
if event.actions and event.actions.artifact_delta:
    print(f"  Artifacts saved: {event.actions.artifact_delta}")
    # UI might refresh an artifact list
```

#### Artifact Services

```python
from google.adk.artifacts import InMemoryArtifactService

# Simply instantiate the class
in_memory_service = InMemoryArtifactService()

# Then pass it to the Runner
# runner = Runner(..., artifact_service=in_memory_service)
```

```python
from google.adk.artifacts import GcsArtifactService

# Specify the GCS bucket name
gcs_bucket_name = "your-gcs-bucket-for-adk-artifacts" # Replace with your bucket name

try:
    gcs_service = GcsArtifactService(bucket_name=gcs_bucket_name)
    print(f"GcsArtifactService initialized for bucket: {gcs_bucket_name}")
    # Ensure your environment has credentials to access this bucket.
    # e.g., via Application Default Credentials (ADC)

    # Then pass it to the Runner
    # runner = Runner(..., artifact_service=gcs_service)

except Exception as e:
    # Catch potential errors during GCS client initialization (e.g., auth issues)
    print(f"Error initializing GcsArtifactService: {e}")
    # Handle the error appropriately - maybe fall back to InMemory or raise
```

### Control Flow

#### Detecting Control Flow Signals

```python
if event.actions:
    if event.actions.transfer_to_agent:
        print(f"  Signal: Transfer to {event.actions.transfer_to_agent}")
    if event.actions.escalate:
        print("  Signal: Escalate (terminate loop)")
    if event.actions.skip_summarization:
        print("  Signal: Skip summarization for tool result")
```

#### Processing Event Stream and Identifying Final Responses

```python
# Pseudocode: Handling final responses in application
# full_response_text = ""
# async for event in runner.run_async(...):
#     # Accumulate streaming text if needed...
#     if event.partial and event.content and event.content.parts and event.content.parts[0].text:
#         full_response_text += event.content.parts[0].text
#
#     # Check if it's a final, displayable event
#     if event.is_final_response():
#         print("\n--- Final Output Detected ---")
#         if event.content and event.content.parts and event.content.parts[0].text:
#              # If it's the final part of a stream, use accumulated text
#              final_text = full_response_text + (event.content.parts[0].text if not event.partial else "")
#              print(f"Display to user: {final_text.strip()}")
#              full_response_text = "" # Reset accumulator
#         elif event.actions.skip_summarization:
#              # Handle displaying the raw tool result if needed
#              response_data = event.get_function_responses()[0].response
#              print(f"Display raw tool result: {response_data}")
#         elif event.long_running_tool_ids:
#              print("Display message: Tool is running in background...")
#         else:
#              # Handle other types of final responses if applicable
#              print("Display: Final non-textual response or signal.")
```

## Agent Types

### LLM Agents

LLM Agents use Large Language Models for dynamic reasoning and decision-making.

```python
from google.adk.agents import LlmAgent

# Example: Defining the basic identity
capital_agent = LlmAgent(
    model="gemini-2.0-flash",
    name="capital_agent",
    description="Answers user questions about the capital city of a given country."
    # instruction and tools will be added next
)
```

### Workflow Agents

Workflow agents are specialized components in ADK designed purely for orchestrating the execution flow of sub-agents. They operate based on predefined logic rather than consulting an LLM for orchestration.

#### Types of Workflow Agents

1. **Sequential Agents**: Executes sub-agents one after another, in sequence.
2. **Loop Agents**: Repeatedly executes its sub-agents until a specific termination condition is met.
3. **Parallel Agents**: Executes multiple sub-agents in parallel.

#### Example: Generator-Critic Pattern with Sequential Agent

```python
# Conceptual Code: Generator-Critic
from google.adk.agents import SequentialAgent, LlmAgent

generator = LlmAgent(
    name="DraftWriter",
    instruction="Write a short paragraph about subject X.",
    output_key="draft_text"
)

reviewer = LlmAgent(
    name="FactChecker",
    instruction="Review the text in state key 'draft_text' for factual accuracy. Output 'valid' or 'invalid' with reasons.",
    output_key="review_status"
)

# Optional: Further steps based on review_status

review_pipeline = SequentialAgent(
    name="WriteAndReview",
    sub_agents=[generator, reviewer]
)
# generator runs -> saves draft to state['draft_text']
# reviewer runs -> reads state['draft_text'], saves status to state['review_status']
```

#### Example: Coordinator/Dispatcher Pattern with LLM Transfer

```python
# Conceptual Code: Coordinator using LLM Transfer
from google.adk.agents import LlmAgent

billing_agent = LlmAgent(name="Billing", description="Handles billing inquiries.")
support_agent = LlmAgent(name="Support", description="Handles technical support requests.")

coordinator = LlmAgent(
    name="HelpDeskCoordinator",
    model="gemini-2.0-flash",
    instruction="Route user requests: Use Billing agent for payment issues, Support agent for technical problems.",
    description="Main help desk router.",
    # allow_transfer=True is often implicit with sub_agents in AutoFlow
    sub_agents=[billing_agent, support_agent]
)
# User asks "My payment failed" -> Coordinator's LLM should call transfer_to_agent(agent_name='Billing')
# User asks "I can't log in" -> Coordinator's LLM should call transfer_to_agent(agent_name='Support')
```

## Session and Memory Management

### Session Services

```python
from google.adk.sessions import InMemorySessionService
session_service = InMemorySessionService()
```

```python
from google.adk.sessions import DatabaseSessionService
# Example using a local SQLite file:
db_url = "sqlite:///./my_agent_data.db"
session_service = DatabaseSessionService(db_url=db_url)
```

### Memory Services

```python
from google.adk.memory import InMemoryMemoryService
memory_service = InMemoryMemoryService()
```

```python
# Requires: pip install google-adk[vertexai]
# Plus GCP setup, RAG Corpus, and authentication
from google.adk.memory import VertexAiRagMemoryService

# The RAG Corpus name or ID
RAG_CORPUS_RESOURCE_NAME = "projects/your-gcp-project-id/locations/us-central1/ragCorpora/your-corpus-id"
# Optional configuration for retrieval
SIMILARITY_TOP_K = 5
VECTOR_DISTANCE_THRESHOLD = 0.7

memory_service = VertexAiRagMemoryService(
    rag_corpus=RAG_CORPUS_RESOURCE_NAME,
    similarity_top_k=SIMILARITY_TOP_K,
    vector_distance_threshold=VECTOR_DISTANCE_THRESHOLD
)
```

## Context Management

### ReadonlyContext

```python
from google.adk.agents import ReadonlyContext

def my_instruction_provider(context: ReadonlyContext) -> str:
    # Read-only access example
    user_tier = context.state.get("user_tier", "standard") # Can read state
    # context.state['new_key'] = 'value' # This would typically cause an error or be ineffective
    return f"Process the request for a {user_tier} user."
```

### ToolContext

```python
from google.adk.tools import ToolContext
from typing import Dict, Any

# Assume this function is wrapped by a FunctionTool
def search_external_api(query: str, tool_context: ToolContext) -> Dict[str, Any]:
    api_key = tool_context.state.get("api_key")
    if not api_key:
        # Define required auth config
        # auth_config = AuthConfig(...)
        # tool_context.request_credential(auth_config) # Request credentials
        # Use the 'actions' property to signal the auth request has been made
        # tool_context.actions.requested_auth_configs[tool_context.function_call_id] = auth_config
        return {"status": "Auth Required"}

    # Use the API key...
    print(f"Tool executing for query '{query}' using API key. Invocation: {tool_context.invocation_id}")

    # Optionally search memory or list artifacts
    # relevant_docs = tool_context.search_memory(f"info related to {query}")
    # available_files = tool_context.list_artifacts()

    return {"result": f"Data for {query} fetched."}
```

### Data Flow Between Tools

```python
# Pseudocode: Tool 1 - Fetches user ID
from google.adk.tools import ToolContext
import uuid

def get_user_profile(tool_context: ToolContext) -> dict:
    user_id = str(uuid.uuid4()) # Simulate fetching ID
    # Save the ID to state for the next tool
    tool_context.state["temp:current_user_id"] = user_id
    return {"profile_status": "ID generated"}

# Pseudocode: Tool 2 - Uses user ID from state
def get_user_orders(tool_context: ToolContext) -> dict:
    user_id = tool_context.state.get("temp:current_user_id")
    if not user_id:
        return {"error": "User ID not found in state"}

    print(f"Fetching orders for user ID: {user_id}")
    # ... logic to fetch orders using user_id ...
    return {"orders": ["order123", "order456"]}
```

## Tools and Authentication

### Tool Authentication

```python
# Pseudocode: Tool requiring auth
from google.adk.tools import ToolContext
from google.adk.auth import AuthConfig # Assume appropriate AuthConfig is defined

# Define your required auth configuration (e.g., OAuth, API Key)
MY_API_AUTH_CONFIG = AuthConfig(...)
AUTH_STATE_KEY = "user:my_api_credential" # Key to store retrieved credential

def call_secure_api(tool_context: ToolContext, request_data: str) -> dict:
    # 1. Check if credential already exists in state
    credential = tool_context.state.get(AUTH_STATE_KEY)

    if not credential:
        # 2. If not, request it
        print("Credential not found, requesting...")
        try:
            tool_context.request_credential(MY_API_AUTH_CONFIG)
            # The framework handles yielding the event. The tool execution stops here for this turn.
            return {"status": "Authentication required. Please provide credentials."}
        except ValueError as e:
            return {"error": f"Auth error: {e}"} # e.g., function_call_id missing
        except Exception as e:
            return {"error": f"Failed to request credential: {e}"}

    # 3. If credential exists (might be from a previous turn after request)
    #    or if this is a subsequent call after auth flow completed externally
    try:
        # Optionally, re-validate/retrieve if needed, or use directly
        # This might retrieve the credential if the external flow just completed
        auth_credential_obj = tool_context.get_auth_response(MY_API_AUTH_CONFIG)
        api_key = auth_credential_obj.api_key # Or access_token, etc.

        # Store it back in state for future calls within the session
        tool_context.state[AUTH_STATE_KEY] = auth_credential_obj.model_dump() # Persist retrieved credential

        print(f"Using retrieved credential to call API with data: {request_data}")
        # ... Make the actual API call using api_key ...
        api_result = f"API result for {request_data}"

        return {"result": api_result}
    except Exception as e:
        # Handle errors retrieving/using the credential
        print(f"Error using credential: {e}")
        # Maybe clear the state key if credential is invalid?
        # tool_context.state[AUTH_STATE_KEY] = None
        return {"error": "Failed to use credential"}
```

## Artifacts and Document Processing

### Creating an Artifact Representation

```python
# Example of how an artifact might be represented as a types.Part
import google.genai.types as types

# Assume 'image_bytes' contains the binary data of a PNG image
image_bytes = b'\x89PNG\r\n\x1a\n...' # Placeholder for actual image bytes

image_artifact = types.Part(
    inline_data=types.Blob(
        mime_type="image/png",
        data=image_bytes
    )
)

# You can also use the convenience constructor:
# image_artifact_alt = types.Part.from_data(data=image_bytes, mime_type="image/png")

print(f"Artifact MIME Type: {image_artifact.inline_data.mime_type}")
print(f"Artifact Data (first 10 bytes): {image_artifact.inline_data.data[:10]}...")
```

### Document Processing

```python
# Pseudocode: In the Summarizer tool function
from google.adk.tools import ToolContext
from google.genai import types

def summarize_document_tool(tool_context: ToolContext) -> dict:
    artifact_name = tool_context.state.get("temp:doc_artifact_name")
    if not artifact_name:
        return {"error": "Document artifact name not found in state."}

    try:
        # 1. Load the artifact part containing the path/URI
        artifact_part = tool_context.load_artifact(artifact_name)
        if not artifact_part or not artifact_part.text:
            return {"error": f"Could not load artifact or artifact has no text path: {artifact_name}"}

        file_path = artifact_part.text
        print(f"Loaded document reference: {file_path}")

        # 2. Read the actual document content (outside ADK context)
        document_content = ""
        if file_path.startswith("gs://"):
            pass # Replace with actual GCS reading logic
        elif file_path.startswith("/"):
             with open(file_path, 'r', encoding='utf-8') as f:
                 document_content = f.read()
        else:
            return {"error": f"Unsupported file path scheme: {file_path}"}

        # 3. Summarize the content
        if not document_content:
             return {"error": "Failed to read document content."}

        summary = f"Summary of content from {file_path}" # Placeholder

        return {"summary": summary}

    except ValueError as e:
         return {"error": f"Artifact service error: {e}"}
    except FileNotFoundError:
         return {"error": f"Local file not found: {file_path}"}
```

### Listing Available Artifacts

```python
# Pseudocode: In a tool function
from google.adk.tools import ToolContext

def check_available_docs(tool_context: ToolContext) -> dict:
    try:
        artifact_keys = tool_context.list_artifacts()
        print(f"Available artifacts: {artifact_keys}")
        return {"available_docs": artifact_keys}
    except ValueError as e:
        return {"error": f"Artifact service error: {e}"}
```

## Memory Search

```python
# Pseudocode: Tool using memory search
from google.adk.tools import ToolContext

def find_related_info(tool_context: ToolContext, topic: str) -> dict:
    try:
        search_results = tool_context.search_memory(f"Information about {topic}")
        if search_results.results:
            print(f"Found {len(search_results.results)} memory results for '{topic}'")
            # Process search_results.results (which are SearchMemoryResponseEntry)
            top_result_text = search_results.results[0].text
            return {"memory_snippet": top_result_text}
        else:
            return {"message": "No relevant memories found."}
    except ValueError as e:
        return {"error": f"Memory service error: {e}"} # e.g., Service not configured
    except Exception as e:
        return {"error": f"Unexpected error searching memory: {e}"}
```

## Web Integration

### FastAPI App Setup

```python
import os
import json
import asyncio

from pathlib import Path
from dotenv import load_dotenv

from google.genai.types import (
    Part,
    Content,
)

from google.adk.runners import Runner
from google.adk.agents import LiveRequestQueue
from google.adk.agents.run_config import RunConfig
from google.adk.sessions.in_memory_session_service import InMemorySessionService

from fastapi import FastAPI, WebSocket
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from google_search_agent.agent import root_agent

#
# ADK Streaming
#
```

### Root Agent with Google Search Tool

```python
from google.adk.agents import Agent
from google.adk.tools import google_search  # Import the tool

root_agent = Agent(
   # A unique name for the agent.
   name="basic_search_agent",
   # The Large Language Model (LLM) that agent will use.
   model="gemini-2.0-flash-exp",
   # model="gemini-2.0-flash-live-001",  # New streaming model version as of Feb 2025
   # A short description of the agent's purpose.
   description="Agent to answer questions using Google Search.",
   # Instructions to set the agent's behavior.
   instruction="You are an expert researcher. You always stick to the facts.",
   # Add google_search tool to perform grounding with Google search.
   tools=[google_search]
)
```

## Evaluation

### Example Evalset

```json
[
  {
    "name": "roll_16_sided_dice_and_then_check_if_6151953_is_prime",
    "data": [
      {
        "query": "What can you do?",
        "expected_tool_use": [],
        "expected_intermediate_agent_responses": [],
        "reference": "I can roll dice of different sizes and check if a number is prime. I can also use multiple tools in parallel.\n"
      },
      {
        "query": "Roll a 16 sided dice for me",
        "expected_tool_use": [
          {
            "tool_name": "roll_die",
            "tool_input": {
              "sides": 16
            }
          }
        ],
        "expected_intermediate_agent_responses": [],
        "reference": "I rolled a 16 sided die and got 13.\n"
      },
      {
        "query": "Is 6151953  a prime number?",
        "expected_tool_use": [
          {
            "tool_name": "check_prime",
            "tool_input": {
              "nums": [
                6151953
              ]
            }
          }
        ],
        "expected_intermediate_agent_responses": [],
        "reference": "No, 6151953 is not a prime number.\n"
      }
    ],
    "initial_session": {
      "state": {},
      "app_name": "hello_world",
      "user_id": "user"
    }
  }
]
```

### Starting ADK Web UI

```bash
bash adk web samples_for_testing
```

## Installation

```bash
pip install google-adk
```

## Resources

- [ADK GitHub Repository](https://github.com/google/adk)
- [ADK Documentation](https://github.com/google/adk-docs)
- [ADK Samples](https://github.com/google/adk-samples)
