"""Display the existing website in a bidirectional Streamlit iframe."""

import os
from pathlib import Path

import streamlit as st
from streamlit.components.v1 import declare_component

from forum_store import respond

ROOT = Path(__file__).resolve().parent
WIDGET_KEY = "beyond_the_game_website"
site = declare_component("website", path=str(ROOT / "assets"))

st.set_page_config(page_title="Beyond the Game", page_icon="🏐", layout="wide",
                   initial_sidebar_state="collapsed")
st.markdown("""<style>
html, body, [data-testid="stAppViewContainer"], [data-testid="stMain"] {background:#f8f4e9!important;}
[data-testid="stHeader"], [data-testid="stToolbar"], footer {display:none!important;}
[data-testid="stMain"] {overflow:hidden!important;}
[data-testid="stMainBlockContainer"] {padding:0!important;max-width:none!important;}
[data-testid="stVerticalBlock"] {gap:0!important;}
iframe[title$=".website"] {display:block;border:0!important;height:100dvh!important;}
</style>""", unsafe_allow_html=True)


def handle_forum_request():
    database_url = os.getenv("BTG_FORUM_DATABASE_URL")
    if not database_url:
        try:
            database_url = st.secrets.get("BTG_FORUM_DATABASE_URL")
        except FileNotFoundError:
            pass
    st.session_state["forum_response"] = respond(st.session_state[WIDGET_KEY], database_url)


site(key=WIDGET_KEY, forum_response=st.session_state.get("forum_response"),
     on_change=handle_forum_request)
