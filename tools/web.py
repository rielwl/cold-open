# -*- coding: utf-8 -*-
# HTTP helpers shared by the Python build scripts (the Node tools use lib.mjs).
import json, os, re, time, urllib.parse, urllib.request

# Contact for the APIs' polite pools. Optional: set CONTACT_EMAIL to add yours.
MAIL = os.environ.get("CONTACT_EMAIL", "")
UA = {"User-Agent": "ColdOpen/1.1 (https://github.com/rielwl/cold-open" + ("; " + MAIL if MAIL else "") + ")"}
# Query-string tail for every OpenAlex call. OPENALEX_API_KEY is an optional
# free key from openalex.org: 10x the keyless daily budget.
OPENALEX_AUTH = (("&mailto=" + urllib.parse.quote(MAIL)) if MAIL else "") + \
    (("&api_key=" + urllib.parse.quote(os.environ["OPENALEX_API_KEY"])) if os.environ.get("OPENALEX_API_KEY") else "")
WIKI_API = "https://en.wikipedia.org/w/api.php?"


def redact(url):
    """For log lines: hides the API key and contact email that ride in the query string."""
    return re.sub(r"([?&](?:api_key|mailto|email)=)[^&]*", "\\1…", url)


def get_json(url, tries=3, timeout=35, wait=lambda attempt: 1.5 * (attempt + 1)):
    """GET a URL and parse it as JSON. Returns None, with a message, once every try has failed."""
    error = None
    for attempt in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=timeout) as r:
                return json.load(r)
        except Exception as e:  # network errors, HTTP errors, timeouts and bad JSON are all retried
            error = e
            if attempt < tries - 1:
                time.sleep(wait(attempt))
    print("gave up on", redact(url)[:160], "-", error, flush=True)
    return None


def wiki(tries=3, timeout=35, wait=lambda attempt: 1.5 * (attempt + 1), **params):
    """Call the English Wikipedia API with the given query parameters."""
    params = {"format": "json", "formatversion": "2", **params}
    return get_json(WIKI_API + urllib.parse.urlencode(params), tries, timeout, wait)


def wiki_pages(titles):
    """Intro extract, byte length and URL for up to 20 titles, as a list of API page objects."""
    d = wiki(action="query", titles="|".join(titles), prop="extracts|info",
             exintro=1, explaintext=1, inprop="url", redirects=1)
    return (d or {}).get("query", {}).get("pages", [])
