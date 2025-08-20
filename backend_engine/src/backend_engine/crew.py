import os
import logging
from typing import List, Optional

from crewai import Agent, Task, Crew, Process
from crewai.project import CrewBase, agent, crew, task
from composio_crewai import ComposioToolSet, App, Action

# Basic logging
LOG_LEVEL = os.getenv("COMPOSIO_LOGGING_LEVEL", "INFO")
logging.basicConfig(level=getattr(logging, LOG_LEVEL.upper(), logging.INFO))
logger = logging.getLogger(__name__)


def make_toolset_for(
    entity_env_var: str, fallback: Optional[str] = None
) -> ComposioToolSet:
    """
    Create a ComposioToolSet for the given env var (which should contain the Composio account id,
    e.g. the 'ca_*' Account ID shown in the dashboard). Optionally uses COMPOSIO_AUTH_CONFIG_ID.
    """
    # Always use the main entity ID with auth config
    entity_id = os.getenv("COMPOSIO_ENTITY_ID")
    auth_config = os.getenv("COMPOSIO_AUTH_CONFIG_ID")

    logger.info(
        "Creating ComposioToolSet with entity_id=%s, auth_config_id=%s",
        entity_id,
        auth_config,
    )

    try:
        if auth_config and entity_id:
            return ComposioToolSet(entity_id=entity_id, auth_config_id=auth_config)
        elif entity_id:
            return ComposioToolSet(entity_id=entity_id)
        else:
            # Last resort - use default
            logger.warning("No entity_id found, using default")
            return ComposioToolSet()
    except Exception as e:
        logger.exception(
            "Failed to create ComposioToolSet for entity_id=%s: %s", entity_id, e
        )
        # Re-raise so caller sees the error (you can decide to catch upstream)
        raise


def _names_for_tools(tools) -> List[str]:
    if not tools:
        return []
    names = []
    for t in tools:
        # SDK objects sometimes expose .name, .action or have repr
        names.append(getattr(t, "name", getattr(t, "action", repr(t))))
    return names


@CrewBase
class BackendEngine:

    """Crew to list repos and fetch PRs for a GitHub account via Composio."""


    agents: List[Agent]
    tasks: List[Task]

    @agent
    def github_agent(self) -> Agent:
        # Use the main auth config with entity ID
        toolset = make_toolset_for("COMPOSIO_ENTITY_ID")
        try:
            tools = toolset.get_tools(apps=[App.GITHUB])
            logger.info("GitHub tools discovered: %s", _names_for_tools(tools))
        except Exception as e:
            logger.warning("Error discovering GitHub tools: %s", e)
            tools = []

        cfg = dict(self.agents_config.get("github_agent", {}))
        cfg.pop("tools", None)
        return Agent(config=cfg, tools=tools or [], verbose=cfg.get("verbose", True))

    @agent
    def slack_agent(self) -> Agent:
        # Use the main auth config with entity ID
        toolset = make_toolset_for("COMPOSIO_ENTITY_ID")

        # Preferred Slack actions we would like (SDK Action enum may or may not include them)
        desired_action_names = [
            "SLACK_FETCH_CONVERSATION_HISTORY",
            "SLACK_FIND_CHANNELS",
            "SLACK_LIST_CONVERSATIONS",
            "SLACK_LIST_ALL_USERS",
            "SLACK_GET_CHANNEL_MESSAGES",  # sometimes present in other SDK versions
        ]

        slack_actions = []
        for action_name in desired_action_names:
            if hasattr(Action, action_name):
                slack_actions.append(getattr(Action, action_name))

        # If we have specific actions, request them; otherwise fall back to asking for all Slack tools
        tools = []
        try:
            if slack_actions:
                try:
                    tools = toolset.get_tools(actions=slack_actions)
                    logger.info(
                        "Slack tools discovered (by actions): %s",
                        _names_for_tools(tools),
                    )
                except Exception as e:
                    # fallback to apps-based discovery
                    logger.warning(
                        "get_tools(actions=...) failed: %s -- falling back to apps=[App.SLACK]",
                        e,
                    )
                    tools = toolset.get_tools(apps=[App.SLACK])
                    logger.info(
                        "Slack tools discovered (fallback apps): %s",
                        _names_for_tools(tools),
                    )
            else:
                tools = toolset.get_tools(apps=[App.SLACK])
                logger.info(
                    "Slack tools discovered (apps): %s", _names_for_tools(tools)
                )
        except Exception as e:
            logger.exception("Slack tool discovery failed for entity. Error: %s", e)
            tools = []

        if not tools:
            logger.error(
                "No Slack tools available for the configured Composio entity. "
                "Ensure the Slack integration is connected in the Dashboard."
            )

        cfg = dict(self.agents_config.get("slack_agent", {}))
        cfg.pop("tools", None)
        return Agent(config=cfg, tools=tools or [], verbose=cfg.get("verbose", True))

    @agent
    def confluence_agent(self) -> Agent:
        # Use the main auth config with entity ID
        toolset = make_toolset_for("COMPOSIO_ENTITY_ID")

        # Preferred Confluence actions
        desired_action_names = [
            "CONFLUENCE_GET_SPACES",
            "CONFLUENCE_GET_PAGES_IN_SPACE",
            "CONFLUENCE_GET_PAGE_BY_ID",
            "CONFLUENCE_SEARCH_CONTENT",
            "CONFLUENCE_GET_CONTENT",
            "CONFLUENCE_GET_PAGE_CONTENT",
        ]

        confluence_actions = []
        for action_name in desired_action_names:
            if hasattr(Action, action_name):
                confluence_actions.append(getattr(Action, action_name))

        tools = []
        try:
            if confluence_actions:
                try:
                    tools = toolset.get_tools(actions=confluence_actions)
                    logger.info(
                        "Confluence tools discovered (by actions): %s",
                        _names_for_tools(tools),
                    )
                except Exception as e:
                    # fallback to apps-based discovery
                    logger.warning(
                        "get_tools(actions=...) failed: %s -- falling back to apps=[App.CONFLUENCE]",
                        e,
                    )
                    tools = toolset.get_tools(apps=[App.CONFLUENCE])
                    logger.info(
                        "Confluence tools discovered (fallback apps): %s",
                        _names_for_tools(tools),
                    )
            else:
                tools = toolset.get_tools(apps=[App.CONFLUENCE])
                logger.info(
                    "Confluence tools discovered (apps): %s", _names_for_tools(tools)
                )
        except Exception as e:
            logger.exception(
                "Confluence tool discovery failed for entity. Error: %s", e
            )
            tools = []

        if not tools:
            logger.error(
                "No Confluence tools available for the configured Composio entity. "
                "Ensure the Confluence integration is connected in the Dashboard."
            )

        cfg = dict(self.agents_config.get("confluence_agent", {}))
        cfg.pop("tools", None)
        return Agent(config=cfg, tools=tools or [], verbose=cfg.get("verbose", True))

    @task
    def list_repos_task(self) -> Task:
        return Task(config=self.tasks_config["list_repos_task"])

    @task

    def fetch_prs_task(self) -> Task:
        return Task(config=self.tasks_config["fetch_prs_task"])

    def fetch_slack_data_task(self) -> Task:
        return Task(config=self.tasks_config["fetch_slack_data_task"])

    @task
    def fetch_confluence_data_task(self) -> Task:
        return Task(config=self.tasks_config["fetch_confluence_data_task"])


    @crew
    def crew(self) -> Crew:
        return Crew(
            agents=self.agents,
            tasks=self.tasks,
            process=Process.sequential,
            verbose=True,
        )