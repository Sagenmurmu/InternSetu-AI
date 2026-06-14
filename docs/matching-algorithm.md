# InternSetu AI — Upgraded AI Matching Algorithm

The matching engine analyzes candidate profiles and internship listings to produce recommendations. It computes scores across five distinct factors, aggregates them using configurable system weights, and performs policy-guided re-ranking to support representation goals.

---

## 1. Skill Normalization & Mapping

To handle variations in terminology, the system normalizes skill inputs before matching.

*   **Synonym Resolution**: Cleaned inputs are converted using pre-defined mappings (e.g. `js` $\rightarrow$ `javascript`, `reactjs` $\rightarrow$ `react`, `ml` $\rightarrow$ `machine learning`).
*   **Parsing Utilities**: Supports parsing lists, comma-separated lists, and JSON-encoded array formats.
*   **Pipeline Integration**: Duplicate entries are automatically deduplicated and sorted.

---

## 2. Scoring Factors & Mechanics

Each match between a candidate and an internship calculates five individual scores from `0.0` to `100.0`.

### 2.1. Skill Score (Weight: 35%)
Upgraded to combine exact overlap matching with semantic vector space representation.
*   **Exact Overlap (75% weight)**: Measures the ratio of required skills matched.
    $$\text{Exact Score} = \left( \frac{|\text{Candidate Skills} \cap \text{Required Skills}|}{|\text{Required Skills}|} \right) \times 100$$
*   **Semantic Similarity (25% weight)**: Implements `scikit-learn`'s `TfidfVectorizer` and `cosine_similarity`. Converts the candidate skills and required skills documents into sparse vectors in a TF-IDF vector space fitted on platform vocabulary, calculating their cosine similarity:
    $$\text{Cosine Score} = \text{cosine\_similarity}(\vec{C}, \vec{R}) \times 100$$
*   **Aggregation**:
    $$\text{Skill Score} = 0.75 \cdot \text{Exact Score} + 0.25 \cdot \text{Cosine Score}$$

### 2.2. Qualification Score (Weight: 20%)
Evaluates educational eligibility using an academic hierarchy level:
$$\text{10th (Level 1)} \rightarrow \text{12th (Level 2)} \rightarrow \text{ITI (Level 3)} \rightarrow \text{Diploma (Level 4)} \rightarrow \text{BCA/BSc/BA/BCom (Level 5)} \rightarrow \text{B.Tech/BE (Level 6)} \rightarrow \text{MBA/MCA/M.Tech/MSc (Level 7)} \rightarrow \text{PhD (Level 8)}$$
*   **Exact Match / Equal Level**: Returns `100.0`.
*   **Over-qualified (Candidate Level > Required Level)**: Returns `90.0`.
*   **One level below requirement (Candidate Level == Required Level - 1)**: Returns `60.0`.
*   **Under-qualified / Too low**: Returns `0.0`.

### 2.3. Location Score (Weight: 15%)
Measures proximity matching and relocation preferences:
*   **Same District**: Returns `100.0`.
*   **Remote Mode Internship**: Returns `90.0`.
*   **Same State (On-site)**: Returns `75.0`.
*   **Same State (Hybrid Mode)**: Returns `70.0`.
*   **Willing to Relocate**: Returns `55.0`.
*   **Different State / Unwilling to Relocate**: Returns `25.0`.

### 2.4. Sector Score (Weight: 15%)
Scores industry interest alignment and sector transferability using related groupings (e.g. IT ↔ Data Analytics ↔ AI/ML, and Finance ↔ Banking ↔ Accounting):
*   **Exact Sector Match**: Returns `100.0`.
*   **Related Sector group**: Returns `70.0`.
*   **No Match**: Returns `35.0`.

### 2.5. Fairness Score (Weight: 15%)
Applies policy-guided demographic bonuses to support underrepresented candidates:
*   **Base Score**: Starts at `50.0`.
*   **Demographic Bonuses**:
    *   **Rural residency**: `+20.0` points.
    *   **Aspirational district residency**: `+20.0` points.
    *   **SC/ST category**: `+20.0` points (OBC/EWS category receives `+12.0` points).
    *   **Female/Other gender**: `+10.0` points.
    *   **First-time participant**: `+10.0` points.
*   **Constraint**: The total score is capped at `100.0`.

---

## 3. Final Combined Score

The five scores are aggregated using core system weights:

$$\text{Final Score} = 0.35 \cdot S_{\text{skills}} + 0.20 \cdot S_{\text{qual}} + 0.15 \cdot S_{\text{loc}} + 0.15 \cdot S_{\text{sector}} + 0.15 \cdot S_{\text{fairness}}$$

---

## 4. Policy-Guided Re-ranking

For candidate match lists, the engine computes an adjusted `ranking_score` to re-order candidate list results:
$$\text{Ranking Score} = \text{Final Score} + \min(\text{Fairness Score} \times 0.05, 5.0)$$
This ensures that fairness adjustments act as a transparent boost of up to `5.0` ranking points but never override merit or hard eligibility criteria.

---

## 5. Capacity-Aware Hard Filtering

To optimize platform allocation:
*   Positions that are inactive or have filled their slot capacities (`selected_count >= capacity`) are filtered out and will not receive candidate recommendations.
*   Internships with nearly filled capacities (seats remaining $\le 2$) trigger warnings: `"Limited seats remaining: Only X slots available."`

---

## 6. Explanation Generation

Bulleted rationales explaining exact matched skills, missing skills suggestions, qualification levels, and location Mode details are automatically compiled for all matches to ensure algorithmic transparency.
