# BackendEngine Crew

Welcome to the BackendEngine Crew project, powered by [crewAI](https://crewai.com). This template is designed to help you set up a multi-agent AI system with ease, leveraging the powerful and flexible framework provided by crewAI. Our goal is to enable your agents to collaborate effectively on complex tasks, maximizing their collective intelligence and capabilities.

## Installation

Ensure you have Python >=3.10 <3.14 installed on your system. This project uses [UV](https://docs.astral.sh/uv/) for dependency management and package handling, offering a seamless setup and execution experience.

First, if you haven't already, install uv:

```bash
pip install uv
```

Next, navigate to your project directory and install the dependencies:

(Optional) Lock the dependencies and install them by using the CLI command:

```bash
crewai install
```

### Customizing

**Add your `OPENAI_API_KEY` into the `.env` file**

- Modify `src/backend_engine/config/agents.yaml` to define your agents
- Modify `src/backend_engine/config/tasks.yaml` to define your tasks
- Modify `src/backend_engine/crew.py` to add your own logic, tools and specific args
- Modify `src/backend_engine/main.py` to add custom inputs for your agents and tasks

## Running the Project

To kickstart your crew of AI agents and begin task execution, run this from the root folder of your project:

```bash
$ crewai run
```

This command initializes the backend_engine Crew, assembling the agents and assigning them tasks as defined in your configuration.

This example, unmodified, will run the create a `report.md` file with the output of a research on LLMs in the root folder.

## Understanding Your Crew

The backend_engine Crew is composed of multiple AI agents, each with unique roles, goals, and tools. These agents collaborate on a series of tasks, defined in `config/tasks.yaml`, leveraging their collective skills to achieve complex objectives. The `config/agents.yaml` file outlines the capabilities and configurations of each agent in your crew.

## Support

For support, questions, or feedback regarding the BackendEngine Crew or crewAI.

- Visit our [documentation](https://docs.crewai.com)
- Reach out to us through our [GitHub repository](https://github.com/joaomdmoura/crewai)
- [Join our Discord](https://discord.com/invite/X4JWnZnxPb)
- [Chat with our docs](https://chatg.pt/DWjSBZn)

Let's create wonders together with the power and simplicity of crewAI.

## Composio Tool Integration

Composio provides 250+ production-ready tools with flexible authentication. This project integrates Composio tools into both agents.

### Installation

Dependencies are declared in `pyproject.toml` and will be installed with your normal project install. If installing manually, ensure:

```bash
pip install composio-crewai
pip install crewai
```

After installation, authenticate Composio either by logging in or setting an API key:

```bash
composio login
# or
export COMPOSIO_API_KEY=YOUR_KEY
```

Optionally, connect GitHub (default app used by this project):

```bash
composio add github
```

### Usage

- Both `researcher` and `reporting_analyst` agents automatically load Composio tools (defaulting to GitHub app). See `src/backend_engine/tools/composio_tools.py` to customize apps or specific actions.

For more details, see the official documentation: [Composio Tool for crewAI](https://docs.crewai.com/en/tools/automation/composiotool#installation).
