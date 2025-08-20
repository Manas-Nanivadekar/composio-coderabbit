# src/backend_engine/crew.py
import os
from typing import List
from crewai import Agent, Task, Crew, Process
from crewai.project import CrewBase, agent, crew, task
from composio_crewai import ComposioToolSet, App


@CrewBase
class BackendEngine:
    """Crew to list repos and fetch PRs for a GitHub account via Composio."""

    agents: List[Agent]
    tasks: List[Task]

    @agent
    def github_agent(self) -> Agent:
        entity_id = os.getenv("COMPOSIO_ENTITY_ID", "default")
        toolset = ComposioToolSet(entity_id="Manas-Nanivadekar")

        # Get all GitHub tools (let Composio auto-discover)
        tools = toolset.get_tools(apps=[App.GITHUB])

        cfg = dict(self.agents_config["github_agent"])
        cfg.pop("tools", None)  # ensure YAML tools don't interfere
        return Agent(config=cfg, tools=tools, verbose=cfg.get("verbose", True))

    @task
    def list_repos_task(self) -> Task:
        return Task(config=self.tasks_config["list_repos_task"])

    @task
    def fetch_prs_task(self) -> Task:
        return Task(config=self.tasks_config["fetch_prs_task"])

    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )