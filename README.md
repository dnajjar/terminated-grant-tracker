
---

## About

This is a visual exploratoy tool designed to dig deeper into NSF grants that were terminated during the Trump administration. By combining natural language processing, clustering, and large language models, the tool offers multiple ways to explore the grants: by shared themes, institutional affiliations, research areas, and politically salient keywords. It’s designed not to make claims, but to help researchers, journalists and anyone interested in these grants to explore and query them. 

Each dot in the scatterplot represents one terminated NSF grant. The position reflects the semantic similarity of its abstract. Users can explore grants using filters for:

- **Cluster theme** (LLM-generated summaries of grant groupings)
- **High-level tags** (normalized themes derived from LLM suggestions)
- **State and institution**
- **Search (title or institution)**
- **"Woke" keywords** (terms flagged in political discourse)
---

## Methodology

### 1. **Data Collection**
We use a dataset compiled by an academic team tracking terminated NSF and NIH grants, publicly available [here](https://grant-watch.us/nsf-data.html). The dataset includes grant abstracts, metadata (e.g., program, institution, budget), and termination dates.

### 2. **Embedding & Clustering**
Each grant abstract is embedded using the `all-MiniLM-L6-v2` model from [SentenceTransformers](https://www.sbert.net/), producing a dense vector representing its semantic content. We apply **k-means clustering** (k=15) to group similar grants.

### 3. **Cluster Labeling with GPT**
For each cluster, a representative sample of grants was passed to **GPT-4**, with a prompt asking the model to summarize the shared theme. The outputs were manually reviewed to ensure interpretability.

### 4. **LLM Tagging**
Each individual grant was passed to GPT with all available metadata (title, abstract, institution, division, budget, etc.) and the cluster description. The prompt asked for additional thematic or analytical tags. The outputs were cleaned and normalized into canonical tags using embedding similarity.

### 5. **"Wokeness" Flagging**
A list of ~200 keywords drawn from political scrutiny of NIH/NSF grantmaking (terms like "diversity," "gender identity," "equity") was used to flag grants containing related terms. We used both direct string matching and semantic similarity scoring to flag potential matches.

### 6. **Visualization**
Using [D3.js](https://d3js.org/), we created a scatterplot based on a 2D UMAP projection of the embeddings. Users can interact with filters, zoom, and pinned tooltips. Tooltip links go to the original NSF grant record.

---

## Caveats and Limitations

- AI-generated summaries and tags are not perfect. They are meant to guide exploration, not replace expert judgment.
- Clustering is based on text similarity, not programmatic or institutional categories.
- Flagged keywords are sensitive and politically charged. Their presence in a grant does not imply anything about its scientific merit or intent.
- The model may reflect biases present in the training data and terminology.

---

## Tech Stack

- **Python** (data prep, embeddings, clustering, tagging)
- **SentenceTransformers** for semantic embeddings
- **OpenAI GPT-4** for cluster labeling and tag generation
- **D3.js** for interactive visualization
- **Pandas**, **Scikit-learn**, **UMAP**, **Geopy**

## 📖 License

Open-source under the MIT License. Use responsibly. Contributions welcome.
