from google.adk.agents import LlmAgent

def main():
    print("Creating a simple ADK agent...")
    
    # Create a simple agent
    agent = LlmAgent(
        name="test_agent",
        model="gemini-2.0-flash",  # This is a model ID
        description="A test agent to verify ADK installation",
        instruction="You are a helpful assistant."
    )
    
    print(f"Successfully created agent: {agent.name}")
    print(f"Model: {agent.model}")
    print(f"Description: {agent.description}")
    print("ADK is working correctly!")

if __name__ == "__main__":
    main()
