import pandas as pd
import openai
from openai import OpenAI
import random
import time
import os
from dotenv import load_dotenv

# Load OpenAI key from .env
load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


# Load your clustered data
df = pd.read_pickle("nsf_terminated_grants_clustered.pkl")

def label_cluster(cluster_id, samples):
    prompt = (
        f"The following are summaries of NSF grants that were grouped together by semantic similarity "
        f"(Cluster {cluster_id}). Based on the content, please provide a short, descriptive theme label "
        f"for this group (e.g., 'Computational Biology in Ecology', 'STEM Access in Minority Institutions', etc).\n\n"
        "Grants:\n\n"
        + "\n\n---\n\n".join(samples) +
        "\n\nReturn a single sentence or phrase summarizing the shared theme of this cluster."
    )

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3
        )
        content = response.choices[0].message.content
        return response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Error labeling cluster {cluster_id}: {e}")
        return "Unlabeled Cluster"

# Loop through each cluster
cluster_labels = {}
for cluster_id in sorted(df["cluster"].unique()):
    print(f"Labeling cluster {cluster_id}...")
    cluster_df = df[df["cluster"] == cluster_id]
    sample_llm_inputs = random.sample(cluster_df["llm_input"].tolist(), k=min(100, len(cluster_df)))
    label = label_cluster(cluster_id, sample_llm_inputs)
    cluster_labels[int(cluster_id)] = label
    print(f"Cluster {cluster_id} → {label}")
    time.sleep(1.2)  # Rate limiting

# Save to disk for reuse
import json
with open("cluster_labels.json", "w") as f:
    json.dump(cluster_labels, f, indent=2)

print("All clusters labeled.")