import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans

# --------------------------
# Configuration
# --------------------------
INPUT_CSV = "nsf_terminations_airtable.csv"
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
N_CLUSTERS = 15
OUTPUT_PREFIX = "nsf_terminated_grants_clustered"

# --------------------------
# Step 1: Load and Preprocess
# --------------------------
df = pd.read_csv(INPUT_CSV)
df = df.dropna(subset=["abstract"])

# --------------------------
# Step 2: Create LLM Summary Input
# --------------------------
def create_summary(row):
    return (
        f"Grant Title: {row['project_title']}\n"
        f"Abstract: {row['abstract']}\n"
        f"Institution: {row['org_name']} ({row['org_city']}, {row['org_state']})\n"
        f"NSF Division: {row['division']} | Program: {row['nsf_program_name']}\n"
        f"Budget: {row['nsf_total_budget']}\n"
        f"Expected Duration: {row['nsf_startdate']} to {row['nsf_expected_end_date']}\n"
        f"Existing Tags: cluster {row['cluster']}, program name, city, state, and division\n\n"
        "Based on this information, suggest any additional thematic or analytical tags that could be useful. "
        "These could include research methodologies, risk factors, grant structure, interdisciplinarity, innovation type, or social relevance.\n"
        "Respond with a list of high-level tags or labels not already included."
    )

df["llm_input"] = df.apply(create_summary, axis=1)

# --------------------------
# Step 3: Generate Embeddings
# --------------------------
print("Generating embeddings...")
model = SentenceTransformer(EMBEDDING_MODEL)
embeddings = model.encode(df["llm_input"].tolist(), show_progress_bar=True)
df["embedding"] = [e.tolist() for e in embeddings]

# --------------------------
# Step 4: Cluster Grants
# --------------------------
print(f"Clustering into {N_CLUSTERS} clusters...")
kmeans = KMeans(n_clusters=N_CLUSTERS, random_state=42)
df["cluster"] = kmeans.fit_predict(embeddings)

# --------------------------
# Step 5: Save Output
# --------------------------
final_columns = [
    "Grant Number", "project_title", "termination_letter_date",
    "org_name", "org_city", "org_state", "org_district",
    "nsf_total_budget", "usaspending_obligated", "award_type",
    "directorate_abbrev", "directorate", "division", "nsf_program_name",
    "nsf_url", "usaspending_url", "nsf_startdate", "nsf_expected_end_date",
    "org_zip", "org_uei", "abstract", "in_cruz_list",
    "llm_input", "embedding", "cluster"
]

df_final = df[final_columns]

print("Saving outputs...")
df_final.to_pickle(f"{OUTPUT_PREFIX}.pkl")
df_final.to_json(f"{OUTPUT_PREFIX}.json", orient="records")
df_final.to_csv(f"{OUTPUT_PREFIX}.csv", index=False)

print("Done.")