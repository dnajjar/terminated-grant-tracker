import pandas as pd
import numpy as np
import umap
import json

# Load clustered data
df = pd.read_pickle("nsf_terminated_grants_clustered.pkl")

# Extract embeddings and run UMAP
embeddings = np.array(df["embedding"].tolist())
umap_model = umap.UMAP(n_neighbors=15, min_dist=0.1, metric="cosine", random_state=42)
umap_coords = umap_model.fit_transform(embeddings)
df["x"] = umap_coords[:, 0]
df["y"] = umap_coords[:, 1]

# Load cluster labels
with open("cluster_labels_sample_size_10.json") as f:
    cluster_labels = json.load(f)
cluster_labels = {int(k): v.strip('"') for k, v in cluster_labels.items()}
df["cluster_theme"] = df["cluster"].apply(lambda c: cluster_labels.get(int(c), "Unknown"))

if "gpt_tags" not in df.columns:
    df["gpt_tags"] = "[]"
    
# Format and export JSON
df_viz = df[[
    "Grant Number", "project_title", "org_name", "org_city", "org_state",
    "nsf_total_budget", "division", "nsf_program_name", "cluster",
    "x", "y", "gpt_tags", "abstract", "cluster_theme"
]].rename(columns={
    "Grant Number": "grant_number", "project_title": "title",
    "org_name": "institution", "org_city": "city", "org_state": "state",
    "nsf_total_budget": "budget", "nsf_program_name": "program",
    "gpt_tags": "tags"
})

df_viz.to_json("nsf_clustered_grants_d3_umap.json", orient="records", indent=2)